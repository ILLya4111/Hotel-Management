package com.bookhotel.hotelmanagement.api.service;

import com.bookhotel.hotelmanagement.api.dto.HotelDto;
import com.bookhotel.hotelmanagement.api.entity.Hotel;

import java.util.List;

public interface HotelService {

    Hotel findById(Long id);

    List<Hotel> findAll();

    List<Hotel> findAllAdmin();

    Hotel create (HotelDto hotelDto);

    Hotel update(Hotel hotel);

    Hotel update(Long id, HotelDto hotelDto);

    void deleteById(Long id);
}
