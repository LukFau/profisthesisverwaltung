package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Pruefungsordnung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_id")
    private Long id;

    private String bezeichnung;

    @Column(name = "gueltig_ab")
    private LocalDate gueltigAb;

    @ManyToOne
    @JoinColumn(name = "studiengang_id")
    private Studiengang studiengang;
}