package com.aegis.repository;

import com.aegis.entity.EvidenceBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EvidenceBlockRepository extends JpaRepository<EvidenceBlock, UUID> {
    List<EvidenceBlock> findAllByOrderByBlockIndexAsc();
    Optional<EvidenceBlock> findFirstByOrderByBlockIndexDesc();
}
