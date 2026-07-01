package com.securestack.sarif;

import com.securestack.dto.Dto.FindingDto;
import com.securestack.dto.Dto.ScanResultDto;
import com.securestack.model.Enums.Severity;
import com.securestack.service.ScanService;
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
        rule.put("shortDescription", text(finding.title()));
        if (hasText(finding.description())) rule.put("fullDescription", text(finding.description()));
        if (hasText(finding.recommendation())) rule.put("help", text(finding.recommendation()));
        return rule;
    }

    private Map<String, Object> result(FindingDto finding) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ruleId", finding.ruleId());
        result.put("level", level(finding.severity()));
        result.put("message", text(finding.title()));
        result.put("locations", List.of(location(finding)));
        Map<String, Object> properties = new LinkedHashMap<>();
        if (finding.category() != null) properties.put("category", finding.category().name());
        if (finding.confidence() != null) properties.put("confidence", finding.confidence().name());
        if (hasText(finding.recommendation())) properties.put("recommendation", finding.recommendation());
        if (!properties.isEmpty()) result.put("properties", properties);
        return result;
    }

    private Map<String, Object> location(FindingDto finding) {
        Map<String, Object> physicalLocation = new LinkedHashMap<>();
        physicalLocation.put("artifactLocation", Map.of("uri", finding.fileName()));
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

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
