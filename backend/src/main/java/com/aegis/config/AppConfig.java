package com.aegis.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, AegisProperties.class})
public class AppConfig {

    @Bean
    public RestTemplate restTemplate(AegisProperties props) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(props.getAi().getTimeoutMs());
        factory.setReadTimeout(props.getAi().getTimeoutMs());
        return new RestTemplate(factory);
    }
}
