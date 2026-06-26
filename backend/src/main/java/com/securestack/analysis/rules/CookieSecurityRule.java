package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class CookieSecurityRule extends BaseSecurityRule {
    public String id() { return "APP-001"; }
    public String name() { return "Cookie security attributes"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)setcookie|Set-Cookie"), "Cookie may be missing HttpOnly/Secure/SameSite", Severity.MEDIUM, Category.DATA_EXPOSURE, "Set HttpOnly, Secure, and SameSite=Lax or Strict on session cookies.");
    }
}
