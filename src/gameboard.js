export function Gameboard() {
  const placeShip = (ship, coordinates) => {
    ship.setPositions(coordinates);
    return ship.getPositions();
  };

  const receiveAttack = (coordinates) => {};

  return { placeShip };
}
