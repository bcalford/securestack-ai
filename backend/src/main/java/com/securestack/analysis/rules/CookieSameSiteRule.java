package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CookieSameSiteRule extends CookieSecurityRule {
    public String id() { return "APP-004"; }
    public String name() { return "Missing SameSite cookie flag"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.LOW; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public String description() { return "Detects cookie-setting code that appears to omit a SameSite attribute."; }
    public String recommendation() { return "Set SameSite=Lax or SameSite=Strict on session cookies unless a documented cross-site flow requires otherwise."; }
    public String secureExample() { return "Set-Cookie: session=<value>; Secure; HttpOnly; SameSite=Lax"; }
    public String falsePositiveNote() { return "Some federated login or embedded workflows require SameSite=None with Secure; verify the intended browser flow."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-1275 Sensitive Cookie With Improper SameSite Attribute", "PW.8 Protect sensitive data", "V3 Session Management");
    }

    public List<Finding> analyze(ScanFileInput file) {
        List<Finding> results = new ArrayList<>();
        for (String line : (file.content() == null ? "" : file.content()).split("\\R")) {
            String lower = line.toLowerCase();
            if (setsCookie(lower) && !lower.contains("samesite")) {
                results.add(finding(file, "Cookie missing SameSite flag", Severity.LOW, Category.DATA_EXPOSURE, Confidence.MEDIUM, line, recommendation()));
            }
        }
        return results;
    }
}
