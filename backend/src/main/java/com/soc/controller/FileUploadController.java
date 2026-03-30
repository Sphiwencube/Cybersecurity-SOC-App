package com.soc.controller;

import com.soc.model.User;
import com.soc.repository.UserRepository;
import com.soc.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
@Slf4j
public class FileUploadController {

    @Autowired
    private UserRepository userRepository;

    @Value("${upload.path:uploads/avatars}")
    private String uploadPath;

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please select a file"));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed"));
            }

            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "File size must be less than 5MB"));
            }

            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadDir.resolve(filename);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Get current user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Delete old avatar if exists (optional)
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                try {
                    String oldFilename = user.getAvatarUrl().substring(user.getAvatarUrl().lastIndexOf("/") + 1);
                    Path oldFile = uploadDir.resolve(oldFilename);
                    Files.deleteIfExists(oldFile);
                } catch (Exception e) {
                    log.warn("Could not delete old avatar: {}", e.getMessage());
                }
            }

            // Update user with new avatar URL
            String avatarUrl = "/api/upload/avatars/" + filename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            log.info("Avatar uploaded for user {}: {}", user.getUsername(), filename);

            return ResponseEntity.ok(Map.of(
                "message", "Avatar uploaded successfully",
                "avatarUrl", avatarUrl,
                "filename", filename
            ));

        } catch (IOException e) {
            log.error("Error uploading avatar: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/avatars/{filename}")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadPath).resolve(filename);
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] imageBytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            
            if (contentType == null) {
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(imageBytes);

        } catch (IOException e) {
            log.error("Error reading avatar: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}