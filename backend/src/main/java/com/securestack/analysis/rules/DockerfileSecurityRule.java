package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DockerfileSecurityRule extends BaseSecurityRule {
    public String id() { return "CTR-001"; }
    public String name() { return "Dockerfile security"; }
    public Category category() { return Category.CONTAINER_SECURITY; }
    public Severity defaultSeverity() { return Severity.LOW; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        List<Finding> results = scan(file, Pattern.compile("FROM\\s+\\S+:latest|COPY\\s+\\.\\s+\\.|ADD\\s+https?://|ENV\\s+.*(SECRET|PASSWORD|TOKEN)|EXPOSE\\s+(22|3306|5432|6379)"), "Insecure Dockerfile pattern", Severity.LOW, Category.CONTAINER_SECURITY, "Pin image tags, run as non-root, and avoid baking secrets into images.");
        if (fileNameMatches(file, "Dockerfile") && !file.content().contains("USER ")) {
            results.add(finding(file, "Dockerfile missing non-root USER", Severity.MEDIUM, Category.CONTAINER_SECURITY, Confidence.HIGH, "Dockerfile", "Run containers as a non-root user."));
        }
        return results;
    }
}
