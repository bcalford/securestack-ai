package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DatabaseCredentialUrlRule extends BaseSecurityRule {
    public String id() { return "SEC-003"; }
    public String name() { return "Database URL contains credentials"; }
    public Category category() { return Category.SECRETS; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects database connection URLs that include a username and password inline."; }
    public String recommendation() { return "Store database credentials in environment variables or a managed secret store and assemble connection settings at runtime."; }
    public String secureExample() { return "DATABASE_URL=jdbc:postgresql://db.internal:5432/app\nDATABASE_PASSWORD=${DATABASE_PASSWORD}"; }
    public String falsePositiveNote() { return "Local demo files can include placeholder credentials, but production connection strings should not."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A02:2021 Cryptographic Failures", "CWE-798 Use of Hard-coded Credentials", "PW.8 Protect sensitive data", "V6 Stored Cryptography");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(postgres(?:ql)?|mysql|mongodb|redis|mssql|oracle)://[^\\s:@/]+:[^\\s@/]+@|jdbc:[a-z0-9]+://[^\\s]+[?;&](user|username)=[^\\s;&]+[;&]password=[^\\s;&]+"), "Database URL embeds credentials", Severity.HIGH, Category.SECRETS, recommendation());
    }
}
