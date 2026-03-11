package com.clinic.repository;

import com.clinic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndIsActiveTrue(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.role.name = :roleName")
    List<User> findByRoleName(
            @org.springframework.data.repository.query.Param("roleName") com.clinic.entity.enums.RoleName roleName);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(u.createdAt AS date), COUNT(u) " +
            "FROM User u WHERE u.createdAt BETWEEN :from AND :to " +
            "GROUP BY CAST(u.createdAt AS date) ORDER BY CAST(u.createdAt AS date)")
    List<Object[]> getUserRegistrationTrend(@Param("from") java.time.LocalDateTime from,
            @Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query("SELECT u.role.name, COUNT(u) " +
            "FROM User u GROUP BY u.role.name")
    List<Object[]> getRoleDistribution();
}
