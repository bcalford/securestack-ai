package com.securestack.analysis.ai;

import java.util.List;

public record AiAnalysisResult(String executiveSummary, List<String> topRisks, String remediationPlan, String limitations, String suggestedNextSteps, String provider) {
    public AiAnalysisResult(String executiveSummary, List<String> topRisks, String remediationPlan, String limitations, String suggestedNextSteps) {
        this(executiveSummary, topRisks, remediationPlan, limitations, suggestedNextSteps, "mock");
    }
}
