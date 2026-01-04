package de.profis.dto;

import lombok.Data;

@Data
public class ThesisCreateDto {
    private String titel;
    private String typ;     // "Bachelorarbeit" etc.
    private String status;  // "in Bearbeitung"

    // Wir empfangen nur die IDs für die Verknüpfungen
    private Long studierendenId;
    private Long studiengangId;
    private Long poId;
    private Long semesterId; // Startsemester

    private Double noteArbeit;
    private Double noteKolloquium;
    // Optional: ID des Betreuers, der die Note gibt (Standardmäßig nehmen wir Erstprüfer an)
    private Long betreuerId;
}