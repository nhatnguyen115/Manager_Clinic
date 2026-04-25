package com.clinic.repository;

import com.clinic.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, UUID> {

    Optional<Specialty> findByName(String name);

    List<Specialty> findByIsActiveTrueOrderByDisplayOrderAsc();

    boolean existsByName(String name);
}
