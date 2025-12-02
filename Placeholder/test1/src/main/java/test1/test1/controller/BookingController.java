package test1.test1.controller;

import org.springframework.web.bind.annotation.*;
import test1.test1.model.Booking;
import test1.test1.service.BookingService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking createBooking(@RequestParam Integer userId,
                                 @RequestParam Integer gameId,
                                 @RequestParam String startDate,
                                 @RequestParam String endDate) {

        return bookingService.createBooking(
                userId,
                gameId,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate)
        );
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
}
