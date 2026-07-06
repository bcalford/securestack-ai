package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class PlaintextHttpEndpointRule extends BaseSecurityRule {
    public String id() { return "CFG-001"; }
    public String name() { return "Plaintext HTTP endpoint"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects non-localhost HTTP URLs in source or configuration that may send data without transport encryption."; }
    public String recommendation() { return "Use HTTPS endpoints for service calls and document any local-only HTTP development endpoints."; }
    public String secureExample() { return "API_BASE_URL=https://api.example.test"; }
    public String falsePositiveNote() { return "Localhost and loopback development URLs are intentionally ignored by this rule."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A02:2021 Cryptographic Failures", "CWE-319 Cleartext Transmission of Sensitive Information", "PW.8 Protect sensitive data", "V9 Communications");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("http://(?!(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0|\\[::1\\])(?::|/|\\b))[A-Za-z0-9.-]+(?::[0-9]+)?[/A-Za-z0-9._~:%?#\\[\\]@!$&'()*+,;=-]*"), "Plaintext HTTP endpoint configured", Severity.MEDIUM, Category.DATA_EXPOSURE, recommendation());
    }
}
