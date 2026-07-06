package com.securestack.review;

import com.securestack.dto.Dto.*;
import com.securestack.model.Entities.*;
import com.securestack.model.Enums.*;
import com.securestack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class SecurityReviewArtifactService {
    private final ScanRepository scans;
    private final FindingRepository findings;

    public SecurityReviewArtifactService(ScanRepository scans, FindingRepository findings) {
        this.scans = scans;
        this.findings = findings;
    }

    @Transactional(readOnly = true)
    public ThreatModelDto threatModel(UUID scanId) {
        Scan scan = scan(scanId);
        List<Finding> fs = orderedFindings(scanId);
        List<String> files = safeFiles(scan);
        return new ThreatModelDto(
                scan.id,
                scan.name,
                assets(fs, files),
                entryPoints(fs, files),
                trustBoundaries(fs, files),
                dataFlows(fs, files),
                assumptions(fs),
                abuseCases(fs),
                recommendedControls(fs),
                relatedFindingIds(fs)
        );
    }

    @Transactional(readOnly = true)
    public RiskPathResponseDto riskPaths(UUID scanId) {
        Scan scan = scan(scanId);
        List<Finding> fs = orderedFindings(scanId);
        List<RiskPathDto> paths = riskDefinitions().stream()
                .map(def -> path(def, fs))
                .filter(p -> !p.relatedFindingIds().isEmpty() || fs.isEmpty())
                .toList();
        return new RiskPathResponseDto(scan.id, scan.name, paths);
    }

    @Transactional(readOnly = true)
    public FixPlanDto fixPlan(UUID scanId) {
        Scan scan = scan(scanId);
        List<Finding> fs = orderedFindings(scanId);
        List<FixPlanItemDto> items = fs.stream().map(this::fixItem).toList();
        if (items.isEmpty()) {
            items = List.of(new FixPlanItemDto("hardening backlog", "Maintain low-risk security hygiene", "LOW", "Low", "Preserves current low-risk posture", "security", List.of("Review scan inputs for expected coverage", "Keep dependency and container baselines current", "Document any accepted residual risk"), safeFiles(scan), List.of()));
        }
        return new FixPlanDto(scan.id, scan.name, items.stream().filter(i -> i.phase().equals("fix first")).toList(), items.stream().filter(i -> i.phase().equals("fix next")).toList(), items.stream().filter(i -> i.phase().equals("hardening backlog")).toList());
    }

    @Transactional(readOnly = true)
    public SecurityChecklistDto checklist(UUID scanId) {
        Scan scan = scan(scanId);
        List<Finding> fs = orderedFindings(scanId);
        Set<Category> cats = categories(fs);
        List<ChecklistItemDto> items = new ArrayList<>();
        items.add(item("secrets-reviewed", "Secrets reviewed", !cats.contains(Category.SECRETS), "Confirm detected secrets are revoked, rotated, and removed from source control."));
        items.add(item("authentication-session-reviewed", "Authentication/session reviewed", !(cats.contains(Category.AUTHENTICATION) || cats.contains(Category.AUTHORIZATION)), "Review authentication, authorization, cookie, and session findings."));
        items.add(item("cors-reviewed", "CORS reviewed", fs.stream().noneMatch(f -> text(f).contains("cors")), "Validate cross-origin policy is intentionally scoped."));
        items.add(item("dockerfile-reviewed", "Dockerfile reviewed", !cats.contains(Category.CONTAINER_SECURITY), "Review container image, user, package, and runtime hardening findings."));
        items.add(item("dependency-scripts-reviewed", "Dependency scripts reviewed", !cats.contains(Category.DEPENDENCY), "Review install scripts and dependency lifecycle risks."));
        items.add(item("cloud-iac-reviewed", "Cloud/IaC reviewed", !(cats.contains(Category.CLOUD_CONFIGURATION) || cats.contains(Category.INFRASTRUCTURE_AS_CODE)), "Review cloud exposure, IAM, storage, and IaC guardrails."));
        items.add(item("high-findings-triaged", "High findings triaged", fs.stream().noneMatch(f -> f.severity == Severity.CRITICAL || f.severity == Severity.HIGH), "Prioritize critical and high findings before lower-risk cleanup."));
        items.add(item("false-positives-marked", "False positives marked", fs.stream().noneMatch(f -> f.status == FindingStatus.OPEN), "Mark reviewed false positives or accepted risk after validation."));
        items.add(item("exports-generated", "Exports generated", false, "Generate report, SARIF, JSON, or bundle exports for review records."));
        items.add(item("fix-plan-reviewed", "Fix plan reviewed", fs.isEmpty(), "Review the deterministic fix plan and assign owners."));
        return new SecurityChecklistDto(scan.id, scan.name, items);
    }

    private Scan scan(UUID id) { return scans.findById(id).orElseThrow(NoSuchElementException::new); }
    private List<Finding> orderedFindings(UUID id) { return findings.findByScanId(id).stream().sorted(Comparator.comparing((Finding f) -> f.severity.ordinal()).thenComparing(f -> Optional.ofNullable(f.fileName).orElse(""))).toList(); }
    private List<String> safeFiles(Scan s) { return s.files == null ? List.of() : s.files.stream().filter(Objects::nonNull).distinct().toList(); }
    private Set<Category> categories(List<Finding> fs) { EnumSet<Category> set = EnumSet.noneOf(Category.class); fs.forEach(f -> set.add(f.category)); return set; }
    private List<UUID> relatedFindingIds(List<Finding> fs) { return fs.stream().map(f -> f.id).toList(); }
    private String text(Finding f) { return ((f.ruleId + " " + f.title + " " + f.description + " " + f.fileName)).toLowerCase(); }

    private List<String> assets(List<Finding> fs, List<String> files) { List<String> out = new ArrayList<>(List.of("Source code and configuration included in the scan", "Application secrets and credentials referenced by configuration", "Build, dependency, container, and cloud configuration metadata")); if (fs.isEmpty()) out.add("No high-risk assets were flagged by deterministic rules"); return out; }
    private List<String> entryPoints(List<Finding> fs, List<String> files) { Set<String> out = new LinkedHashSet<>(List.of("Uploaded or pasted files analyzed by SecureStack AI", "Application HTTP/API boundaries inferred from security findings")); files.stream().filter(f -> f.toLowerCase().contains("docker") || f.endsWith(".tf") || f.endsWith("package.json")).forEach(f -> out.add("Configuration file: " + f)); return new ArrayList<>(out); }
    private List<String> trustBoundaries(List<Finding> fs, List<String> files) { return List.of("Browser/client to backend service boundary", "Application to dependency and build tooling boundary", "Application to cloud, container, and runtime infrastructure boundary", "Logs, reports, and exported findings to reviewer boundary"); }
    private List<String> dataFlows(List<Finding> fs, List<String> files) { return List.of("Scan metadata and masked finding evidence flow into deterministic review artifacts", "Application configuration influences runtime security posture", "Dependency and container configuration influences build and deployment posture"); }
    private List<String> assumptions(List<Finding> fs) { return List.of("Artifacts are generated from stored scan findings and file names only", "Raw uploaded file content is not stored or reused for these artifacts", "Findings require human validation before production changes", "No external AI or network service is called for artifact generation"); }
    private List<String> abuseCases(List<Finding> fs) { if (fs.isEmpty()) return List.of("No specific abuse case was identified; continue routine secure review and monitoring."); return fs.stream().limit(8).map(f -> "Defensively review " + f.category.name().toLowerCase().replace('_', ' ') + " risk in " + f.fileName + " and reduce exposure through the recommended control.").distinct().toList(); }
    private List<String> recommendedControls(List<Finding> fs) { Set<String> c = new LinkedHashSet<>(); fs.forEach(f -> { if (f.recommendation != null && !f.recommendation.isBlank()) c.add(f.recommendation); }); if (c.isEmpty()) c.addAll(List.of("Maintain least privilege defaults", "Keep dependencies and runtime images current", "Continue periodic secure code review")); return new ArrayList<>(c); }

    private List<RiskPathDefinition> riskDefinitions() { return List.of(new RiskPathDefinition("credential-exposure", "Credential exposure path", Set.of(Category.SECRETS), "Protect secret material and remove credentials from source-controlled or exported configuration."), new RiskPathDefinition("session-authentication", "Session/authentication risk path", Set.of(Category.AUTHENTICATION, Category.AUTHORIZATION, Category.API_SECURITY), "Strengthen identity, session, authorization, and API boundary controls."), new RiskPathDefinition("unsafe-deployment-container", "Unsafe deployment/container path", Set.of(Category.CONTAINER_SECURITY), "Harden image, package, user, and runtime deployment defaults."), new RiskPathDefinition("cloud-iac-misconfiguration", "Cloud/IaC misconfiguration path", Set.of(Category.CLOUD_CONFIGURATION, Category.INFRASTRUCTURE_AS_CODE), "Apply least privilege and private-by-default cloud infrastructure controls."), new RiskPathDefinition("dependency-script-supply-chain", "Dependency/script supply-chain path", Set.of(Category.DEPENDENCY), "Reduce dependency lifecycle and build script risk with review and pinning."), new RiskPathDefinition("logging-data-exposure", "Logging/data exposure path", Set.of(Category.DATA_EXPOSURE, Category.LOGGING_MONITORING, Category.INPUT_VALIDATION), "Reduce unintended data disclosure through validation, redaction, and safe error handling.")); }
    private RiskPathDto path(RiskPathDefinition def, List<Finding> fs) { List<Finding> matches = fs.stream().filter(f -> def.categories().contains(f.category)).toList(); return new RiskPathDto(def.id(), def.name(), def.narrative(), matches.stream().map(f -> f.id).toList(), matches.stream().map(f -> f.ruleId).filter(Objects::nonNull).distinct().toList(), matches.stream().map(f -> f.fileName).filter(Objects::nonNull).distinct().toList(), matches.isEmpty() ? List.of("No matching findings; keep this area on the review checklist.") : matches.stream().map(f -> f.recommendation).filter(Objects::nonNull).distinct().toList()); }
    private record RiskPathDefinition(String id, String name, Set<Category> categories, String narrative) {}

    private FixPlanItemDto fixItem(Finding f) { String phase = (f.severity == Severity.CRITICAL || f.severity == Severity.HIGH) ? "fix first" : (f.severity == Severity.MEDIUM ? "fix next" : "hardening backlog"); return new FixPlanItemDto(phase, f.title, f.severity.name(), effort(f.severity), reduction(f.severity), owner(f.category), List.of("Confirm the finding is reproducible through code/configuration review", "Apply the recommended defensive change", "Rerun the relevant SecureStack scan and project tests", "Record any accepted residual risk"), f.fileName == null ? List.of() : List.of(f.fileName), f.ruleId == null ? List.of() : List.of(f.ruleId)); }
    private String effort(Severity s) { return switch (s) { case CRITICAL, HIGH -> "Medium"; case MEDIUM -> "Small"; case LOW, INFO -> "Low"; }; }
    private String reduction(Severity s) { return switch (s) { case CRITICAL -> "Very high"; case HIGH -> "High"; case MEDIUM -> "Moderate"; case LOW -> "Low"; case INFO -> "Informational"; }; }
    private String owner(Category c) { return switch (c) { case CONTAINER_SECURITY, CLOUD_CONFIGURATION, INFRASTRUCTURE_AS_CODE, DEPENDENCY -> "devops"; case AUTHENTICATION, AUTHORIZATION, API_SECURITY, INPUT_VALIDATION, DATA_EXPOSURE, LOGGING_MONITORING, SECRETS -> "backend"; default -> "security"; }; }
    private ChecklistItemDto item(String id, String label, boolean completed, String guidance) { return new ChecklistItemDto(id, label, completed ? "completed" : "pending", guidance); }
}
