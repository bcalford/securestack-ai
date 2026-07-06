package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DependencyScriptRule extends BaseSecurityRule {
    public String id() { return "DEP-001"; }
    public String name() { return "Suspicious dependency script"; }
    public Category category() { return Category.DEPENDENCY; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects dependency install scripts that fetch and pipe remote content into shell interpreters."; }
    public String recommendation() { return "Avoid install-time shell fetch patterns and review dependency lifecycle scripts before enabling them."; }
    public String secureExample() { return "Install dependencies from pinned lockfiles and review lifecycle scripts before release."; }
    public String falsePositiveNote() { return "Build tooling can use scripts legitimately, but remote shell execution during install needs explicit review."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A08:2021 Software and Data Integrity Failures", "CWE-494 Download of Code Without Integrity Check", "PW.4 Reuse existing secure software", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("curl\\s+[^|]+\\|\\s*(sh|bash)|postinstall.*(curl|wget|bash)", Pattern.CASE_INSENSITIVE), "Suspicious dependency install script", Severity.HIGH, Category.DEPENDENCY, recommendation());
    }
}
