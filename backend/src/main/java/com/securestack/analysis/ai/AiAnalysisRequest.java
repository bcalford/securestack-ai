package com.securestack.analysis.ai;

import com.securestack.model.Enums.Category;
import com.securestack.model.Enums.Confidence;
import com.securestack.model.Enums.RiskLevel;
import com.securestack.model.Enums.Severity;
import java.util.List;
import java.util.Map;

public record AiAnalysisRequest(
        String scanName,
        int riskScore,
        RiskLevel riskLevel,
        Map<Severity, Long> severityCounts,
        Map<Category, Long> categoryCounts,
        String reviewDepth,
        List<String> fileNames,
        List<FindingSummary> findings,
        List<String> recommendations,
        List<FileContentSummary> fileContents) {
    public AiAnalysisRequest(String scanName, int riskScore, Map<Severity, Long> severityCounts, Map<Category, Long> categoryCounts, String reviewDepth) {
        this(scanName, riskScore, null, severityCounts, categoryCounts, reviewDepth, List.of(), List.of(), List.of(), List.of());
    }

    public record FindingSummary(String title, String description, Severity severity, Category category, Confidence confidence, String fileName, Integer lineNumber, String maskedEvidence, String recommendation) {}
    public record FileContentSummary(String fileName, String maskedContent) {}
}
