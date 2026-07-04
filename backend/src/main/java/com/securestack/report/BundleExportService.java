package com.securestack.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securestack.dto.Dto.ScanResultDto;
import com.securestack.sarif.SarifService;
import com.securestack.service.ScanService;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.stereotype.Service;

@Service
public class BundleExportService {
    private static final String TOOL_NAME = "SecureStack AI";
    private static final String TOOL_VERSION = JsonExportService.EXPORT_VERSION;

    private final ScanService scans;
    private final ReportService reports;
    private final SarifService sarif;
    private final JsonExportService jsonExports;
    private final ObjectMapper objectMapper;

    public BundleExportService(ScanService scans, ReportService reports, SarifService sarif, JsonExportService jsonExports, ObjectMapper objectMapper) {
        this.scans = scans;
        this.reports = reports;
        this.sarif = sarif;
        this.jsonExports = jsonExports;
        this.objectMapper = objectMapper;
    }

    public byte[] bundle(UUID scanId) {
        ScanResultDto scan = scans.get(scanId);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream(); ZipOutputStream zip = new ZipOutputStream(out)) {
            add(zip, "securestack-report.pdf", reports.pdf(scanId));
            add(zip, "securestack-findings.sarif.json", objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(sarif.export(scanId)));
            add(zip, "securestack-summary.json", objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(jsonExports.export(scanId)));
            add(zip, "README.txt", readme(scan).getBytes(StandardCharsets.UTF_8));
            zip.finish();
            return out.toByteArray();
        } catch (IOException | RuntimeException e) {
            throw new BundleExportException("Bundle generation failed", e);
        }
    }

    private void add(ZipOutputStream zip, String name, byte[] bytes) throws IOException {
        ZipEntry entry = new ZipEntry(name);
        zip.putNextEntry(entry);
        zip.write(bytes);
        zip.closeEntry();
    }

    private String readme(ScanResultDto scan) {
        return String.join("\n", List.of(
                "SecureStack AI export bundle",
                "",
                "Scan ID: " + scan.id(),
                "Scan name: " + scan.name(),
                "Generated at: " + Instant.now(),
                "Tool: " + TOOL_NAME,
                "Tool version: " + TOOL_VERSION,
                "",
                "Files included:",
                "- securestack-report.pdf: PDF report for sharing and review.",
                "- securestack-findings.sarif.json: SARIF 2.1.0 findings export for compatible security tooling.",
                "- securestack-summary.json: SecureStack JSON summary with scan metadata, summaries, counts, and findings.",
                "- README.txt: This manifest.",
                "",
                "Disclaimer: Static analysis results require manual review and may include false positives or miss context-dependent issues.",
                "Raw uploaded file content is not included in this bundle."
        )) + "\n";
    }
}
