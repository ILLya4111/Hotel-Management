package com.bookhotel.hotelmanagement.api.service;

import com.bookhotel.hotelmanagement.api.dto.SignInDto;
import com.bookhotel.hotelmanagement.api.dto.SignUpDto;
import com.bookhotel.hotelmanagement.api.dto.UserDto;
import com.bookhotel.hotelmanagement.api.entity.User;

public interface AuthService {

    String signIn(SignInDto signInDto);

    User signUp(SignUpDto signUpDto);

    void logout();

    User findByUsername(String username);

    User update(String username, UserDto userDto);
}
