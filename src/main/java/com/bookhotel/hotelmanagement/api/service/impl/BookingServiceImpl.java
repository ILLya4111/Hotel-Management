package com.bookhotel.hotelmanagement.api.service.impl;

import com.bookhotel.hotelmanagement.api.dto.BookingDto;
import com.bookhotel.hotelmanagement.api.entity.Booking;
import com.bookhotel.hotelmanagement.api.entity.Room;
import com.bookhotel.hotelmanagement.api.entity.User;
import com.bookhotel.hotelmanagement.api.repository.BookingRepository;
import com.bookhotel.hotelmanagement.api.service.BookingAlreadyExistException;
import com.bookhotel.hotelmanagement.api.service.BookingService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final AuthServiceImpl authService;
    private final RoomServiceImpl roomService;

    @Autowired
    public BookingServiceImpl(BookingRepository bookingRepository, AuthServiceImpl authService, RoomServiceImpl roomService) {
        this.bookingRepository = bookingRepository;
        this.authService = authService;
        this.roomService = roomService;
    }

    @Override
    @Transactional
    public List<Booking> findAll() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.findByUsername(username);
        return bookingRepository.findAllByUser(user);
    }

    @Override
    @Transactional
    public Booking findById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public List<Booking> findByRoom(Long hotelId, Integer number) {
        return bookingRepository.findByRoom(roomService.findByNumber(hotelId, number));
    }

    @Override
    @Transactional
    public List<Booking> findByRoom(Room room) {
        return bookingRepository.findByRoom(room);
    }

    @Override
    @Transactional
    public Booking book(Long hotelId, Integer number, BookingDto bookingDto) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.findByUsername(username);
        Room room = roomService.findByNumber(hotelId, number);

        validateCreateBooking(room, bookingDto);

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .settlementDate(bookingDto.getSettlementDate())
                .evictionDate(bookingDto.getEvictionDate())
                .build();

        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public Booking update(Long id, BookingDto bookingDto) {

        Booking booking = findById(id);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!booking.getUser().getUsername().equals(username)) return null; // Forbidden

        validateUpdateBooking(booking.getRoom(), bookingDto, username);

        if (bookingDto.getSettlementDate() != null) booking.setSettlementDate(bookingDto.getSettlementDate());
        if (bookingDto.getEvictionDate() != null) booking.setEvictionDate(bookingDto.getEvictionDate());

        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {

        Booking booking = findById(id);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!booking.getUser().getUsername().equals(username)) return; // Forbidden

        bookingRepository.deleteById(id);
    }

    private void validateCreateBooking(Room room, BookingDto bookingDto) {

        if (bookingDto.getSettlementDate().isAfter(bookingDto.getEvictionDate())) {
            throw new IllegalArgumentException("Check-in date cannot be later than the check-out date");
        }

        for (Booking existingBooking : findByRoom(room)) {
            if (bookingDto.getEvictionDate().isAfter(existingBooking.getSettlementDate()) &&
                    bookingDto.getSettlementDate().isBefore(existingBooking.getEvictionDate())) {

                System.out.println(bookingDto.getEvictionDate());
                System.out.println(existingBooking.getSettlementDate());
                System.out.println("hueta IN " + bookingDto.getEvictionDate().isAfter(existingBooking.getSettlementDate()));

                System.out.println(existingBooking.getEvictionDate());
                System.out.println(bookingDto.getSettlementDate());
                System.out.println("hueta OUT " + bookingDto.getSettlementDate().isBefore(existingBooking.getEvictionDate()));

                throw new BookingAlreadyExistException();
            }
        }
    }

    private void validateUpdateBooking(Room room, BookingDto bookingDto, String username) {

        if (bookingDto.getSettlementDate().isAfter(bookingDto.getEvictionDate())) {
            throw new IllegalArgumentException("Check-in date cannot be later than the check-out date");
        }

        for (Booking existingBooking : findByRoom(room)) {
            if (bookingDto.getEvictionDate().isAfter(existingBooking.getSettlementDate()) &&
                    bookingDto.getSettlementDate().isBefore(existingBooking.getEvictionDate()) &&
                    !existingBooking.getUser().getUsername().equals(username)) {
                throw new BookingAlreadyExistException();
            }
        }
    }
}
