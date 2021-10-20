import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player, Ai } from "./player";

(function GameController() {
  const gb = Gameboard();
  const ship = Ship(2);
  gb.placeShip(ship);
})();
