package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DockerfilePackageCacheRule extends BaseSecurityRule {
    public String id() { return "CTR-003"; }
    public String name() { return "Dockerfile package manager cache leftovers"; }
    public Category category() { return Category.CONTAINER_SECURITY; }
    public Severity defaultSeverity() { return Severity.LOW; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return fileNameMatches(file, "Dockerfile") || fileNameEndsWith(file, ".dockerfile"); }
    public String description() { return "Detects package-manager install commands that appear to leave package indexes or caches in the image layer."; }
    public String recommendation() { return "Clean package-manager caches in the same Dockerfile layer as install commands."; }
    public String secureExample() { return "RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*"; }
    public String falsePositiveNote() { return "A later cleanup in the same RUN instruction can satisfy this control; multi-line shell formatting may require manual review."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-459 Incomplete Cleanup", "PW.9 Configure secure defaults", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        List<Finding> results = new ArrayList<>();
        if (!supports(file)) return results;
        for (String line : (file.content() == null ? "" : file.content()).split("\\R")) {
            String lower = line.toLowerCase();
            boolean installs = lower.contains("apt-get install") || lower.contains("apk add") || lower.contains("yum install") || lower.contains("dnf install");
            boolean cleans = lower.contains("/var/lib/apt/lists") || lower.contains("apk cache clean") || lower.contains("yum clean all") || lower.contains("dnf clean all") || lower.contains("--no-cache");
            if (installs && !cleans) {
                results.add(finding(file, "Dockerfile package cache may remain", Severity.LOW, Category.CONTAINER_SECURITY, Confidence.MEDIUM, line, recommendation()));
            }
        }
        return results;
    }
}
