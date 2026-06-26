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

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("0[.]0[.]0[.]0/0|from_port.*(22|3389)", Pattern.CASE_INSENSITIVE), "Security group exposes sensitive service", Severity.HIGH, Category.INFRASTRUCTURE_AS_CODE, "Restrict administrative ports to trusted network ranges.");
    }
}
