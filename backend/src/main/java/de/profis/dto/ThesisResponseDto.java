package de.profis.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ThesisResponseDto {
    private Long id;
    private String titel;
    private String typ;
    private String status;

    private String studentName;
    private String matrikelnummer;
    private String studiengang;
    private String semester;
    private String erstpruefer;

    // --- NEU: Zweitprüfer Name für Anzeige ---
    private String zweitpruefer;

    // --- NEU: Alle Zeitdaten ---
    private LocalDate anfangsdatum;
    private LocalDate abgabedatum;
    private LocalDate kolloquiumsdatum;

    // IDs für das Frontend-Formular
    private Long studierendenId;
    private Long studiengangId;
    private Long poId;
    private Long semesterId;

    // Noten & Prüfer IDs
    private Double noteArbeit;
    private Double noteKolloquium;
    private Long erstprueferId;

    // --- NEU: Zweitprüfer ID ---
    private Long zweitprueferId;
}