package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CookieHttpOnlyRule extends CookieSecurityRule {
    public String id() { return "APP-003"; }
    public String name() { return "Missing HttpOnly cookie flag"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public String description() { return "Detects cookie-setting code that appears to omit the HttpOnly attribute."; }
    public String recommendation() { return "Set HttpOnly on session cookies to reduce exposure to client-side script access."; }
    public String secureExample() { return "Set-Cookie: session=<value>; Secure; HttpOnly; SameSite=Lax"; }
    public String falsePositiveNote() { return "Cookies intentionally read by client-side code may not use HttpOnly, but session cookies should."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-1004 Sensitive Cookie Without HttpOnly Flag", "PW.8 Protect sensitive data", "V3 Session Management");
    }

    public List<Finding> analyze(ScanFileInput file) {
        List<Finding> results = new ArrayList<>();
        for (String line : (file.content() == null ? "" : file.content()).split("\\R")) {
            String lower = line.toLowerCase();
            if (setsCookie(lower) && !lower.contains("httponly")) {
                results.add(finding(file, "Cookie missing HttpOnly flag", Severity.MEDIUM, Category.DATA_EXPOSURE, Confidence.MEDIUM, line, recommendation()));
            }
        }
        return results;
    }
}
