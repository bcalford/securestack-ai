package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DebugExposureRule extends BaseSecurityRule {
    public String id() { return "APP-002"; }
    public String name() { return "Dangerous debug mode flag"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects application configuration that appears to enable debug mode."; }
    public String recommendation() { return "Disable debug mode outside local development and use safe operational logging instead."; }
    public String secureExample() { return "DEBUG=false\nAPP_ENV=production"; }
    public String falsePositiveNote() { return "A local-only development profile can be acceptable if it cannot be deployed to production."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-489 Active Debug Code", "PW.9 Configure secure defaults", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(debug\\s*[:=]\\s*true|app\\.debug\\s*=\\s*True|flask_debug\\s*[:=]\\s*1|spring\\.profiles\\.active\\s*[:=]\\s*dev)"), "Debug mode enabled", Severity.MEDIUM, Category.DATA_EXPOSURE, recommendation());
    }
}
