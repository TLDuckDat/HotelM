package org.example.hotelm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class    HotelMApplication {

    public static void main(String[] args) {
        SpringApplication.run(HotelMApplication.class, args);
    }

}
    