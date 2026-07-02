package com.securestack.analysis.rules;

import com.securestack.analysis.SecurityRule;
import com.securestack.analysis.SecurityRule.ControlMapping;
import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import com.securestack.util.Sanitizer;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public abstract class BaseSecurityRule implements SecurityRule {
    protected Finding finding(ScanFileInput file, String title, Severity severity, Category category, Confidence confidence, String evidence, String recommendation) {
        Finding finding = new Finding();
        finding.fileName = file.fileName();
        finding.lineNumber = lineNumber(file.content(), evidence);
        finding.title = title;
        finding.description = title + " detected by SecureStack AI static analysis.";
        finding.severity = severity;
        finding.category = category;
        finding.confidence = confidence;
        finding.evidence = Sanitizer.mask(evidence);
        finding.recommendation = recommendation;
        finding.secureExample = secureExample();
        finding.ruleId = id();
        return finding;
    }

    protected List<Finding> scan(ScanFileInput file, Pattern pattern, String title, Severity severity, Category category, String recommendation) {
        List<Finding> results = new ArrayList<>();
        Matcher matcher = pattern.matcher(file.content() == null ? "" : file.content());
        while (matcher.find()) {
            results.add(finding(file, title, severity, category, confidence(), matcher.group(), recommendation));
        }
        return results;
    }

    protected boolean fileNameMatches(ScanFileInput file, String name) {
        return file.fileName() != null && file.fileName().equalsIgnoreCase(name);
    }

    protected boolean fileNameEndsWith(ScanFileInput file, String suffix) {
        return file.fileName() != null && file.fileName().toLowerCase().endsWith(suffix.toLowerCase());
    }

    protected List<ControlMapping> mappings(String owasp, String cwe, String ssdf, String asvs) {
        return List.of(
            new ControlMapping("OWASP Top 10", owasp),
            new ControlMapping("CWE", cwe),
            new ControlMapping("NIST SSDF-lite", ssdf),
            new ControlMapping("ASVS-lite", asvs)
        );
    }

    private int lineNumber(String content, String evidence) {
        String[] lines = (content == null ? "" : content).split("\\R", -1);
        String needle = evidence == null ? "" : evidence.trim();
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (!line.isEmpty() && (line.contains(needle) || needle.contains(line))) return i + 1;
        }
        return 1;
    }
}
