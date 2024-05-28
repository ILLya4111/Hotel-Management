package com.bookhotel.hotelmanagement.api.service.impl;

import com.bookhotel.hotelmanagement.api.dto.SignInDto;
import com.bookhotel.hotelmanagement.api.dto.SignUpDto;
import com.bookhotel.hotelmanagement.api.dto.UserDto;
import com.bookhotel.hotelmanagement.api.entity.Role;
import com.bookhotel.hotelmanagement.api.entity.User;
import com.bookhotel.hotelmanagement.api.repository.RoleRepository;
import com.bookhotel.hotelmanagement.api.repository.UserRepository;
import com.bookhotel.hotelmanagement.api.security.jwt.JwtUtils;
import com.bookhotel.hotelmanagement.api.service.AuthService;
import com.bookhotel.hotelmanagement.api.service.UserAlreadyExistException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtUtils jwtUtils;

    @Autowired
    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public String signIn(SignInDto signInDto) {

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                signInDto.getUsernameOrEmail(), signInDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return jwtUtils.generateJwtToken(authentication);
    }

    @Override
    public User signUp(SignUpDto signUpDto) {

        if (userRepository.existsByUsername(signUpDto.getUsername())) {
            throw new UserAlreadyExistException("username", signUpDto.getUsername());
        }


        if (userRepository.existsByEmail(signUpDto.getEmail())) {
            throw new UserAlreadyExistException("email", signUpDto.getEmail());
        }

        User user = User.builder()
                .username(signUpDto.getUsername())
                .email(signUpDto.getEmail())
                .password(passwordEncoder.encode(signUpDto.getPassword()))
                .firstName(signUpDto.getFirstName())
                .secondName(signUpDto.getSecondName()).build();

        Set<Role> roles = new HashSet<>();
        for (Role role : signUpDto.getRoles()) {
            switch (role.getName()) {
                case "ROLE_USER" -> roles.add(roleRepository.findByName("ROLE_USER").orElse(null));
                case "ROLE_HOTEL_ADMIN" -> roles.add(roleRepository.findByName("ROLE_HOTEL_ADMIN").orElse(null));
            }
        }

        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Override
    public void logout() {
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public User update(String username, UserDto userDto) {
        User existingUser = findByUsername(username);

        if (userRepository.existsByEmail(userDto.getEmail()) && !userDto.getEmail().equals(existingUser.getEmail())) {
            throw new UserAlreadyExistException("email", userDto.getEmail());
        }

        if (userDto.getEmail() != null) existingUser.setEmail(userDto.getEmail());
        if (userDto.getPassword() != null) existingUser.setPassword(userDto.getPassword());
        if (userDto.getFirstName() != null) existingUser.setFirstName(userDto.getFirstName());
        if (userDto.getSecondName() != null) existingUser.setSecondName(userDto.getSecondName());
        if (userDto.getPhoneNumber() != null) existingUser.setPhoneNumber(userDto.getPhoneNumber());

        return userRepository.save(existingUser);
    }
}
