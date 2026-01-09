package de.profis.controller;

import de.profis.model.*;
import de.profis.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // Basis-Pfad für alle Aufrufe
@CrossOrigin(origins = "http://localhost:3000")
public class MasterDataController {

    private final StudiengangRepository studiengangRepo;
    private final PruefungsordnungRepository poRepo;
    private final SemesterRepository semesterRepo;
    private final FachbereichRepository fbRepo;

    // --- NEU: Repositories für Studenten und Betreuer hinzufügen ---
    private final StudierendeRepository studentRepo;
    private final BetreuerRepository betreuerRepo;

    public MasterDataController(StudiengangRepository studiengangRepo,
                                PruefungsordnungRepository poRepo,
                                SemesterRepository semesterRepo,
                                FachbereichRepository fbRepo,
                                StudierendeRepository studentRepo,
                                BetreuerRepository betreuerRepo) {
        this.studiengangRepo = studiengangRepo;
        this.poRepo = poRepo;
        this.semesterRepo = semesterRepo;
        this.fbRepo = fbRepo;
        this.studentRepo = studentRepo;
        this.betreuerRepo = betreuerRepo;
    }

    // --- Bestehende Endpunkte (achte auf den Pfad /masterdata/...) ---

    @GetMapping("/masterdata/studiengaenge")
    public List<Studiengang> getAllStudiengaenge() {
        return studiengangRepo.findAll();
    }

    @GetMapping("/masterdata/pos")
    public List<Pruefungsordnung> getAllPOs() {
        return poRepo.findAll();
    }

    @GetMapping("/masterdata/semester")
    public List<Semester> getAllSemester() {
        return semesterRepo.findAll();
    }

    @GetMapping("/masterdata/fachbereiche")
    public List<Fachbereich> getAllFachbereiche() {
        return fbRepo.findAll();
    }

    // --- NEU: Endpunkte für Studenten und Betreuer (direkt unter /api/...) ---
    // Diese werden von ThesisForm.js aufgerufen: api.get('/students')

    @GetMapping("/students")
    public List<Studierende> getAllStudents() {
        return studentRepo.findAll();
    }

    @GetMapping("/betreuer")
    public List<Betreuer> getAllBetreuer() {
        return betreuerRepo.findAll();
    }
    @DeleteMapping("/students/{id}")
    public org.springframework.http.ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        try {
            if (!studentRepo.existsById(id)) return org.springframework.http.ResponseEntity.notFound().build();
            studentRepo.deleteById(id);
            return org.springframework.http.ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Passiert oft, wenn der Student noch eine Arbeit hat (Foreign Key Constraint)
            return org.springframework.http.ResponseEntity.status(409)
                    .body("Kann nicht gelöscht werden: Dieser Eintrag wird noch verwendet.");
        }
    }

    @DeleteMapping("/betreuer/{id}")
    public org.springframework.http.ResponseEntity<String> deleteBetreuer(@PathVariable Long id) {
        try {
            if (!betreuerRepo.existsById(id)) return org.springframework.http.ResponseEntity.notFound().build();
            betreuerRepo.deleteById(id);
            return org.springframework.http.ResponseEntity.noContent().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(409)
                    .body("Kann nicht gelöscht werden: Dieser Eintrag wird noch verwendet.");
        }
    }
}