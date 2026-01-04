package de.profis.repository;

import de.profis.model.Fachbereich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FachbereichRepository extends JpaRepository<Fachbereich, Long> {
    // Hilft beim Import zu prüfen, ob der FB schon existiert
    Optional<Fachbereich> findByBezeichnung(String bezeichnung);
}