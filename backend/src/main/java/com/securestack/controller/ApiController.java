package com.securestack.controller;

import com.securestack.dto.Dto.*;
import com.securestack.report.ReportService;
import com.securestack.service.ScanService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final ScanService scans;
    private final ReportService reports;

    ApiController(ScanService scans, ReportService reports) { this.scans = scans; this.reports = reports; }

    @GetMapping("/health")
    Map<String, String> health() { return Map.of("status", "ok", "service", "securestack-ai", "version", "1.0.0"); }

    @PostMapping(value = "/scans", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<CreateScanResponse> create(@RequestParam(required = false) String scanName,
                                              @RequestParam(defaultValue = "STANDARD") String reviewDepth,
                                              @RequestParam(required = false) String focusAreas,
                                              @RequestParam(defaultValue = "false") boolean generatePdf,
                                              @RequestPart(required = false) MultipartFile[] files,
                                              @RequestParam(required = false) String pastedFiles) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(scans.create(scanName, reviewDepth, focusAreas, pastedFiles, files, generatePdf));
    }

    @GetMapping("/scans/{id}") ScanResultDto get(@PathVariable UUID id) { return scans.get(id); }
    @GetMapping("/scans") List<ScanListItem> list() { return scans.list(); }
    @PatchMapping("/scans/{sid}/findings/{fid}") @ResponseStatus(HttpStatus.NO_CONTENT) void update(@PathVariable UUID sid, @PathVariable UUID fid, @RequestBody UpdateFindingStatusRequest r) { scans.update(sid, fid, r.status()); }
    @DeleteMapping("/scans/{sid}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable UUID sid) { scans.delete(sid); }
    @GetMapping("/scans/{id}/report") ResponseEntity<byte[]> report(@PathVariable UUID id) { return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=securestack-report.pdf").contentType(MediaType.APPLICATION_PDF).body(reports.pdf(id)); }

    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<ErrorResponse> notFound(Exception e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("NOT_FOUND", "Requested scan or finding was not found.", List.of())); }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ErrorResponse> validation(Exception e) { return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", e.getMessage(), List.of())); }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> unexpected(Exception e) { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("INTERNAL_ERROR", "Unexpected server error.", List.of())); }
}
