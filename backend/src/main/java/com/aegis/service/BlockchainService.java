package com.aegis.service;

import com.aegis.entity.EvidenceBlock;
import com.aegis.entity.User;
import com.aegis.repository.EvidenceBlockRepository;
import com.aegis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlockchainService {
    private final EvidenceBlockRepository evidenceBlockRepository;
    private final UserRepository userRepository;

    public List<EvidenceBlock> getChain() {
        return evidenceBlockRepository.findAllByOrderByBlockIndexAsc();
    }

    public EvidenceBlock addEvidence(String type, String description, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Optional<EvidenceBlock> latestBlockOpt = evidenceBlockRepository.findFirstByOrderByBlockIndexDesc();
        
        long newIndex = 1L;
        String prevHash = "0000000000000000000000000000000000000000000000000000000000000000"; // 64 zeros as in frontend
        if (latestBlockOpt.isPresent()) {
            EvidenceBlock latest = latestBlockOpt.get();
            newIndex = latest.getBlockIndex() + 1;
            prevHash = latest.getHash();
        }

        Instant timestamp = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
        // Compute SHA-256
        String dataToHash = type + "|" + description + "|" + timestamp.toString() + "|" + prevHash;
        String hash = computeSha256(dataToHash);

        EvidenceBlock newBlock = EvidenceBlock.builder()
                .blockIndex(newIndex)
                .timestamp(timestamp)
                .type(type)
                .description(description)
                .prevHash(prevHash)
                .hash(hash)
                .tampered(false)
                .user(user)
                .build();

        return evidenceBlockRepository.save(newBlock);
    }

    public boolean verifyChain() {
        List<EvidenceBlock> chain = evidenceBlockRepository.findAllByOrderByBlockIndexAsc();
        if (chain.isEmpty()) {
            return true;
        }

        for (int i = 0; i < chain.size(); i++) {
            EvidenceBlock current = chain.get(i);
            
            if (Boolean.TRUE.equals(current.getTampered())) {
                return false;
            }

            Instant ts = current.getTimestamp().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
            String dataToHash = current.getType() + "|" + current.getDescription() + "|" + ts.toString() + "|" + current.getPrevHash();
            String calculatedHash = computeSha256(dataToHash);
            if (!calculatedHash.equals(current.getHash())) {
                return false;
            }

            if (i > 0) {
                EvidenceBlock previous = chain.get(i - 1);
                if (!current.getPrevHash().equals(previous.getHash())) {
                    return false;
                }
            }
        }
        return true;
    }


    public EvidenceBlock tamperBlock(UUID blockId) {
        EvidenceBlock block = evidenceBlockRepository.findById(blockId)
                .orElseThrow(() -> new IllegalArgumentException("Block not found: " + blockId));
        block.setDescription(block.getDescription() + " [TAMPERED]");
        block.setTampered(true);
        return evidenceBlockRepository.save(block);
    }

    private String computeSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
