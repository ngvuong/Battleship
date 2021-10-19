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

export function Ai() {
  const coordsAttacked = [];
  const ai = Player();
  const x = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const attackingAi = {
    randomAttack: (enemyBoard) => {
      const xIndex = Math.floor(Math.random() * 10);
      const yIndex = Math.floor(Math.random() * 10);
      const coordinates = x[xIndex] + y[yIndex];
      if (!coordsAttacked.includes(coordinates)) {
        ai.attack(enemyBoard, coordinates);
        coordsAttacked.push(coordinates);
        console.log(coordinates);
        return coordinates;
      } else randomAttack(enemyBoard);
    },
  };

  return Object.assign(ai, attackingAi);
}
