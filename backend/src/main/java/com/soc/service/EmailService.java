package com.soc.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@soc.com}")
    private String systemEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${app.email.fallback-to-console:true}")
    private boolean fallbackToConsole;

    public boolean sendVerificationEmail(String toEmail, String username, String verificationToken) {
        String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken;

        String subject = "Verify Your Email - SOC Guard Security Platform";
        String body = """
            Hello %s,
            
            Welcome to SOC Guard!
            
            Verify your email:
            %s
            
            This link expires in 24 hours.
            """.formatted(username, verificationLink);

        return sendEmail(toEmail, subject, body, "Verification");
    }

    public boolean sendOtpEmail(String toEmail, String username, String otpCode) {
        String subject = "Password Reset Code";
        String body = """
            Hello %s,
            
            Your OTP code is: %s
            
            It expires in 10 minutes.
            """.formatted(username, otpCode);

        return sendEmail(toEmail, subject, body, "OTP");
    }

    public boolean sendPasswordResetConfirmation(String toEmail, String username) {
        String subject = "Password Reset Successful";
        String body = """
            Hello %s,
            
            Your password has been reset successfully.
            """.formatted(username);

        return sendEmail(toEmail, subject, body, "Password Reset");
    }

    private boolean sendEmail(String toEmail, String subject, String body, String type) {
        try {
            // 👉 If mail is configured
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(systemEmail);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);

                mailSender.send(message);
                log.info("✅ {} email sent to {}", type, toEmail);
                return true;
            }

            // 👉 Fallback to console
            log.warn("⚠️ Mail not configured. Printing email to console.");
            return fallbackToConsole(toEmail, subject, body, type);

        } catch (Exception e) {
            log.error("❌ Failed to send {} email: {}", type, e.getMessage());
            return fallbackToConsole(toEmail, subject, body, type);
        }
    }

    private boolean fallbackToConsole(String toEmail, String subject, String body, String type) {
        if (!fallbackToConsole) return false;

        log.info("\n==== EMAIL [{}] ====", type);
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Body:\n{}", body);
        log.info("====================\n");

        return true;
    }
}