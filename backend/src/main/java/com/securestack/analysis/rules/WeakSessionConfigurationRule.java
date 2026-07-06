package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class WeakSessionConfigurationRule extends BaseSecurityRule {
    public String id() { return "AUTH-003"; }
    public String name() { return "Weak session configuration"; }
    public Category category() { return Category.AUTHENTICATION; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public Confidence confidence() { return Confidence.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects session settings that appear to disable secure cookies, use very long lifetimes, or weaken session protection."; }
    public String recommendation() { return "Use server-side session rotation, secure cookie settings, and bounded idle and absolute timeouts."; }
    public String secureExample() { return "server.servlet.session.cookie.secure=true\nserver.servlet.session.cookie.http-only=true\nserver.servlet.session.timeout=30m"; }
    public String falsePositiveNote() { return "Development-only session settings may be acceptable when isolated from production configuration."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A07:2021 Identification and Authentication Failures", "CWE-613 Insufficient Session Expiration", "PW.8 Protect sensitive data", "V3 Session Management");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)(session\\.(cookie\\.)?secure\\s*[:=]\\s*false|session\\.(cookie\\.)?http[-_]?only\\s*[:=]\\s*false|session\\.(timeout|max[-_]?age)\\s*[:=]\\s*(0|-1|[0-9]{7,}))"), "Weak session configuration", Severity.MEDIUM, Category.AUTHENTICATION, recommendation());
    }
}
