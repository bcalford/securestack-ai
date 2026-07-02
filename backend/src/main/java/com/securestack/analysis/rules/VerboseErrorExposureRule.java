package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class VerboseErrorExposureRule extends BaseSecurityRule {
    public String id() { return "APP-006"; }
    public String name() { return "Verbose error exposure"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects settings that appear to expose stack traces or detailed server errors to clients."; }
    public String recommendation() { return "Return generic client errors and keep detailed stack traces in protected server logs."; }
    public String secureExample() { return "server.error.include-stacktrace=never\nserver.error.include-message=never"; }
    public String falsePositiveNote() { return "Internal-only diagnostic profiles should still be separated from deployable production configuration."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-209 Generation of Error Message Containing Sensitive Information", "PW.9 Configure secure defaults", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(include-stacktrace\\s*[:=]\\s*(always|on_trace_param)|show_error_details\\s*[:=]\\s*true|display_errors\\s*[:=]\\s*(on|true)|stacktrace\\s*[:=]\\s*true)"), "Verbose errors exposed", Severity.MEDIUM, Category.DATA_EXPOSURE, recommendation());
    }
}
