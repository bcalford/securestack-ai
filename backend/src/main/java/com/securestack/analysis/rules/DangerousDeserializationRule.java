package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DangerousDeserializationRule extends BaseSecurityRule {
    public String id() { return "INJ-003"; }
    public String name() { return "Dangerous deserialization indicator"; }
    public Category category() { return Category.INPUT_VALIDATION; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects deserialization APIs commonly risky when processing untrusted data."; }
    public String recommendation() { return "Avoid native object deserialization for untrusted input; use typed data formats and allowlisted schemas."; }
    public String secureExample() { return "Parse untrusted input as typed JSON DTOs with validation before use."; }
    public String falsePositiveNote() { return "Some serialization APIs are safe when the data source is trusted and schema-limited; verify the trust boundary."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A08:2021 Software and Data Integrity Failures", "CWE-502 Deserialization of Untrusted Data", "PW.6 Use secure libraries and frameworks", "V5 Validation, Sanitization and Encoding");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(ObjectInputStream|readObject\\s*\\(|pickle\\.loads?\\s*\\(|yaml\\.load\\s*\\(|BinaryFormatter|JsonConvert\\.DeserializeObject\\s*<\\s*object\\s*>)"), "Dangerous deserialization indicator", Severity.HIGH, Category.INPUT_VALIDATION, recommendation());
    }
}
