package de.profis.repository;

import de.profis.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    // Wichtig, um z.B. das Semester "2021-1" schnell zu finden
    Optional<Semester> findByBezeichnung(String bezeichnung);
}