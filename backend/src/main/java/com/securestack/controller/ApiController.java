package com.securestack.controller;

import com.securestack.dto.Dto.*;
import com.securestack.analysis.RuleCatalogService;
import com.securestack.github.GitHubRepositoryImportService;
import com.securestack.report.ReportService;
import com.securestack.service.ScanService;
import com.securestack.sarif.SarifService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
public class ApiController {
    private static final Logger log = LoggerFactory.getLogger(ApiController.class);
    private final ScanService scans;
    private final ReportService reports;
    private final SarifService sarif;
    private final RuleCatalogService ruleCatalog;
    private final GitHubRepositoryImportService githubImport;

    ApiController(ScanService scans, ReportService reports, SarifService sarif, RuleCatalogService ruleCatalog, GitHubRepositoryImportService githubImport) { this.scans = scans; this.reports = reports; this.sarif = sarif; this.ruleCatalog = ruleCatalog; this.githubImport = githubImport; }

    @GetMapping("/health")
    Map<String, String> health() { return Map.of("status", "ok", "service", "securestack-ai", "version", "1.0.0"); }

    @GetMapping("/rules")
    List<RuleCatalogItem> rules() { return ruleCatalog.list(); }

    @PostMapping(value = "/scans", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<CreateScanResponse> create(@RequestParam(required = false) String scanName,
                                              @RequestParam(defaultValue = "STANDARD") String reviewDepth,
                                              @RequestParam(required = false) String focusAreas,
                                              @RequestParam(defaultValue = "false") boolean generatePdf,
                                              @RequestPart(required = false) MultipartFile[] files,
                                              @RequestParam(required = false) String pastedFiles) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(scans.create(scanName, reviewDepth, focusAreas, pastedFiles, files, generatePdf));
    }


    @PostMapping(value = "/scans/github", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<CreateScanResponse> createFromGitHub(@RequestBody GitHubImportRequest request) throws Exception {
        var files = githubImport.importPublicRepository(request.repositoryUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(scans.createFromFiles(request.scanName(), request.reviewDepth(), request.focusAreas(), files));
    }

    @GetMapping("/scans/{id}") ScanResultDto get(@PathVariable UUID id) { return scans.get(id); }
    @GetMapping("/scans") List<ScanListItem> list() { return scans.list(); }
    @PatchMapping("/scans/{sid}/findings/{fid}") @ResponseStatus(HttpStatus.NO_CONTENT) void update(@PathVariable UUID sid, @PathVariable UUID fid, @RequestBody UpdateFindingStatusRequest r) { scans.update(sid, fid, r.status()); }
    @DeleteMapping("/scans/{sid}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable UUID sid) { scans.delete(sid); }
    @GetMapping("/scans/{id}/report") ResponseEntity<byte[]> report(@PathVariable UUID id) { return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=securestack-report.pdf").contentType(MediaType.APPLICATION_PDF).body(reports.pdf(id)); }
    @GetMapping("/scans/{id}/sarif") Map<String, Object> sarif(@PathVariable UUID id) { return sarif.export(id); }

    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<ErrorResponse> notFound(Exception e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("NOT_FOUND", "Requested scan or finding was not found.", List.of())); }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ErrorResponse> validation(Exception e) { return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", e.getMessage(), List.of())); }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> unexpected(Exception e) { log.error("Unexpected API error", e); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("INTERNAL_ERROR", "Unexpected server error.", List.of())); }
}
