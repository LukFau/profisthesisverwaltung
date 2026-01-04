package de.profis.service;

import de.profis.model.WissenschaftlicheArbeit;
import de.profis.repository.WissenschaftlicheArbeitRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    private final WissenschaftlicheArbeitRepository arbeitRepo;

    public ExcelExportService(WissenschaftlicheArbeitRepository arbeitRepo) {
        this.arbeitRepo = arbeitRepo;
    }

    public ByteArrayInputStream exportThesesToExcel() {
        // 1. Daten laden
        List<WissenschaftlicheArbeit> arbeiten = arbeitRepo.findAll();

        // 2. Excel Workbook erstellen
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Wissenschaftliche Arbeiten");

            // Header Zeile definieren
            String[] headers = {"ID", "Titel", "Typ", "Status", "Student", "Matrikelnr", "Semester"};
            Row headerRow = sheet.createRow(0);

            // Styling für Header (Fett gedruckt)
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerCellStyle.setFont(font);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // 3. Daten Zeilen füllen
            int rowIdx = 1;
            for (WissenschaftlicheArbeit arbeit : arbeiten) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(arbeit.getId());
                row.createCell(1).setCellValue(arbeit.getTitel());
                row.createCell(2).setCellValue(arbeit.getTyp());
                row.createCell(3).setCellValue(arbeit.getStatus());

                // Null-Checks für Relationen
                if (arbeit.getStudierende() != null) {
                    row.createCell(4).setCellValue(arbeit.getStudierende().getNachname() + ", " + arbeit.getStudierende().getVorname());
                    row.createCell(5).setCellValue(arbeit.getStudierende().getMatrikelnummer());
                }

                if (arbeit.getSemester() != null) {
                    row.createCell(6).setCellValue(arbeit.getSemester().getBezeichnung());
                }
            }

            // Spaltenbreite automatisch anpassen
            for(int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Erzeugen der Excel-Datei: " + e.getMessage());
        }
    }
}