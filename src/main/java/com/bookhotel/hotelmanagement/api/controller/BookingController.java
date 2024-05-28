package com.bookhotel.hotelmanagement.api.controller;

import com.bookhotel.hotelmanagement.api.dto.BookingDto;
import com.bookhotel.hotelmanagement.api.entity.Booking;
import com.bookhotel.hotelmanagement.api.service.impl.BookingServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingServiceImpl bookingService;

    @Autowired
    public BookingController(BookingServiceImpl bookingService) {
        this.bookingService = bookingService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.findAll());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.findById(id));
    }

    @GetMapping("/{hotelId}/{number}")
    public ResponseEntity<List<Booking>> getAllRoomBookings(@PathVariable Long hotelId, @PathVariable Integer number) {
        return ResponseEntity.ok(bookingService.findByRoom(hotelId, number));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{hotelId}/{number}")
    public ResponseEntity<Booking> bookNumber(@PathVariable Long hotelId, @PathVariable Integer number,
                                              @RequestBody BookingDto bookingDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.book(hotelId, number, bookingDto));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody BookingDto bookingDto) {
        return ResponseEntity.ok(bookingService.update(id, bookingDto));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
