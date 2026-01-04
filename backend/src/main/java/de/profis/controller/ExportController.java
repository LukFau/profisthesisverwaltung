package de.profis.controller;

import de.profis.service.ExcelExportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final ExcelExportService excelService;

    public ExportController(ExcelExportService excelService) {
        this.excelService = excelService;
    }

    @GetMapping("/theses")
    public ResponseEntity<InputStreamResource> exportTheses() {
        ByteArrayInputStream in = excelService.exportThesesToExcel();

        String filename = "theses_export.xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}