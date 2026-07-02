package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class RateLimitingRule extends BaseSecurityRule {
    public String id() { return "API-002"; }
    public String name() { return "Authentication rate limiting"; }
    public Category category() { return Category.API_SECURITY; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.LOW; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Flags authentication and recovery endpoints as requiring rate-limit review."; }
    public String recommendation() { return "Add rate limiting and abuse monitoring to authentication and account recovery endpoints."; }
    public String secureExample() { return "Apply per-account and per-IP throttling to login and password-reset routes."; }
    public String falsePositiveNote() { return "This rule identifies endpoints that should be reviewed; rate limiting may live in middleware or infrastructure."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A07:2021 Identification and Authentication Failures", "CWE-307 Improper Restriction of Excessive Authentication Attempts", "PW.9 Configure secure defaults", "V2 Authentication");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(/login|/auth|password-reset)"), "Authentication endpoint should include rate limiting", Severity.MEDIUM, Category.API_SECURITY, recommendation());
    }
}
