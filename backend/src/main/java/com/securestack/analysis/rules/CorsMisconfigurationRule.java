package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class CorsMisconfigurationRule extends BaseSecurityRule {
    public String id() { return "API-001"; }
    public String name() { return "Wildcard CORS policy"; }
    public Category category() { return Category.API_SECURITY; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects wildcard CORS origins and permissive origin patterns, especially risky with credentials."; }
    public String recommendation() { return "Restrict CORS to trusted origins and avoid wildcard origins for authenticated APIs."; }
    public String secureExample() { return "cors({ origin: ['https://app.example.test'], credentials: true })"; }
    public String falsePositiveNote() { return "Public unauthenticated static resources may use permissive CORS, but authenticated APIs should not."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-942 Permissive Cross-domain Policy", "PW.9 Configure secure defaults", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        Severity severity = (file.content() == null ? "" : file.content()).toLowerCase().contains("credentials") ? Severity.HIGH : Severity.MEDIUM;
        return scan(file, Pattern.compile("Access-Control-Allow-Origin:.*[*]|allowedOrigins.*[*]|cors.*origin.*[*]|CORS.*[*]", Pattern.CASE_INSENSITIVE), "Wildcard CORS policy", severity, Category.API_SECURITY, recommendation());
    }
}
