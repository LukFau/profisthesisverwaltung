package de.profis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class WissenschaftlicheArbeit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "arbeit_id")
    private Long id;

    private String titel;
    private String typ;     // "Bachelorarbeit", "Masterarbeit"
    private String status;  // "abgeschlossen", "in Bearbeitung"

    @ManyToOne
    @JoinColumn(name = "studierenden_id")
    private Studierende studierende;

    @ManyToOne
    @JoinColumn(name = "studiengang_id")
    private Studiengang studiengang;

    @ManyToOne
    @JoinColumn(name = "pruefungsordnung_id")
    private Pruefungsordnung pruefungsordnung;

    @ManyToOne
    @JoinColumn(name = "semester_id")
    private Semester semester;

    // Beziehungen zu Details (werden automatisch mitgeladen/gelöscht durch CascadeType.ALL)

    @OneToMany(mappedBy = "arbeit", cascade = CascadeType.ALL)
    private List<Notenbestandteil> noten;

    @OneToOne(mappedBy = "arbeit", cascade = CascadeType.ALL)
    private Zeitdaten zeitdaten;
}