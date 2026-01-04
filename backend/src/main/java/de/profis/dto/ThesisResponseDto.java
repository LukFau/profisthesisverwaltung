package de.profis.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ThesisResponseDto {
    private Long id;
    private String titel;
    private String typ;     // Bachelor/Master
    private String status;  // abgeschlossen/in Bearbeitung

    // Wir lösen die Objekte auf, um im Frontend direkt Namen anzeigen zu können
    private String studentName;
    private String matrikelnummer;
    private String studiengang;
    private String semester; // z.B. "2021-1"
    private String erstpruefer;

    // Zeitdaten (falls vorhanden)
    private LocalDate abgabedatum;

    // IDs für das Frontend-Formular (zum Pre-Filling der Dropdowns)
    private Long studierendenId;
    private Long studiengangId;
    private Long poId;
    private Long semesterId;

    // Noten
    private Double noteArbeit;
    private Double noteKolloquium;
    private Long erstprueferId; // ID für das Dropdown
}