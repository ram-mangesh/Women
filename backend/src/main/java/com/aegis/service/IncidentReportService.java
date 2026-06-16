package com.aegis.service;

import com.aegis.dto.request.IncidentReportRequest;
import com.aegis.dto.response.IncidentReportResponse;
import com.aegis.entity.IncidentReport;
import com.aegis.entity.User;
import com.aegis.exception.NotFoundException;
import com.aegis.repository.IncidentReportRepository;
import com.aegis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncidentReportService {

    private final IncidentReportRepository repo;
    private final UserRepository users;

    @Transactional
    public IncidentReportResponse create(UUID reporterId, IncidentReportRequest r) {
        User reporter = users.findById(reporterId).orElseThrow(() -> new NotFoundException("User not found"));
        IncidentReport ir = IncidentReport.builder()
            .reporter(r.isAnonymous() ? null : reporter)
            .areaName(r.areaName())
            .latitude(r.latitude())
            .longitude(r.longitude())
            .type(r.type())
            .severity(r.severity())
            .description(r.description())
            .isAnonymous(r.isAnonymous())
            .build();
        return IncidentReportResponse.from(repo.save(ir));
    }

    public Page<IncidentReportResponse> list(Pageable p) {
        return repo.findAllByOrderByCreatedAtDesc(p).map(IncidentReportResponse::from);
    }

    public List<IncidentReportResponse> verified() {
        return repo.findByVerifiedTrueOrderByCreatedAtDesc()
            .stream().map(IncidentReportResponse::from).toList();
    }

    public List<IncidentReportResponse> boundingBox(double minLat, double maxLat, double minLng, double maxLng) {
        return repo.findInBoundingBox(minLat, maxLat, minLng, maxLng)
            .stream().map(IncidentReportResponse::from).toList();
    }

    @Transactional
    public void upvote(UUID id) {
        if (repo.incrementUpvotes(id) == 0) throw new NotFoundException("Report not found");
    }

    @Transactional
    public IncidentReportResponse verify(UUID id, UUID adminId) {
        IncidentReport ir = repo.findById(id).orElseThrow(() -> new NotFoundException("Report not found"));
        ir.setVerified(true);
        ir.setVerifiedBy(users.findById(adminId).orElse(null));
        return IncidentReportResponse.from(repo.save(ir));
    }
}
