package com.bookhotel.hotelmanagement.api.controller;

import com.bookhotel.hotelmanagement.api.entity.Hotel;
import com.bookhotel.hotelmanagement.api.service.impl.HotelServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/hotels")
public class HotelAdminController {

    private final HotelServiceImpl hotelService;

    @Autowired
    public HotelAdminController(HotelServiceImpl hotelService) {
        this.hotelService = hotelService;
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @GetMapping
    public ResponseEntity<List<Hotel>> getHotels() {
        return ResponseEntity.ok(hotelService.findAllAdmin());
    }
}
