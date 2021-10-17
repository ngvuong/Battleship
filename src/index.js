import { Ship } from "./ship";

const carrier = Ship(5, ["a1", "a2", "a3", "a4", "a5"]);

console.log(carrier.hit("a1"));
