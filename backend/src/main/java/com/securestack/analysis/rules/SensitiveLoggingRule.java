package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SensitiveLoggingRule extends BaseSecurityRule {
    public String id() { return "LOG-001"; }
    public String name() { return "Sensitive logging"; }
    public Category category() { return Category.LOGGING_MONITORING; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(console\\.log|logger\\.(info|debug)|print)\\([^)]*(password|token|secret|authorization)"), "Sensitive data logged", Severity.MEDIUM, Category.LOGGING_MONITORING, "Redact secrets and authorization headers from logs.");
    }
}
