package de.profis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class SwsCalculationDto {
    private Long betreuerId;        // NEU
    private String betreuerName;    // NEU
    private String semesterName;
    private int anzahlArbeiten;
    private double swsBerechnet;    // Die "echte" Summe (z.B. 2.4)
    private double swsAnrechenbar;  // Die gekappte Summe (max 2.0)
    private double limit;           // Das Limit selbst (2.0) zur Anzeige
    private List<SwsThesisDetailDto> details;
}