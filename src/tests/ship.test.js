import { Ship } from "../ship";
import { pubsub } from "../pubsub";

it("creates a ship object with length 5", () => {
  expect(Ship(5).getLength()).toBe(5);
});

it("sets positions for the ship", () => {
  const carrier = Ship(5);
  carrier.setPositions(["A1", "A2", "A3", "A4", "A5"]);
  expect(carrier.getPositions()).toEqual({
    A1: { isHit: false },
    A2: { isHit: false },
    A3: { isHit: false },
    A4: { isHit: false },
    A5: { isHit: false },
  });
});

it("marks ship position as hit", () => {
  const ship = Ship(2);
  ship.setPositions(["A1", "B1"]);
  pubsub.emit("attackHit", { coordinates: "A1", type: "player" });
  expect(ship.getPositions()).toEqual({
    A1: { isHit: true },
    B1: { isHit: false },
  });
});

it("marks ship as sunk when all positions are hit", () => {
  const ship = Ship(2);
  ship.setPositions(["A1", "B1"]);
  pubsub.emit("attackHit", { coordinates: "A1", type: "player" });
  pubsub.emit("attackHit", { coordinates: "B1", type: "player" });
  expect(ship.isSunk()).toBe(true);
});
