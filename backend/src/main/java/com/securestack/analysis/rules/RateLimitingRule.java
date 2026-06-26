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
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(/login|/auth|password-reset)"), "Authentication endpoint should include rate limiting", Severity.MEDIUM, Category.API_SECURITY, "Add rate limiting to authentication and recovery endpoints.");
    }
}
