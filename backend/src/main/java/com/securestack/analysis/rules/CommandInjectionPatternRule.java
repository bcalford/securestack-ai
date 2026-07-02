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
    public String description() { return "Detects direct shell or process execution patterns that require strict input control."; }
    public String recommendation() { return "Avoid shell execution for request-controlled values; use safe APIs and allowlisted arguments."; }
    public String secureExample() { return "ProcessBuilder(command, allowedArgument).start();"; }
    public String falsePositiveNote() { return "Administrative tools may execute fixed commands safely when arguments are not user-controlled."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A03:2021 Injection", "CWE-78 OS Command Injection", "PW.7 Review and analyze human-readable code", "V5 Validation, Sanitization and Encoding");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("Runtime\\.getRuntime\\(\\)\\.exec|child_process\\.exec|os\\.system|subprocess\\.[^(]+\\([^)]*shell\\s*=\\s*True"), "Command execution requires strict validation", Severity.HIGH, Category.INPUT_VALIDATION, recommendation());
    }
}
