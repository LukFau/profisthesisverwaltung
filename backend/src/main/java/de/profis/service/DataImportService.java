package de.profis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import de.profis.dto.importjson.InitialDataWrapper;
import de.profis.model.*;
import de.profis.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
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

    // --- JSON IMPORT (Unverändert) ---
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (arbeitRepo.count() > 0) {
            System.out.println("Datenbank bereits gefüllt. JSON-Import übersprungen.");
            return;
        }

        System.out.println("Starte Datenimport aus initial_data.json...");
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        try {
            InitialDataWrapper data = mapper.readValue(
                    new ClassPathResource("initial_data.json").getInputStream(),
                    InitialDataWrapper.class
            );
            processJsonImport(data);
            System.out.println("JSON Import abgeschlossen!");
        } catch (Exception e) {
            System.err.println("JSON Import fehlgeschlagen: " + e.getMessage());
        }
    }

    private void processJsonImport(InitialDataWrapper data) {
        Map<Long, Fachbereich> fbMap = new HashMap<>();
        Map<Long, Studiengang> sgMap = new HashMap<>();
        Map<Long, Pruefungsordnung> poMap = new HashMap<>();
        Map<Long, Semesterzeit> szMap = new HashMap<>();
        Map<Long, Semester> semMap = new HashMap<>();
        Map<Long, Betreuer> betreuerMap = new HashMap<>();
        Map<Long, Studierende> studMap = new HashMap<>();
        Map<Long, WissenschaftlicheArbeit> arbeitMap = new HashMap<>();

        if (data.getFachbereich() != null) {
            for (var dto : data.getFachbereich()) {
                Fachbereich entity = new Fachbereich();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setFbname(dto.getFbname());
                fbMap.put(dto.getId(), fbRepo.save(entity));
            }
        }
        if (data.getStudiengang() != null) {
            Fachbereich defaultFb = fbMap.values().stream().findFirst().orElse(null);
            for (var dto : data.getStudiengang()) {
                Studiengang entity = new Studiengang();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setAbschluss(dto.getAbschluss());
                entity.setAktiv(dto.getAktiv());
                entity.setFachbereich(defaultFb);
                sgMap.put(dto.getId(), sgRepo.save(entity));
            }
        }
        if (data.getSemesterzeit() != null) {
            for (var dto : data.getSemesterzeit()) {
                Semesterzeit entity = new Semesterzeit();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setBeginn(dto.getBeginn());
                entity.setEnde(dto.getEnde());
                szMap.put(dto.getId(), szRepo.save(entity));
            }
        }
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
        if (data.getPruefungsordnung() != null) {
            for (var dto : data.getPruefungsordnung()) {
                Pruefungsordnung entity = new Pruefungsordnung();
                entity.setBezeichnung(dto.getBezeichnung());
                entity.setGueltigAb(dto.getGueltigAb());
                entity.setStudiengang(sgMap.get(dto.getStudiengangId()));
                poMap.put(dto.getId(), poRepo.save(entity));
            }
        }
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
        if (data.getWissenschaftlicheArbeit() != null) {
            for (var dto : data.getWissenschaftlicheArbeit()) {
                WissenschaftlicheArbeit entity = new WissenschaftlicheArbeit();
                entity.setTitel(dto.getTitel());
                entity.setTyp(dto.getTyp());
                entity.setStatus(dto.getStatus());
                entity.setStudierende(studMap.get(dto.getStudierendenId()));
                entity.setStudiengang(sgMap.get(dto.getStudiengangId()));
                entity.setPruefungsordnung(poMap.get(dto.getPoId()));
                entity.setSemester(semMap.get(dto.getSemesterId()));
                arbeitMap.put(dto.getId(), arbeitRepo.save(entity));
            }
        }
        if (data.getZeitdaten() != null) {
            for (var dto : data.getZeitdaten()) {
                WissenschaftlicheArbeit arbeit = arbeitMap.get(dto.getArbeitId());
                if (arbeit != null) {
                    Zeitdaten entity = new Zeitdaten();
                    entity.setAnfangsdatum(dto.getAnfangsdatum());
                    entity.setAbgabedatum(dto.getAbgabedatum());
                    entity.setKolloquiumsdatum(dto.getKolloquiumsdatum());
                    entity.setArbeit(arbeit);
                    zeitRepo.save(entity);
                }
            }
        }
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
    }


    // --- EXCEL IMPORT ---

    @Transactional
    public void importExcel(InputStream inputStream) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(inputStream)) {

            // 1. Studierende
            Sheet sheetStudents = workbook.getSheet("Studierende");
            if (sheetStudents != null) {
                importStudentsFromSheet(sheetStudents);
            }

            // 2. Referenten
            Sheet sheetBetreuer = workbook.getSheet("Referenten");
            if (sheetBetreuer != null) {
                importBetreuerFromSheet(sheetBetreuer);
            }
        }
    }

    private void importStudentsFromSheet(Sheet sheet) {
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String matnr = getCellValue(row.getCell(0));
            if (matnr == null || matnr.isEmpty()) continue;

            // HIER WAR DER FEHLER: Wir nutzen .orElse(null), um das Optional aufzulösen
            Studierende student = studRepo.findByMatrikelnummer(matnr).orElse(null);

            if (student == null) {
                student = new Studierende();
                student.setMatrikelnummer(matnr);
            }

            student.setVorname(getCellValue(row.getCell(1)));
            student.setNachname(getCellValue(row.getCell(2)));
            student.setEmail(getCellValue(row.getCell(3)));

            studRepo.save(student);
        }
    }

    private void importBetreuerFromSheet(Sheet sheet) {
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String nachname = getCellValue(row.getCell(2));
            if (nachname == null || nachname.isEmpty()) continue;

            Betreuer b = new Betreuer();
            b.setTitel(getCellValue(row.getCell(0)));
            b.setVorname(getCellValue(row.getCell(1)));
            b.setNachname(nachname);

            betreuerRepo.save(b);
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) return cell.getLocalDateTimeCellValue().toString();
                return String.valueOf((long) cell.getNumericCellValue());
            default: return "";
        }
    }
}