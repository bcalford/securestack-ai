package com.securestack.sarif;

import com.securestack.dto.Dto.FindingDto;
import com.securestack.dto.Dto.ScanResultDto;
import com.securestack.model.Enums.Severity;
import com.securestack.service.ScanService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SarifService {
    private static final String SARIF_VERSION = "2.1.0";
    private static final String SARIF_SCHEMA = "https://json.schemastore.org/sarif-2.1.0.json";
    private static final String TOOL_NAME = "SecureStack AI";
    private static final String INFORMATION_URI = "https://github.com/bcalford/securestack-ai";
    private static final String APP_VERSION = "0.4-alpha";

    private final ScanService scans;

    public SarifService(ScanService scans) {
        this.scans = scans;
    }

    public Map<String, Object> export(UUID scanId) {
        ScanResultDto scan = scans.get(scanId);
        Map<String, Object> sarif = new LinkedHashMap<>();
        sarif.put("version", SARIF_VERSION);
        sarif.put("$schema", SARIF_SCHEMA);
        sarif.put("runs", List.of(run(scan.findings())));
        return sarif;
    }

    private Map<String, Object> run(List<FindingDto> findings) {
        Map<String, Object> run = new LinkedHashMap<>();
        run.put("tool", Map.of("driver", driver(findings)));
        run.put("results", findings.stream()
                .sorted(Comparator.comparing(FindingDto::ruleId, Comparator.nullsLast(String::compareTo))
                        .thenComparing(FindingDto::fileName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(finding -> finding.lineNumber() == null ? 0 : finding.lineNumber())
                        .thenComparing(FindingDto::title, Comparator.nullsLast(String::compareTo)))
                .map(this::result)
                .toList());
        return run;
    }

    private Map<String, Object> driver(List<FindingDto> findings) {
        Map<String, Object> driver = new LinkedHashMap<>();
        driver.put("name", TOOL_NAME);
        driver.put("informationUri", INFORMATION_URI);
        driver.put("semanticVersion", APP_VERSION);
        driver.put("rules", findings.stream()
                .sorted(Comparator.comparing(FindingDto::ruleId, Comparator.nullsLast(String::compareTo))
                        .thenComparing(FindingDto::title, Comparator.nullsLast(String::compareTo)))
                .collect(LinkedHashMap<String, FindingDto>::new, (rules, finding) -> rules.putIfAbsent(finding.ruleId(), finding), Map::putAll)
                .values()
                .stream()
                .map(this::rule)
                .toList());
        return driver;
    }

    private Map<String, Object> rule(FindingDto finding) {
        Map<String, Object> rule = new LinkedHashMap<>();
        rule.put("id", finding.ruleId());
        rule.put("shortDescription", text(mask(finding.title())));
        if (hasText(finding.description())) rule.put("fullDescription", text(mask(finding.description())));
        if (hasText(finding.recommendation())) rule.put("help", text(mask(finding.recommendation())));
        Map<String, Object> properties = new LinkedHashMap<>();
        if (finding.category() != null) properties.put("category", finding.category().name());
        if (finding.severity() != null) properties.put("security-severity", securitySeverity(finding.severity()));
        if (finding.confidence() != null) properties.put("precision", precision(finding.confidence()));
        if (!properties.isEmpty()) rule.put("properties", properties);
        return rule;
    }

    private Map<String, Object> result(FindingDto finding) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ruleId", finding.ruleId());
        result.put("level", level(finding.severity()));
        result.put("message", text(mask(finding.title())));
        result.put("locations", List.of(location(finding)));
        result.put("partialFingerprints", Map.of("securestackFingerprint/v1", fingerprint(finding)));
        Map<String, Object> properties = new LinkedHashMap<>();
        if (finding.category() != null) properties.put("category", finding.category().name());
        if (finding.confidence() != null) properties.put("confidence", finding.confidence().name());
        if (hasText(finding.recommendation())) properties.put("recommendation", mask(finding.recommendation()));
        if (finding.status() != null) properties.put("status", finding.status().name());
        if (!properties.isEmpty()) result.put("properties", properties);
        return result;
    }

    private Map<String, Object> location(FindingDto finding) {
        Map<String, Object> physicalLocation = new LinkedHashMap<>();
        physicalLocation.put("artifactLocation", Map.of("uri", finding.fileName() == null ? "unknown" : finding.fileName()));
        if (finding.lineNumber() != null) physicalLocation.put("region", Map.of("startLine", finding.lineNumber()));
        return Map.of("physicalLocation", physicalLocation);
    }

    private Map<String, Object> text(String value) {
        return Map.of("text", value == null ? "" : value);
    }

    private String level(Severity severity) {
        if (severity == null) return "warning";
        return switch (severity) {
            case CRITICAL, HIGH -> "error";
            case MEDIUM, LOW -> "warning";
            case INFO -> "note";
        };
    }

    private String securitySeverity(Severity severity) {
        return switch (severity) {
            case CRITICAL -> "9.0";
            case HIGH -> "8.0";
            case MEDIUM -> "5.0";
            case LOW -> "2.0";
            case INFO -> "0.0";
        };
    }

    private String precision(com.securestack.model.Enums.Confidence confidence) {
        return switch (confidence) {
            case HIGH -> "high";
            case MEDIUM -> "medium";
            case LOW -> "low";
        };
    }

    private String fingerprint(FindingDto finding) {
        String stable = String.join("|",
                safe(finding.ruleId()),
                safe(finding.fileName()),
                String.valueOf(finding.lineNumber() == null ? 0 : finding.lineNumber()),
                safe(finding.title()));
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(stable.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private String mask(String value) {
        if (value == null) return "";
        return value.replaceAll("(?i)(password|secret|token|api[_-]?key|access[_-]?key)(\\s*[=:]\\s*)[^\\s,'\"}]+", "$1$2<redacted>");
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
