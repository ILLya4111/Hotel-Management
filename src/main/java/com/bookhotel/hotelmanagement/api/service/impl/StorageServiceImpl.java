package com.bookhotel.hotelmanagement.api.service.impl;

import com.bookhotel.hotelmanagement.api.entity.Hotel;
import com.bookhotel.hotelmanagement.api.entity.Image;
import com.bookhotel.hotelmanagement.api.entity.Room;
import com.bookhotel.hotelmanagement.api.repository.StorageRepository;
import com.bookhotel.hotelmanagement.api.service.HotelService;
import com.bookhotel.hotelmanagement.api.service.RoomService;
import com.bookhotel.hotelmanagement.api.service.StorageService;
import com.bookhotel.hotelmanagement.api.util.ImageUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class StorageServiceImpl implements StorageService {

    private final StorageRepository storageRepository;
    private final HotelService hotelService;
    private final RoomService roomService;

    @Autowired
    public StorageServiceImpl(StorageRepository storageRepository,
                              HotelService hotelService,
                              RoomService roomService) {
        this.storageRepository = storageRepository;
        this.hotelService = hotelService;
        this.roomService = roomService;
    }

    @Override
    @Transactional
    public Image findImage(Long hotelId) {
        return hotelService.findById(hotelId).getImage();
    }

    @Override
    @Transactional
    public Image findImage(Long hotelId, Integer number) {
        return roomService.findByNumber(hotelId, number).getImage();
    }

    @Override
    @Transactional
    public Image uploadImage(Long hotelId, MultipartFile file) throws IOException {

        Hotel hotel = hotelService.findById(hotelId);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!hotel.getOwner().getUsername().equals(username)) return null; // Forbidden

        Image image = Image.builder()
                .name(file.getOriginalFilename())
                .type(file.getContentType())
                .imageData(ImageUtils.compressImage(file.getBytes()))
                .hotel(hotel).build();

        return storageRepository.save(image);
    }

    @Override
    @Transactional
    public Image uploadImage(Long hotelId, Integer number, MultipartFile file) throws IOException {

        Hotel hotel = hotelService.findById(hotelId);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!hotel.getOwner().getUsername().equals(username)) return null; // Forbidden

        Image image = Image.builder()
                .name(file.getOriginalFilename())
                .type(file.getContentType())
                .imageData(ImageUtils.compressImage(file.getBytes()))
                .room(roomService.findByNumber(hotelId, number)).build();

        return storageRepository.save(image);
    }

    @Override
    @Transactional
    public Image updateImage(Long hotelId, MultipartFile file) throws IOException {

        Hotel hotel = hotelService.findById(hotelId);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!hotel.getOwner().getUsername().equals(username)) return null; // Forbidden

        Image existingImage = hotel.getImage();

        existingImage.setName(file.getName());
        existingImage.setType(file.getContentType());
        existingImage.setImageData(ImageUtils.compressImage(file.getBytes()));

        return storageRepository.save(existingImage);
    }

    @Override
    @Transactional
    public Image updateImage(Long hotelId, Integer number, MultipartFile file) throws IOException {

        Hotel hotel = hotelService.findById(hotelId);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!hotel.getOwner().getUsername().equals(username)) return null; // Forbidden

        Room room = roomService.findByNumber(hotelId, number);

        Image existingImage = room.getImage();

        if (existingImage == null) {
            return uploadImage(hotelId, number, file);
        } else {
            existingImage.setName(file.getName());
            existingImage.setType(file.getContentType());
            existingImage.setImageData(ImageUtils.compressImage(file.getBytes()));
            return storageRepository.save(existingImage);
        }
    }

    @Override
    @Transactional
    public void deleteImage(Long hotelId) {

        Hotel hotel = hotelService.findById(hotelId);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!hotel.getOwner().getUsername().equals(username)) return; // Forbidden

        Image image = hotel.getImage();

        hotel.setImage(null);
        hotelService.update(hotel);
        storageRepository.delete(image);
    }

    @Override
    @Transactional
    public void deleteImage(Long hotelId, Integer number) {

        Hotel hotel = hotelService.findById(hotelId);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!hotel.getOwner().getUsername().equals(username)) return; // Forbidden

        Room room = roomService.findByNumber(hotelId, number);
        Image image = room.getImage();

        room.setImage(null);
        roomService.update(room);
        storageRepository.delete(image);
    }

    @Override
    @Transactional
    public byte[] downloadImage(Image image) {
        return ImageUtils.decompressImage(image.getImageData());
    }
}
