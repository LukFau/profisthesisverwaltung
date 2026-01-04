package de.profis.repository;

import de.profis.model.Semesterzeit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SemesterzeitRepository extends JpaRepository<Semesterzeit, Long> {
    Optional<Semesterzeit> findByBezeichnung(String bezeichnung);
}