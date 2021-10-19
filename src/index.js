import { Ship } from "./ship";
import { Gameboard } from "./gameboard";

(function GameController() {
  const carrier = Ship(5);

  const gb = Gameboard();
  gb.placeShip(carrier, ["A1", "A2", "A3", "A4", "A5"]);
  gb.receiveAttack("A1");
  gb.receiveAttack("B1");
  console.log(carrier.getPositions());
})();
