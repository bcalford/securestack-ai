package com.securestack;

import com.securestack.report.ReportService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import com.securestack.service.ScanService;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class ReportServiceTest {
    @Autowired ScanService scans;
    @Autowired ReportService reports;

    @Test void pdfGenerationReturnsBytes() throws Exception {
        var response = scans.create("PDF <scan>", "STANDARD", "", "[{\"fileName\":\"app.js\",\"fileType\":\"js\",\"content\":\"const JWT_SECRET = \\\"supersecret123\\\";\"}]", new MockMultipartFile[0], true);
        byte[] pdf = reports.pdf((UUID) response.scanId());
        assertTrue(pdf.length > 1000);
        assertTrue(new String(pdf, 0, 4).contains("%PDF"));
    }
}
