package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Fachbereich {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fachbereich_id")
    private Long id;

    private String bezeichnung; // z.B. "Fachbereich 1"
    private String fbname;      // z.B. "Architektur..."
}