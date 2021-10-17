import { Gameboard } from "../gameboard";
import { Ship } from "../ship";

let ship;
beforeAll(() => {
  ship = Ship(2);
});

it("creates the gameboard", () => {
  // const ship = Ship(2);
  expect(Gameboard().placeShip(ship, ["a1", "a2"])).toEqual({
    a1: { isHit: false },
    a2: { isHit: false },
  });
});

it("takes an attack that misses", () => {});

it("takes an attack that hits a ship", () => {});
