package com.soc.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.soc.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;

    @JsonIgnore
    private String password;

    private String role;
    private Collection<? extends GrantedAuthority> authorities;

    // Store the original User entity
    @JsonIgnore
    private User user;

    /**
     * Build UserDetailsImpl from User entity
     */
    public static UserDetailsImpl build(User user) {
        GrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().name(),
                Collections.singletonList(authority),
                user
        );
    }

    /**
     * Access the original User entity safely
     */
    public User getUser() {
        return this.user;
    }

    // -------------------------
    // Spring Security overrides
    // -------------------------

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // You can wire this to user.isActive() if needed
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Add logic if you support locking
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user != null && user.getIsActive() != null
                ? user.getIsActive()
                : true;
    }
}