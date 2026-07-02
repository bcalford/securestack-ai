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
    public String name() { return "Hardcoded cloud credential"; }
    public Category category() { return Category.SECRETS; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects cloud access keys, service account material, and private-key markers committed in source or configuration."; }
    public String recommendation() { return "Rotate exposed credentials, remove them from source, and load secrets from a managed secret store or local-only environment."; }
    public String secureExample() { return "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}"; }
    public String falsePositiveNote() { return "Demo fixtures can intentionally contain fake keys; keep samples clearly marked and unusable."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A02:2021 Cryptographic Failures", "CWE-798 Use of Hard-coded Credentials", "PW.8 Protect sensitive data", "V6 Stored Cryptography");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("AKIA[0-9A-Z]{12,}|ASIA[0-9A-Z]{12,}|AIza[0-9A-Za-z_-]{20,}|-----BEGIN PRIVATE KEY-----|-----BEGIN RSA PRIVATE KEY-----|EXAMPLE_PRIVATE_KEY|azure[_-]?client[_-]?secret\\s*[:=]\\s*[^\\s#]{8,}", Pattern.CASE_INSENSITIVE), "Cloud credential or private key exposed", Severity.CRITICAL, Category.SECRETS, recommendation());
    }
}
