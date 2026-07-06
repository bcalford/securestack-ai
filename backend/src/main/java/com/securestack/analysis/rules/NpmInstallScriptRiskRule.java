package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class NpmInstallScriptRiskRule extends BaseSecurityRule {
    public String id() { return "DEP-002"; }
    public String name() { return "npm install script risk"; }
    public Category category() { return Category.DEPENDENCY; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return fileNameMatches(file, "package.json"); }
    public String description() { return "Detects npm lifecycle install scripts that execute during dependency installation."; }
    public String recommendation() { return "Review npm preinstall, install, and postinstall scripts and keep lockfiles pinned for reproducible dependency installs."; }
    public String secureExample() { return "\"scripts\": { \"test\": \"vitest run\" }"; }
    public String falsePositiveNote() { return "Some packages require install scripts for native builds; review the command and dependency source before release."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A08:2021 Software and Data Integrity Failures", "CWE-829 Inclusion of Functionality from Untrusted Control Sphere", "PW.4 Reuse existing secure software", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        if (!supports(file)) return List.of();
        return scan(file, Pattern.compile("\"(preinstall|install|postinstall)\"\\s*:\\s*\"[^\"]+\""), "npm lifecycle install script present", Severity.MEDIUM, Category.DEPENDENCY, recommendation());
    }
}
