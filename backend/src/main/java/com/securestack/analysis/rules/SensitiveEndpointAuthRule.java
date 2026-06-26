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
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(/admin|/payments|/accounts|/internal|/delete|/export)"), "Sensitive endpoint should require authentication", Severity.MEDIUM, Category.AUTHORIZATION, "Apply authentication, authorization, and role checks to sensitive routes.");
    }
}
