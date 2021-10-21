import { utils } from "./utils";
import { pubsub } from "./pubsub";

export function Player() {
  const coordsAttacked = [];

  const attack = (enemyBoard, coordinates) => {
    if (!coordsAttacked.includes(coordinates)) {
      const outcome = enemyBoard.receiveAttack(coordinates);
      if (outcome === 0) {
        pubsub.emit("attackMissed", { enemyBoard, coordinates });
      } else pubsub.emit("attackHit", { enemyBoard, coordinates });
      coordsAttacked.push(coordinates);
      return outcome;
    }
  };

  return { attack };
}

export function Ai() {
  const coordsAttacked = [];
  const ai = Player();

  const attackingAi = {
    randomAttack: (enemyBoard) => {
      const coordinates = utils.randomCoordinates();
      if (!coordsAttacked.includes(coordinates)) {
        ai.attack(enemyBoard, coordinates);
        coordsAttacked.push(coordinates);
        return coordinates;
      } else attackingAi.randomAttack(enemyBoard);
    },
  };

  return Object.assign(ai, attackingAi);
}
