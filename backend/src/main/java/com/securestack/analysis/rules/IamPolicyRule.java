package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class IamPolicyRule extends BaseSecurityRule {
    public String id() { return "CLOUD-001"; }
    public String name() { return "Overly permissive IAM policy"; }
    public Category category() { return Category.CLOUD_CONFIGURATION; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects IAM-style policies with wildcard actions, wildcard resources, or administrator-level permissions."; }
    public String recommendation() { return "Apply least privilege by scoping actions, resources, principals, and conditions to the required access path."; }
    public String secureExample() { return "\"Action\": [\"s3:GetObject\"], \"Resource\": \"arn:aws:s3:::example-bucket/reports/*\""; }
    public String falsePositiveNote() { return "Bootstrap or break-glass roles can require broader permissions, but should be isolated, monitored, and documented."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A01:2021 Broken Access Control", "CWE-266 Incorrect Privilege Assignment", "PW.7 Review and analyze human-readable code", "V4 Access Control");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("Action.*[*]|Resource.*[*]|AdministratorAccess|iam:[*]|s3:[*]", Pattern.CASE_INSENSITIVE), "Overly permissive IAM policy", Severity.HIGH, Category.CLOUD_CONFIGURATION, recommendation());
    }
}
