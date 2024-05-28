package com.bookhotel.hotelmanagement.api.controller;

import com.bookhotel.hotelmanagement.api.dto.HotelDto;
import com.bookhotel.hotelmanagement.api.dto.RoomDto;
import com.bookhotel.hotelmanagement.api.entity.Hotel;
import com.bookhotel.hotelmanagement.api.entity.Image;
import com.bookhotel.hotelmanagement.api.entity.Room;
import com.bookhotel.hotelmanagement.api.service.HotelService;
import com.bookhotel.hotelmanagement.api.service.RoomService;
import com.bookhotel.hotelmanagement.api.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;
    private final RoomService roomService;
    private final StorageService storageService;

    @Autowired
    public HotelController(HotelService hotelService, RoomService roomService, StorageService storageService) {
        this.hotelService = hotelService;
        this.roomService = roomService;
        this.storageService = storageService;
    }


    /*
    HOTEL
     */

    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        System.out.println();
        return ResponseEntity.ok(hotelService.findAll());
    }

    @GetMapping("/{hotelId}")
    public ResponseEntity<Hotel> getHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(hotelService.findById(hotelId));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@RequestBody HotelDto hotelDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.create(hotelDto));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @PatchMapping("/{hotelId}")
    public ResponseEntity<Hotel> updateHotel(@PathVariable Long hotelId, @RequestBody HotelDto hotelDto) {
        return ResponseEntity.ok(hotelService.update(hotelId, hotelDto));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @DeleteMapping("/{hotelId}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long hotelId) {
        hotelService.deleteById(hotelId);
        return ResponseEntity.noContent().build();
    }


    /*
    HOTEL IMAGES
     */

    @GetMapping("/{hotelId}/image")
    public ResponseEntity<?> getHotelImage(@PathVariable Long hotelId) {
        Image image = storageService.findImage(hotelId);
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.valueOf(image.getType()))
                .body(storageService.downloadImage(image));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @PostMapping("/{hotelId}/image")
    public ResponseEntity<?> uploadHotelImage(@PathVariable Long hotelId,
                                               @RequestParam MultipartFile file) throws IOException {
        Image image = storageService.uploadImage(hotelId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.valueOf(image.getType()))
                .body(storageService.downloadImage(image));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @PutMapping("/{hotelId}/image")
    public ResponseEntity<?> updateHotelImage(@PathVariable Long hotelId,
                                               @RequestParam MultipartFile file) throws IOException {
        Image image = storageService.updateImage(hotelId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.valueOf(image.getType()))
                .body(storageService.downloadImage(image));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @DeleteMapping("/{hotelId}/image")
    public ResponseEntity<Void> deleteHotelImage(@PathVariable Long hotelId) {
        storageService.deleteImage(hotelId);
        return ResponseEntity.noContent().build();
    }


    /*
    HOTEL ROOMS
     */

    @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<List<Room>> getAllHotelRooms(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.findAll(hotelId));
    }

    @GetMapping("/{hotelId}/rooms/{number}")
    public ResponseEntity<Room> getHotelRoom(@PathVariable Long hotelId, @PathVariable Integer number) {
        return ResponseEntity.ok(roomService.findByNumber(hotelId, number));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @PostMapping("/{hotelId}/rooms")
    public ResponseEntity<Room> createHotelRoom(@PathVariable Long hotelId, @RequestBody RoomDto roomDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(hotelId, roomDto));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @PatchMapping("/{hotelId}/rooms/{number}")
    public ResponseEntity<Room> updateHotelRoom(@PathVariable Long hotelId, @PathVariable Integer number,
                                                 @RequestBody RoomDto roomDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.update(hotelId, number, roomDto));
    }

    @PreAuthorize("hasRole('ROLE_HOTEL_ADMIN')")
    @DeleteMapping("/{hotelId}/rooms/{number}")
    public ResponseEntity<Void> deleteHotelRoom(@PathVariable Long hotelId, @PathVariable Integer number) {
        roomService.deleteByNumber(hotelId, number);
        return ResponseEntity.noContent().build();
    }


    /*
    ROOM IMAGES
     */

    @GetMapping("/{hotelId}/rooms/{number}/image")
    public ResponseEntity<?> getRoomImage(@PathVariable Long hotelId, @PathVariable Integer number) {
        Image image = storageService.findImage(hotelId, number);
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.valueOf(image.getType()))
                .body(storageService.downloadImage(image));
    }

    @PostMapping("/{hotelId}/rooms/{number}/image")
    public ResponseEntity<?> uploadRoomImage(@PathVariable Long hotelId, @PathVariable Integer number,
                                               @RequestParam MultipartFile file) throws IOException {
        Image image = storageService.uploadImage(hotelId, number, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.valueOf(image.getType()))
                .body(storageService.downloadImage(image));
    }

    @PutMapping("/{hotelId}/rooms/{number}/image")
    public ResponseEntity<?> updateRoomImage(@PathVariable Long hotelId, @PathVariable Integer number,
                                               @RequestParam MultipartFile file) throws IOException {
        Image image = storageService.updateImage(hotelId, number, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.valueOf(image.getType()))
                .body(storageService.downloadImage(image));
    }

    @DeleteMapping("/{hotelId}/rooms/{number}/image")
    public ResponseEntity<Void> deleteRoomImage(@PathVariable Long hotelId, @PathVariable Integer number) {
        storageService.deleteImage(hotelId, number);
        return ResponseEntity.noContent().build();
    }
}
