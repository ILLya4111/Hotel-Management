package com.bookhotel.hotelmanagement.api.service;

import com.bookhotel.hotelmanagement.api.dto.BookingDto;
import com.bookhotel.hotelmanagement.api.entity.Booking;
import com.bookhotel.hotelmanagement.api.entity.Room;

import java.util.List;

public interface BookingService {

    List<Booking> findAll();

    Booking findById(Long id);

    List<Booking> findByRoom(Long hotelId, Integer number);

    List<Booking> findByRoom(Room room);

    Booking book(Long hotelId, Integer number, BookingDto bookingDto);

    Booking update(Long id, BookingDto bookingDto);

    void deleteById(Long id);
}
