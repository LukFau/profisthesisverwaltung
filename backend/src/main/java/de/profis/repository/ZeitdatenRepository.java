package de.profis.repository;

import de.profis.model.Zeitdaten;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZeitdatenRepository extends JpaRepository<Zeitdaten, Long> {
}