package com.soc.controller;

import com.soc.model.User;
import com.soc.repository.UserRepository;
import com.soc.security.UserDetailsImpl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Get current user profile
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(new UserResponse(user));
    }
    
    // Update current user profile
    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<?> updateCurrentUser(@RequestBody UpdateUserRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update username if provided and not taken
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
            }
            user.setUsername(request.getUsername());
        }
        
        // Update email if provided and not taken
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
            }
            user.setEmail(request.getEmail());
        }
        
        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        // Update names
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        
        // Update avatar URL
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        userRepository.save(user);
        log.info("User {} updated their profile", user.getUsername());
        
        return ResponseEntity.ok(new UserResponse(user));
    }
    
    // Update avatar only
    @PutMapping("/me/avatar")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String avatarUrl = request.get("avatarUrl");
        if (avatarUrl == null || avatarUrl.isEmpty()) {
            // Set default avatar
            avatarUrl = "https://ui-avatars.com/api/?name=" + user.getUsername() + "&background=random";
        }
        
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("avatarUrl", user.getAvatarUrl()));
    }
    
    // ADMIN: Get all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
    
    // ADMIN: Get user by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserResponse(user));
    }
    
    // ADMIN: Create new user
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        log.info("Admin creating new user: {}", request.getUsername());
        
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf(request.getRole()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setIsActive(true);
        
        // Set default avatar
        user.setAvatarUrl("https://ui-avatars.com/api/?name=" + request.getUsername() + "&background=random");
        
        userRepository.save(user);
        
        return ResponseEntity.ok(new UserResponse(user));
    }
    
    // ADMIN: Update any user
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
            }
            user.setUsername(request.getUsername());
        }
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        if (request.getRole() != null) {
            user.setRole(User.Role.valueOf(request.getRole()));
        }
        
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        
        userRepository.save(user);
        log.info("Admin updated user: {}", user.getUsername());
        
        return ResponseEntity.ok(new UserResponse(user));
    }
    
    // ADMIN: Delete user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent admin from deleting themselves
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl currentUser = (UserDetailsImpl) auth.getPrincipal();
        
        if (user.getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete your own account!"));
        }
        
        userRepository.delete(user);
        log.info("Admin deleted user: {}", user.getUsername());
        
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
    
    // DTOs
    @Data
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String role;
        private String firstName;
        private String lastName;
        private String avatarUrl;
        private Boolean isActive;
        private String createdAt;
        
        public UserResponse(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.role = user.getRole().name();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.avatarUrl = user.getAvatarUrl() != null ? user.getAvatarUrl() : 
                "https://ui-avatars.com/api/?name=" + user.getUsername() + "&background=random";
            this.isActive = user.getIsActive();
            this.createdAt = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;
        }
    }
    
    @Data
    public static class UpdateUserRequest {
        private String username;
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String role;
        private Boolean isActive;
        private String avatarUrl;
    }
    
    @Data
    public static class CreateUserRequest {
        private String username;
        private String email;
        private String password;
        private String role;
        private String firstName;
        private String lastName;
    }
}