package de.profis.controller;

import de.profis.service.DataImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "http://localhost:3000")
public class ImportController {

    private final DataImportService importService;

    public ImportController(DataImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/excel")
    public ResponseEntity<String> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Bitte eine Datei auswählen.");
            }

            importService.importExcel(file.getInputStream());

            return ResponseEntity.ok("Import erfolgreich abgeschlossen!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Fehler beim Import: " + e.getMessage());
        }
    }
}