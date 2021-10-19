import { Gameboard } from "../gameboard";
import { Ship } from "../ship";

let ship;
let gameBoard;
beforeEach(() => {
  ship = Ship(2);
  gameBoard = Gameboard();
});

it("creates a gameboard with 100 named coordinates", () => {
  expect(
    Object.keys(gameBoard.board).every((key) => gameBoard.board[key] === null)
  ).toBe(true);
});

it("places the ship on the board", () => {
  expect(gameBoard.placeShip(ship, ["A1", "A2"])).toEqual({
    A1: { isHit: false },
    A2: { isHit: false },
  });
});

it("takes an attack that misses and tracks it", () => {
  gameBoard.receiveAttack("A1");
  expect(gameBoard.board["A1"]).toBe(0);
});

it("takes an attack that hits a ship", () => {
  gameBoard.placeShip(ship, ["B1", "B2"]);
  gameBoard.receiveAttack("B1");
  expect(gameBoard.board["B1"]).toBe(-1);
  expect(ship.getPositions()["B1"]).toEqual({ isHit: true });
});

it("takes an attack that hits and sinks a ship", () => {
  gameBoard.placeShip(ship, ["C1", "C2"]);
  gameBoard.receiveAttack("C1");
  gameBoard.receiveAttack("C2");
  expect(ship.isSunk()).toBe(true);
});

it("reports whether all ships are sunk", () => {
  gameBoard.placeShip(ship, ["A1", "A2"]);
  gameBoard.receiveAttack("A1");
  gameBoard.receiveAttack("A2");
  expect(gameBoard.allShipsSunk()).toBe(true);
});
