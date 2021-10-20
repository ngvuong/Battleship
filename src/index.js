import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player, Ai } from "./player";
import { Interface } from "./gameUI";

(function GameController() {
  const gb = Gameboard();
  const ship = Ship(5);
  gb.placeShip(ship, ["A1", "B1", "C1", "D1", "E1"]);
  const ship2 = Ship(5);
  gb.placeShip(ship2);
  console.log(gb.board);
})();
