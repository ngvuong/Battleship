export function Player() {
  const attack = (enemyBoard, coordinates) => {
    return enemyBoard.receiveAttack(coordinates);
  };

  return { attack };
}
