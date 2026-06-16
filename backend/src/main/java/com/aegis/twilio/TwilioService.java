package com.aegis.twilio;

import com.aegis.config.AegisProperties;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Twilio integration: SMS, WhatsApp, and Voice.
 * When account SID is "ACdemo" it runs in sandbox mode (logs only).
 *
 * All numbers are normalized to E.164 format (+91XXXXXXXXXX for India)
 * before being passed to Twilio.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TwilioService {

    private final AegisProperties props;
    private boolean sandbox = false;

    @PostConstruct
    void init() {
        var t = props.getTwilio();
        if (t.getAccountSid() == null || t.getAccountSid().equals("ACdemo")) {
            sandbox = true;
            log.warn("⚠ Twilio running in SANDBOX mode — messages will be logged, not sent");
            return;
        }
        Twilio.init(t.getAccountSid(), t.getAuthToken());
        log.info("Twilio initialized (from={})", t.getFromNumber());
    }

    public void sendSms(String to, String body) {
        String e164 = toE164(to);
        if (sandbox) {
            log.info("[SANDBOX SMS] to={} body={}", e164, body);
            return;
        }
        log.info("Sending SMS to {}", e164);
        Message.creator(
            new PhoneNumber(e164),
            new PhoneNumber(props.getTwilio().getFromNumber()),
            body
        ).create();
    }

    public void sendWhatsApp(String to, String body) {
        String e164 = toE164(to);
        String toWa = e164.startsWith("whatsapp:") ? e164 : "whatsapp:" + e164;
        if (sandbox) {
            log.info("[SANDBOX WA] to={} body={}", toWa, body);
            return;
        }
        log.info("Sending WhatsApp to {}", toWa);
        Message.creator(
            new PhoneNumber(toWa),
            new PhoneNumber(props.getTwilio().getWhatsappFrom()),
            body
        ).create();
    }

    public void placeVoiceCall(String to, String twimlUrl) {
        String e164 = toE164(to);
        if (sandbox) {
            log.info("[SANDBOX CALL] to={} twiml={}", e164, twimlUrl);
            return;
        }
        log.info("Placing voice call to {}", e164);
        Call.creator(
            props.getTwilio().getAccountSid(),
            new PhoneNumber(e164),
            new PhoneNumber(props.getTwilio().getFromNumber()),
            java.net.URI.create(twimlUrl)
        ).create();
    }

    public void placeVoiceCallWithTwiml(String to, String twimlMarkup) {
        String e164 = toE164(to);
        if (sandbox) {
            log.info("[SANDBOX CALL WITH TWIML] to={} twiml={}", e164, twimlMarkup);
            return;
        }
        log.info("Placing voice call (TwiML) to {}", e164);
        Call.creator(
            props.getTwilio().getAccountSid(),
            new PhoneNumber(e164),
            new PhoneNumber(props.getTwilio().getFromNumber()),
            new com.twilio.type.Twiml(twimlMarkup)
        ).create();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Phone number normalizer → E.164
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Converts any Indian phone number format to E.164 (+91XXXXXXXXXX).
     *
     * Handles all common formats:
     *   9172134875         → +919172134875
     *   91 9172134875      → +919172134875
     *   +91 91721 34875    → +919172134875
     *   09172134875        → +919172134875
     *   0091 9172134875    → +919172134875
     *   +919172134875      → +919172134875  (already correct)
     *   +12025551234       → +12025551234   (non-Indian, pass through)
     */
    static String toE164(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Phone number must not be blank");
        }

        // Strip spaces, dashes, parentheses
        String digits = raw.replaceAll("[\\s\\-().]+", "");

        // Already E.164 and NOT Indian — pass through untouched
        if (digits.startsWith("+") && !digits.startsWith("+91")) {
            return digits;
        }

        // Strip leading '+' for uniform processing
        if (digits.startsWith("+")) {
            digits = digits.substring(1);
        }

        // Strip international dialling prefix 0091, or 91 when total is 12 digits
        if (digits.startsWith("0091")) {
            digits = digits.substring(4);
        } else if (digits.startsWith("91") && digits.length() == 12) {
            digits = digits.substring(2);
        } else if (digits.startsWith("0") && digits.length() == 11) {
            // 0XXXXXXXXXX (STD with leading 0)
            digits = digits.substring(1);
        }

        // Expect 10-digit Indian mobile number
        if (digits.length() != 10) {
            log.warn("Unexpected phone format '{}' — sending as-is", raw);
            return "+" + digits;
        }

        return "+91" + digits;
    }
}
