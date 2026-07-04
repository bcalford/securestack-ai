package com.securestack;

import com.securestack.model.Entities.Finding;
import com.securestack.model.Entities.Scan;
import com.securestack.model.Enums.Category;
import com.securestack.model.Enums.Confidence;
import com.securestack.model.Enums.RiskLevel;
import com.securestack.model.Enums.Severity;
import com.securestack.repository.FindingRepository;
import com.securestack.repository.ScanRepository;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.MvcResult;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
class SarifExportIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ScanRepository scans;
    @Autowired FindingRepository findings;



    @Test
    void bundleEndpointReturnsZipWithExpectedNonEmptyEntries() throws Exception {
        Scan scan = saveScan("Bundle mapping");
        scan.executiveSummary = "Executive token = abc123";
        scan.remediationSummary = "Rotate token = abc123";
        scan.files = List.of("src/Secret.java");
        scans.save(scan);
        saveFinding(scan.id, "SEC-002", Severity.HIGH, "src/Secret.java", 4, "Hardcoded password = supersecret");

        MvcResult result = mvc.perform(get("/api/scans/{scanId}/bundle", scan.id))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/zip"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", "attachment; filename=securestack-scan-" + scan.id + "-bundle.zip"))
                .andReturn();

        var entries = unzip(result.getResponse().getContentAsByteArray());
        assertThat(entries).containsKeys("securestack-report.pdf", "securestack-findings.sarif.json", "securestack-summary.json", "README.txt");
        assertThat(entries.get("securestack-report.pdf")).isNotEmpty();
        assertThat(entries.get("securestack-findings.sarif.json")).contains("\"version\" : \"2.1.0\"");
        assertThat(entries.get("securestack-summary.json")).contains("SecureStack JSON Report");
        assertThat(entries.get("README.txt"))
                .contains("Scan ID: " + scan.id)
                .contains("Scan name: Bundle mapping")
                .contains("Tool: SecureStack AI")
                .contains("Raw uploaded file content is not included in this bundle")
                .contains("Static analysis results require manual review");
        assertThat(String.join("\n", entries.values()))
                .doesNotContain("RAW_UPLOADED_SECRET_DO_NOT_EXPORT")
                .doesNotContain("supersecret");
    }

    @Test
    void missingBundleScanReturnsNotFound() throws Exception {
        mvc.perform(get("/api/scans/{scanId}/bundle", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void sarifIncludesRequiredMetadataAndFingerprints() throws Exception {
        Scan scan = saveScan("SARIF metadata");
        saveFinding(scan.id, "SEC-001", Severity.HIGH, "src/App.java", 10, "Token exposed");

        mvc.perform(get("/api/scans/{scanId}/sarif", scan.id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value("2.1.0"))
                .andExpect(jsonPath("$['$schema']").value("https://json.schemastore.org/sarif-2.1.0.json"))
                .andExpect(jsonPath("$.runs[0].tool.driver.name").value("SecureStack AI"))
                .andExpect(jsonPath("$.runs[0].tool.driver.informationUri").value("https://github.com/bcalford/securestack-ai"))
                .andExpect(jsonPath("$.runs[0].tool.driver.semanticVersion").value("0.4-alpha"))
                .andExpect(jsonPath("$.runs[0].tool.driver.rules[0].properties.category").value("INPUT_VALIDATION"))
                .andExpect(jsonPath("$.runs[0].tool.driver.rules[0].properties.security-severity").value("8.0"))
                .andExpect(jsonPath("$.runs[0].results[0].partialFingerprints['securestackFingerprint/v1']", matchesPattern("[a-f0-9]{64}")))
                .andExpect(jsonPath("$.runs[0].results[0].properties.status").value("OPEN"));
    }

    @Test
    void sarifRuleAndResultOrderingIsDeterministic() throws Exception {
        Scan scan = saveScan("SARIF deterministic");
        saveFinding(scan.id, "Z-RULE", Severity.LOW, "b.java", 2, "B finding");
        saveFinding(scan.id, "A-RULE", Severity.HIGH, "a.java", 1, "A finding");

        MvcResult first = mvc.perform(get("/api/scans/{scanId}/sarif", scan.id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.runs[0].tool.driver.rules[*].id", contains("A-RULE", "Z-RULE")))
                .andExpect(jsonPath("$.runs[0].results[*].ruleId", contains("A-RULE", "Z-RULE")))
                .andReturn();
        MvcResult second = mvc.perform(get("/api/scans/{scanId}/sarif", scan.id))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(second.getResponse().getContentAsString()).isEqualTo(first.getResponse().getContentAsString());
    }

    @Test
    void jsonExportEndpointReturnsScanReportWithoutRawContent() throws Exception {
        Scan scan = saveScan("JSON mapping");
        scan.aiProvider = "mock";
        scan.executiveSummary = "Executive token = abc123";
        scan.remediationSummary = "Rotate token = abc123";
        scan.files = List.of("src/Secret.java");
        scans.save(scan);
        saveFinding(scan.id, "SEC-002", Severity.HIGH, "src/Secret.java", 4, "Hardcoded password = supersecret");

        mvc.perform(get("/api/scans/{scanId}/export/json", scan.id))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.format").value("SecureStack JSON Report"))
                .andExpect(jsonPath("$.exportVersion").value("0.4-alpha"))
                .andExpect(jsonPath("$.scanId").value(scan.id.toString()))
                .andExpect(jsonPath("$.scanName").value("JSON mapping"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.riskScore").value(70))
                .andExpect(jsonPath("$.riskLevel").value("MODERATE"))
                .andExpect(jsonPath("$.aiProvider").value("mock"))
                .andExpect(jsonPath("$.executiveSummary").value("Executive token = <redacted>"))
                .andExpect(jsonPath("$.remediationSummary").value("Rotate token = <redacted>"))
                .andExpect(jsonPath("$.filesReviewed", contains("src/Secret.java")))
                .andExpect(jsonPath("$.findings", hasSize(1)))
                .andExpect(jsonPath("$.findings[0].ruleId").value("SEC-002"))
                .andExpect(jsonPath("$.findings[0].status").value("OPEN"))
                .andExpect(jsonPath("$.findings[0].controlMappings").isArray())
                .andExpect(jsonPath("$.limitations").exists())
                .andExpect(content().string(not(containsString("RAW_UPLOADED_SECRET_DO_NOT_EXPORT"))))
                .andExpect(content().string(not(containsString("supersecret"))));
    }

    @Test
    void missingJsonExportScanReturnsNotFound() throws Exception {
        mvc.perform(get("/api/scans/{scanId}/export/json", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void sarifEndpointExportsCompletedScanFindings() throws Exception {
        Scan scan = saveScan("SARIF mapping");
        saveFinding(scan.id, "rule-critical", Severity.CRITICAL, "src/App.java", 12, "Critical finding");
        saveFinding(scan.id, "rule-high", Severity.HIGH, "src/Auth.java", 7, "High finding");
        saveFinding(scan.id, "rule-medium", Severity.MEDIUM, "src/Api.java", 22, "Medium finding");
        saveFinding(scan.id, "rule-low", Severity.LOW, "src/Log.java", 31, "Low finding");
        saveFinding(scan.id, "rule-info", Severity.INFO, "README.md", null, "Info finding");

        mvc.perform(get("/api/scans/{scanId}/sarif", scan.id))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.version").value("2.1.0"))
                .andExpect(jsonPath("$['$schema']").value("https://json.schemastore.org/sarif-2.1.0.json"))
                .andExpect(jsonPath("$.runs[0].tool.driver.name").value("SecureStack AI"))
                .andExpect(jsonPath("$.runs[0].results", hasSize(5)))
                .andExpect(jsonPath("$.runs[0].results[*].ruleId", contains("rule-critical", "rule-high", "rule-info", "rule-low", "rule-medium")))
                .andExpect(jsonPath("$.runs[0].results[*].level", contains("error", "error", "note", "warning", "warning")))
                .andExpect(jsonPath("$.runs[0].results[0].message.text").value("Critical finding"))
                .andExpect(jsonPath("$.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri").value("src/App.java"))
                .andExpect(jsonPath("$.runs[0].results[0].locations[0].physicalLocation.region.startLine").value(12))
                .andExpect(jsonPath("$.runs[0].results[0].properties.category").value("INPUT_VALIDATION"))
                .andExpect(jsonPath("$.runs[0].results[0].properties.confidence").value("HIGH"))
                .andExpect(jsonPath("$.runs[0].results[0].properties.recommendation").value("Fix Critical finding"));
    }

    @Test
    void sarifDriverRulesAreDeduplicatedByRuleId() throws Exception {
        Scan scan = saveScan("SARIF rules");
        saveFinding(scan.id, "duplicate-rule", Severity.HIGH, "src/One.java", 1, "First duplicate");
        saveFinding(scan.id, "duplicate-rule", Severity.MEDIUM, "src/Two.java", 2, "Second duplicate");
        saveFinding(scan.id, "unique-rule", Severity.LOW, "src/Three.java", 3, "Unique finding");

        mvc.perform(get("/api/scans/{scanId}/sarif", scan.id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.runs[0].tool.driver.rules", hasSize(2)))
                .andExpect(jsonPath("$.runs[0].tool.driver.rules[*].id", contains("duplicate-rule", "unique-rule")));
    }

    @Test
    void missingScanReturnsExistingNotFoundErrorStyle() throws Exception {
        mvc.perform(get("/api/scans/{scanId}/sarif", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Requested scan or finding was not found."));
    }

    @Test
    void sarifResponseDoesNotIncludeRawUploadedFileContent() throws Exception {
        Scan scan = saveScan("SARIF content safety");
        scan.files = List.of("src/Secret.java");
        scans.save(scan);
        saveFinding(scan.id, "secret-rule", Severity.HIGH, "src/Secret.java", 4, "Secret detected");

        mvc.perform(get("/api/scans/{scanId}/sarif", scan.id))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("RAW_UPLOADED_SECRET_DO_NOT_EXPORT"))))
                .andExpect(content().string(not(containsString("password = super-secret-password"))));
    }


    private java.util.Map<String, String> unzip(byte[] bytes) throws Exception {
        java.util.Map<String, String> entries = new java.util.LinkedHashMap<>();
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                entries.put(entry.getName(), new String(zip.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8));
            }
        }
        return entries;
    }

    private Scan saveScan(String name) {
        Scan scan = new Scan();
        scan.name = name;
        scan.riskScore = 70;
        scan.riskLevel = RiskLevel.MODERATE;
        scan.fileCount = 1;
        scan.findingCount = 1;
        scan.executiveSummary = "Summary";
        scan.remediationSummary = "Remediation";
        scan.files = List.of("src/App.java");
        return scans.save(scan);
    }

    private Finding saveFinding(UUID scanId, String ruleId, Severity severity, String fileName, Integer lineNumber, String title) {
        Finding finding = new Finding();
        finding.scanId = scanId;
        finding.ruleId = ruleId;
        finding.severity = severity;
        finding.category = Category.INPUT_VALIDATION;
        finding.confidence = Confidence.HIGH;
        finding.fileName = fileName;
        finding.lineNumber = lineNumber;
        finding.title = title;
        finding.description = "Description for " + title;
        finding.recommendation = "Fix " + title;
        finding.evidence = "Masked evidence only";
        return findings.save(finding);
    }
}
