package com.soc.controller;

import com.soc.dto.AuthRequest;
import com.soc.dto.AuthResponse;
import com.soc.dto.RegisterRequest;
import com.soc.model.User;
import com.soc.repository.UserRepository;
import com.soc.security.JwtUtils;
import com.soc.security.UserDetailsImpl;
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

import java.util.Map;

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
        
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
        }
        
        // Validate role - only VIEWER and ANALYST allowed for registration
        String requestedRole = registerRequest.getRole();
        if (requestedRole == null || requestedRole.isEmpty()) {
            requestedRole = "VIEWER";
        }
        
        if (!requestedRole.equals("VIEWER") && !requestedRole.equals("ANALYST")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Only VIEWER or ANALYST can be selected during registration."));
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(User.Role.valueOf(requestedRole));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setIsActive(true);
        
        userRepository.save(user);
        
        log.info("User {} registered successfully with role {}", user.getUsername(), user.getRole());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "User registered successfully!",
            "username", user.getUsername(),
            "role", user.getRole().name()
        ));
    }
}