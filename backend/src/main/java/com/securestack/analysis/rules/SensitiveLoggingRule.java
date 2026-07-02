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
    public String description() { return "Detects log statements that appear to include passwords, tokens, secrets, or authorization data."; }
    public String recommendation() { return "Redact secrets and authorization headers from logs before writing them."; }
    public String secureExample() { return "logger.info(\"login attempted for userId={}\", userId);"; }
    public String falsePositiveNote() { return "Masked or hashed values may be acceptable, but raw secrets should not be logged."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A09:2021 Security Logging and Monitoring Failures", "CWE-532 Insertion of Sensitive Information into Log File", "PW.8 Protect sensitive data", "V7 Error Handling and Logging");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(console\\.log|logger\\.(info|debug)|print)\\([^)]*(password|token|secret|authorization)"), "Sensitive data logged", Severity.MEDIUM, Category.LOGGING_MONITORING, recommendation());
    }
}
