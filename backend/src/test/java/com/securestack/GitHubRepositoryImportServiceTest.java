package com.securestack.github;

import com.securestack.config.ScanProperties;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class GitHubRepositoryImportServiceTest {
    @Test
    void parsesValidPublicGithubUrl() {
        var ref = serviceWithArchive(new byte[0]).parse("https://github.com/securestack/demo");

        assertEquals("securestack", ref.owner());
        assertEquals("demo", ref.repo());
        assertNull(ref.branch());
    }

    @Test
    void parsesValidTrailingSlashGithubUrl() {
        var ref = serviceWithArchive(new byte[0]).parse("https://github.com/securestack/demo/");

        assertEquals("securestack", ref.owner());
        assertEquals("demo", ref.repo());
        assertNull(ref.branch());
    }

    @Test
    void parsesValidTreeBranchUrl() {
        var ref = serviceWithArchive(new byte[0]).parse("https://github.com/securestack/demo/tree/feature/safe-branch");

        assertEquals("feature/safe-branch", ref.branch());
    }

    @Test
    void rejectsUnsupportedUrlsWithSingleSafeMessage() {
        var service = serviceWithArchive(new byte[0]);

        assertAll(
                () -> assertUrlRejected(service, "https://example.com/owner/repo"),
                () -> assertUrlRejected(service, "http://github.com/owner/repo"),
                () -> assertUrlRejected(service, "ssh://git@github.com/owner/repo"),
                () -> assertUrlRejected(service, "git@github.com:owner/repo.git"),
                () -> assertUrlRejected(service, "https://gist.github.com/owner/id"),
                () -> assertUrlRejected(service, "https://raw.githubusercontent.com/owner/repo/main/app.js"),
                () -> assertUrlRejected(service, "https://user:pass@github.com/owner/repo"),
                () -> assertUrlRejected(service, "https://github.com/../repo"),
                () -> assertUrlRejected(service, "https://github.com/owner"),
                () -> assertUrlRejected(service, "https://github.com/owner/repo.git"),
                () -> assertUrlRejected(service, "https://github.com/owner/repo?archive=https://evil.test/x.zip"),
                () -> assertUrlRejected(service, "https://github.com/owner/repo#readme"),
                () -> assertUrlRejected(service, "https://github.com/owner/repo/archive/main.zip")
        );
    }

    @Test
    void mapsArchiveEntriesToScanFileInputsSafelyWithoutExecutingCode() throws Exception {
        byte[] archive = zipWithFiles(
                file("repo-main/src/app.js", "throw new Error('should not execute');"),
                file("repo-main/node_modules/ignored.js", "const ignored = true;"),
                file("repo-main/.git/config", "ignored")
        );

        var files = serviceWithArchive(new byte[0]).zipToScanFiles(archive);

        assertEquals(1, files.size());
        assertEquals("src/app.js", files.get(0).fileName());
        assertEquals("js", files.get(0).fileType());
        assertTrue(files.get(0).content().contains("should not execute"));
    }

    @Test
    void rejectsUnsafeArchiveEntryPath() throws Exception {
        byte[] archive = zipWithFiles(file("repo-main/../evil.js", "const bad = true;"));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> serviceWithArchive(new byte[0]).zipToScanFiles(archive));

        assertEquals(GitHubRepositoryImportService.PROCESSING_ERROR, error.getMessage());
    }

    @Test
    void rejectsTooManyArchiveFiles() throws Exception {
        ScanProperties properties = new ScanProperties();
        properties.setMaxScanFiles(1);
        var service = new GitHubRepositoryImportService(properties, (uri, max) -> zipWithFiles(file("repo/a.js", ""), file("repo/b.js", "")));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> service.importPublicRepository("https://github.com/owner/repo"));

        assertEquals(GitHubRepositoryImportService.PROCESSING_ERROR, error.getMessage());
    }

    @Test
    void rejectsUnsupportedFilesWhenNoSupportedFilesExist() throws Exception {
        byte[] archive = zipWithFiles(file("repo/image.png", "not supported"));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> serviceWithArchive(new byte[0]).zipToScanFiles(archive));

        assertEquals(GitHubRepositoryImportService.NO_SUPPORTED_FILES_ERROR, error.getMessage());
    }

    @Test
    void rejectsMalformedArchive() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> serviceWithArchive(new byte[0]).zipToScanFiles("not a zip".getBytes()));

        assertEquals(GitHubRepositoryImportService.PROCESSING_ERROR, error.getMessage());
    }

    @Test
    void rejectsOversizedArchiveDownload() {
        ScanProperties properties = new ScanProperties();
        properties.setMaxGithubDownloadSizeMb(1);
        AtomicReference<Integer> observedLimit = new AtomicReference<>();
        var service = new GitHubRepositoryImportService(properties, (uri, max) -> {
            observedLimit.set(max);
            throw new IllegalArgumentException(GitHubRepositoryImportService.DOWNLOAD_TOO_LARGE_ERROR);
        });

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> service.importPublicRepository("https://github.com/owner/repo"));

        assertEquals(1024 * 1024, observedLimit.get());
        assertEquals(GitHubRepositoryImportService.DOWNLOAD_TOO_LARGE_ERROR, error.getMessage());
    }

    @Test
    void returnsControlledDownloadFailure() {
        var service = new GitHubRepositoryImportService(new ScanProperties(), (uri, max) -> {
            throw new IOException("connection refused: secret internal detail");
        });

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> service.importPublicRepository("https://github.com/owner/repo"));

        assertEquals(GitHubRepositoryImportService.DOWNLOAD_ERROR, error.getMessage());
    }

    @Test
    void downloadsOnlyDeterministicGithubArchiveUrlAfterValidationWithoutTokens() throws Exception {
        AtomicReference<URI> requested = new AtomicReference<>();
        var service = new GitHubRepositoryImportService(new ScanProperties(), (uri, max) -> {
            requested.set(uri);
            assertNull(uri.getUserInfo());
            return zipWithFiles(file("repo-main/app.js", "const ok = true;"));
        });

        service.importPublicRepository("https://github.com/owner/repo/tree/main");

        assertEquals(URI.create("https://github.com/owner/repo/archive/refs/heads/main.zip"), requested.get());
    }

    private static void assertUrlRejected(GitHubRepositoryImportService service, String url) {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> service.parse(url));
        assertEquals(GitHubRepositoryImportService.URL_ERROR, error.getMessage());
    }

    private GitHubRepositoryImportService serviceWithArchive(byte[] archive) {
        return new GitHubRepositoryImportService(new ScanProperties(), (uri, max) -> archive);
    }

    private static ZipFixture file(String name, String content) {
        return new ZipFixture(name, content);
    }

    private static byte[] zipWithFiles(ZipFixture... files) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ZipArchiveOutputStream zip = new ZipArchiveOutputStream(output)) {
            for (ZipFixture file : files) {
                zip.putArchiveEntry(new ZipArchiveEntry(file.name()));
                zip.write(file.content().getBytes());
                zip.closeArchiveEntry();
            }
        }
        return output.toByteArray();
    }

    private record ZipFixture(String name, String content) {}
}
