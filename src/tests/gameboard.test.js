import { Gameboard } from "../gameboard";
import { Ship } from "../ship";

let ship;
let gameBoard;
beforeAll(() => {
  ship = Ship(2);
  gameBoard = Gameboard();
});

it("creates a gameboard with 100 named coordinates", () => {
  expect(
    Object.keys(gameBoard.board).every((key) => gameBoard.board[key] === null)
  ).toBe(true);
});

it("places the ship on the board", () => {
  expect(Gameboard().placeShip(ship, ["A1", "A2"])).toEqual({
    A1: { isHit: false },
    A2: { isHit: false },
  });
});

it("takes an attack that misses and tracks it", () => {
  gameBoard.receiveAttack("A1");
  expect(gameBoard.board["A1"]).toBe(0);
});

it("takes an attack that hits a ship", () => {
  gameBoard.placeShip(ship, ["A1", "A2"]);
  gameBoard.receiveAttack("A1");
  expect(gameBoard.board["A1"]).toBe(-1);
  expect(ship.getPositions()["A1"]).toEqual({ isHit: true });
});

it("takes an attack that hits and sinks a ship", () => {
  gameBoard.placeShip(ship, ["A1", "A2"]);
  gameBoard.receiveAttack("A1");
  gameBoard.receiveAttack("A2");
  expect(ship.isSunk()).toBe(true);
});

it("reports whether all ships are sunk", () => {
  gameBoard.placeShip(ship, ["A1", "A2"]);
  gameBoard.receiveAttack("A1");
  gameBoard.receiveAttack("A2");
  expect(gameBoard.allShipsSunk()).toBe(true);
});
