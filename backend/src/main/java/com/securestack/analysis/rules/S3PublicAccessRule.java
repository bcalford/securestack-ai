package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class S3PublicAccessRule extends BaseSecurityRule {
    public String id() { return "CLOUD-002"; }
    public String name() { return "Public S3 access"; }
    public Category category() { return Category.CLOUD_CONFIGURATION; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects S3-style bucket configuration that appears to allow public access or disables public-access blocking."; }
    public String recommendation() { return "Enable S3 Block Public Access and scope bucket policies to trusted principals."; }
    public String secureExample() { return "\"Principal\": {\"AWS\": \"arn:aws:iam::123456789012:role/AppRole\"}"; }
    public String falsePositiveNote() { return "Public website buckets may be intentional, but should be documented and isolated from sensitive data."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A01:2021 Broken Access Control", "CWE-284 Improper Access Control", "PW.9 Configure secure defaults", "V4 Access Control");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("public-read|block_public_acls.*false|block_public_policy.*false|ignore_public_acls.*false|Principal.*[*]", Pattern.CASE_INSENSITIVE), "Public S3 access risk", Severity.HIGH, Category.CLOUD_CONFIGURATION, recommendation());
    }
}
