package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Notenbestandteil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "noten_id")
    private Long id;

    @Column(name = "note_arbeit")
    private Double noteArbeit;

    @Column(name = "note_kolloquium")
    private Double noteKolloquium;

    private String rolle; // "Erstprüfer", "Zweitprüfer"

    @ManyToOne
    @JoinColumn(name = "arbeit_id")
    private WissenschaftlicheArbeit arbeit;

    @ManyToOne
    @JoinColumn(name = "betreuer_id")
    private Betreuer betreuer;
}