package de.profis.repository;

import de.profis.model.Notenbestandteil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotenbestandteilRepository extends JpaRepository<Notenbestandteil, Long> {

    // Findet alle Betreuungen eines Profs in einem bestimmten Semester
    // Wir navigieren durch die Objekte: Arbeit -> Semester -> ID
    List<Notenbestandteil> findByBetreuerIdAndArbeit_Semester_Id(Long betreuerId, Long semesterId);
}