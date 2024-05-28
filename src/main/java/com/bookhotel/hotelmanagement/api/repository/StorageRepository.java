package com.bookhotel.hotelmanagement.api.repository;

import com.bookhotel.hotelmanagement.api.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StorageRepository extends JpaRepository<Image, Long> {

}
