package com.aegis.repository;

import com.aegis.entity.SafetyPod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SafetyPodRepository extends JpaRepository<SafetyPod, UUID> {
    Optional<SafetyPod> findByCode(String code);

    @Query("SELECT p FROM SafetyPod p WHERE p.creatorName = :user OR p.memberNames LIKE %:user% ORDER BY p.createdAt DESC")
    List<SafetyPod> findUserPods(@Param("user") String userName);
}
