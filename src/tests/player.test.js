import { Player } from "../player";
import { Gameboard } from "../gameboard";
import { Ship } from "../ship";

const player = Player();
const playerBoard = Gameboard();
const playerShip = Ship(2);
playerBoard.placeShip(playerShip, ["A1", "B1"]);

const ai = Player();
const aiBoard = Gameboard();
const aiShip = Ship(2);
aiBoard.placeShip(aiShip, ["C1", "D1"]);

it("attacks ai board and hits a ship", () => {
  expect(player.attack(aiBoard, "C1")).toBe(-1);
  // expect(aiBoard.board["C1"]).toBe(-1);
});
