package de.profis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import de.profis.dto.importjson.InitialDataWrapper;
import de.profis.model.*;
import de.profis.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class DataImportService implements CommandLineRunner {

    private final FachbereichRepository fbRepo;
    private final StudiengangRepository sgRepo;
    private final PruefungsordnungRepository poRepo;
    private final SemesterzeitRepository szRepo;
    private final SemesterRepository semRepo;
    private final BetreuerRepository betreuerRepo;
    private final StudierendeRepository studRepo;
    private final WissenschaftlicheArbeitRepository arbeitRepo;
    private final ZeitdatenRepository zeitRepo;
    private final NotenbestandteilRepository notenRepo;

    public DataImportService(FachbereichRepository fbRepo, StudiengangRepository sgRepo, PruefungsordnungRepository poRepo, SemesterzeitRepository szRepo, SemesterRepository semRepo, BetreuerRepository betreuerRepo, StudierendeRepository studRepo, WissenschaftlicheArbeitRepository arbeitRepo, ZeitdatenRepository zeitRepo, NotenbestandteilRepository notenRepo) {
        this.fbRepo = fbRepo;
        this.sgRepo = sgRepo;
        this.poRepo = poRepo;
        this.szRepo = szRepo;
        this.semRepo = semRepo;
        this.betreuerRepo = betreuerRepo;
        this.studRepo = studRepo;
        this.arbeitRepo = arbeitRepo;
        this.zeitRepo = zeitRepo;
        this.notenRepo = notenRepo;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (arbeitRepo.count() > 0) {
            System.out.println("Datenbank bereits gefüllt. Import übersprungen.");
            return;
        }

        System.out.println("Starte Datenimport aus initial_data.json...");

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // Wichtig für LocalDate

        // Datei einlesen
        InitialDataWrapper data = mapper.readValue(
                new ClassPathResource("initial_data.json").getInputStream(),
                InitialDataWrapper.class
        );

        // Maps zum Speichern der Zuordnung: JSON-ID -> Echtes Entity Objekt
        Map<Long, Fachbereich> fbMap = new HashMap<>();
        Map<Long, Studiengang> sgMap = new HashMap<>();
        Map<Long, Pruefungsordnung> poMap = new HashMap<>();
        Map<Long, Semesterzeit> szMap = new HashMap<>();
        Map<Long, Semester> semMap = new HashMap<>();
        Map<Long, Betreuer> betreuerMap = new HashMap<>();
        Map<Long, Studierende> studMap = new HashMap<>();
        Map<Long, WissenschaftlicheArbeit> arbeitMap = new HashMap<>();

        // 1. Fachbereiche
        if (data.getFachbereich() != null) {
            for (var dto : data.getFachbereich()) {
                Fachbereich entity = new Fachbereich();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setFbname(dto.getFbname());
                fbMap.put(dto.getId(), fbRepo.save(entity));
            }
        }

        // 2. Studiengänge (Achtung: JSON hat keine FB-ID, wir weisen dummy FB zu oder lassen null)
        if (data.getStudiengang() != null) {
            // Fallback: Nimm den ersten Fachbereich, falls vorhanden
            Fachbereich defaultFb = fbMap.values().stream().findFirst().orElse(null);

            for (var dto : data.getStudiengang()) {
                Studiengang entity = new Studiengang();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setAbschluss(dto.getAbschluss());
                entity.setAktiv(dto.getAktiv());
                entity.setFachbereich(defaultFb); // Workaround für fehlende Relation im JSON
                sgMap.put(dto.getId(), sgRepo.save(entity));
            }
        }

        // 3. Semesterzeiten
        if (data.getSemesterzeit() != null) {
            for (var dto : data.getSemesterzeit()) {
                Semesterzeit entity = new Semesterzeit();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setBeginn(dto.getBeginn());
                entity.setEnde(dto.getEnde());
                szMap.put(dto.getId(), szRepo.save(entity));
            }
        }

        // 4. Semester (braucht Semesterzeit)
        if (data.getSemester() != null) {
            for (var dto : data.getSemester()) {
                Semester entity = new Semester();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setTyp(dto.getTyp());
                entity.setJahr(dto.getJahr());
                entity.setSemesterzeit(szMap.get(dto.getSemesterzeitId()));
                semMap.put(dto.getId(), semRepo.save(entity));
            }
        }

        // 5. Prüfungsordnungen (braucht Studiengang)
        if (data.getPruefungsordnung() != null) {
            for (var dto : data.getPruefungsordnung()) {
                Pruefungsordnung entity = new Pruefungsordnung();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setGueltigAb(dto.getGueltigAb());
                entity.setStudiengang(sgMap.get(dto.getStudiengangId()));
                poMap.put(dto.getId(), poRepo.save(entity));
            }
        }

        // 6. Betreuer
        if (data.getBetreuer() != null) {
            for (var dto : data.getBetreuer()) {
                Betreuer entity = new Betreuer();
                entity.setVorname(dto.getVorname());
                entity.setNachname(dto.getNachname());
                entity.setTitel(dto.getTitel());
                entity.setRolle(dto.getRolle());
                betreuerMap.put(dto.getId(), betreuerRepo.save(entity));
            }
        }

        // 7. Studierende
        if (data.getStudierende() != null) {
            for (var dto : data.getStudierende()) {
                Studierende entity = new Studierende();
                entity.setMatrikelnummer(dto.getMatrikelnummer());
                entity.setVorname(dto.getVorname());
                entity.setNachname(dto.getNachname());
                entity.setEmail(dto.getEmail());
                studMap.put(dto.getId(), studRepo.save(entity));
            }
        }

        // 8. Wissenschaftliche Arbeiten (Die Zentrale!)
        if (data.getWissenschaftlicheArbeit() != null) {
            for (var dto : data.getWissenschaftlicheArbeit()) {
                WissenschaftlicheArbeit entity = new WissenschaftlicheArbeit();
                entity.setTitel(dto.getTitel());
                entity.setTyp(dto.getTyp());
                entity.setStatus(dto.getStatus());

                // Relationen setzen
                entity.setStudierende(studMap.get(dto.getStudierendenId()));
                entity.setStudiengang(sgMap.get(dto.getStudiengangId()));
                entity.setPruefungsordnung(poMap.get(dto.getPoId()));
                entity.setSemester(semMap.get(dto.getSemesterId()));

                arbeitMap.put(dto.getId(), arbeitRepo.save(entity));
            }
        }

        // 9. Zeitdaten (1:1 zu Arbeit)
        if (data.getZeitdaten() != null) {
            for (var dto : data.getZeitdaten()) {
                WissenschaftlicheArbeit arbeit = arbeitMap.get(dto.getArbeitId());
                if (arbeit != null) {
                    Zeitdaten entity = new Zeitdaten();
                    entity.setAnfangsdatum(dto.getAnfangsdatum());
                    entity.setAbgabedatum(dto.getAbgabedatum());
                    entity.setKolloquiumsdatum(dto.getKolloquiumsdatum());
                    entity.setArbeit(arbeit); // Verknüpfung
                    zeitRepo.save(entity);
                }
            }
        }

        // 10. Notenbestandteile
        if (data.getNotenbestandteil() != null) {
            for (var dto : data.getNotenbestandteil()) {
                Notenbestandteil entity = new Notenbestandteil();
                entity.setNoteArbeit(dto.getNoteArbeit());
                entity.setNoteKolloquium(dto.getNoteKolloquium());
                entity.setRolle(dto.getRolle());

                entity.setArbeit(arbeitMap.get(dto.getArbeitId()));
                entity.setBetreuer(betreuerMap.get(dto.getBetreuerId()));

                notenRepo.save(entity);
            }
        }

        System.out.println("Import abgeschlossen!");
    }
}