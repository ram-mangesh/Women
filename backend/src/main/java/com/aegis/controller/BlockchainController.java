package com.aegis.controller;

import com.aegis.dto.request.EvidenceRequest;
import com.aegis.dto.response.EvidenceBlockResponse;
import com.aegis.entity.EvidenceBlock;
import com.aegis.repository.UserRepository;
import com.aegis.service.BlockchainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/blockchain")
@RequiredArgsConstructor
@Tag(name = "Blockchain", description = "Cryptographic evidence integrity chain")
public class BlockchainController {

    private final BlockchainService blockchainService;
    private final UserRepository userRepository;

    private EvidenceBlockResponse mapToResponse(EvidenceBlock block) {
        return new EvidenceBlockResponse(
            block.getId(),
            block.getBlockIndex(),
            block.getTimestamp(),
            block.getType(),
            block.getDescription(),
            block.getPrevHash(),
            block.getHash(),
            block.getTampered(),
            block.getUser().getId()
        );
    }

    @GetMapping
    @Operation(summary = "Get the complete cryptographic evidence chain")
    public ResponseEntity<List<EvidenceBlockResponse>> getChain() {
        List<EvidenceBlockResponse> chain = blockchainService.getChain()
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(chain);
    }

    @PostMapping("/add")
    @Operation(summary = "Add a new verified evidence block to the chain")
    public ResponseEntity<EvidenceBlockResponse> addEvidence(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody EvidenceRequest request
    ) {
        UUID userId = userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
        EvidenceBlock block = blockchainService.addEvidence(request.type(), request.description(), userId);
        return ResponseEntity.ok(mapToResponse(block));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify the chain cryptographic integrity")
    public ResponseEntity<Boolean> verifyChain() {
        return ResponseEntity.ok(blockchainService.verifyChain());
    }

    @PostMapping("/{id}/tamper")
    @Operation(summary = "Simulate data tampering on a specific block (demo purposes)")
    public ResponseEntity<EvidenceBlockResponse> tamperBlock(@PathVariable UUID id) {
        EvidenceBlock block = blockchainService.tamperBlock(id);
        return ResponseEntity.ok(mapToResponse(block));
    }
}
