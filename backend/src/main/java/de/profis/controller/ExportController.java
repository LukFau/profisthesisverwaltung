package de.profis.controller;

import de.profis.model.Betreuer;
import de.profis.model.Studierende;
import de.profis.model.WissenschaftlicheArbeit;
import de.profis.repository.BetreuerRepository;
import de.profis.repository.StudierendeRepository;
import de.profis.repository.WissenschaftlicheArbeitRepository;
import de.profis.service.ExcelExportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/export") // Achte darauf, dass "/api" passt, sonst nur "/export"
@CrossOrigin(origins = "http://localhost:3000")
public class ExportController {

    private final ExcelExportService exportService;
    private final WissenschaftlicheArbeitRepository thesisRepo;
    private final StudierendeRepository studentRepo;
    private final BetreuerRepository betreuerRepo;

    public ExportController(ExcelExportService exportService, WissenschaftlicheArbeitRepository thesisRepo, StudierendeRepository studentRepo, BetreuerRepository betreuerRepo) {
        this.exportService = exportService;
        this.thesisRepo = thesisRepo;
        this.studentRepo = studentRepo;
        this.betreuerRepo = betreuerRepo;
    }

    // Export Thesen (mit Filter-Liste)
    @GetMapping("/theses")
    public ResponseEntity<Resource> exportTheses(@RequestParam(required = false) List<String> status) {
        List<WissenschaftlicheArbeit> theses;

        if (status == null || status.isEmpty() || status.contains("Alle")) {
            theses = thesisRepo.findAll();
        } else {
            // Filtert alle Thesen, deren Status in der Liste enthalten ist
            theses = thesisRepo.findAll().stream()
                    .filter(t -> status.contains(t.getStatus()))
                    .collect(Collectors.toList());
        }

        ByteArrayInputStream in = exportService.exportThesesToExcel(theses);
        return createResponse(in, "theses_export.xlsx");
    }

    // Export Studenten
    @GetMapping("/students")
    public ResponseEntity<Resource> exportStudents() {
        List<Studierende> students = studentRepo.findAll();
        ByteArrayInputStream in = exportService.exportStudentsToExcel(students);
        return createResponse(in, "students_export.xlsx");
    }

    // Export Referenten
    @GetMapping("/betreuer")
    public ResponseEntity<Resource> exportBetreuer() {
        List<Betreuer> betreuer = betreuerRepo.findAll();
        ByteArrayInputStream in = exportService.exportBetreuerToExcel(betreuer);
        return createResponse(in, "referenten_export.xlsx");
    }

    @GetMapping("/combined")
    public ResponseEntity<Resource> exportCombined(
            @RequestParam(defaultValue = "false") boolean includeTheses,
            @RequestParam(defaultValue = "false") boolean includeStudents,
            @RequestParam(defaultValue = "false") boolean includeBetreuer,
            @RequestParam(required = false) List<String> status // Filter für Theses
    ) {
        List<WissenschaftlicheArbeit> theses = null;
        List<Studierende> students = null;
        List<Betreuer> betreuer = null;

        // 1. Theses laden (falls gewünscht)
        if (includeTheses) {
            if (status == null || status.isEmpty() || status.contains("Alle")) {
                theses = thesisRepo.findAll();
            } else {
                theses = thesisRepo.findAll().stream()
                        .filter(t -> status.contains(t.getStatus()))
                        .collect(Collectors.toList());
            }
        }

        // 2. Studenten laden (falls gewünscht)
        if (includeStudents) {
            students = studentRepo.findAll();
        }

        // 3. Betreuer laden (falls gewünscht)
        if (includeBetreuer) {
            betreuer = betreuerRepo.findAll();
        }

        // Service aufrufen
        ByteArrayInputStream in = exportService.exportCombined(theses, students, betreuer);

        return createResponse(in, "export_daten.xlsx");
    }

    private ResponseEntity<Resource> createResponse(ByteArrayInputStream in, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(in));
    }
}