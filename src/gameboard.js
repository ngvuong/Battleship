export function Gameboard() {
  const board = {};

  const xCoord = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const yCoord = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const gridCoords = xCoord.map((x) => {
    return yCoord.map((y) => x + y);
  });
  gridCoords.forEach((row) =>
    row.forEach((position) => (board[position] = null))
  );

  const placeShip = (ship, coordinates) => {
    ship.setPositions(coordinates);
    return ship.getPositions();
  };

  const receiveAttack = (coordinates) => {};

  return { board, placeShip };
}
