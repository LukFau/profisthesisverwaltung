package de.profis.repository;

import de.profis.model.Betreuer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BetreuerRepository extends JpaRepository<Betreuer, Long> {
    // Optional: Suche nach Namen, falls nötig
    Optional<Betreuer> findByNachnameAndVorname(String nachname, String vorname);
}