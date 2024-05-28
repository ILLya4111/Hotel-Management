package com.bookhotel.hotelmanagement.api.service;

public class BookingAlreadyExistException extends RuntimeException {

    public BookingAlreadyExistException() {
        super("Booking on such dates already exists");
    }
}
