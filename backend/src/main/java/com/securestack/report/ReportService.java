package com.securestack.report;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.securestack.dto.Dto.FindingDto;
import com.securestack.dto.Dto.ScanResultDto;
import com.securestack.report.ReportService.Html;
import com.securestack.service.ScanService;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ReportService {
    private final ScanService scans;

    public ReportService(ScanService scans) {
        this.scans = scans;
    }

    public byte[] pdf(UUID id) {
        ScanResultDto result = scans.get(id);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            new PdfRendererBuilder().withHtmlContent(render(result), null).toStream(out).run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Report generation failed", e);
        }
    }

    private String render(ScanResultDto scan) {
        Html html = new Html();
        html.add("<html><head><style>");
        html.add("body{font-family:Arial,sans-serif;color:#0f172a}h1,h2{color:#0f766e}table{width:100%;border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:6px;text-align:left}.muted{color:#475569}.finding{page-break-inside:avoid;margin-bottom:16px}.disclaimer{font-size:12px;color:#475569}");
        html.add("</style></head><body>");
        html.tag("h1", "SecureStack AI Security Review Report");
        html.tag("p", "Generated: " + Instant.now());
        html.tag("p", "Scan: " + safe(scan.name()));
        html.tag("p", "Risk score: " + scan.riskScore() + "/100 (" + scan.riskLevel() + ")");
        html.tag("h2", "Executive summary");
        html.tag("p", scan.executiveSummary());
        html.tag("h2", "Severity breakdown");
        html.add(mapTable(scan.severityCounts()));
        html.tag("h2", "Category breakdown");
        html.add(mapTable(scan.categoryCounts()));
        html.tag("h2", "Files reviewed");
        html.add("<ul>");
        scan.files().forEach(file -> html.tag("li", file));
        html.add("</ul>");
        html.tag("h2", "Findings summary");
        html.add(summaryTable(scan));
        html.tag("h2", "Detailed findings");
        scan.findings().forEach(finding -> detailedFinding(html, finding));
        html.tag("h2", "Remediation checklist");
        html.add("<ul>");
        scan.findings().forEach(finding -> html.tag("li", finding.recommendation()));
        html.add("</ul>");
        html.tag("h2", "Methodology");
        html.tag("p", "SecureStack AI uses safe file validation, deterministic static rules, heuristic risk scoring, and mock AI summaries. Uploaded code is treated as untrusted and is not executed.");
        html.tag("h2", "Limitations");
        html.tag("p", "Rules are heuristic and may produce false positives or miss context-dependent vulnerabilities. Results should be validated by a qualified reviewer.");
        html.add("<p class='disclaimer'>Disclaimer: This report supports defensive review and documentation. It is not a replacement for a professional security assessment.</p>");
        html.add("</body></html>");
        return html.toString();
    }

    private void detailedFinding(Html html, FindingDto finding) {
        html.add("<div class='finding'>");
        html.tag("h3", finding.severity() + " - " + safe(finding.title()));
        html.tag("p", "Category: " + finding.category() + " | Confidence: " + finding.confidence() + " | Rule: " + safe(finding.ruleId()));
        html.tag("p", "File: " + safe(finding.fileName()) + ":" + finding.lineNumber());
        html.tag("p", finding.description());
        html.tag("p", "Evidence: " + safe(finding.evidence()));
        html.tag("p", "Recommendation: " + safe(finding.recommendation()));
        html.tag("p", "Secure example: " + safe(finding.secureExample()));
        html.add("</div>");
    }

    private String summaryTable(ScanResultDto scan) {
        Html html = new Html();
        html.add("<table><tr><th>Severity</th><th>Title</th><th>File</th><th>Status</th></tr>");
        for (FindingDto f : scan.findings()) {
            html.add("<tr>");
            html.tag("td", String.valueOf(f.severity()));
            html.tag("td", f.title());
            html.tag("td", safe(f.fileName()) + ":" + f.lineNumber());
            html.tag("td", String.valueOf(f.status()));
            html.add("</tr>");
        }
        html.add("</table>");
        return html.toString();
    }

    private String mapTable(Map<?, Long> counts) {
        Html html = new Html();
        html.add("<table><tr><th>Name</th><th>Count</th></tr>");
        counts.forEach((key, value) -> {
            html.add("<tr>");
            html.tag("td", String.valueOf(key));
            html.tag("td", String.valueOf(value));
            html.add("</tr>");
        });
        html.add("</table>");
        return html.toString();
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    static class Html {
        private final StringBuilder out = new StringBuilder();
        void add(String raw) { out.append(raw); }
        void tag(String tag, String value) { out.append('<').append(tag).append('>').append(escape(value)).append("</").append(tag).append('>'); }
        public String toString() { return out.toString(); }
        private static String escape(String value) {
            if (value == null) return "";
            return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
        }
    }
}
