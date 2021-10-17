import { Ship } from "../ship";

it("creates a ship object with length 5", () => {
  expect(Ship(2)).toBeTruthy();
  expect(Ship(5).getLength()).toBe(5);
});

it("sets positions for the ship", () => {
  const carrier = Ship(5);
  carrier.setPositions(["a1", "a2", "a3", "a4", "a5"]);
  expect(carrier.getPositions()).toEqual({
    a1: { isHit: false },
    a2: { isHit: false },
    a3: { isHit: false },
    a4: { isHit: false },
    a5: { isHit: false },
  });
});
