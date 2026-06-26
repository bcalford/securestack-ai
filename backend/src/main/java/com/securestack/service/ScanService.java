package com.securestack.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securestack.analysis.SecurityRule;
import com.securestack.analysis.ai.Ai.*;
import com.securestack.config.ScanProperties;
import com.securestack.dto.Dto.*;
import com.securestack.model.Entities.*;
import com.securestack.model.Enums.*;
import com.securestack.repository.*;
import org.apache.commons.compress.archivers.zip.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScanService {
    private final List<SecurityRule> rules;
    private final ScanRepository scans;
    private final FindingRepository findings;
    private final AiAnalysisProvider ai;
    private final ScanProperties properties;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Set<String> allowed = Set.of("js", "ts", "tsx", "java", "py", "json", "yaml", "yml", "env", "example", "dockerfile", "tf", "md", "txt", "xml", "properties", "gradle", "pom.xml", "package.json");

    public ScanService(List<SecurityRule> rules, ScanRepository scans, FindingRepository findings, AiAnalysisProvider ai) {
        this(rules, scans, findings, ai, new ScanProperties());
    }

    @Autowired
    public ScanService(List<SecurityRule> rules, ScanRepository scans, FindingRepository findings, AiAnalysisProvider ai, ScanProperties properties) {
        this.rules = rules;
        this.scans = scans;
        this.findings = findings;
        this.ai = ai;
        this.properties = properties;
    }

    @Transactional
    public CreateScanResponse create(String name, String depth, String focusAreas, String pastedJson, MultipartFile[] uploads, boolean pdf) throws Exception {
        ReviewDepth reviewDepth = parseDepth(depth);
        Set<Category> focusCategories = focusCategories(focusAreas);
        List<ScanFileInput> files = normalizeFiles(pastedJson, uploads);
        if (files.isEmpty()) throw new IllegalArgumentException("At least one pasted or uploaded file is required.");
        if (files.size() > properties.getMaxScanFiles()) throw new IllegalArgumentException("Too many files; maximum is " + properties.getMaxScanFiles() + ".");
        for (ScanFileInput file : files) validate(file);

        Scan scan = new Scan();
        scan.name = name == null || name.isBlank() ? "Untitled scan" : name;
        scan.fileCount = files.size();
        scan.files = files.stream().map(ScanFileInput::fileName).toList();

        List<Finding> found = new ArrayList<>();
        for (ScanFileInput file : files) {
            for (SecurityRule rule : rules) {
                if (enabled(rule, reviewDepth, focusCategories) && rule.supports(file)) found.addAll(rule.analyze(file));
            }
        }
        found = dedupe(sort(found));
        scan.findingCount = found.size();
        scan.riskScore = score(found);
        scan.riskLevel = level(scan.riskScore);
        Map<Severity, Long> sev = severityCounts(found);
        Map<Category, Long> cat = categoryCounts(found);
        var summary = ai.generateSummary(new AiAnalysisRequest(scan.name, scan.riskScore, sev, cat, reviewDepth.name()));
        scan.executiveSummary = summary.executiveSummary();
        scan.remediationSummary = summary.remediationPlan();
        scans.save(scan);
        for (Finding finding : found) {
            finding.scanId = scan.id;
            findings.save(finding);
        }
        return new CreateScanResponse(scan.id, scan.status, scan.riskScore, scan.riskLevel, scan.findingCount);
    }

    private List<ScanFileInput> normalizeFiles(String pastedJson, MultipartFile[] uploads) throws Exception {
        List<ScanFileInput> files = new ArrayList<>();
        if (pastedJson != null && !pastedJson.isBlank()) {
            for (PastedFile pasted : Arrays.asList(mapper.readValue(pastedJson, PastedFile[].class))) {
                if (pasted.content() != null && !pasted.content().isBlank()) files.add(new ScanFileInput(pasted.fileName(), pasted.fileType(), pasted.content()));
            }
        }
        if (uploads != null) for (MultipartFile upload : uploads) {
            if (upload == null || upload.isEmpty()) continue;
            String original = safeName(upload.getOriginalFilename());
            if (original.toLowerCase().endsWith(".zip")) {
                try (ZipArchiveInputStream zis = new ZipArchiveInputStream(upload.getInputStream())) {
                    ZipArchiveEntry entry;
                    while ((entry = zis.getNextZipEntry()) != null) {
                        if (entry.isDirectory() || skip(entry.getName())) continue;
                        String entryName = safeName(entry.getName());
                        byte[] bytes = zis.readNBytes(maxBytes() + 1);
                        files.add(new ScanFileInput(entryName, type(entryName), decodeText(bytes, entryName)));
                    }
                }
            } else {
                byte[] bytes = upload.getBytes();
                files.add(new ScanFileInput(original, type(original), decodeText(bytes, original)));
            }
        }
        return files;
    }

    private boolean enabled(SecurityRule rule, ReviewDepth depth, Set<Category> focus) {
        if (!focus.isEmpty() && !focus.contains(rule.category())) return false;
        if (depth == ReviewDepth.FULL) return true;
        if (depth == ReviewDepth.STANDARD) return rule.defaultSeverity() != Severity.INFO;
        return rule.defaultSeverity() == Severity.CRITICAL || rule.defaultSeverity() == Severity.HIGH;
    }

    private Set<Category> focusCategories(String focusAreas) {
        if (focusAreas == null || focusAreas.isBlank()) return Set.of();
        Set<Category> set = EnumSet.noneOf(Category.class);
        String v = focusAreas.toLowerCase();
        if (v.contains("secrets")) set.add(Category.SECRETS);
        if (v.contains("dependencies")) set.add(Category.DEPENDENCY);
        if (v.contains("api")) set.add(Category.API_SECURITY);
        if (v.contains("cloud") || v.contains("iac")) { set.add(Category.CLOUD_CONFIGURATION); set.add(Category.INFRASTRUCTURE_AS_CODE); }
        if (v.contains("docker") || v.contains("container")) set.add(Category.CONTAINER_SECURITY);
        if (v.contains("application")) set.addAll(List.of(Category.AUTHENTICATION, Category.AUTHORIZATION, Category.INPUT_VALIDATION, Category.DATA_EXPOSURE, Category.LOGGING_MONITORING, Category.GENERAL));
        if (v.contains("ai-generated")) return Set.of();
        return set;
    }

    private ReviewDepth parseDepth(String depth) { try { return ReviewDepth.valueOf(depth == null ? "STANDARD" : depth.toUpperCase()); } catch (Exception e) { return ReviewDepth.STANDARD; } }
    private String safeName(String name) {
        if (name == null || name.isBlank()) return "file.txt";
        String normalized = name.replace('\\', '/');
        if (normalized.startsWith("/") || normalized.contains("../") || normalized.contains("..\\") || Path.of(normalized).isAbsolute()) throw new IllegalArgumentException("Unsafe file path: " + name);
        return normalized;
    }
    private void validate(ScanFileInput file) {
        String name = safeName(file.fileName());
        String content = file.content() == null ? "" : file.content();
        if (content.length() > maxBytes()) throw new IllegalArgumentException("File exceeds maximum allowed size: " + name);
        if (content.indexOf('\0') >= 0) throw new IllegalArgumentException("Binary files are not supported: " + name);
        if (!allowed.contains(type(name))) throw new IllegalArgumentException("Unsupported file type: " + name);
    }
    private boolean skip(String name) { String l = name.toLowerCase(); return l.contains("node_modules/") || l.contains(".git/") || l.contains("target/") || l.contains("build/") || l.contains("dist/") || l.contains(".next/") || l.contains(".venv/") || l.contains("venv/"); }
    private String type(String name) { String l = name == null ? "txt" : name.toLowerCase(); if (l.endsWith("pom.xml")) return "pom.xml"; if (l.endsWith("package.json")) return "package.json"; if (l.endsWith("dockerfile") || l.equals("dockerfile")) return "dockerfile"; int i = l.lastIndexOf('.'); return i < 0 ? l : l.substring(i + 1); }
    private int maxBytes() { return properties.getMaxFileSizeMb() * 1024 * 1024; }
    private String decodeText(byte[] bytes, String name) { if (bytes.length > maxBytes()) throw new IllegalArgumentException("File exceeds maximum allowed size: " + name); return new String(bytes, StandardCharsets.UTF_8); }
    private List<Finding> sort(List<Finding> fs) { return fs.stream().sorted(Comparator.comparing((Finding f) -> f.severity.ordinal()).thenComparing(f -> f.confidence.ordinal()).thenComparing(f -> f.category.name()).thenComparing(f -> f.fileName).thenComparing(f -> Optional.ofNullable(f.lineNumber).orElse(0))).toList(); }
    private List<Finding> dedupe(List<Finding> fs) { Set<String> seen = new HashSet<>(); return fs.stream().filter(f -> seen.add(f.ruleId + f.fileName + f.lineNumber + f.title + f.evidence)).toList(); }
    public int score(List<Finding> fs) { int p = fs.stream().mapToInt(f -> switch (f.severity) { case CRITICAL -> 20; case HIGH -> 10; case MEDIUM -> 5; case LOW -> 2; case INFO -> 0; }).sum(); return Math.max(0, 100 - p); }
    public RiskLevel level(int s) { return s >= 90 ? RiskLevel.LOW : s >= 70 ? RiskLevel.MODERATE : s >= 40 ? RiskLevel.HIGH : RiskLevel.CRITICAL; }
    private Map<Severity, Long> severityCounts(List<Finding> fs) { return fs.stream().collect(Collectors.groupingBy(f -> f.severity, () -> new EnumMap<>(Severity.class), Collectors.counting())); }
    private Map<Category, Long> categoryCounts(List<Finding> fs) { return fs.stream().collect(Collectors.groupingBy(f -> f.category, () -> new EnumMap<>(Category.class), Collectors.counting())); }
    public ScanResultDto get(UUID id) { Scan s = scans.findById(id).orElseThrow(NoSuchElementException::new); return dto(s, findings.findByScanId(id)); }
    public List<ScanListItem> list() { return scans.findAll().stream().map(s -> new ScanListItem(s.id, s.name, s.createdAt, s.riskScore, s.riskLevel, s.findingCount)).toList(); }
    @Transactional public void update(UUID sid, UUID fid, FindingStatus st) { Finding f = findings.findById(fid).orElseThrow(NoSuchElementException::new); if (!f.scanId.equals(sid)) throw new NoSuchElementException(); f.status = st; }
    @Transactional public void delete(UUID sid) { findings.deleteAll(findings.findByScanId(sid)); scans.deleteById(sid); }
    private ScanResultDto dto(Scan s, List<Finding> fs) { return new ScanResultDto(s.id, s.name, s.createdAt, s.status, s.riskScore, s.riskLevel, s.fileCount, s.findingCount, s.executiveSummary, s.remediationSummary, fs.stream().map(f -> new FindingDto(f.id, f.fileName, f.lineNumber, f.title, f.description, f.severity, f.category, f.confidence, f.evidence, f.recommendation, f.secureExample, f.status, f.ruleId)).toList(), severityCounts(fs), categoryCounts(fs), s.files); }
}
