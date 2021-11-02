import { pubsub } from "./pubsub";
import { utils } from "./utils";

export function Gameboard(type = "player") {
  const board = {};
  const ships = [];

  const xCoord = utils.x;
  const yCoord = utils.y;
  const gridCoords = xCoord.map((x) => {
    return yCoord.map((y) => x + y);
  });
  gridCoords.forEach((row) =>
    row.forEach((position) => (board[position] = null))
  );

  const placeShip = (ship, positions = []) => {
    if (positions.length) {
      const positionsAvailable = positions.every((pos) => board[pos] === null);
      if (positionsAvailable) {
        ship.setPositions(positions);
        positions.forEach((coord) => (board[coord] = 1));
        ships.push(ship);
        pubsub.emit("shipPlaced", { positions, type });
        return ship.getPositions();
      } else console.error("Invalid position");
    } else {
      const shipLength = ship.getLength();
      const headPosition = utils.randomCoordinates();
      const orientation = Math.floor(Math.random() * 2);
      const direction = Math.floor(Math.random() * 2);
      const dirOffset = direction === 0 ? -1 : 1;
      const targetCoord = headPosition.split("")[orientation];

      const positions = [];
      positions[0] = headPosition;

      for (let i = 1; i < shipLength; i++) {
        if (orientation === 0) {
          const index = xCoord.indexOf(targetCoord);
          positions[i] =
            xCoord[index + dirOffset * i] + headPosition.split("")[1];
        } else {
          const index = yCoord.indexOf(parseInt(targetCoord));
          positions[i] =
            headPosition.split("")[0] + yCoord[index + dirOffset * i];
        }
      }
      const allValid = positions.every((pos) => board[pos] === null);
      if (allValid) {
        placeShip(ship, positions);
      } else placeShip(ship);
    }
  };

  const receiveAttack = (coordinates) => {
    if (board[coordinates] === null) {
      board[coordinates] = 0;
      pubsub.emit("attackMissed", { coordinates, type });
    } else if (board[coordinates] === 1) {
      board[coordinates] = -1;
      pubsub.emit("attackHit", { coordinates, type });
      console.log(coordinates);
      ships.forEach((ship) => {
        if (ship.isSunk()) {
          console.log(ship.getPositions());
          ships.splice(ships.indexOf(ship), 1);
          pubsub.emit("shipSunk", { ship, type });
          console.log(ship);
        }
      });
    }
    return board[coordinates];
  };

  const allShipsSunk = () => ships.length === 0;

  return { board, ships, placeShip, receiveAttack, allShipsSunk };
}
