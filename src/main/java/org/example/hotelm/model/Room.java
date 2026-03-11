package org.example.hotelm.model;

public class Room {
    public enum RoomStatus {
        AVAILABLE,
        BOOKED,
        MAINTENANCE
    }
    private String roomID;
    private String roomName;
    private RoomType roomType;
    private int maxCapacity;
    private RoomStatus status;
    private String description;
    private String imageUrl;
}
