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

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("Action.*[*]|Resource.*[*]|AdministratorAccess|iam:[*]|s3:[*]", Pattern.CASE_INSENSITIVE), "Overly permissive IAM policy", Severity.HIGH, Category.CLOUD_CONFIGURATION, "Apply least privilege and scope actions/resources.");
    }
}
