package com.soc.dto;

import com.soc.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserInfo user;
    
    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = new UserInfo(user);
    }
    
    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String role;
        private String firstName;
        private String lastName;
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.role = user.getRole().name();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
        }
    }
}
