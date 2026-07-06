package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SecurityGroupExposureRule extends BaseSecurityRule {
    public String id() { return "CLOUD-003"; }
    public String name() { return "Security group exposure"; }
    public Category category() { return Category.INFRASTRUCTURE_AS_CODE; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }
    public String description() { return "Detects infrastructure rules that expose administrative ports or broad network ranges."; }
    public String recommendation() { return "Restrict administrative ports to trusted network ranges and prefer private access paths."; }
    public String secureExample() { return "cidr_blocks = [\"10.0.0.0/16\"]\nfrom_port = 22"; }
    public String falsePositiveNote() { return "Public services can expose specific application ports intentionally; administrative ports need stronger scrutiny."; }
    public java.util.List<com.securestack.analysis.SecurityRule.ControlMapping> controlMappings() {
        return mappings("A05:2021 Security Misconfiguration", "CWE-284 Improper Access Control", "PW.9 Configure secure defaults", "V14 Configuration");
    }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("0[.]0[.]0[.]0/0|from_port.*(22|3389)", Pattern.CASE_INSENSITIVE), "Security group exposes sensitive service", Severity.HIGH, Category.INFRASTRUCTURE_AS_CODE, recommendation());
    }
}
