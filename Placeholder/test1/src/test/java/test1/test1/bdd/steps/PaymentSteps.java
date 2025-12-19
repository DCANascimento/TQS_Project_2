package test1.test1.bdd.steps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import test1.test1.bdd.World;
import test1.test1.controller.PaymentController;
import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.Payment;
import test1.test1.model.User;
import test1.test1.service.BookingService;
import test1.test1.service.PaymentService;
import test1.test1.service.UserService;

public class PaymentSteps {

    private final PaymentService paymentService = Mockito.mock(PaymentService.class);
    private final BookingService bookingService = Mockito.mock(BookingService.class);
    private final UserService userService = Mockito.mock(UserService.class);

    private final PaymentController controller = new PaymentController(paymentService, bookingService, userService);

    private Integer currentBookingId;
    private String expectedOutcome;
    // use shared world to store responses across step classes

    @Given("a user exists with username {string} and id {int}")
    public void a_user_exists_with_username_and_id(String username, Integer id) {
        User user = new User(username);
        user.setUserId(id);
        when(userService.findByUsername(username)).thenReturn(Optional.of(user));
    }

    @Given("a booking will be created for user {int} and game {int} between {string} and {string} with booking id {int}")
    public void a_booking_will_be_created(Integer userId, Integer gameId, String start, String end, Integer bookingId) {
        User user = new User("user-" + userId);
        user.setUserId(userId);
        Game game = new Game("Game-" + gameId, "Desc", 10.0);
        game.setGameId(gameId);
        Booking booking = new Booking(user, game, LocalDate.parse(start), LocalDate.parse(end), 30.0);
        booking.setBookingId(bookingId);
        when(bookingService.createBooking(eq(userId), eq(gameId), any(), any())).thenReturn(booking);
        this.currentBookingId = bookingId;
    }

    @Given("payment outcome for method {string} is {string}")
    public void payment_outcome_for_method_is(String method, String outcome) {
        this.expectedOutcome = outcome;
        when(paymentService.processPayment(eq(currentBookingId), eq(method), anyDouble(), anyString(), any(), any(), any())).thenAnswer(inv -> {
            Booking b = new Booking(null, null, LocalDate.now(), LocalDate.now(), 0.0);
            b.setBookingId(currentBookingId);
            Payment p = new Payment(b, method, inv.getArgument(2), inv.getArgument(3));
            if ("COMPLETED".equalsIgnoreCase(outcome)) {
                p.setStatus("COMPLETED");
            } else {
                p.setStatus("FAILED");
                p.setFailureReason("Unsupported method");
            }
            p.setPaymentId(123);
            p.setTransactionId("txn_test");
            return p;
        });
    }

    @When("I submit a payment of {double} {string} using method {string}")
    public void i_submit_a_payment(Double amount, String currency, String method) {
        Map<String, Object> bookingData = new HashMap<>();
        bookingData.put("userId", 10);
        bookingData.put("username", "john");
        bookingData.put("gameId", 5);
        bookingData.put("startDate", "2025-12-01");
        bookingData.put("endDate", "2025-12-05");

        Map<String, Object> body = new HashMap<>();
        body.put("method", method);
        body.put("amount", amount);
        body.put("currency", currency);
        body.put("bookingData", bookingData);

        if ("stripe".equals(method)) {
            Map<String, Object> card = new HashMap<>();
            card.put("number", "4242424242424242");
            body.put("card", card);
        }

        World.lastResponse = controller.processPayment(body);
    }

    @Then("the response status should be {int}")
    public void the_response_status_should_be(Integer status) {
        assertThat(World.lastResponse).isNotNull();
        assertThat(World.lastResponse.getStatusCode().value()).isEqualTo(status);
    }
}
