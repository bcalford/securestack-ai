package com.securestack;

import com.securestack.model.Entities.Finding;
import com.securestack.model.Entities.Scan;
import com.securestack.model.Enums.Category;
import com.securestack.model.Enums.Confidence;
import com.securestack.model.Enums.RiskLevel;
import com.securestack.model.Enums.Severity;
import com.securestack.repository.FindingRepository;
import com.securestack.repository.ScanRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SarifExportIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ScanRepository scans;
    @Autowired FindingRepository findings;

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
