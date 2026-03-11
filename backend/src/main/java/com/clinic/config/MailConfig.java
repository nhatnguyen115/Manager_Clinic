package com.clinic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class MailConfig {
    // Spring Boot will auto-configure JavaMailSender based on spring.mail
    // properties in application.yml
}
