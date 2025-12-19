package test1.test1.bdd.steps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

import java.util.Optional;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import jakarta.servlet.http.HttpSession;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import test1.test1.bdd.World;
import test1.test1.controller.GameController;
import test1.test1.dto.GameRequest;
import test1.test1.model.Game;
import test1.test1.service.GameService;
import test1.test1.service.UserService;

public class GameSteps {

    private final GameService gameService = Mockito.mock(GameService.class);
    private final UserService userService = Mockito.mock(UserService.class);
    private final HttpSession session = Mockito.mock(HttpSession.class);
    private final GameController controller = new GameController(gameService, userService);

    private Integer currentGameId;
    private String currentOwner;
    // use shared world to store responses across step classes

    @Given("a game with id {int} owned by {string}")
    public void a_game_with_id_owned_by(Integer id, String owner) {
        this.currentGameId = id;
        this.currentOwner = owner;
        Game existing = new Game("Old Title", "Old Desc", 10.0);
        existing.setGameId(id);
        existing.setOwnerUsername(owner);
        when(gameService.getGameById(id)).thenReturn(Optional.of(existing));
    }

    @Given("the session username is {string}")
    public void the_session_username_is(String username) {
        when(session.getAttribute("username")).thenReturn(username);
    }

    @When("I update the game with title {string} and price {double}")
    public void i_update_the_game_with_title_and_price(String title, Double price) {
        when(gameService.updateGame(
                eq(currentGameId), any(), any(), any(), anyDouble(), any(), any(), any(), anyBoolean(), any(), any()
        )).thenAnswer(inv -> {
            Game updated = new Game(title, "New Desc", price);
            updated.setGameId(currentGameId);
            updated.setOwnerUsername(currentOwner);
            return updated;
        });

        GameRequest req = new GameRequest();
        req.setTitle(title);
        req.setDescription("New Desc");
        req.setPrice(price);
        req.setCondition("good");
        req.setPhotos("photo.jpg");
        req.setTags("tag1");
        req.setActive(true);
        req.setStartDate("2025-12-01");
        req.setEndDate("2025-12-31");

        World.lastResponse = controller.updateGame(currentGameId, req, session);
    }

    @Given("no session user")
    public void no_session_user() {
        when(session.getAttribute("username")).thenReturn(null);
        when(session.getAttribute("userId")).thenReturn(null);
    }

    @When("I delete the game with id {int}")
    public void i_delete_the_game_with_id(Integer id) {
        World.lastResponse = controller.deleteGame(id, session);
    }

    // Response assertion implemented in PaymentSteps to avoid duplicate step definitions
}
