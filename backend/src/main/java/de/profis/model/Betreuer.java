package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Betreuer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "betreuer_id")
    private Long id;

    private String vorname;
    private String nachname;
    private String titel;
    private String rolle;
}