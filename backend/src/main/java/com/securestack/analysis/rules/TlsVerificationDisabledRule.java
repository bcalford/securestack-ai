package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class TlsVerificationDisabledRule extends BaseSecurityRule {
    public String id() { return "CFG-002"; }
    public String name() { return "TLS verification disabled"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects client configuration that appears to disable certificate or hostname verification."; }
    public String recommendation() { return "Keep TLS certificate and hostname verification enabled and install trusted development certificates when needed."; }
    public String secureExample() { return "requests.get(url, timeout=10)"; }
    public String falsePositiveNote() { return "Test-only fixtures may disable verification, but production HTTP clients should not."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A02:2021 Cryptographic Failures", "CWE-295 Improper Certificate Validation", "PW.8 Protect sensitive data", "V9 Communications");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(verify\\s*=\\s*false|rejectUnauthorized\\s*:\\s*false|check_hostname\\s*=\\s*False|ssl_verify\\s*[:=]\\s*false|insecureSkipVerify\\s*[:=]\\s*true)"), "TLS verification disabled", Severity.HIGH, Category.DATA_EXPOSURE, recommendation());
    }
}
