package com.securestack.analysis.ai;

import java.time.Duration;

public interface BedrockRuntimeGateway {
    String invoke(String modelId, String prompt, int maxTokens, double temperature, Duration timeout);
}
