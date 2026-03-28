package com.soc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CybersecuritySocApplication {
    public static void main(String[] args) {
        SpringApplication.run(CybersecuritySocApplication.class, args);
    }
}
