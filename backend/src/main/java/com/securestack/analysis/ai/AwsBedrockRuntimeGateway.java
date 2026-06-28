package com.securestack.analysis.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;

public class AwsBedrockRuntimeGateway implements BedrockRuntimeGateway {
    private static final Logger log = LoggerFactory.getLogger(AwsBedrockRuntimeGateway.class);
    private final BedrockRuntimeClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    public AwsBedrockRuntimeGateway(BedrockRuntimeClient client) { this.client = client; }

    @Override
    public String invoke(String modelId, String prompt, int maxTokens, double temperature, Duration timeout) {
        try {
            ObjectNode message = mapper.createObjectNode().put("role", "user");
            message.set("content", mapper.createArrayNode().add(mapper.createObjectNode().put("text", prompt)));
            ObjectNode bodyNode = mapper.createObjectNode().put("schemaVersion", "messages-v1");
            bodyNode.set("messages", mapper.createArrayNode().add(message));
            bodyNode.set("inferenceConfig", mapper.createObjectNode().put("maxTokens", maxTokens).put("temperature", temperature));
            String body = mapper.writeValueAsString(bodyNode);
            var response = client.invokeModel(InvokeModelRequest.builder().modelId(modelId).contentType("application/json").accept("application/json").body(SdkBytes.fromUtf8String(body)).build());
            JsonNode root = mapper.readTree(response.body().asUtf8String());
            JsonNode text = root.at("/output/message/content/0/text");
            if (text.isTextual()) return text.asText();
            log.warn("Bedrock response did not include expected Nova text output shape");
            return "";
        } catch (Exception e) { throw new BedrockRuntimeException(safeMessage(e), e); }
    }

    private static String safeMessage(Exception e) { return e.getClass().getSimpleName() + ": " + (e.getMessage() == null ? "Bedrock invocation failed" : e.getMessage().replaceAll("(?i)(credential|access.?key|secret.?key|session.?token)=[^,\s]+", "$1=<redacted>")); }
    public static class BedrockRuntimeException extends RuntimeException { public BedrockRuntimeException(String message, Throwable cause) { super(message, cause); } }
}
