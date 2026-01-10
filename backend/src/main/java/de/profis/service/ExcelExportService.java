package de.profis.service;

import de.profis.model.Betreuer;
import de.profis.model.Studierende;
import de.profis.model.WissenschaftlicheArbeit;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    // --- NEU: Hauptmethode für kombinierten Export ---
    public ByteArrayInputStream exportCombined(List<WissenschaftlicheArbeit> theses,
                                               List<Studierende> students,
                                               List<Betreuer> betreuer) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Wir fügen Sheets nur hinzu, wenn die Liste nicht null ist
            if (theses != null) {
                createThesesSheet(workbook, theses);
            }
            if (students != null) {
                createStudentsSheet(workbook, students);
            }
            if (betreuer != null) {
                createBetreuerSheet(workbook, betreuer);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Excel-Export: " + e.getMessage());
        }
    }

    // --- Wrapper für Einzel-Exports (falls du die alten Endpunkte behalten willst) ---
    public ByteArrayInputStream exportThesesToExcel(List<WissenschaftlicheArbeit> theses) {
        return exportCombined(theses, null, null);
    }
    public ByteArrayInputStream exportStudentsToExcel(List<Studierende> students) {
        return exportCombined(null, students, null);
    }
    public ByteArrayInputStream exportBetreuerToExcel(List<Betreuer> betreuer) {
        return exportCombined(null, null, betreuer);
    }

    // --- Private Helper Methoden zum Füllen der Sheets ---

    private void createThesesSheet(Workbook workbook, List<WissenschaftlicheArbeit> theses) {
        Sheet sheet = workbook.createSheet("Arbeiten");
        Row headerRow = sheet.createRow(0);
        String[] columns = {"ID", "Titel", "Typ", "Status", "Student", "Matrikelnr.", "Studiengang", "Erstprüfer", "Note Arbeit", "Note Kolloquium"};

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(getHeaderStyle(workbook));
        }

        int rowIdx = 1;
        for (WissenschaftlicheArbeit thesis : theses) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(thesis.getId());
            row.createCell(1).setCellValue(thesis.getTitel());
            row.createCell(2).setCellValue(thesis.getTyp());
            row.createCell(3).setCellValue(thesis.getStatus());

            if (thesis.getStudierende() != null) {
                row.createCell(4).setCellValue(thesis.getStudierende().getVorname() + " " + thesis.getStudierende().getNachname());
                row.createCell(5).setCellValue(thesis.getStudierende().getMatrikelnummer());
                if (thesis.getStudiengang() != null) {
                    row.createCell(6).setCellValue(thesis.getStudiengang().getBezeichnung());
                }
            }

            thesis.getNoten().stream()
                    .filter(n -> "Erstprüfer".equalsIgnoreCase(n.getRolle()) && n.getBetreuer() != null)
                    .findFirst()
                    .ifPresent(n -> {
                        row.createCell(7).setCellValue(n.getBetreuer().getVorname() + " " + n.getBetreuer().getNachname());
                        if (n.getNoteArbeit() != null) row.createCell(8).setCellValue(n.getNoteArbeit());
                        if (n.getNoteKolloquium() != null) row.createCell(9).setCellValue(n.getNoteKolloquium());
                    });
        }
        for(int i=0; i<columns.length; i++) sheet.autoSizeColumn(i);
    }

    private void createStudentsSheet(Workbook workbook, List<Studierende> students) {
        Sheet sheet = workbook.createSheet("Studierende");
        String[] columns = {"ID", "Vorname", "Nachname", "Matrikelnummer", "E-Mail"};

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(getHeaderStyle(workbook));
        }

        int rowIdx = 1;
        for (Studierende s : students) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(s.getId());
            row.createCell(1).setCellValue(s.getVorname());
            row.createCell(2).setCellValue(s.getNachname());
            row.createCell(3).setCellValue(s.getMatrikelnummer());
            row.createCell(4).setCellValue(s.getEmail());
        }
        for(int i=0; i<columns.length; i++) sheet.autoSizeColumn(i);
    }

    private void createBetreuerSheet(Workbook workbook, List<Betreuer> betreuer) {
        Sheet sheet = workbook.createSheet("Referenten");
        String[] columns = {"ID", "Titel", "Vorname", "Nachname", "E-Mail", "Fachbereich"};

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(getHeaderStyle(workbook));
        }

        int rowIdx = 1;
        for (Betreuer b : betreuer) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(b.getId());
            row.createCell(1).setCellValue(b.getTitel());
            row.createCell(2).setCellValue(b.getVorname());
            row.createCell(3).setCellValue(b.getNachname());
            row.createCell(4).setCellValue(b.getEmail());
            // FIX: Hier nutzen wir jetzt korrekt getFbname()
            if (b.getFachbereich() != null) row.createCell(5).setCellValue(b.getFachbereich().getFbname());
        }
        for(int i=0; i<columns.length; i++) sheet.autoSizeColumn(i);
    }

    private CellStyle getHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    public java.io.ByteArrayInputStream exportSws(java.util.List<de.profis.dto.SwsCalculationDto> data) {
        try (Workbook workbook = new XSSFWorkbook(); java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Deputat SWS");

            // Header
            Row header = sheet.createRow(0);
            String[] cols = {"Name", "Semester", "Anzahl Arbeiten", "Berechnet (SWS)", "Anrechenbar (SWS)", "Limit"};
            for(int i=0; i<cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            // Data
            int rowIdx = 1;
            for (de.profis.dto.SwsCalculationDto dto : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getBetreuerName());
                row.createCell(1).setCellValue(dto.getSemesterName());
                row.createCell(2).setCellValue(dto.getAnzahlArbeiten());
                row.createCell(3).setCellValue(dto.getSwsBerechnet());
                row.createCell(4).setCellValue(dto.getSwsAnrechenbar());
                row.createCell(5).setCellValue(dto.getLimit());
            }

            for(int i=0; i<cols.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return new java.io.ByteArrayInputStream(out.toByteArray());
        } catch (java.io.IOException e) {
            throw new RuntimeException("Export failed: " + e.getMessage());
        }
    }
}