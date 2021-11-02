import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player, Ai } from "./player";
import { Interface, dragAndDrop } from "./gameUI";
import { pubsub } from "./pubsub";

(function GameController() {
  // Player board
  let playerBoard = Gameboard();
  const carrier = Ship(5);
  const battleship = Ship(4);
  const destroyer = Ship(3);
  const submarine = Ship(3);
  const patrolBoat = Ship(2);
  // Drag and Drop ships for placement based on length
  const positionShip = (positions) => {
    if (positions.length === 5) {
      playerBoard.placeShip(carrier, positions);
    } else if (positions.length === 4) {
      playerBoard.placeShip(battleship, positions);
    } else if (positions.length === 3) {
      if (Object.keys(destroyer.getPositions()).length === 0) {
        playerBoard.placeShip(destroyer, positions);
      } else playerBoard.placeShip(submarine, positions);
    } else if (positions.length === 2) {
      playerBoard.placeShip(patrolBoat, positions);
    }
  };
  pubsub.on("shipPositioned", positionShip);

  const randomizePlacement = () => {
    playerBoard = Gameboard();

    playerBoard.placeShip(carrier);
    playerBoard.placeShip(battleship);
    playerBoard.placeShip(destroyer);
    playerBoard.placeShip(submarine);
    playerBoard.placeShip(patrolBoat);
  };
  pubsub.on("randomized", randomizePlacement);

  const resetBoard = () => {
    playerBoard = Gameboard();
  };
  pubsub.on("boardReset", resetBoard);

  // Ai board
  const aiBoard = Gameboard("enemy");
  const aiCarrier = Ship(5, "enemy");
  const aiBattleship = Ship(4, "enemy");
  const aiDestroyer = Ship(3, "enemy");
  const aiSubmarine = Ship(3, "enemy");
  const aiPatrolBoat = Ship(2, "enemy");

  aiBoard.placeShip(aiCarrier);
  aiBoard.placeShip(aiBattleship);
  aiBoard.placeShip(aiDestroyer);
  aiBoard.placeShip(aiSubmarine);
  aiBoard.placeShip(aiPatrolBoat);

  // Players
  const humanPlayer = Player();
  const ai = Ai();

  // Game loop
  let isGameOver = false;
  let turn = 1;
  const playerTurn = (Math.floor(Math.random() * 2) + 1) % 2;

  const takeTurn = (coordinates = null) => {
    if (!isGameOver) {
      if (turn % 2 === playerTurn) {
        if (coordinates) {
          setTimeout(() => {
            const outcome = humanPlayer.attack(aiBoard, coordinates);
            pubsub.emit("attacked", { attacker: "player", outcome });
            turn++;
            takeTurn();
          });
        }
      } else {
        setTimeout(() => {
          const outcome = ai.randomAttack(playerBoard);
          pubsub.emit("attacked", { attacker: "enemy", outcome });
          turn++;
          takeTurn();
        });
      }
    }
  };
  pubsub.on("attackLaunched", takeTurn);

  pubsub.on("gameStarted", takeTurn);

  const handleShipSunk = (data) => {
    if (data.type !== "player") {
      setTimeout(() => {
        pubsub.emit("shipSunkMessage", { message: "An enemy ship was sunk!" });
      });
      checkWinner();
    } else if (data.type === "player") {
      setTimeout(() => {
        pubsub.emit("shipSunkMessage", { message: "An ally ship was sunk!" });
      });
      checkWinner();
    }
  };
  pubsub.on("shipSunk", handleShipSunk);

  const checkWinner = () => {
    if (playerBoard.allShipsSunk()) {
      isGameOver = true;
      setTimeout(() => {
        pubsub.emit("gameEnded", { message: "Computer wins!" });
      });
    } else if (aiBoard.allShipsSunk()) {
      isGameOver = true;
      setTimeout(() => {
        pubsub.emit("gameEnded", { message: "Player wins!" });
      });
    }
  };
})();
