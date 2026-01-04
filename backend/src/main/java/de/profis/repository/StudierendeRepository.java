package de.profis.repository;

import de.profis.model.Studierende;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudierendeRepository extends JpaRepository<Studierende, Long> {
    // Essenziell: Findet Studenten eindeutig über die Matrikelnummer
    Optional<Studierende> findByMatrikelnummer(String matrikelnummer);
}