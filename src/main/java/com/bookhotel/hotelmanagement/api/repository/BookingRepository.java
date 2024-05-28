package com.bookhotel.hotelmanagement.api.repository;

import com.bookhotel.hotelmanagement.api.entity.Booking;
import com.bookhotel.hotelmanagement.api.entity.Room;
import com.bookhotel.hotelmanagement.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findAllByUser(User user);

    List<Booking> findByRoom(Room room);
}
