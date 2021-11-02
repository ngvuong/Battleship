import { utils } from "./utils";

export function Player() {
  const coordsAttacked = [];

  const attack = (enemyBoard, coordinates) => {
    if (!coordsAttacked.includes(coordinates)) {
      const outcome = enemyBoard.receiveAttack(coordinates);
      coordsAttacked.push(coordinates);

      return outcome;
    }
  };

  return { attack };
}

// Ai extends Player to allow random attacks
export function Ai() {
  const coordsAttacked = [];
  const ai = Player();

  const attackingAi = {
    randomAttack: (enemyBoard) => {
      let coordinates = utils.randomCoordinates();

      while (coordsAttacked.includes(coordinates)) {
        coordinates = utils.randomCoordinates();
      }
      const outcome = ai.attack(enemyBoard, coordinates);
      coordsAttacked.push(coordinates);
      return outcome;
    },
  };

  return Object.assign(ai, attackingAi);
}
