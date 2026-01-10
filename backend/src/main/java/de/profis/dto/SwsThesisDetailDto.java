package de.profis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SwsThesisDetailDto {
    private String titel;
    private String studentName;
    private String art;   // Bachelor/Master
    private String rolle; // Erstprüfer/Zweitprüfer
}