package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DockerfileSecurityRule extends BaseSecurityRule {
    public String id() { return "CTR-001"; }
    public String name() { return "Dockerfile root user usage"; }
    public Category category() { return Category.CONTAINER_SECURITY; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public boolean supports(ScanFileInput file) { return fileNameMatches(file, "Dockerfile") || fileNameEndsWith(file, ".dockerfile"); }
    public String description() { return "Detects Dockerfiles that appear to run as root or omit a non-root USER declaration."; }
    public String recommendation() { return "Create a dedicated application user and switch to it with USER before the runtime command."; }
    public String secureExample() { return "RUN adduser -D appuser\nUSER appuser"; }
    public String falsePositiveNote() { return "Build stages may run as root, but the final runtime stage should use a non-root user where practical."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-250 Execution with Unnecessary Privileges", "PW.9 Configure secure defaults", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        List<Finding> results = new ArrayList<>();
        String content = file.content() == null ? "" : file.content();
        if (!supports(file)) return results;
        if (!content.matches("(?is).*\\bUSER\\s+\\S+.*")) {
            results.add(finding(file, "Dockerfile missing non-root USER", Severity.MEDIUM, Category.CONTAINER_SECURITY, Confidence.HIGH, "Dockerfile", recommendation()));
        }
        for (String line : content.split("\\R")) {
            if (line.trim().equalsIgnoreCase("USER root")) {
                results.add(finding(file, "Dockerfile uses root user", Severity.MEDIUM, Category.CONTAINER_SECURITY, Confidence.HIGH, line, recommendation()));
            }
        }
        return results;
    }
}
