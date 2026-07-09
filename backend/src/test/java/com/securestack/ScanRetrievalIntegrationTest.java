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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ScanRetrievalIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void createdScanCanBeRetrievedWithFullResultDto() throws Exception {
        String pastedFiles = """
                [{
                  "fileName":"app.js",
                  "fileType":"js",
                  "content":"app.use(cors({ origin: '*' }));\\napp.use(cors({ origin: '*' }));"
                }]
                """;

        MvcResult created = mvc.perform(multipart("/api/scans")
                        .param("scanName", "Retrieval integration")
                        .param("reviewDepth", "STANDARD")
                        .param("pastedFiles", pastedFiles)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scanId").exists())
                .andReturn();

        JsonNode body = mapper.readTree(created.getResponse().getContentAsString());
        String scanId = body.get("scanId").asText();

        mvc.perform(get("/api/scans/{scanId}", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(scanId))
                .andExpect(jsonPath("$.findings", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.severityCounts").exists())
                .andExpect(jsonPath("$.categoryCounts").exists())
                .andExpect(jsonPath("$.files", hasSize(1)));
    }

    @Test
    void missingScanReturnsNotFoundError() throws Exception {
        mvc.perform(get("/api/scans/{scanId}", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Requested scan or finding was not found."));
    }

    @Test
    void invalidScanIdentifierReturnsControlledValidationError() throws Exception {
        mvc.perform(get("/api/scans/{scanId}", "not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Invalid scan or finding identifier."));
    }

    @Test
    void missingFindingStatusReturnsControlledValidationError() throws Exception {
        String pastedFiles = """
                [{
                  "fileName":"app.js",
                  "fileType":"js",
                  "content":"app.use(cors({ origin: '*' }));"
                }]
                """;

        MvcResult created = mvc.perform(multipart("/api/scans")
                        .param("scanName", "Status validation")
                        .param("reviewDepth", "STANDARD")
                        .param("pastedFiles", pastedFiles)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andReturn();

        String scanId = mapper.readTree(created.getResponse().getContentAsString()).get("scanId").asText();
        MvcResult scanResult = mvc.perform(get("/api/scans/{scanId}", scanId))
                .andExpect(status().isOk())
                .andReturn();
        String findingId = mapper.readTree(scanResult.getResponse().getContentAsString()).get("findings").get(0).get("id").asText();

        mvc.perform(patch("/api/scans/{scanId}/findings/{findingId}", scanId, findingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Finding status is required."));
    }
}
