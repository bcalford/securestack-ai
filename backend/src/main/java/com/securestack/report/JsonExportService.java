package com.securestack.report;

import com.securestack.analysis.RuleCatalogService;
import com.securestack.dto.Dto.ControlMappingDto;
import com.securestack.dto.Dto.FindingDto;
import com.securestack.dto.Dto.RuleCatalogItem;
import com.securestack.dto.Dto.ScanResultDto;
import com.securestack.service.ScanService;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class JsonExportService {
    public static final String FORMAT_NAME = "SecureStack JSON Report";
    public static final String EXPORT_VERSION = "0.4-alpha";
    private static final String DISCLAIMER = "SecureStack AI provides defensive, best-effort static review results for triage. Validate findings in context before making production changes. Uploaded file contents are not included in this export.";

    private final ScanService scans;
    private final RuleCatalogService ruleCatalog;

    public JsonExportService(ScanService scans, RuleCatalogService ruleCatalog) {
        this.scans = scans;
        this.ruleCatalog = ruleCatalog;
    }

    public Map<String, Object> export(UUID scanId) {
        ScanResultDto scan = scans.get(scanId);
        Map<String, RuleCatalogItem> rulesById = ruleCatalog.list().stream()
                .collect(Collectors.toMap(RuleCatalogItem::id, Function.identity(), (left, right) -> left));

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("format", FORMAT_NAME);
        report.put("exportVersion", EXPORT_VERSION);
        report.put("generatedAt", Instant.now().toString());
        report.put("scanId", scan.id().toString());
        report.put("scanName", scan.name());
        report.put("createdAt", scan.createdAt());
        report.put("riskScore", scan.riskScore());
        report.put("riskLevel", scan.riskLevel());
        report.put("aiProvider", scan.aiProvider());
        report.put("executiveSummary", mask(scan.executiveSummary()));
        report.put("remediationSummary", mask(scan.remediationSummary()));
        report.put("filesReviewed", scan.files().stream().sorted().toList());
        report.put("severityCounts", scan.severityCounts());
        report.put("categoryCounts", scan.categoryCounts());
        report.put("findings", sortedFindings(scan.findings()).stream().map(finding -> finding(finding, rulesById.get(finding.ruleId()))).toList());
        report.put("limitations", DISCLAIMER);
        return report;
    }

    private Map<String, Object> finding(FindingDto finding, RuleCatalogItem rule) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", finding.id().toString());
        item.put("ruleId", finding.ruleId());
        item.put("title", mask(finding.title()));
        item.put("description", mask(finding.description()));
        item.put("severity", finding.severity());
        item.put("category", finding.category());
        item.put("confidence", finding.confidence());
        item.put("status", finding.status());
        item.put("fileName", finding.fileName());
        item.put("lineNumber", finding.lineNumber());
        item.put("recommendation", mask(finding.recommendation()));
        item.put("controlMappings", rule == null ? List.<ControlMappingDto>of() : rule.controlMappings());
        return item;
    }

    private List<FindingDto> sortedFindings(List<FindingDto> findings) {
        return findings.stream()
                .sorted(Comparator.comparing(FindingDto::ruleId, Comparator.nullsLast(String::compareTo))
                        .thenComparing(FindingDto::fileName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(finding -> finding.lineNumber() == null ? 0 : finding.lineNumber())
                        .thenComparing(FindingDto::title, Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    private String mask(String value) {
        if (value == null) return "";
        return value.replaceAll("(?i)(password|secret|token|api[_-]?key|access[_-]?key)(\\s*[=:]\\s*)[^\\s,'\"}]+", "$1$2<redacted>");
    }
}
