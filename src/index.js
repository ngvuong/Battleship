import { Ship } from "./ship";

const carrier = Ship(5);

carrier.setPositions(["a1", "a2", "a3", "a4", "a5"]);
console.log(carrier.getPositions());
