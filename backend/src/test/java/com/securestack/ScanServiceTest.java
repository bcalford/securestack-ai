package com.securestack;

import com.securestack.analysis.ai.MockAiAnalysisProvider;
import com.securestack.config.ScanProperties;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.Category;
import com.securestack.model.Enums.RiskLevel;
import com.securestack.model.Enums.Severity;
import com.securestack.service.ScanService;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ScanServiceTest {
    @Test
    void mockAiSummarizes() {
        var request = new com.securestack.analysis.ai.AiAnalysisRequest(
                "x",
                80,
                RiskLevel.MODERATE,
                Map.of(Severity.HIGH, 1L),
                Map.of(Category.SECRETS, 1L),
                "STANDARD",
                List.of("app.js"),
                List.of(),
                List.of(),
                List.of()
        );

        var result = new MockAiAnalysisProvider().generateSummary(request);

        assertTrue(result.executiveSummary().contains("80"));
    }

    @Test
    void riskMath() {
        Finding critical = new Finding();
        critical.severity = Severity.CRITICAL;
        Finding high = new Finding();
        high.severity = Severity.HIGH;
        var service = new ScanService(List.of(), null, null, new MockAiAnalysisProvider());

        assertEquals(70, service.score(List.of(critical, high)));
        assertEquals(RiskLevel.MODERATE, service.level(70));
    }

    @Test
    void zipNormalizationAbortsWhenMaxFilesExceeded() throws Exception {
        ScanProperties properties = new ScanProperties();
        properties.setMaxScanFiles(1);
        var service = new ScanService(List.of(), null, null, new MockAiAnalysisProvider(), properties);
        byte[] zip = zipWithFiles("one.js", "two.js");
        var upload = new MockMultipartFile("files", "demo.zip", "application/zip", zip);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> service.create("zip demo", "STANDARD", "", "[]", new MockMultipartFile[]{upload}, false)
        );

        assertTrue(error.getMessage().contains("Too many files"));
    }

    private byte[] zipWithFiles(String... names) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ZipArchiveOutputStream zip = new ZipArchiveOutputStream(output)) {
            for (String name : names) {
                zip.putArchiveEntry(new ZipArchiveEntry(name));
                zip.write("const ok = true;".getBytes());
                zip.closeArchiveEntry();
            }
        }
        return output.toByteArray();
    }
}
