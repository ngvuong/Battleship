import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player, Ai } from "./player";
import { Interface } from "./gameUI";
import { pubsub } from "./pubsub";

(function GameController() {
  // Player board
  let playerBoard = Gameboard();
  const carrier = Ship(5);
  const battleship = Ship(4);
  const destroyer = Ship(3);
  const submarine = Ship(3);
  const patrolBoat = Ship(2);

  const randomizePlacement = () => {
    playerBoard = Gameboard();

    playerBoard.placeShip(carrier);
    playerBoard.placeShip(battleship);
    playerBoard.placeShip(destroyer);
    playerBoard.placeShip(submarine);
    playerBoard.placeShip(patrolBoat);
  };

  pubsub.on("randomized", randomizePlacement);

  // Ai board
  const aiBoard = Gameboard("enemy");
  const aiCarrier = Ship(5);
  const aiBattleship = Ship(4);
  const aiDestroyer = Ship(3);
  const aiSubmarine = Ship(3);
  const aiPatrolBoat = Ship(2);

  aiBoard.placeShip(aiCarrier);
  aiBoard.placeShip(aiBattleship);
  aiBoard.placeShip(aiDestroyer);
  aiBoard.placeShip(aiSubmarine);
  aiBoard.placeShip(aiPatrolBoat);

  // Players
  const humanPlayer = Player();
  const ai = Ai();

  let isGameOver = false;
  let turn = 1;
  const playerTurn = (Math.floor(Math.random() * 2) + 1) % 2;
  console.log(playerTurn);
  let isAttacking = false;

  let coordinates;

  const play = (e) => {
    coordinates = e.target.dataset.position;
    console.log(humanPlayer.attack(aiBoard, coordinates));
    takeTurn();
  };

  const takeTurn = () => {
    if (!isGameOver) {
      if (turn % 2 === playerTurn) {
        const squares = document.querySelectorAll(".enemy.square");
        squares.forEach((square) => square.addEventListener("click", play));
        turn++;
      } else {
        ai.randomAttack(playerBoard);
        turn++;
        takeTurn();
      }
    }
  };
  takeTurn();

  const announce = (ship) => {};
  pubsub.on("shipSunk", announce);
})();
