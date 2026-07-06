package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SensitiveEndpointAuthRule extends BaseSecurityRule {
    public String id() { return "AUTH-002"; }
    public String name() { return "Sensitive endpoint auth"; }
    public Category category() { return Category.AUTHORIZATION; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.LOW; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Flags sensitive route names that should have authentication and authorization checks."; }
    public String recommendation() { return "Apply authentication, authorization, and role checks to sensitive routes."; }
    public String secureExample() { return "Require an authenticated role check before admin, account, export, or payment handlers."; }
    public String falsePositiveNote() { return "This rule is a review prompt; route protection may be declared in framework middleware or gateway policy."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A01:2021 Broken Access Control", "CWE-862 Missing Authorization", "PW.7 Review and analyze human-readable code", "V4 Access Control");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(/admin|/payments|/accounts|/internal|/delete|/export)"), "Sensitive endpoint should require authentication", Severity.MEDIUM, Category.AUTHORIZATION, recommendation());
    }
}
