package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SqlInjectionPatternRule extends BaseSecurityRule {
    public String id() { return "INJ-001"; }
    public String name() { return "SQL injection pattern"; }
    public Category category() { return Category.INPUT_VALIDATION; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects SQL query construction patterns that concatenate input into query text."; }
    public String recommendation() { return "Use prepared statements, ORM parameter binding, or safe query builders."; }
    public String secureExample() { return "db.query(\"SELECT * FROM users WHERE id = ?\", id)"; }
    public String falsePositiveNote() { return "Static string query assembly without user-controlled data may need manual triage."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A03:2021 Injection", "CWE-89 SQL Injection", "PW.7 Review and analyze human-readable code", "V5 Validation, Sanitization and Encoding");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(SELECT|UPDATE|DELETE|INSERT).*[+]|createStatement|Statement", Pattern.CASE_INSENSITIVE), "Possible SQL injection pattern", Severity.HIGH, Category.INPUT_VALIDATION, recommendation());
    }
}
