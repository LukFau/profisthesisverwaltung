package de.profis.service;

import de.profis.dto.SwsCalculationDto;
import de.profis.dto.SwsThesisDetailDto;
import de.profis.model.Betreuer;
import de.profis.model.Notenbestandteil;
import de.profis.model.Semester;
import de.profis.repository.BetreuerRepository;
import de.profis.repository.NotenbestandteilRepository;
import de.profis.repository.SemesterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SwsCalculationService {

    private final NotenbestandteilRepository notenRepo;
    private final SemesterRepository semesterRepo;
    private final BetreuerRepository betreuerRepo;

    private static final double SWS_FACTOR = 0.2;
    private static final double SWS_LIMIT = 2.0;

    public SwsCalculationService(NotenbestandteilRepository notenRepo, SemesterRepository semesterRepo, BetreuerRepository betreuerRepo) {
        this.notenRepo = notenRepo;
        this.semesterRepo = semesterRepo;
        this.betreuerRepo = betreuerRepo;
    }

    // Hilfsmethode für Controller & Export
    public List<SwsCalculationDto> getAllSwsForSemester(Long semesterId) {
        return betreuerRepo.findAll().stream()
                .map(b -> calculateSws(semesterId, b.getId()))
                .collect(Collectors.toList());
    }

    public SwsCalculationDto calculateSws(Long semesterId, Long betreuerId) {
        Semester semester = semesterRepo.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester nicht gefunden"));

        Betreuer betreuer = betreuerRepo.findById(betreuerId)
                .orElseThrow(() -> new IllegalArgumentException("Betreuer nicht gefunden"));

        // Name zusammenbauen
        String name = (betreuer.getTitel() != null ? betreuer.getTitel() + " " : "")
                + betreuer.getVorname() + " " + betreuer.getNachname();

        List<Notenbestandteil> betreuungen = notenRepo.findByBetreuerIdAndArbeit_Semester_Id(betreuerId, semesterId);

        // Details mappen (Hier werden die Daten für den Report gesammelt)
        List<SwsThesisDetailDto> details = betreuungen.stream().map(n -> new SwsThesisDetailDto(
                n.getArbeit().getTitel(),
                n.getArbeit().getStudierende().getVorname() + " " + n.getArbeit().getStudierende().getNachname(),
                n.getArbeit().getTyp(),
                n.getRolle()
        )).collect(Collectors.toList());

        int anzahl = betreuungen.size();
        double rawSws = Math.round((anzahl * SWS_FACTOR) * 10.0) / 10.0;
        double anrechenbar = Math.min(rawSws, SWS_LIMIT);

        return new SwsCalculationDto(
                betreuer.getId(),
                name,
                semester.getBezeichnung(),
                anzahl,
                rawSws,
                anrechenbar,
                SWS_LIMIT,
                details
        );
    }
}