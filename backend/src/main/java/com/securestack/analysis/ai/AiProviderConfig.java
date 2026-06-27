package com.securestack.analysis.ai;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;

@Configuration
public class AiProviderConfig {
    @Bean
    @ConditionalOnProperty(prefix = "securestack", name = "ai-provider", havingValue = "bedrock")
    AiAnalysisProvider bedrockAiAnalysisProvider(AiPromptBuilder promptBuilder, BedrockRuntimeGateway gateway, BedrockOptions options) {
        return new BedrockAiAnalysisProvider(promptBuilder, gateway, options);
    }

    @Bean
    @ConditionalOnProperty(prefix = "securestack", name = "ai-provider", havingValue = "bedrock")
    BedrockRuntimeGateway bedrockRuntimeGateway(BedrockRuntimeClient client) {
        return new AwsBedrockRuntimeGateway(client);
    }

    @Bean
    @ConditionalOnProperty(prefix = "securestack", name = "ai-provider", havingValue = "bedrock")
    BedrockRuntimeClient bedrockRuntimeClient(BedrockOptions options) {
        return BedrockRuntimeClient.builder().region(Region.of(options.region())).build();
    }

    @Bean
    BedrockOptions bedrockOptions(
            @Value("${securestack.bedrock.region:us-east-1}") String region,
            @Value("${securestack.bedrock.model-id:amazon.nova-lite-v1:0}") String modelId,
            @Value("${securestack.bedrock.max-tokens:1200}") int maxTokens,
            @Value("${securestack.bedrock.temperature:0.2}") double temperature,
            @Value("${securestack.bedrock.send-raw-content:false}") boolean sendRawContent,
            @Value("${securestack.bedrock.timeout-seconds:30}") long timeoutSeconds) {
        return new BedrockOptions(region, modelId, maxTokens, temperature, sendRawContent, Duration.ofSeconds(timeoutSeconds));
    }

    public record BedrockOptions(String region, String modelId, int maxTokens, double temperature, boolean sendRawContent, Duration timeout) {}
}
