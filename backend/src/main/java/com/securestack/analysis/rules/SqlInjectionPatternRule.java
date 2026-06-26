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

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(SELECT|UPDATE|DELETE|INSERT).*[+]|createStatement|Statement", Pattern.CASE_INSENSITIVE), "Possible SQL injection pattern", Severity.HIGH, Category.INPUT_VALIDATION, "Use prepared statements, ORM parameter binding, or safe query builders.");
    }
}
