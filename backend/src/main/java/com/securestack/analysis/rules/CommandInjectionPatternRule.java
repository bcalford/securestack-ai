package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class CommandInjectionPatternRule extends BaseSecurityRule {
    public String id() { return "INJ-002"; }
    public String name() { return "Command execution pattern"; }
    public Category category() { return Category.INPUT_VALIDATION; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("Runtime\\.getRuntime\\(\\)\\.exec|child_process\\.exec|os\\.system|subprocess\\.[^(]+\\([^)]*shell\\s*=\\s*True"), "Command execution requires strict validation", Severity.HIGH, Category.INPUT_VALIDATION, "Avoid shell execution; use safe APIs and allowlisted arguments.");
    }
}
