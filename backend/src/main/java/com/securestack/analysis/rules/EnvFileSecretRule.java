package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class EnvFileSecretRule extends BaseSecurityRule {
    public String id() { return "SEC-002"; }
    public String name() { return "Environment file secret detection"; }
    public Category category() { return Category.SECRETS; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects secret-like values assigned in environment-style files or configuration."; }
    public String recommendation() { return "Keep environment files out of source control and load secrets from a managed secret store or local-only runtime environment."; }
    public String secureExample() { return "DATABASE_PASSWORD=${DATABASE_PASSWORD}"; }
    public String falsePositiveNote() { return "Placeholder values in sample files should be clearly non-secret and documented as fake."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A02:2021 Cryptographic Failures", "CWE-798 Use of Hard-coded Credentials", "PW.8 Protect sensitive data", "V6 Stored Cryptography");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?im)^(api[_-]?key|client_secret|jwt_secret|password|db_password|database_password|token)\\s*[:=]\\s*[^\\s#]{6,}"), "Environment secret value exposed", Severity.HIGH, Category.SECRETS, recommendation());
    }
}
