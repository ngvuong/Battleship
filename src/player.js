import { utils } from "./utils";
import { pubsub } from "./pubsub";

export function Player() {
  const coordsAttacked = [];

  const attack = (enemyBoard, coordinates) => {
    if (!coordsAttacked.includes(coordinates)) {
      const outcome = enemyBoard.receiveAttack(coordinates);
      console.log(coordinates);
      coordsAttacked.push(coordinates);
      // if(outcome === 0) {
      // pubsub.emit("attackMissed", { coordinates, type });

      // } else pubsub.emit("attackHit")
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
      let coordinates = utils.randomCoordinates();
      // if (!coordsAttacked.includes(coordinates)) {
      //   const outcome = ai.attack(enemyBoard, coordinates);
      //   coordsAttacked.push(coordinates);
      //   console.log(outcome);
      //   return outcome;
      // } else {
      //   console.log("duplicate", coordinates);
      //   randomAttack(enemyBoard);
      // }
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
