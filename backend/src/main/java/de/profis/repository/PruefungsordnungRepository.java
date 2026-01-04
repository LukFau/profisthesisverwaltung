package de.profis.repository;

import de.profis.model.Pruefungsordnung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PruefungsordnungRepository extends JpaRepository<Pruefungsordnung, Long> {
}