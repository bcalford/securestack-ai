package com.securestack.analysis.ai;

import com.securestack.analysis.ai.AiProviderConfig.BedrockOptions;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BedrockAiAnalysisProvider implements AiAnalysisProvider {
    private static final Logger log = LoggerFactory.getLogger(BedrockAiAnalysisProvider.class);
    static final String FALLBACK = "Bedrock AI summary could not be generated. Static findings are still available. Check AWS credentials, model access, region, and BEDROCK_MODEL_ID.";
    private final AiPromptBuilder promptBuilder;
    private final BedrockRuntimeGateway gateway;
    private final BedrockOptions options;

    public BedrockAiAnalysisProvider(AiPromptBuilder promptBuilder, BedrockRuntimeGateway gateway, BedrockOptions options) {
        this.promptBuilder = promptBuilder;
        this.gateway = gateway;
        this.options = options;
    }

    @Override
    public AiAnalysisResult generateSummary(AiAnalysisRequest request) {
        try {
            String prompt = promptBuilder.build(request, options.sendRawContent());
            String summary = gateway.invoke(options.modelId(), prompt, options.maxTokens(), options.temperature(), options.timeout());
            if (summary == null || summary.isBlank()) return fallback();
            return new AiAnalysisResult(summary.trim(), List.of("Review static findings by severity"), "Use the Bedrock summary with the static remediation recommendations and verify fixes manually.", "AI output is generated from summarized static findings and is not a complete security audit.", "Re-run SecureStack AI after remediation and keep manual review in the workflow.", "bedrock");
        } catch (RuntimeException e) {
            log.warn("Bedrock summary unavailable. Check AWS credentials, model access, region, and model id. Cause: {}", e.getMessage());
            return fallback();
        }
    }

    private AiAnalysisResult fallback() {
        return new AiAnalysisResult(FALLBACK, List.of("Static findings remain available"), "Review the static findings and fix critical/high issues first.", "Bedrock was configured but no model summary was generated.", "Check AWS credentials, model access, region, and BEDROCK_MODEL_ID, then retry.", "bedrock");
    }
}
