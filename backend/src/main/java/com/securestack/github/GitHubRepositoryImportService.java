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
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class GitHubRepositoryImportService {
    private static final Pattern SAFE_GITHUB_NAME = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,99}");
    private static final Pattern SAFE_BRANCH = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._/-]{0,199}");
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
        URI archiveUri = ref.archiveUri();
        byte[] archive = downloader.download(archiveUri, maxDownloadBytes());
        return zipToScanFiles(archive);
    }

    public GitHubRepositoryRef parse(String repositoryUrl) {
        if (repositoryUrl == null || repositoryUrl.isBlank()) {
            throw new IllegalArgumentException("GitHub repository URL is required.");
        }
        URI uri;
        try {
            uri = URI.create(repositoryUrl.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Malformed GitHub repository URL.");
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new IllegalArgumentException("Only HTTPS GitHub repository URLs are supported.");
        }
        if (uri.getUserInfo() != null) {
            throw new IllegalArgumentException("GitHub repository URLs must not include credentials.");
        }
        if (!"github.com".equalsIgnoreCase(uri.getHost())) {
            throw new IllegalArgumentException("Only github.com repository URLs are supported.");
        }
        if (uri.getRawQuery() != null || uri.getRawFragment() != null) {
            throw new IllegalArgumentException("GitHub repository URLs must not include query strings or fragments.");
        }

        String[] parts = uri.getPath() == null ? new String[0] : uri.getPath().split("/", -1);
        List<String> path = new ArrayList<>();
        for (String part : parts) {
            if (!part.isBlank()) path.add(part);
        }
        if (path.size() != 2 && path.size() < 4) {
            throw new IllegalArgumentException("Expected a public GitHub repository URL like https://github.com/owner/repo.");
        }
        String owner = cleanSegment(path.get(0), "owner");
        String repo = cleanSegment(path.get(1), "repository");
        String branch = null;
        if (path.size() >= 4) {
            if (!"tree".equals(path.get(2))) {
                throw new IllegalArgumentException("Only /tree/{branch} repository URLs are supported beyond owner/repo.");
            }
            branch = cleanBranch(String.join("/", path.subList(3, path.size())));
        }
        return new GitHubRepositoryRef(owner, repo, branch);
    }

    List<ScanFileInput> zipToScanFiles(byte[] archive) throws IOException {
        List<ScanFileInput> files = new ArrayList<>();
        try (ZipArchiveInputStream zip = new ZipArchiveInputStream(new ByteArrayInputStream(archive))) {
            ZipArchiveEntry entry;
            while ((entry = zip.getNextZipEntry()) != null) {
                if (entry.isDirectory() || skip(entry.getName())) continue;
                String entryName = stripArchiveRoot(safeName(entry.getName()));
                if (entryName.isBlank() || skip(entryName)) continue;
                byte[] bytes = zip.readNBytes(maxFileBytes() + 1);
                files.add(new ScanFileInput(entryName, type(entryName), decodeText(bytes, entryName)));
                ensureWithinMaxFiles(files);
            }
        }
        return files;
    }

    private String cleanSegment(String value, String label) {
        if (value == null || value.equals(".") || value.equals("..") || !SAFE_GITHUB_NAME.matcher(value).matches()) {
            throw new IllegalArgumentException("Malformed GitHub " + label + " name.");
        }
        return value;
    }

    private String cleanBranch(String value) {
        if (value == null || value.contains("..") || value.startsWith("/") || value.endsWith("/") || !SAFE_BRANCH.matcher(value).matches()) {
            throw new IllegalArgumentException("Malformed GitHub branch name.");
        }
        return value;
    }

    private String safeName(String name) {
        if (name == null || name.isBlank()) return "";
        String normalized = name.replace('\\', '/');
        if (normalized.startsWith("/") || normalized.contains("../") || normalized.contains("..\\") || Path.of(normalized).isAbsolute()) {
            throw new IllegalArgumentException("Unsafe archive path detected.");
        }
        return normalized;
    }

    private String stripArchiveRoot(String name) {
        int slash = name.indexOf('/');
        return slash < 0 ? name : name.substring(slash + 1);
    }

    private void ensureWithinMaxFiles(List<ScanFileInput> files) {
        if (files.size() > properties.getMaxScanFiles()) {
            throw new IllegalArgumentException("Too many files; maximum is " + properties.getMaxScanFiles() + ".");
        }
    }

    private boolean skip(String name) { String l = name.toLowerCase(); return l.contains("node_modules/") || l.contains(".git/") || l.contains("target/") || l.contains("build/") || l.contains("dist/") || l.contains(".next/") || l.contains(".venv/") || l.contains("venv/"); }
    private String type(String name) { String l = name == null ? "txt" : name.toLowerCase(); if (l.endsWith("pom.xml")) return "pom.xml"; if (l.endsWith("package.json")) return "package.json"; if (l.endsWith("dockerfile") || l.equals("dockerfile")) return "dockerfile"; int i = l.lastIndexOf('.'); return i < 0 ? l : l.substring(i + 1); }
    private int maxFileBytes() { return properties.getMaxFileSizeMb() * 1024 * 1024; }
    private int maxDownloadBytes() { return properties.getMaxGithubDownloadSizeMb() * 1024 * 1024; }
    private String decodeText(byte[] bytes, String name) { if (bytes.length > maxFileBytes()) throw new IllegalArgumentException("File exceeds maximum allowed size: " + name); return new String(bytes, StandardCharsets.UTF_8); }

    public record GitHubRepositoryRef(String owner, String repo, String branch) {
        URI archiveUri() {
            if (branch == null) {
                return URI.create("https://github.com/" + owner + "/" + repo + "/archive/HEAD.zip");
            }
            return URI.create("https://github.com/" + owner + "/" + repo + "/archive/refs/heads/" + branch + ".zip");
        }
    }

    @FunctionalInterface
    interface GitHubArchiveDownloader {
        byte[] download(URI archiveUri, int maxBytes) throws IOException, InterruptedException;
    }

    static class HttpGitHubArchiveDownloader implements GitHubArchiveDownloader {
        private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).followRedirects(HttpClient.Redirect.NORMAL).build();

        @Override
        public byte[] download(URI archiveUri, int maxBytes) throws IOException, InterruptedException {
            HttpRequest request = HttpRequest.newBuilder(archiveUri).timeout(Duration.ofSeconds(30)).GET().build();
            HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() == 404) {
                throw new IllegalArgumentException("Public GitHub repository archive was not found or is not accessible.");
            }
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalArgumentException("Unable to download the public GitHub repository archive.");
            }
            try (InputStream body = response.body()) {
                byte[] bytes = body.readNBytes(maxBytes + 1);
                if (bytes.length > maxBytes) {
                    throw new IllegalArgumentException("GitHub repository archive exceeds maximum download size.");
                }
                return bytes;
            }
        }
    }
}
