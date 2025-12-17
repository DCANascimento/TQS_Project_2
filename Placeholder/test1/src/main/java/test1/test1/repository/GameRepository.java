package test1.test1.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import test1.test1.model.Game;

public interface GameRepository extends JpaRepository<Game, Integer> {
    List<Game> findByOwnerUsername(String ownerUsername);
}