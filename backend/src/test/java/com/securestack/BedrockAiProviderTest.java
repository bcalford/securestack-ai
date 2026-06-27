package com.securestack;

import static org.junit.jupiter.api.Assertions.*;

import com.securestack.analysis.ai.*;
import com.securestack.analysis.ai.AiProviderConfig.BedrockOptions;
import com.securestack.model.Enums.*;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BedrockAiProviderTest {
    private final AiAnalysisRequest request = new AiAnalysisRequest(
            "Demo", 42, RiskLevel.HIGH,
            Map.of(Severity.HIGH, 1L), Map.of(Category.SECRETS, 1L), "STANDARD",
            List.of("app.js"),
            List.of(new AiAnalysisRequest.FindingSummary("Hardcoded token", "Token found", Severity.HIGH, Category.SECRETS, Confidence.HIGH, "app.js", 7, "token=<redacted>", "Use a secrets manager")),
            List.of("Use a secrets manager"),
            List.of(new AiAnalysisRequest.FileContentSummary("app.js", "const token=<redacted>")));

    @Test void promptExcludesRawContentByDefault() {
        String prompt = new AiPromptBuilder().build(request, false);
        assertFalse(prompt.contains("const token"));
        assertTrue(prompt.contains("Do not provide exploit instructions"));
    }

    @Test void promptIncludesSafeSummaryData() {
        String prompt = new AiPromptBuilder().build(request, false);
        assertTrue(prompt.contains("Risk score: 42/100"));
        assertTrue(prompt.contains("Severity counts"));
        assertTrue(prompt.contains("Category counts"));
        assertTrue(prompt.contains("Hardcoded token"));
        assertTrue(prompt.contains("token=<redacted>"));
        assertTrue(prompt.contains("Use a secrets manager"));
    }

    @Test void bedrockProviderMapsFakeGatewayResponse() {
        BedrockAiAnalysisProvider provider = new BedrockAiAnalysisProvider(new AiPromptBuilder(), (modelId, prompt, maxTokens, temperature, timeout) -> "Defensive summary", options());
        AiAnalysisResult result = provider.generateSummary(request);
        assertEquals("Defensive summary", result.executiveSummary());
        assertEquals("bedrock", result.provider());
    }

    @Test void bedrockProviderReturnsControlledFallbackOnFailure() {
        BedrockAiAnalysisProvider provider = new BedrockAiAnalysisProvider(new AiPromptBuilder(), (modelId, prompt, maxTokens, temperature, timeout) -> { throw new RuntimeException("AccessDeniedException"); }, options());
        AiAnalysisResult result = provider.generateSummary(request);
        assertTrue(result.executiveSummary().contains("Bedrock AI summary could not be generated"));
        assertEquals("bedrock", result.provider());
    }

    @Test void providerSelectionDefaultsToMockProvider() {
        AiAnalysisResult result = new MockAiAnalysisProvider().generateSummary(request);
        assertEquals("mock", result.provider());
    }

    private BedrockOptions options() { return new BedrockOptions("us-east-1", "amazon.nova-lite-v1:0", 1200, 0.2, false, Duration.ofSeconds(30)); }
}
