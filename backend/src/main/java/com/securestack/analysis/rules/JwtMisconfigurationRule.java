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
    public String description() { return "Detects JWT verification bypasses and weak or placeholder signing secret patterns."; }
    public String recommendation() { return "Use strong signing keys from a secret manager, enforce signature verification, and rotate keys intentionally."; }
    public String secureExample() { return "JWT_SECRET=${JWT_SECRET_FROM_SECRET_MANAGER}"; }
    public String falsePositiveNote() { return "Test-only JWT fixtures should be isolated from production configuration and clearly marked as fake."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A07:2021 Identification and Authentication Failures", "CWE-347 Improper Verification of Cryptographic Signature", "PW.8 Protect sensitive data", "V2 Authentication");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("alg.*none|verify.*false|JWT_SECRET.{0,20}[=:]\\s*(secret|changeme|password|dev|test|[\"'][A-Za-z0-9_-]{1,16}[\"'])", Pattern.CASE_INSENSITIVE), "Weak JWT handling", Severity.HIGH, Category.AUTHENTICATION, recommendation());
    }
}
