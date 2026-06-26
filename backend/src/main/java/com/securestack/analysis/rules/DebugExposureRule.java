package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DebugExposureRule extends BaseSecurityRule {
    public String id() { return "APP-002"; }
    public String name() { return "Debug exposure"; }
    public Category category() { return Category.DATA_EXPOSURE; }
    public Severity defaultSeverity() { return Severity.MEDIUM; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("(?i)debug\\s*[:=]\\s*true|app\\.debug\\s*=\\s*True|stacktrace"), "Debug mode or stack traces enabled", Severity.MEDIUM, Category.DATA_EXPOSURE, "Disable debug mode in production and return safe error messages.");
    }
}
