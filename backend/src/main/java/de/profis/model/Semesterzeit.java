package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Semesterzeit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "semesterzeit_id")
    private Long id;

    private LocalDate beginn;
    private LocalDate ende;
    private String bezeichnung; // z.B. "2021-0"
}