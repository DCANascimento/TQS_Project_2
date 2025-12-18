package test1.tests.unittests;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.Payment;
import test1.test1.model.User;

public class PaymentTest {

    @Test
    void constructor_setsDefaults() {
        Booking booking = new Booking(new User("john"), new Game("Chess", "Desc", 10.0), LocalDate.now(), LocalDate.now().plusDays(1), 15.0);
        Payment payment = new Payment(booking, "stripe", 20.0, "USD");

        assertThat(payment.getPaymentId()).isNull();
        assertThat(payment.getBooking()).isEqualTo(booking);
        assertThat(payment.getPaymentMethod()).isEqualTo("stripe");
        assertThat(payment.getAmount()).isEqualTo(20.0);
        assertThat(payment.getCurrency()).isEqualTo("USD");
        assertThat(payment.getStatus()).isEqualTo("PENDING");
        assertThat(payment.getCreatedAt()).isNotNull();
        assertThat(payment.getCompletedAt()).isNull();
    }

    @Test
    void setters_updateFields() {
        Payment payment = new Payment(null, null, 0.0, "EUR");
        Booking booking = new Booking(new User("alice"), new Game("Go", "Desc", 12.0), LocalDate.now(), LocalDate.now().plusDays(3), 30.0);
        LocalDateTime now = LocalDateTime.now();

        payment.setPaymentId(5);
        payment.setBooking(booking);
        payment.setPaymentMethod("paypal");
        payment.setAmount(55.5);
        payment.setCurrency("GBP");
        payment.setStatus("COMPLETED");
        payment.setTransactionId("tx-123");
        payment.setCardLast4("4242");
        payment.setCardBrand("Visa");
        payment.setPaypalEmail("user@example.com");
        payment.setCreatedAt(now);
        payment.setCompletedAt(now.plusHours(1));
        payment.setFailureReason("reason");

        assertThat(payment.getPaymentId()).isEqualTo(5);
        assertThat(payment.getBooking()).isEqualTo(booking);
        assertThat(payment.getPaymentMethod()).isEqualTo("paypal");
        assertThat(payment.getAmount()).isEqualTo(55.5);
        assertThat(payment.getCurrency()).isEqualTo("GBP");
        assertThat(payment.getStatus()).isEqualTo("COMPLETED");
        assertThat(payment.getTransactionId()).isEqualTo("tx-123");
        assertThat(payment.getCardLast4()).isEqualTo("4242");
        assertThat(payment.getCardBrand()).isEqualTo("Visa");
        assertThat(payment.getPaypalEmail()).isEqualTo("user@example.com");
        assertThat(payment.getCreatedAt()).isEqualTo(now);
        assertThat(payment.getCompletedAt()).isEqualTo(now.plusHours(1));
        assertThat(payment.getFailureReason()).isEqualTo("reason");
    }
}
