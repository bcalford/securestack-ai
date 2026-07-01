package com.securestack.analysis;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;

public interface SecurityRule {
    String id();
    String name();
    Category category();
    Severity defaultSeverity();
    boolean supports(ScanFileInput file);
    List<Finding> analyze(ScanFileInput file);

    default String description() {
        return name() + " detected by SecureStack AI static analysis.";
    }

    default String recommendation() {
        return "Review the affected code or configuration and apply the least-privilege, validated, production-safe pattern recommended in scan findings.";
    }

    default String reviewDepthBehavior() {
        return switch (defaultSeverity()) {
            case CRITICAL, HIGH -> "Runs in QUICK, STANDARD, and FULL review depths unless filtered by focus area.";
            case MEDIUM, LOW -> "Runs in STANDARD and FULL review depths unless filtered by focus area.";
            case INFO -> "Runs only in FULL review depth unless filtered by focus area.";
        };
    }
}
