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
  expect(Gameboard().placeShip(ship, ["a1", "a2"])).toEqual({
    a1: { isHit: false },
    a2: { isHit: false },
  });
});

it("takes an attack that misses", () => {
  gameBoard.receiveAttack("A1");
  expect(gameBoard.board["A1"]).toBe(0);
});

it("takes an attack that hits a ship", () => {
  gameBoard.placeShip(ship, ["A1", "A2"]);
  gameBoard.receiveAttack("A1");
  expect(gameBoard.board["A1"]).toBe(-1);
});
