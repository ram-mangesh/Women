package com.aegis.service;

import com.aegis.dto.request.GoogleFitSyncRequest;
import com.aegis.dto.request.VitalReadingRequest;
import com.aegis.entity.User;
import com.aegis.entity.VitalReading;
import com.aegis.exception.NotFoundException;
import com.aegis.notification.NotificationService;
import com.aegis.repository.UserRepository;
import com.aegis.repository.VitalReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VitalReadingService {

    private final VitalReadingRepository vitalRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public VitalReading recordVitals(UUID patientId, VitalReadingRequest request) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Patient not found with id: " + patientId));

        VitalReading vital = new VitalReading();
        vital.setPatient(patient);
        vital.setHeartRate(request.getHeartRate());
        vital.setSystolicBP(request.getSystolicBP());
        vital.setDiastolicBP(request.getDiastolicBP());
        vital.setOxygenSaturation(request.getOxygenSaturation());
        vital.setBodyTemperature(request.getBodyTemperature());
        vital.setRespiratoryRate(request.getRespiratoryRate());
        vital.setBloodGlucose(request.getBloodGlucose());
        vital.setSteps(request.getSteps());
        vital.setCaloriesBurned(request.getCaloriesBurned());
        vital.setSleepMinutes(request.getSleepMinutes());
        vital.setDistanceKm(request.getDistanceKm());
        vital.setSource(request.getSource());
        vital.setDeviceId(request.getDeviceId());
        vital.setDeviceModel(request.getDeviceModel());

        if (request.getRecordedAt() != null) {
            vital.setRecordedAt(request.getRecordedAt());
        }

        vital.setSyncedAt(LocalDateTime.now());

        // Analyze for abnormalities
        analyzeVitals(vital);

        vital = vitalRepository.save(vital);

        // Send alert if abnormal
        if (vital.getIsAbnormal() && vital.getAlertTriggered()) {
            notificationService.push(
                    patientId,
                    "⚠️ Health Alert: Abnormal Vitals Detected",
                    vital.getAbnormalityNotes(),
                    "HEALTH_ANOMALY");
        }

        return vital;
    }

    private void analyzeVitals(VitalReading vital) {
        StringBuilder abnormalityNotes = new StringBuilder();
        StringBuilder analysis = new StringBuilder();
        boolean isAbnormal = false;

        // Heart Rate Analysis (Normal: 60-100 bpm)
        if (vital.getHeartRate() != null) {
            if (vital.getHeartRate() < 60) {
                isAbnormal = true;
                abnormalityNotes.append("Low heart rate (Bradycardia). ");
                analysis.append("Heart rate below normal range. Consider consulting doctor if persistent. ");
            } else if (vital.getHeartRate() > 100) {
                isAbnormal = true;
                abnormalityNotes.append("High heart rate (Tachycardia). ");
                analysis.append("Elevated heart rate detected. Monitor and rest. ");
            }
        }

        // Blood Pressure Analysis
        if (vital.getSystolicBP() != null && vital.getDiastolicBP() != null) {
            if (vital.getSystolicBP() >= 140 || vital.getDiastolicBP() >= 90) {
                isAbnormal = true;
                abnormalityNotes.append("High blood pressure (Hypertension). ");
                analysis.append("Blood pressure elevated. Limit salt, manage stress. ");
            } else if (vital.getSystolicBP() < 90 || vital.getDiastolicBP() < 60) {
                isAbnormal = true;
                abnormalityNotes.append("Low blood pressure (Hypotension). ");
                analysis.append("Blood pressure low. Stay hydrated and avoid sudden position changes. ");
            }
        }

        // Oxygen Saturation (Normal: 95-100%)
        if (vital.getOxygenSaturation() != null) {
            if (vital.getOxygenSaturation() < 95) {
                isAbnormal = true;
                abnormalityNotes.append("Low oxygen saturation. ");
                analysis.append("Oxygen levels below normal. Seek medical attention if below 92%. ");

                if (vital.getOxygenSaturation() < 92) {
                    vital.setAlertTriggered(true);
                }
            }
        }

        // Temperature (Normal: 36.1-37.2°C)
        if (vital.getBodyTemperature() != null) {
            if (vital.getBodyTemperature() >= 38.0) {
                isAbnormal = true;
                abnormalityNotes.append("Fever detected. ");
                analysis.append("Body temperature elevated. Monitor and stay hydrated. ");

                if (vital.getBodyTemperature() >= 39.5) {
                    vital.setAlertTriggered(true);
                }
            } else if (vital.getBodyTemperature() < 36.0) {
                isAbnormal = true;
                abnormalityNotes.append("Low body temperature (Hypothermia). ");
                analysis.append("Body temperature low. Warm up gradually. ");
            }
        }

        // Blood Glucose (Normal: 70-100 mg/dL fasting)
        if (vital.getBloodGlucose() != null) {
            if (vital.getBloodGlucose() < 70) {
                isAbnormal = true;
                abnormalityNotes.append("Low blood sugar (Hypoglycemia). ");
                analysis.append("Blood glucose low. Consume fast-acting carbs. ");
                vital.setAlertTriggered(true);
            } else if (vital.getBloodGlucose() > 125) {
                isAbnormal = true;
                abnormalityNotes.append("High blood sugar (Hyperglycemia). ");
                analysis.append("Blood glucose elevated. Monitor diet and activity. ");
            }
        }

        // Respiratory Rate (Normal: 12-20 breaths/min)
        if (vital.getRespiratoryRate() != null) {
            if (vital.getRespiratoryRate() < 12 || vital.getRespiratoryRate() > 20) {
                isAbnormal = true;
                abnormalityNotes.append("Abnormal respiratory rate. ");
                analysis.append("Breathing rate outside normal range. ");
            }
        }

        vital.setIsAbnormal(isAbnormal);
        if (isAbnormal) {
            vital.setAbnormalityNotes(abnormalityNotes.toString().trim());
            vital.setAiAnalysis(analysis.toString().trim());
        } else {
            vital.setAiAnalysis("All vital signs within normal range. Continue monitoring.");
        }
    }

    @Transactional
    public List<VitalReading> syncGoogleFitData(UUID patientId, GoogleFitSyncRequest request) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Patient not found with id: " + patientId));

        List<VitalReading> syncedReadings = new ArrayList<>();

        for (VitalReadingRequest reading : request.getReadings()) {
            // Override source and device info from the sync request
            reading.setSource(VitalReading.ReadingSource.GOOGLE_FIT);
            if (request.getDeviceId() != null)
                reading.setDeviceId(request.getDeviceId());
            if (request.getDeviceModel() != null)
                reading.setDeviceModel(request.getDeviceModel());

            VitalReading vital = recordVitals(patientId, reading);
            syncedReadings.add(vital);
        }

        return syncedReadings;
    }

    public List<VitalReading> getPatientVitals(UUID patientId) {
        return vitalRepository.findByPatientId(patientId);
    }

    public List<VitalReading> getAllAbnormalVitals() {
        return vitalRepository.getAllAbnormalVitals();
    }

    public List<VitalReading> getRecentVitals(UUID patientId, LocalDateTime since) {
        return vitalRepository.findRecentReadings(patientId, since);
    }

    public List<VitalReading> getVitalsInRange(UUID patientId, LocalDateTime start, LocalDateTime end) {
        return vitalRepository.findByPatientIdAndRecordedAtBetween(patientId, start, end);
    }

    public VitalReading getVitalById(Long id) {
        return vitalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("VitalReading not found with id: " + id));
    }
}
