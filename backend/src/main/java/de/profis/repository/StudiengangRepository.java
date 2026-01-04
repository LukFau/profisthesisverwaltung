package de.profis.repository;

import de.profis.model.Studiengang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudiengangRepository extends JpaRepository<Studiengang, Long> {
}