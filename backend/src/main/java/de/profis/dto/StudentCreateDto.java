package de.profis.dto;

import lombok.Data;

@Data
public class StudentCreateDto {
    private String matrikelnummer;
    private String vorname;
    private String nachname;
    private String email;
}