package de.profis.controller;

import de.profis.dto.ThesisCreateDto;
import de.profis.dto.ThesisResponseDto;
import de.profis.model.WissenschaftlicheArbeit;
import de.profis.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import de.profis.model.Notenbestandteil; // Import nötig
import de.profis.repository.NotenbestandteilRepository; // Import nötig
import de.profis.repository.BetreuerRepository; // Import nötig

@RestController
@RequestMapping("/api/theses")
public class ThesisController {

    private final WissenschaftlicheArbeitRepository arbeitRepository;
    private final StudierendeRepository studRepo;
    private final StudiengangRepository sgRepo;
    private final PruefungsordnungRepository poRepo;
    private final SemesterRepository semRepo;
    private final NotenbestandteilRepository notenRepo;
    private final BetreuerRepository betreuerRepo;

    // Konstruktor mit Dependency Injection für alle benötigten Repositories
    public ThesisController(WissenschaftlicheArbeitRepository arbeitRepository,
                            StudierendeRepository studRepo,
                            StudiengangRepository sgRepo,
                            PruefungsordnungRepository poRepo,
                            SemesterRepository semRepo,
                            NotenbestandteilRepository notenRepo,
                            BetreuerRepository betreuerRepo
    ) {
        this.arbeitRepository = arbeitRepository;
        this.studRepo = studRepo;
        this.sgRepo = sgRepo;
        this.poRepo = poRepo;
        this.semRepo = semRepo;
        this.notenRepo = notenRepo;
        this.betreuerRepo = betreuerRepo;
    }

    // --- GET: Alle Arbeiten abrufen ---
    @GetMapping
    public List<ThesisResponseDto> getAllTheses() {
        // 1. Alle Arbeiten aus der DB holen
        List<WissenschaftlicheArbeit> entities = arbeitRepository.findAll();

        // 2. Entities in DTOs umwandeln (für schöne JSON-Ausgabe)
        return entities.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- POST: Neue Arbeit anlegen ---
    @PostMapping
    public ThesisResponseDto createThesis(@RequestBody ThesisCreateDto dto) {
        WissenschaftlicheArbeit entity = new WissenschaftlicheArbeit();

        // Basis-Daten setzen
        entity.setTitel(dto.getTitel());
        entity.setTyp(dto.getTyp());
        entity.setStatus(dto.getStatus());

        // Verknüpfungen anhand der IDs aus der DB laden und setzen
        if (dto.getStudierendenId() != null) {
            entity.setStudierende(studRepo.findById(dto.getStudierendenId()).orElse(null));
        }

        if (dto.getStudiengangId() != null) {
            entity.setStudiengang(sgRepo.findById(dto.getStudiengangId()).orElse(null));
        }

        if (dto.getPoId() != null) {
            entity.setPruefungsordnung(poRepo.findById(dto.getPoId()).orElse(null));
        }

        if (dto.getSemesterId() != null) {
            entity.setSemester(semRepo.findById(dto.getSemesterId()).orElse(null));
        }

        // Speichern in der DB
        WissenschaftlicheArbeit saved = arbeitRepository.save(entity);

        // Das gespeicherte Objekt als DTO zurückgeben
        return convertToDto(saved);
    }

    // --- Hilfsmethode: Entity -> DTO Konvertierung ---
    private ThesisResponseDto convertToDto(WissenschaftlicheArbeit entity) {
        ThesisResponseDto dto = new ThesisResponseDto();
        dto.setId(entity.getId());
        dto.setTitel(entity.getTitel());
        dto.setTyp(entity.getTyp());
        dto.setStatus(entity.getStatus());

        // IDs setzen
        if(entity.getStudierende() != null) {
            dto.setStudentName(entity.getStudierende().getVorname() + " " + entity.getStudierende().getNachname());
            dto.setMatrikelnummer(entity.getStudierende().getMatrikelnummer());
            dto.setStudierendenId(entity.getStudierende().getId()); // NEU
        }
        if(entity.getStudiengang() != null) {
            dto.setStudiengang(entity.getStudiengang().getBezeichnung());
            dto.setStudiengangId(entity.getStudiengang().getId()); // NEU
        }
        if(entity.getSemester() != null) {
            dto.setSemester(entity.getSemester().getBezeichnung());
            dto.setSemesterId(entity.getSemester().getId()); // NEU
        }
        if(entity.getPruefungsordnung() != null) dto.setPoId(entity.getPruefungsordnung().getId()); // NEU

        if (entity.getZeitdaten() != null) dto.setAbgabedatum(entity.getZeitdaten().getAbgabedatum());

        // Noten & Prüfer
        if (entity.getNoten() != null) {
            entity.getNoten().stream()
                    .filter(n -> "Erstprüfer".equalsIgnoreCase(n.getRolle()))
                    .findFirst()
                    .ifPresent(n -> {
                        if(n.getBetreuer() != null) {
                            String t = n.getBetreuer().getTitel() != null ? n.getBetreuer().getTitel() + " " : "";
                            dto.setErstpruefer(t + n.getBetreuer().getVorname() + " " + n.getBetreuer().getNachname());
                            dto.setErstprueferId(n.getBetreuer().getId()); // NEU
                        }
                        dto.setNoteArbeit(n.getNoteArbeit()); // NEU
                        dto.setNoteKolloquium(n.getNoteKolloquium()); // NEU
                    });
        }
        return dto;
    }

    @GetMapping("/{id}")
    public ThesisResponseDto getThesisById(@PathVariable Long id) {
        WissenschaftlicheArbeit entity = arbeitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Arbeit nicht gefunden"));

        ThesisResponseDto dto = convertToDto(entity);

        // Wir müssen die IDs und Noten manuell ins DTO packen, damit das Formular sie hat
        // (Hack: Wir nutzen convertToDto für die Anzeige, erweitern es hier aber um Details für Edit)
        // Hinweis: Normalerweise würde man ein separates "ThesisDetailDto" nutzen.
        // Wir packen die Werte hier einfachheitshalber in das ResponseDto oder nutzen eine Map.
        // Um es sauber zu halten, erweitern wir kurz das ResponseDto um die Roh-Werte:

        // Hier simulieren wir das Laden der Noten (nur Erstprüfer)
        entity.getNoten().stream().filter(n -> "Erstprüfer".equalsIgnoreCase(n.getRolle())).findFirst().ifPresent(n -> {
            // Wir bräuchten Felder im DTO dafür. Um die DTO Struktur nicht zu sprengen,
            // sende ich sie nicht mit, sondern das Frontend muss sie separat laden oder wir erweitern das DTO.
            // *Lösung*: Wir erweitern convertToDto unten, um auch Noten zurückzugeben.
        });

        return dto;
    }

    // --- NEU: Update (PUT) ---
    @PutMapping("/{id}")
    public ThesisResponseDto updateThesis(@PathVariable Long id, @RequestBody ThesisCreateDto dto) {
        WissenschaftlicheArbeit entity = arbeitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Arbeit nicht gefunden"));

        // Basis-Daten updaten
        entity.setTitel(dto.getTitel());
        entity.setTyp(dto.getTyp());
        entity.setStatus(dto.getStatus());

        // Relationen updaten (nur wenn IDs gesendet wurden)
        if (dto.getStudierendenId() != null) entity.setStudierende(studRepo.findById(dto.getStudierendenId()).orElse(null));
        if (dto.getStudiengangId() != null) entity.setStudiengang(sgRepo.findById(dto.getStudiengangId()).orElse(null));
        if (dto.getPoId() != null) entity.setPruefungsordnung(poRepo.findById(dto.getPoId()).orElse(null));
        if (dto.getSemesterId() != null) entity.setSemester(semRepo.findById(dto.getSemesterId()).orElse(null));

        // --- NOTEN UPDATEN ---
        if (dto.getNoteArbeit() != null || dto.getNoteKolloquium() != null) {
            // Suche existierenden Noteneintrag für Erstprüfer
            Notenbestandteil note = entity.getNoten().stream()
                    .filter(n -> "Erstprüfer".equalsIgnoreCase(n.getRolle()))
                    .findFirst()
                    .orElse(new Notenbestandteil()); // Oder neu erstellen

            note.setArbeit(entity);
            note.setRolle("Erstprüfer");
            if (dto.getNoteArbeit() != null) note.setNoteArbeit(dto.getNoteArbeit());
            if (dto.getNoteKolloquium() != null) note.setNoteKolloquium(dto.getNoteKolloquium());

            // Falls Betreuer im Formular gewählt wurde
            if (dto.getBetreuerId() != null) {
                note.setBetreuer(betreuerRepo.findById(dto.getBetreuerId()).orElse(null));
            }

            notenRepo.save(note);
        }

        WissenschaftlicheArbeit saved = arbeitRepository.save(entity);
        return convertToDto(saved);
    }
}