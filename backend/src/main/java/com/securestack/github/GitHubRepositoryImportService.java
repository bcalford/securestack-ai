package com.securestack.github;

import com.securestack.config.ScanProperties;
import com.securestack.dto.Dto.ScanFileInput;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class GitHubRepositoryImportService {
    static final String URL_ERROR = "Only public https://github.com/{owner}/{repo} URLs are supported.";
    static final String DOWNLOAD_TOO_LARGE_ERROR = "Repository archive exceeded the maximum allowed download size.";
    static final String DOWNLOAD_ERROR = "Repository archive could not be downloaded.";
    static final String PROCESSING_ERROR = "Repository archive could not be processed safely.";
    static final String NO_SUPPORTED_FILES_ERROR = "Repository did not contain supported files.";

    private static final Pattern SAFE_GITHUB_NAME = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,99}");
    private static final Pattern SAFE_BRANCH = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._/-]{0,199}");
    private static final Set<String> ALLOWED_TYPES = Set.of("js", "ts", "tsx", "java", "py", "json", "yaml", "yml", "env", "example", "dockerfile", "tf", "md", "txt", "xml", "properties", "gradle", "pom.xml", "package.json");

    private final ScanProperties properties;
    private final GitHubArchiveDownloader downloader;

    @Autowired
    public GitHubRepositoryImportService(ScanProperties properties) {
        this(properties, new HttpGitHubArchiveDownloader());
    }

    GitHubRepositoryImportService(ScanProperties properties, GitHubArchiveDownloader downloader) {
        this.properties = properties;
        this.downloader = downloader;
    }

    public List<ScanFileInput> importPublicRepository(String repositoryUrl) throws IOException, InterruptedException {
        GitHubRepositoryRef ref = parse(repositoryUrl);
        byte[] archive;
        try {
            archive = downloader.download(ref.archiveUri(), maxDownloadBytes());
        } catch (IllegalArgumentException e) {
            if (DOWNLOAD_TOO_LARGE_ERROR.equals(e.getMessage()) || DOWNLOAD_ERROR.equals(e.getMessage())) throw e;
            throw new IllegalArgumentException(DOWNLOAD_ERROR);
        } catch (IOException e) {
            throw new IllegalArgumentException(DOWNLOAD_ERROR);
        }
        try {
            return zipToScanFiles(archive);
        } catch (IllegalArgumentException | IOException e) {
            if (NO_SUPPORTED_FILES_ERROR.equals(e.getMessage())) throw e;
            throw new IllegalArgumentException(PROCESSING_ERROR);
        }
    }

    public GitHubRepositoryRef parse(String repositoryUrl) {
        URI uri;
        try {
            if (repositoryUrl == null || repositoryUrl.isBlank()) throw new IllegalArgumentException();
            uri = URI.create(repositoryUrl.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(URL_ERROR);
        }
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getUserInfo() != null || !"github.com".equalsIgnoreCase(uri.getHost())
                || uri.getRawQuery() != null || uri.getRawFragment() != null) {
            throw new IllegalArgumentException(URL_ERROR);
        }

        String pathValue = uri.getRawPath() == null ? "" : uri.getRawPath();
        if (pathValue.contains("%2e") || pathValue.contains("%2E") || pathValue.contains("%2f") || pathValue.contains("%2F") || pathValue.contains("%5c") || pathValue.contains("%5C")) {
            throw new IllegalArgumentException(URL_ERROR);
        }
        String[] parts = pathValue.split("/", -1);
        List<String> path = new ArrayList<>();
        for (String part : parts) if (!part.isBlank()) path.add(part);
        if (path.size() != 2 && path.size() < 4) throw new IllegalArgumentException(URL_ERROR);

        String owner = cleanSegment(path.get(0));
        String repo = cleanSegment(path.get(1));
        String branch = null;
        if (path.size() >= 4) {
            if (!"tree".equals(path.get(2))) throw new IllegalArgumentException(URL_ERROR);
            branch = cleanBranch(String.join("/", path.subList(3, path.size())));
        }
        return new GitHubRepositoryRef(owner, repo, branch);
    }

    List<ScanFileInput> zipToScanFiles(byte[] archive) throws IOException {
        if (!looksLikeZip(archive)) throw new IllegalArgumentException(PROCESSING_ERROR);
        List<ScanFileInput> files = new ArrayList<>();
        try (ZipArchiveInputStream zip = new ZipArchiveInputStream(new ByteArrayInputStream(archive))) {
            ZipArchiveEntry entry;
            while ((entry = zip.getNextZipEntry()) != null) {
                if (entry.isDirectory() || skip(entry.getName())) continue;
                String entryName = stripArchiveRoot(safeName(entry.getName()));
                if (entryName.isBlank() || skip(entryName)) continue;
                if (!ALLOWED_TYPES.contains(type(entryName))) continue;
                byte[] bytes = zip.readNBytes(maxFileBytes() + 1);
                files.add(new ScanFileInput(entryName, type(entryName), decodeText(bytes, entryName)));
                ensureWithinMaxFiles(files);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException(PROCESSING_ERROR);
        }
        if (files.isEmpty()) throw new IllegalArgumentException(NO_SUPPORTED_FILES_ERROR);
        return files;
    }

    private String cleanSegment(String value) {
        if (value == null || value.equals(".") || value.equals("..") || value.endsWith(".git") || !SAFE_GITHUB_NAME.matcher(value).matches()) {
            throw new IllegalArgumentException(URL_ERROR);
        }
        return value;
    }

    private String cleanBranch(String value) {
        if (value == null || value.contains("..") || value.startsWith("/") || value.endsWith("/") || !SAFE_BRANCH.matcher(value).matches()) {
            throw new IllegalArgumentException(URL_ERROR);
        }
        return value;
    }

    private String safeName(String name) {
        if (name == null || name.isBlank()) return "";
        String normalized = name.replace('\\', '/');
        if (normalized.startsWith("/") || normalized.contains("../") || normalized.contains("/..") || Path.of(normalized).isAbsolute()) throw new IllegalArgumentException(PROCESSING_ERROR);
        return normalized;
    }

    private boolean looksLikeZip(byte[] archive) { return archive != null && archive.length >= 4 && archive[0] == 'P' && archive[1] == 'K'; }
    private String stripArchiveRoot(String name) { int slash = name.indexOf('/'); return slash < 0 ? name : name.substring(slash + 1); }
    private void ensureWithinMaxFiles(List<ScanFileInput> files) { if (files.size() > properties.getMaxScanFiles()) throw new IllegalArgumentException(PROCESSING_ERROR); }
    private boolean skip(String name) { String l = name == null ? "" : name.toLowerCase(); return l.contains("node_modules/") || l.contains(".git/") || l.contains("target/") || l.contains("build/") || l.contains("dist/") || l.contains(".next/") || l.contains(".venv/") || l.contains("venv/"); }
    private String type(String name) { String l = name == null ? "txt" : name.toLowerCase(); if (l.endsWith("pom.xml")) return "pom.xml"; if (l.endsWith("package.json")) return "package.json"; if (l.endsWith("dockerfile") || l.equals("dockerfile")) return "dockerfile"; int i = l.lastIndexOf('.'); return i < 0 ? l : l.substring(i + 1); }
    private int maxFileBytes() { return properties.getMaxFileSizeMb() * 1024 * 1024; }
    private int maxDownloadBytes() { return properties.getMaxGithubDownloadSizeMb() * 1024 * 1024; }
    private String decodeText(byte[] bytes, String name) { if (bytes.length > maxFileBytes() || new String(bytes, StandardCharsets.UTF_8).indexOf('\0') >= 0) throw new IllegalArgumentException(PROCESSING_ERROR); return new String(bytes, StandardCharsets.UTF_8); }

    public record GitHubRepositoryRef(String owner, String repo, String branch) {
        URI archiveUri() { return branch == null ? URI.create("https://github.com/" + owner + "/" + repo + "/archive/HEAD.zip") : URI.create("https://github.com/" + owner + "/" + repo + "/archive/refs/heads/" + branch + ".zip"); }
    }

    @FunctionalInterface
    interface GitHubArchiveDownloader { byte[] download(URI archiveUri, int maxBytes) throws IOException, InterruptedException; }

    static class HttpGitHubArchiveDownloader implements GitHubArchiveDownloader {
        private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).followRedirects(HttpClient.Redirect.NORMAL).build();
        @Override public byte[] download(URI archiveUri, int maxBytes) throws IOException, InterruptedException {
            HttpRequest request = HttpRequest.newBuilder(archiveUri).timeout(Duration.ofSeconds(30)).GET().build();
            try {
                HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
                if (response.statusCode() != 200) throw new IllegalArgumentException(DOWNLOAD_ERROR);
                try (InputStream body = response.body()) {
                    byte[] bytes = body.readNBytes(maxBytes + 1);
                    if (bytes.length > maxBytes) throw new IllegalArgumentException(DOWNLOAD_TOO_LARGE_ERROR);
                    return bytes;
                }
            } catch (HttpTimeoutException e) {
                throw new IllegalArgumentException(DOWNLOAD_ERROR);
            }
        }
    }
}
