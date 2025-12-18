Feature: Payment processing
  As a customer booking a game
  I want to pay for my booking
  So that my reservation is confirmed

  Scenario: Process payment with unknown method fails
    Given a user exists with username "john" and id 10
    And a booking will be created for user 10 and game 5 between "2025-12-01" and "2025-12-05" with booking id 100
    And payment outcome for method "cashapp" is "FAILED"
    When I submit a payment of 50.0 "EUR" using method "cashapp"
    Then the response status should be 400

  Scenario: Process payment with stripe succeeds
    Given a user exists with username "john" and id 10
    And a booking will be created for user 10 and game 5 between "2025-12-10" and "2025-12-12" with booking id 101
    And payment outcome for method "stripe" is "COMPLETED"
    When I submit a payment of 75.0 "EUR" using method "stripe"
    Then the response status should be 200
