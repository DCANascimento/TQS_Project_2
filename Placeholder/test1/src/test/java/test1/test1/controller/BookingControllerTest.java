package test1.test1.controller;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.Booking;
import test1.test1.service.BookingService;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    @Test
    void createBooking_delegatesToService() {
        Booking b = new Booking(null, null, null, null, 100.0);
        when(bookingService.createBooking(1, 2, 
                java.time.LocalDate.parse("2024-07-01"), 
                java.time.LocalDate.parse("2024-07-05"))).thenReturn(b);

        Booking result = bookingController.createBooking(1, 2, "2024-07-01", "2024-07-05");

        assertThat(result).isNotNull();
        assertThat(result.getTotalPrice()).isEqualTo(100.0);
        verify(bookingService).createBooking(1, 2, 
                java.time.LocalDate.parse("2024-07-01"), 
                java.time.LocalDate.parse("2024-07-05"));
    }

    @Test
    void getAllBookings_delegates() {
        bookingController.getAllBookings();
        verify(bookingService).getAllBookings();
    }
}
