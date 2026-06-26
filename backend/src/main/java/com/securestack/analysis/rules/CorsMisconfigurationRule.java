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

    public List<Finding> analyze(ScanFileInput file) {
        Severity severity = file.content().toLowerCase().contains("credentials") ? Severity.HIGH : Severity.MEDIUM;
        return scan(file, Pattern.compile("Access-Control-Allow-Origin:.*[*]|allowedOrigins.*[*]|cors.*origin.*[*]|CORS.*[*]", Pattern.CASE_INSENSITIVE), "Wildcard CORS policy", severity, Category.API_SECURITY, "Restrict CORS to trusted origins and avoid wildcard origins for authenticated APIs.");
    }
}
