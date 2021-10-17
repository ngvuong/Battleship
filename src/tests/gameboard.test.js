import { Gameboard } from "../gameboard";
import { Ship } from "../ship";

let ship;
beforeAll(() => {
  ship = Ship(2);
});

it("creates a gameboard with 100 named coordinates", () => {
  // expect(Gameboard().board["A1"]).toBe(null);
  // expect(Gameboard().board["B1"]).toBe(null);
  const board = Gameboard().board;
  Object.keys(board).forEach((key) => {
    expect(board[key]).toBe(null);
  });
});

it("places the ship on the board", () => {
  // const ship = Ship(2);
  expect(Gameboard().placeShip(ship, ["a1", "a2"])).toEqual({
    a1: { isHit: false },
    a2: { isHit: false },
  });
});

it("takes an attack that misses", () => {});

it("takes an attack that hits a ship", () => {});
