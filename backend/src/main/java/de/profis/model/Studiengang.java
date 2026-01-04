package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Studiengang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "studiengang_id")
    private Long id;

    private String bezeichnung; // z.B. "B.Sc. Informatik"
    private String abschluss;   // z.B. "B.Sc."
    private Integer aktiv;      // 1 = aktiv, 0 = inaktiv

    public void setFachbereich(Fachbereich defaultFb) {
    }
}