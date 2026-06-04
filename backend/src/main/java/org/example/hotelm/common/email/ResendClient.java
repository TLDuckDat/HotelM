package org.example.hotelm.common.email;

import lombok.extern.slf4j.Slf4j;
import org.example.hotelm.common.config.ResendProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Component
@Slf4j
public class ResendClient {

    private final RestClient restClient;
    private final ResendProperties properties;

    public ResendClient(ResendProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + properties.getApiKey())
                .defaultHeader("User-Agent", "HotelM/1.0")
                .build();
    }

    public void sendTextEmail(String toEmail, String subject, String text) {
        var request = new SendEmailRequest(
                properties.getFrom(),
                List.of(toEmail),
                subject,
                text
        );

        try {
            restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            log.error(
                    "Resend failed for {}: status={}, body={}",
                    toEmail,
                    ex.getStatusCode(),
                    ex.getResponseBodyAsString()
            );
            throw ex;
        }
    }

    private record SendEmailRequest(
            String from,
            List<String> to,
            String subject,
            String text
    ) {
    }
}
