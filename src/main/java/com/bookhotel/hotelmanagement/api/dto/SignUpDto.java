package com.bookhotel.hotelmanagement.api.dto;

import com.bookhotel.hotelmanagement.api.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SignUpDto {

    private String username;
    private String email;
    private String password;
    private String firstName;
    private String secondName;

    private Set<Role> roles;
}