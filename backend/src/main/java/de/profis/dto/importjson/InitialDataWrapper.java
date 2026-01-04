package de.profis.dto.importjson;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class InitialDataWrapper {
    // Diese Namen müssen EXAKT den Arrays im JSON entsprechen
    private List<FachbereichDto> fachbereich;
    private List<StudiengangDto> studiengang;
    private List<PruefungsordnungDto> pruefungsordnung;
    private List<SemesterzeitDto> semesterzeit;
    private List<SemesterDto> semester;
    private List<BetreuerDto> betreuer;
    private List<StudierendeDto> studierende;
    @JsonProperty("wissenschaftliche_arbeit")
    private List<ArbeitDto> wissenschaftlicheArbeit;
    private List<ZeitdatenDto> zeitdaten;
    private List<NotenbestandteilDto> notenbestandteil;

    // --- Innere Klassen für die Objekte ---

    @Data
    public static class FachbereichDto {
        @JsonProperty("fachbereich_id") private Long id;
        private String bezeichnung;
        private String fbname;
    }

    @Data
    public static class StudiengangDto {
        @JsonProperty("studiengang_id") private Long id;
        @JsonProperty("fachbereich_id") private Long fachbereichId; // JSON hat hier oft keine FB-ID, Vorsicht!
        // Laut deiner JSON-Datei hat 'studiengang' KEINE fachbereich_id.
        // Wir müssen das im Service manuell zuweisen oder null lassen.
        private String bezeichnung;
        private String abschluss;
        private Integer aktiv;
    }

    @Data
    public static class PruefungsordnungDto {
        @JsonProperty("po_id") private Long id;
        @JsonProperty("studiengang_id") private Long studiengangId;
        private String bezeichnung;
        @JsonProperty("gueltig_ab") private LocalDate gueltigAb;
    }

    @Data
    public static class SemesterzeitDto {
        @JsonProperty("semesterzeit_id") private Long id;
        private LocalDate beginn;
        private LocalDate ende;
        private String bezeichnung;
    }

    @Data
    public static class SemesterDto {
        @JsonProperty("semester_id") private Long id;
        @JsonProperty("semesterzeit_id") private Long semesterzeitId;
        private String bezeichnung;
        private String typ;
        private Integer jahr;
    }

    @Data
    public static class BetreuerDto {
        @JsonProperty("betreuer_id") private Long id;
        private String vorname;
        private String nachname;
        private String titel;
        private String rolle;
    }

    @Data
    public static class StudierendeDto {
        @JsonProperty("studierenden_id") private Long id;
        private String matrikelnummer;
        private String vorname;
        private String nachname;
        private String email;
    }

    @Data
    public static class ArbeitDto {
        @JsonProperty("arbeit_id") private Long id;
        @JsonProperty("studierenden_id") private Long studierendenId;
        @JsonProperty("studiengang_id") private Long studiengangId;
        @JsonProperty("pruefungsordnung_id") private Long poId;
        @JsonProperty("semester_id") private Long semesterId;
        private String titel;
        private String typ;
        private String status;
    }

    @Data
    public static class ZeitdatenDto {
        @JsonProperty("zeit_id") private Long id;
        @JsonProperty("arbeit_id") private Long arbeitId;
        private LocalDate anfangsdatum;
        private LocalDate abgabedatum;
        private LocalDate kolloquiumsdatum;
    }

    @Data
    public static class NotenbestandteilDto {
        @JsonProperty("noten_id") private Long id;
        @JsonProperty("arbeit_id") private Long arbeitId;
        @JsonProperty("betreuer_id") private Long betreuerId;
        @JsonProperty("note_arbeit") private Double noteArbeit;
        @JsonProperty("note_kolloquium") private Double noteKolloquium;
        private String rolle;
    }
}