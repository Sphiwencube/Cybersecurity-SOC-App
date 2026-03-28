package com.soc.service;

import com.soc.model.User;
import com.soc.repository.UserRepository;
import com.soc.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
    
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        if (userDetails.getUsername() != null && !userDetails.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(userDetails.getUsername())) {
                throw new RuntimeException("Username is already taken!");
            }
            user.setUsername(userDetails.getUsername());
        }
        
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email is already in use!");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        
        if (userDetails.getAvatarUrl() != null) {
            user.setAvatarUrl(userDetails.getAvatarUrl());
        }
        
        if (userDetails.getIsActive() != null) {
            user.setIsActive(userDetails.getIsActive());
        }
        
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        
        User updatedUser = userRepository.save(user);
        log.info("Updated user: {}", updatedUser.getUsername());
        return updatedUser;
    }
    
    @Transactional
    public User updatePassword(Long id, String newPassword) {
        User user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        User updatedUser = userRepository.save(user);
        log.info("Password updated for user: {}", updatedUser.getUsername());
        return updatedUser;
    }
    
    @Transactional
    public User updateAvatar(Long id, String avatarUrl) {
        User user = getUserById(id);
        user.setAvatarUrl(avatarUrl);
        User updatedUser = userRepository.save(user);
        log.info("Avatar updated for user: {}", updatedUser.getUsername());
        return updatedUser;
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        
        // Prevent deleting yourself
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl currentUser = (UserDetailsImpl) auth.getPrincipal();
            if (user.getId().equals(currentUser.getId())) {
                throw new RuntimeException("Cannot delete your own account!");
            }
        }
        
        userRepository.delete(user);
        log.info("Deleted user: {}", user.getUsername());
    }
    
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return getUserById(userDetails.getId());
        }
        throw new RuntimeException("No authenticated user found");
    }
}