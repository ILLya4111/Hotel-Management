package com.bookhotel.hotelmanagement.api.service.impl;

import com.bookhotel.hotelmanagement.api.dto.HotelDto;
import com.bookhotel.hotelmanagement.api.dto.RoomDto;
import com.bookhotel.hotelmanagement.api.entity.Hotel;
import com.bookhotel.hotelmanagement.api.entity.Room;
import com.bookhotel.hotelmanagement.api.entity.User;
import com.bookhotel.hotelmanagement.api.repository.HotelRepository;
import com.bookhotel.hotelmanagement.api.repository.UserRepository;
import com.bookhotel.hotelmanagement.api.service.HotelService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    @Autowired
    public HotelServiceImpl(HotelRepository hotelRepository, UserRepository userRepository) {
        this.hotelRepository = hotelRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Hotel findById(Long id) {
        return hotelRepository.findById(id).orElse(null); // HotelNotFoundException
    }

    @Override
    public List<Hotel> findAll() {
        return hotelRepository.findAll();
    }

    @Override
    @Transactional
    public List<Hotel> findAllAdmin() {

        User owner = userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElse(null);

        return hotelRepository.findByOwner(owner);
    }

    @Override
    public Hotel create(HotelDto hotelDto) {

        User user = userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElse(null);

        Hotel hotel = Hotel.builder()
                .name(hotelDto.getName())
                .description(hotelDto.getDescription())
                .address(hotelDto.getAddress())
                .owner(user)
                .build();

        hotel.setRooms(roomsConverting(hotelDto.getRooms(), hotel));

        return hotelRepository.save(hotel);
    }

    @Override
    public Hotel update(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @Override
    public Hotel update(Long id, HotelDto hotelDto) {

        Hotel existingHotel = findById(id);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!existingHotel.getOwner().getUsername().equals(username)) return null; // Forbidden

        if (hotelDto.getName() != null) existingHotel.setName(hotelDto.getName());
        if (hotelDto.getDescription() != null) existingHotel.setDescription(hotelDto.getDescription());
        if (hotelDto.getAddress() != null) existingHotel.setAddress(hotelDto.getAddress());
        if (hotelDto.getRooms() != null) existingHotel.setRooms(roomsConverting(hotelDto.getRooms(), existingHotel));

        return hotelRepository.save(existingHotel);
    }

    @Override
    public void deleteById(Long id) {

        Hotel hotel = findById(id);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!hotel.getOwner().getUsername().equals(username)) return; // Forbidden

        hotelRepository.deleteById(id);
    }


    private List<Room> roomsConverting(List<RoomDto> roomsDto, Hotel hotel) {

        List<Room> rooms = new ArrayList<>();
        for (RoomDto roomDto : roomsDto) {
            Room room = Room.builder()
                    .number(roomDto.getNumber())
                    .size(roomDto.getSize())
                    .pricePerDay(roomDto.getPricePerDay())
                    .hotel(hotel)
                    .build();
            rooms.add(room);
        }
        return rooms;
    }
}
