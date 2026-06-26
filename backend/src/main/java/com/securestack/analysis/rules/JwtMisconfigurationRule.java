package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class JwtMisconfigurationRule extends BaseSecurityRule {
    public String id() { return "AUTH-001"; }
    public String name() { return "JWT misconfiguration"; }
    public Category category() { return Category.AUTHENTICATION; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("alg.*none|verify.*false|JWT_SECRET.{0,20}[=:].{0,20}", Pattern.CASE_INSENSITIVE), "Weak JWT handling", Severity.HIGH, Category.AUTHENTICATION, "Use strong signing secrets, enforce verification, and rotate tokens.");
    }
}
