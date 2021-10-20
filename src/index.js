import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player, Ai } from "./player";

(function GameController() {
  const gb = Gameboard();
  const ship = Ship(3);
  gb.placeShip(ship);
  console.log(gb.board);
})();
