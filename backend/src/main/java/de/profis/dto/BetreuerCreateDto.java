package de.profis.dto;

import lombok.Data;

@Data
public class BetreuerCreateDto {
    private String vorname;
    private String nachname;
    private String titel;
    private String rolle; // z.B. "Prüfer"
}