package com.bookhotel.hotelmanagement.api.dto;

import com.bookhotel.hotelmanagement.api.entity.Hotel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RoomDto {

    private Integer number;

    private Integer size;

    private Integer pricePerDay;

    private Hotel hotel;
}
