package de.profis.controller;

import de.profis.model.Pruefungsordnung;
import de.profis.model.Semester;
import de.profis.model.Studiengang;
import de.profis.model.Studierende;
import de.profis.repository.PruefungsordnungRepository;
import de.profis.repository.SemesterRepository;
import de.profis.repository.StudiengangRepository;
import de.profis.repository.StudierendeRepository;
import org.springframework.web.bind.annotation.*;
import de.profis.repository.BetreuerRepository; // Import nicht vergessen!
import de.profis.model.Betreuer;
import de.profis.dto.BetreuerCreateDto; // NEU
import de.profis.dto.StudentCreateDto;   // NEU

import java.util.List;

@RestController
@RequestMapping("/api/masterdata")
public class MasterDataController {

    private final StudierendeRepository studRepo;
    private final StudiengangRepository sgRepo;
    private final PruefungsordnungRepository poRepo;
    private final SemesterRepository semRepo;

    private final BetreuerRepository betreuerRepo;

    public MasterDataController(
            StudierendeRepository studRepo,
            StudiengangRepository sgRepo,
            PruefungsordnungRepository poRepo,
            SemesterRepository semRepo,
            BetreuerRepository betreuerRepo
    ) {
        this.studRepo = studRepo;
        this.sgRepo = sgRepo;
        this.poRepo = poRepo;
        this.semRepo = semRepo;
        this.betreuerRepo = betreuerRepo;
    }

    @GetMapping("/betreuer")
    public List<Betreuer> getBetreuer() {
        return betreuerRepo.findAll();
    }

    @GetMapping("/students")
    public List<Studierende> getStudents() { return studRepo.findAll(); }

    @GetMapping("/studiengaenge")
    public List<Studiengang> getStudiengaenge() { return sgRepo.findAll(); }

    @GetMapping("/pos")
    public List<Pruefungsordnung> getPos() { return poRepo.findAll(); }

    @GetMapping("/semesters")
    public List<Semester> getSemesters() { return semRepo.findAll(); }

    @PostMapping("/students")
    public Studierende createStudent(@RequestBody StudentCreateDto dto) {
        Studierende s = new Studierende();
        s.setVorname(dto.getVorname());
        s.setNachname(dto.getNachname());
        s.setMatrikelnummer(dto.getMatrikelnummer());
        s.setEmail(dto.getEmail());
        return studRepo.save(s);
    }

    @PostMapping("/betreuer")
    public Betreuer createBetreuer(@RequestBody BetreuerCreateDto dto) {
        Betreuer b = new Betreuer();
        b.setVorname(dto.getVorname());
        b.setNachname(dto.getNachname());
        b.setTitel(dto.getTitel());
        b.setRolle(dto.getRolle());
        return betreuerRepo.save(b);
    }
}