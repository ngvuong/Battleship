import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player, Ai } from "./player";

(function GameController() {
  const gb = Gameboard();
  const ship = Ship(5);
  gb.placeShip(ship);
  console.log(gb.board);
})();
