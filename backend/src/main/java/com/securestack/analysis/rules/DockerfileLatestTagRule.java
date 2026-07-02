package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DockerfileLatestTagRule extends BaseSecurityRule {
    public String id() { return "CTR-002"; }
    public String name() { return "Dockerfile latest tag usage"; }
    public Category category() { return Category.CONTAINER_SECURITY; }
    public Severity defaultSeverity() { return Severity.LOW; }
    public boolean supports(ScanFileInput file) { return fileNameMatches(file, "Dockerfile") || fileNameEndsWith(file, ".dockerfile"); }
    public String description() { return "Detects Docker base images pinned to the mutable latest tag."; }
    public String recommendation() { return "Pin base images to explicit version tags or immutable digests and update them intentionally."; }
    public String secureExample() { return "FROM node:20.11.1-alpine"; }
    public String falsePositiveNote() { return "Short-lived local prototypes may use latest, but reproducible builds should not."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A06:2021 Vulnerable and Outdated Components", "CWE-1104 Use of Unmaintained Third Party Components", "PW.4 Reuse existing secure software", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        if (!supports(file)) return List.of();
        return scan(file, Pattern.compile("(?im)^\\s*FROM\\s+\\S+:latest\\b"), "Dockerfile uses latest image tag", Severity.LOW, Category.CONTAINER_SECURITY, recommendation());
    }
}
