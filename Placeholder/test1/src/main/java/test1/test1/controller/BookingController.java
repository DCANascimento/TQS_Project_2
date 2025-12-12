package test1.test1.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import test1.test1.model.Booking;
import test1.test1.model.User;
import test1.test1.service.BookingService;
import test1.test1.service.UserService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
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

    // Accept JSON payload { username, gameId, startDate, endDate }
    public static class BookingRequest {
        public String username;
        public Integer gameId;
        public String startDate;
        public String endDate;

        // getters/setters omitted for brevity (Jackson will use fields)
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBookingByUsername(@RequestBody BookingRequest req) {
        if (req == null || req.username == null || req.gameId == null || req.startDate == null || req.endDate == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request"));
        }

        Optional<User> maybeUser = userService.findByUsername(req.username);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = maybeUser.get();

        Booking booking = bookingService.createBooking(
                user.getUserId(),
                req.gameId,
                LocalDate.parse(req.startDate),
                LocalDate.parse(req.endDate)
        );

        if (booking == null) {
            return ResponseEntity.status(400).body(Map.of("error", "Unable to create booking"));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("bookingId", booking.getBookingId());
        resp.put("totalPrice", booking.getTotalPrice());

        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
}
