package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Studierende {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "studierenden_id")
    private Long id;

    private String matrikelnummer;
    private String vorname;
    private String nachname;
    private String email;
}