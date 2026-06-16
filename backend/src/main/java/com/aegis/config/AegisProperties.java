package com.aegis.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aegis")
public class AegisProperties {
    private TwilioProps twilio = new TwilioProps();
    private AiProps ai = new AiProps();
    private MapsProps maps = new MapsProps();
    private EscalationProps escalation = new EscalationProps();
    private String publicBaseUrl = "http://localhost:8080";

    public TwilioProps getTwilio() { return twilio; }
    public AiProps getAi() { return ai; }
    public MapsProps getMaps() { return maps; }
    public EscalationProps getEscalation() { return escalation; }
    public String getPublicBaseUrl() { return publicBaseUrl; }
    public void setPublicBaseUrl(String v) { this.publicBaseUrl = v; }

    public static class TwilioProps {
        private String accountSid;
        private String authToken;
        private String fromNumber;
        private String whatsappFrom;
        public String getAccountSid() { return accountSid; }
        public void setAccountSid(String v) { this.accountSid = v; }
        public String getAuthToken() { return authToken; }
        public void setAuthToken(String v) { this.authToken = v; }
        public String getFromNumber() { return fromNumber; }
        public void setFromNumber(String v) { this.fromNumber = v; }
        public String getWhatsappFrom() { return whatsappFrom; }
        public void setWhatsappFrom(String v) { this.whatsappFrom = v; }
    }

    public static class AiProps {
        private String baseUrl;
        private int timeoutMs = 5000;
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String v) { this.baseUrl = v; }
        public int getTimeoutMs() { return timeoutMs; }
        public void setTimeoutMs(int v) { this.timeoutMs = v; }
    }

    public static class MapsProps {
        private String apiKey;
        public String getApiKey() { return apiKey; }
        public void setApiKey(String v) { this.apiKey = v; }
    }

    public static class EscalationProps {
        private int guardianWaitSeconds = 30;
        private int autoCallAfterSeconds = 60;
        private int policeDispatchAfterSeconds = 90;
        public int getGuardianWaitSeconds() { return guardianWaitSeconds; }
        public void setGuardianWaitSeconds(int v) { this.guardianWaitSeconds = v; }
        public int getAutoCallAfterSeconds() { return autoCallAfterSeconds; }
        public void setAutoCallAfterSeconds(int v) { this.autoCallAfterSeconds = v; }
        public int getPoliceDispatchAfterSeconds() { return policeDispatchAfterSeconds; }
        public void setPoliceDispatchAfterSeconds(int v) { this.policeDispatchAfterSeconds = v; }
    }
}
