package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SecretDetectionRule extends BaseSecurityRule {
    public String id() { return "SEC-001"; }
    public String name() { return "Secret detection"; }
    public Category category() { return Category.SECRETS; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("AKIA[0-9A-Z]{12,}|ASIA[0-9A-Z]{12,}|-----BEGIN PRIVATE KEY-----|-----BEGIN RSA PRIVATE KEY-----|EXAMPLE_PRIVATE_KEY"), "Cloud credential or private key exposed", Severity.CRITICAL, Category.SECRETS, "Rotate exposed credentials and move secrets to a managed secret store.");
    }
}
