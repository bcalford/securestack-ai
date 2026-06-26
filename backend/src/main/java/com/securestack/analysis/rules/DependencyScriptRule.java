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

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("curl\\s+[^|]+\\|\\s*(sh|bash)|postinstall.*(curl|wget|bash)"), "Suspicious dependency install script", Severity.HIGH, Category.DEPENDENCY, "Review install scripts and use dependency scanning.");
    }
}
