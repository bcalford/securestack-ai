package com.securestack.analysis.ai;

import com.securestack.model.Enums.Severity;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "securestack", name = "ai-provider", havingValue = "mock", matchIfMissing = true)
public class MockAiAnalysisProvider implements AiAnalysisProvider {
    @Override
    public AiAnalysisResult generateSummary(AiAnalysisRequest r) {
        long critical = r.severityCounts().getOrDefault(Severity.CRITICAL, 0L);
        long high = r.severityCounts().getOrDefault(Severity.HIGH, 0L);
        String posture = critical > 0 ? "critical" : high > 0 ? "elevated" : r.riskScore() < 90 ? "moderate" : "low";
        return new AiAnalysisResult(
                "SecureStack AI found a " + posture + " risk posture for '" + r.scanName() + "'. The score is " + r.riskScore() + "/100 based on detected static security signals. Prioritize confirmed evidence and perform manual review before production decisions.",
                List.of("Address critical and high findings first", "Rotate any exposed credentials", "Tighten cloud, API, and container configuration"),
                "1. Rotate secrets. 2. Restrict public access and broad permissions. 3. Add authentication, validation, logging redaction, and rate limiting. 4. Re-run the scan and verify fixes.",
                "Automated review is not a complete security audit and does not execute code or prove exploitability.",
                "Add CI secret scanning, dependency scanning, and manual threat modeling for sensitive systems.",
                "mock");
    }
}
