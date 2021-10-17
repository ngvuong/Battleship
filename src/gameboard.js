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

  const placeShip = (ship, positions) => {
    ship.setPositions(positions);
    positions.forEach((coord) => (board[coord] = 1));
    return ship.getPositions();
  };

  const receiveAttack = (coordinates) => {
    if (board[coordinates] === null) {
      board[coordinates] = 0;
    } else if (board[coordinates] === 1) {
      board[coordinates] = -1;
    }
  };

  return { board, placeShip, receiveAttack };
}
