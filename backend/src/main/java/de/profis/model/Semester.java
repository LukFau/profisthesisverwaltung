package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Semester {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "semester_id")
    private Long id;

    private String bezeichnung; // z.B. "2021-1"
    private String typ;         // "WiSe" oder "SoSe"
    private Integer jahr;

    @ManyToOne
    @JoinColumn(name = "semesterzeit_id")
    private Semesterzeit semesterzeit;
}