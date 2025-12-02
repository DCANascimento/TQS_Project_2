package test1.test1.controller;

import org.springframework.web.bind.annotation.*;
import test1.test1.model.Game;
import test1.test1.service.GameService;

import java.util.List;

@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping
    public Game addGame(@RequestParam String title,
                        @RequestParam String description,
                        @RequestParam double pricePerDay) {

        return gameService.addGame(title, description, pricePerDay);
    }

    @GetMapping
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }
}
