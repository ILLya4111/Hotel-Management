package com.bookhotel.hotelmanagement.api.controller;

import com.bookhotel.hotelmanagement.api.dto.JwtResponse;
import com.bookhotel.hotelmanagement.api.dto.SignInDto;
import com.bookhotel.hotelmanagement.api.dto.SignUpDto;
import com.bookhotel.hotelmanagement.api.dto.UserDto;
import com.bookhotel.hotelmanagement.api.entity.User;
import com.bookhotel.hotelmanagement.api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInDto signInDto) {
        String jwt = authService.signIn(signInDto);
        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @PostMapping("/signup")
    public ResponseEntity<User> getRegisterPage(@RequestBody SignUpDto signUpDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signUp(signUpDto));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/user")
    public ResponseEntity<User> getUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.OK).body(authService.findByUsername(username));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/user")
    public ResponseEntity<User> updateUser(@RequestBody UserDto userDto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.OK).body(authService.update(username, userDto));
    }

    // Deprecated. Remove JWT token instead
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout();
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
