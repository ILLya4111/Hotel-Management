package com.bookhotel.hotelmanagement.api.service;

import com.bookhotel.hotelmanagement.api.dto.RoomDto;
import com.bookhotel.hotelmanagement.api.entity.Room;

import java.util.List;

public interface RoomService {

    List<Room> findAll(Long hotelId);

    Room findByNumber(Long hotelId, Integer number);

    Room create(Long hotelId, RoomDto roomDto);

    Room update(Room room);

    Room update(Long hotelId, Integer number, RoomDto roomDto);

    void deleteByNumber(Long hotelId, Integer number);
}
