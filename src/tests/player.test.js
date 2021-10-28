import { Player, Ai } from "../player";
import { Gameboard } from "../gameboard";
import { Ship } from "../ship";

const player = Player();
const playerBoard = Gameboard();
const playerShip = Ship(2);
playerBoard.placeShip(playerShip, ["A1", "B1"]);
const playerShip2 = Ship(2);
playerBoard.placeShip(playerShip2, ["A2", "B2"]);

const ai = Ai();
const aiBoard = Gameboard();
const aiShip = Ship(2);
aiBoard.placeShip(aiShip, ["C1", "D1"]);

it("attacks ai board and hits a ship", () => {
  expect(player.attack(aiBoard, "C1")).toBe(-1);
});

it("attacks player board and sinks a ship", () => {
  expect(ai.attack(playerBoard, "A1")).toBe(-1);
  expect(ai.attack(playerBoard, "B1")).toBe(-1);
  expect(playerShip.isSunk()).toBe(true);
});

it("attacks player and sinks the last ship", () => {
  expect(ai.attack(playerBoard, "A2")).toBe(-1);
  expect(ai.attack(playerBoard, "B2")).toBe(-1);
  expect(playerBoard.allShipsSunk()).toBe(true);
});

it("attacks player randomly", () => {
  expect(ai.randomAttack(playerBoard)).toBe(0);
});
