package test1.test1.service;

import org.springframework.stereotype.Service;
import test1.test1.model.Game;
import test1.test1.repository.GameRepository;

import java.util.List;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public Game addGame(String title, String description, double pricePerDay) {
        Game g = new Game(title, description, pricePerDay);
        return gameRepository.save(g);
    }

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public Game getGame(Integer id) {
        return gameRepository.findById(id).orElse(null);
    }

    public void save(Game game) {
        gameRepository.save(game);
    }
}
