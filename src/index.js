import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player, Ai } from "./player";
import { Interface } from "./gameUI";

(function GameController() {
  const gb = Gameboard();
  const carrier = Ship(5);
  const battleship = Ship(4);
  const destroyer = Ship(3);
  const submarine = Ship(3);
  const patrolBoat = Ship(2);
  gb.placeShip(carrier);
  gb.placeShip(battleship);
  gb.placeShip(destroyer);
  gb.placeShip(submarine);
  gb.placeShip(patrolBoat);
  console.log(gb.board);
})();
