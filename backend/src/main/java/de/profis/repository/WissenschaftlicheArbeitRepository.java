package de.profis.repository;

import de.profis.model.WissenschaftlicheArbeit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WissenschaftlicheArbeitRepository extends JpaRepository<WissenschaftlicheArbeit, Long> {
    // Hier können später Methoden hin wie "findAllBySemester" für die SWS-Berechnung
}