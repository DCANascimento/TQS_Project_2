Feature: Game management
  As a game owner
  I want to manage my games
  So that I can keep details up to date

  Scenario: Update game as owner
    Given a game with id 5 owned by "john"
    And the session username is "john"
    When I update the game with title "New Title" and price 25.0
    Then the response status should be 200

  Scenario: Delete game without a logged-in user
    Given no session user
    When I delete the game with id 7
    Then the response status should be 401
