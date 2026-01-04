package de.profis.service;

import de.profis.dto.SwsCalculationDto;
import de.profis.model.Notenbestandteil;
import de.profis.model.Semester;
import de.profis.repository.NotenbestandteilRepository;
import de.profis.repository.SemesterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SwsCalculationService {

    private final NotenbestandteilRepository notenRepo;
    private final SemesterRepository semesterRepo;

    // Konstanten gemäß SRS (0.2 pro Arbeit, Max 2.0)
    private static final double SWS_FACTOR = 0.2;
    private static final double SWS_LIMIT = 2.0;

    public SwsCalculationService(NotenbestandteilRepository notenRepo, SemesterRepository semesterRepo) {
        this.notenRepo = notenRepo;
        this.semesterRepo = semesterRepo;
    }

    /**
     * Berechnet die SWS für einen Betreuer in einem Semester.
     */
    public SwsCalculationDto calculateSws(Long semesterId, Long betreuerId) {
        // 1. Semester-Info laden (für den Namen im DTO)
        Semester semester = semesterRepo.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester nicht gefunden: " + semesterId));

        // 2. Alle Betreuungen laden
        List<Notenbestandteil> betreuungen = notenRepo.findByBetreuerIdAndArbeit_Semester_Id(betreuerId, semesterId);

        int anzahl = betreuungen.size();

        // 3. Berechnung
        double rawSws = anzahl * SWS_FACTOR;

        // Runden auf 1 Nachkommastelle, um Fließkomma-Fehler (z.B. 0.60000001) zu vermeiden
        rawSws = Math.round(rawSws * 10.0) / 10.0;

        // 4. Deckelung (Cap)
        double anrechenbar = Math.min(rawSws, SWS_LIMIT);

        return new SwsCalculationDto(
                semester.getBezeichnung(),
                anzahl,
                rawSws,
                anrechenbar,
                SWS_LIMIT
        );
    }
}