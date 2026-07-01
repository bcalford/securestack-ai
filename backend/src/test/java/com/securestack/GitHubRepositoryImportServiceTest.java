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
        var service = serviceWithArchive(new byte[0]);

        var ref = service.parse("https://github.com/securestack/demo/");

        assertEquals("securestack", ref.owner());
        assertEquals("demo", ref.repo());
        assertNull(ref.branch());
    }

    @Test
    void parsesValidTreeBranchUrl() {
        var service = serviceWithArchive(new byte[0]);

        var ref = service.parse("https://github.com/securestack/demo/tree/feature/safe-branch");

        assertEquals("feature/safe-branch", ref.branch());
    }

    @Test
    void rejectsUnsupportedUrls() {
        var service = serviceWithArchive(new byte[0]);

        assertAll(
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("https://example.com/owner/repo")),
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("http://github.com/owner/repo")),
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("https://user:pass@github.com/owner/repo")),
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("git@github.com:owner/repo.git")),
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("https://gist.github.com/owner/id")),
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("https://raw.githubusercontent.com/owner/repo/main/app.js")),
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("https://github.com/../repo")),
                () -> assertThrows(IllegalArgumentException.class, () -> service.parse("https://github.com/owner/repo/archive/main.zip"))
        );
    }

    @Test
    void mapsArchiveEntriesToScanFileInputsSafelyWithoutExecutingCode() throws Exception {
        var service = serviceWithArchive(new byte[0]);
        byte[] archive = zipWithFiles(
                file("repo-main/src/app.js", "throw new Error('should not execute');"),
                file("repo-main/node_modules/ignored.js", "const ignored = true;"),
                file("repo-main/.git/config", "ignored")
        );

        var files = service.zipToScanFiles(archive);

        assertEquals(1, files.size());
        assertEquals("src/app.js", files.get(0).fileName());
        assertTrue(files.get(0).content().contains("should not execute"));
    }

    @Test
    void rejectsUnsafeArchiveEntryPath() throws Exception {
        var service = serviceWithArchive(new byte[0]);
        byte[] archive = zipWithFiles(file("repo-main/../evil.js", "const bad = true;"));

        assertThrows(IllegalArgumentException.class, () -> service.zipToScanFiles(archive));
    }

    @Test
    void enforcesMaxFileCount() throws Exception {
        ScanProperties properties = new ScanProperties();
        properties.setMaxScanFiles(1);
        var service = new GitHubRepositoryImportService(properties, (uri, max) -> zipWithFiles(file("repo/a.js", ""), file("repo/b.js", "")));

        assertThrows(IllegalArgumentException.class, () -> service.importPublicRepository("https://github.com/owner/repo"));
    }

    @Test
    void enforcesDownloadSizeThroughDownloaderLimit() throws Exception {
        ScanProperties properties = new ScanProperties();
        properties.setMaxGithubDownloadSizeMb(1);
        AtomicReference<Integer> observedLimit = new AtomicReference<>();
        var service = new GitHubRepositoryImportService(properties, (uri, max) -> {
            observedLimit.set(max);
            throw new IllegalArgumentException("GitHub repository archive exceeds maximum download size.");
        });

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> service.importPublicRepository("https://github.com/owner/repo"));

        assertEquals(1024 * 1024, observedLimit.get());
        assertTrue(error.getMessage().contains("maximum download size"));
    }

    @Test
    void returnsControlledDownloadFailure() {
        var service = new GitHubRepositoryImportService(new ScanProperties(), (uri, max) -> {
            throw new IllegalArgumentException("Unable to download the public GitHub repository archive.");
        });

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> service.importPublicRepository("https://github.com/owner/repo"));

        assertEquals("Unable to download the public GitHub repository archive.", error.getMessage());
    }

    @Test
    void downloadsOnlyDeterministicGithubArchiveUrlAfterValidation() throws Exception {
        AtomicReference<URI> requested = new AtomicReference<>();
        var service = new GitHubRepositoryImportService(new ScanProperties(), (uri, max) -> {
            requested.set(uri);
            return zipWithFiles(file("repo-main/app.js", "const ok = true;"));
        });

        service.importPublicRepository("https://github.com/owner/repo/tree/main");

        assertEquals(URI.create("https://github.com/owner/repo/archive/refs/heads/main.zip"), requested.get());
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
