package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Zeitdaten {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "zeit_id")
    private Long id;

    private LocalDate anfangsdatum;
    private LocalDate abgabedatum;
    private LocalDate kolloquiumsdatum;

    @OneToOne
    @JoinColumn(name = "arbeit_id")
    private WissenschaftlicheArbeit arbeit;
}