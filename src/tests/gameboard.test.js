import { Gameboard } from "../gameboard";
import { Ship } from "../ship";

let ship;
let board;
beforeAll(() => {
  ship = Ship(2);
  board = Gameboard();
});

it("creates a gameboard with 100 named coordinates", () => {
  expect(
    Object.keys(board.board).every((key) => board.board[key] === null)
  ).toBe(true);
});

it("places the ship on the board", () => {
  expect(Gameboard().placeShip(ship, ["a1", "a2"])).toEqual({
    a1: { isHit: false },
    a2: { isHit: false },
  });
});

it("takes an attack that misses", () => {
  board.receiveAttack("A1");
  expect(board.board["A1"]).toBe(0);
});

it("takes an attack that hits a ship", () => {});
