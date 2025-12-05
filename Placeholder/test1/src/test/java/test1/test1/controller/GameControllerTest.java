package test1.test1.controller;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.Game;
import test1.test1.service.GameService;

@ExtendWith(MockitoExtension.class)
class GameControllerTest {

    @Mock
    private GameService gameService;

    @InjectMocks
    private GameController gameController;

    @Test
    void createGame_delegatesToService() {
        Game g = new Game("Chess 2", "A strategic board game, again", 5.5);
        g.setGameId(1);
        when(gameService.addGame("Chess 2", "A strategic board game, again", 5.5)).thenReturn(g);

        Game result = gameController.addGame("Chess 2", "A strategic board game, again", 5.5);

        assertThat(result).isNotNull();
        assertThat(result.getGameId()).isEqualTo(1);
        verify(gameService).addGame("Chess 2", "A strategic board game, again", 5.5);
    }

    @Test
    void getAllGames_delegates() {
        gameController.getAllGames();
        verify(gameService).getAllGames();
    }
}
