package com.soc.controller;

import com.soc.dto.AuthRequest;
import com.soc.dto.AuthResponse;
import com.soc.dto.RegisterRequest;
import com.soc.model.OtpToken;
import com.soc.model.User;
import com.soc.model.VerificationToken;
import com.soc.repository.OtpTokenRepository;
import com.soc.repository.UserRepository;
import com.soc.repository.VerificationTokenRepository;
import com.soc.security.JwtUtils;
import com.soc.security.UserDetailsImpl;
import com.soc.service.EmailService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private VerificationTokenRepository verificationTokenRepository;
    
    @Autowired
    private OtpTokenRepository otpTokenRepository;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        log.info("User {} logged in successfully", userDetails.getUsername());

        return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getUser()));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out successfully");
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            boolean isValid = jwtUtils.validateJwtToken(jwt);
            return ResponseEntity.ok(Map.of("valid", isValid));
        }
        return ResponseEntity.ok(Map.of("valid", false));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Registration attempt for user: {}", registerRequest.getUsername());
        
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
        }
        
        String requestedRole = registerRequest.getRole();
        if (requestedRole == null || requestedRole.isEmpty()) {
            requestedRole = "VIEWER";
        }
        
        if (!requestedRole.equals("VIEWER") && !requestedRole.equals("ANALYST")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Only VIEWER or ANALYST can be selected during registration."));
        }
        
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(User.Role.valueOf(requestedRole));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setIsActive(true);
        
        User savedUser = userRepository.save(user);
        
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(savedUser);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        verificationTokenRepository.save(verificationToken);
        
        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getUsername(), token);
        
        log.info("User {} registered successfully. Verification email sent.", savedUser.getUsername());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Registration successful! Please check your email to verify your account.",
            "username", savedUser.getUsername(),
            "email", savedUser.getEmail()
        ));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        Optional<VerificationToken> tokenOptional = verificationTokenRepository.findByToken(token);
        
        if (tokenOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification token."));
        }
        
        VerificationToken verificationToken = tokenOptional.get();
        
        if (verificationToken.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification token has expired. Please register again."));
        }
        
        User user = verificationToken.getUser();
        user.setIsActive(true);
        userRepository.save(user);
        
        verificationTokenRepository.delete(verificationToken);
        
        log.info("Email verified for user: {}", user.getUsername());
        
        return ResponseEntity.ok(Map.of(
            "message", "Email verified successfully! You can now log in.",
            "verified", true
        ));
    }
    
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "If an account exists with this email, you will receive an OTP."));
        }
        
        User user = userOptional.get();
        
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        otpTokenRepository.deleteByEmail(email);
        
        OtpToken otpToken = new OtpToken();
        otpToken.setEmail(email);
        otpToken.setOtpCode(otpCode);
        otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(otpToken);
        
        emailService.sendOtpEmail(email, user.getUsername(), otpCode);
        
        log.info("OTP sent to {} for password reset", email);
        
        return ResponseEntity.ok(Map.of(
            "message", "OTP sent to your email. Please check your inbox.",
            "email", email
        ));
    }
    /*
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otp");
        
        Optional<OtpToken> otpOptional = otpTokenRepository.findByEmailAndOtpCode(email, otpCode);
        
        if (otpOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP."));
        }
        
        OtpToken otpToken = otpOptional.get();
        
        if (otpToken.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
        }
        
        if (otpToken.getUsed()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has already been used."));
        }
        
        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);
        
        return ResponseEntity.ok(Map.of(
            "message", "OTP verified successfully.",
            "verified", true,
            "email", email
        ));
    }*/
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters."));
        }
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found."));
        }
        
        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        otpTokenRepository.deleteByEmail(email);
        
        emailService.sendPasswordResetConfirmation(email, user.getUsername());
        
        log.info("Password reset successful for user: {}", user.getUsername());
        
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in with your new password."));
    }
}