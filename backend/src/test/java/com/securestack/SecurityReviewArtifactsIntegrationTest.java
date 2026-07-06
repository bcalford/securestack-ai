package com.securestack;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityReviewArtifactsIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void reviewArtifactsAreGeneratedFromStoredFindings() throws Exception {
        String scanId = createRiskyScan();

        mvc.perform(get("/api/scans/{id}/threat-model", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasItem(containsString("Source code"))))
                .andExpect(jsonPath("$.entryPoints", not(empty())))
                .andExpect(jsonPath("$.recommendedControls", not(empty())))
                .andExpect(jsonPath("$.relatedFindingIds", not(empty())));

        MvcResult riskPaths = mvc.perform(get("/api/scans/{id}/risk-paths", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskPaths[*].id", hasItems("credential-exposure", "session-authentication", "unsafe-deployment-container", "dependency-script-supply-chain")))
                .andReturn();
        String riskBody = riskPaths.getResponse().getContentAsString().toLowerCase();
        assertTrue(riskBody.contains("defensive") || riskBody.contains("protect") || riskBody.contains("strengthen"));
        assertFalse(riskBody.contains("payload"));
        assertFalse(riskBody.contains("exploit"));
        assertFalse(riskBody.contains("curl "));

        mvc.perform(get("/api/scans/{id}/fix-plan", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fixFirst", not(empty())))
                .andExpect(jsonPath("$.fixFirst[0].severity", anyOf(is("CRITICAL"), is("HIGH"))))
                .andExpect(jsonPath("$.fixFirst[0].verificationSteps", not(empty())))
                .andExpect(jsonPath("$.fixFirst[0].relatedRuleIds", not(empty())));

        mvc.perform(get("/api/scans/{id}/checklist", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].id", hasItems("secrets-reviewed", "authentication-session-reviewed", "dockerfile-reviewed", "dependency-scripts-reviewed", "high-findings-triaged", "fix-plan-reviewed")))
                .andExpect(jsonPath("$.items[?(@.status == 'pending')]", not(empty())));
    }

    @Test
    void reviewArtifactEndpointsReturnNotFoundForMissingScan() throws Exception {
        UUID missing = UUID.randomUUID();
        mvc.perform(get("/api/scans/{id}/threat-model", missing)).andExpect(status().isNotFound());
        mvc.perform(get("/api/scans/{id}/risk-paths", missing)).andExpect(status().isNotFound());
        mvc.perform(get("/api/scans/{id}/fix-plan", missing)).andExpect(status().isNotFound());
        mvc.perform(get("/api/scans/{id}/checklist", missing)).andExpect(status().isNotFound());
    }

    @Test
    void cleanScanReturnsUsefulLowRiskArtifacts() throws Exception {
        String scanId = createCleanScan();
        mvc.perform(get("/api/scans/{id}/threat-model", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", not(empty())))
                .andExpect(jsonPath("$.abuseCases[0]", containsString("No specific abuse case")));
        mvc.perform(get("/api/scans/{id}/fix-plan", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hardeningBacklog", not(empty())))
                .andExpect(jsonPath("$.hardeningBacklog[0].verificationSteps", not(empty())));
        mvc.perform(get("/api/scans/{id}/checklist", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].status", hasItem("completed")));
    }

    private String createRiskyScan() throws Exception {
        String pastedFiles = """
                [
                  {"fileName":"app.js","fileType":"js","content":"app.use(cors({ origin: '*' }));"},
                  {"fileName":".env","fileType":"env","content":"api_key=fake-demo-api-key-12345"},
                  {"fileName":"Dockerfile","fileType":"dockerfile","content":"FROM node:latest\\nUSER root"},
                  {"fileName":"package.json","fileType":"package.json","content":"{\\\"scripts\\\":{\\\"postinstall\\\":\\\"node scripts/setup.js\\\"}}"}
                ]
                """;
        MvcResult created = mvc.perform(multipart("/api/scans")
                        .param("scanName", "Review artifacts integration")
                        .param("reviewDepth", "FULL")
                        .param("pastedFiles", pastedFiles)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andReturn();
        return mapper.readTree(created.getResponse().getContentAsString()).get("scanId").asText();
    }

    private String createCleanScan() throws Exception {
        String pastedFiles = """
                [{"fileName":"README.md","fileType":"md","content":"# Demo\\nDocumented architecture and secure review notes."}]
                """;
        MvcResult created = mvc.perform(multipart("/api/scans")
                        .param("scanName", "Clean artifacts integration")
                        .param("reviewDepth", "FULL")
                        .param("pastedFiles", pastedFiles)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andReturn();
        return mapper.readTree(created.getResponse().getContentAsString()).get("scanId").asText();
    }
}
