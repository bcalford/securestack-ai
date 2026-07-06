package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CookieSecurityRule extends BaseSecurityRule {
    public String id() { return "APP-001"; }
    public String name() { return "Missing Secure cookie flag"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects cookie-setting code that appears to omit the Secure attribute or explicitly disables it."; }
    public String recommendation() { return "Set the Secure attribute on session and authentication cookies so browsers only send them over HTTPS."; }
    public String secureExample() { return "Set-Cookie: session=<value>; Secure; HttpOnly; SameSite=Lax"; }
    public String falsePositiveNote() { return "Local development cookies may intentionally omit Secure, but production session cookies should use it."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A02:2021 Cryptographic Failures", "CWE-614 Sensitive Cookie Without Secure Flag", "PW.8 Protect sensitive data", "V3 Session Management");
    }

    public List<Finding> analyze(ScanFileInput file) {
        List<Finding> results = new ArrayList<>();
        for (String line : (file.content() == null ? "" : file.content()).split("\\R")) {
            String lower = line.toLowerCase();
            if (setsCookie(lower) && (!lower.contains("secure") || lower.matches(".*secure\\s*[:=]\\s*false.*"))) {
                results.add(finding(file, "Cookie missing Secure flag", Severity.MEDIUM, Category.DATA_EXPOSURE, Confidence.MEDIUM, line, recommendation()));
            }
        }
        return results;
    }

    protected boolean setsCookie(String lowerLine) {
        return lowerLine.contains("set-cookie") || lowerLine.contains("setcookie") || lowerLine.contains("res.cookie") || lowerLine.contains("responsecookie");
    }
}
