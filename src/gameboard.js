import { pubsub } from "./pubsub";
import { utils } from "./utils";

export function Gameboard() {
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
        return ship.getPositions();
      }
    } else {
      const shipLength = ship.getLength();
      let headPosition = utils.randomCoordinates();
      const orientation = Math.floor(Math.random() * 2);
      const direction = Math.floor(Math.random() * 2);
      let dirOffset = direction === 0 ? -1 : 1;
      let targetCoord = headPosition.split("")[orientation];
      const coordBase = orientation === 0 ? xCoord : yCoord;
      let positions = [];
      positions[0] = headPosition;
      let tries = 1;

      for (let i = 1; i < shipLength; i++) {
        if (orientation === 0) {
          const index = xCoord.indexOf(targetCoord);
          positions[i] = xCoord[index + dirOffset] + headPosition.split(":")[1];
        } else {
          const index = yCoord.indexOf(targetCoord);
          positions[i] = headPosition.split("")[0] + yCoord[index + dirOffset];
        }
        if (!board[positions[i]] || board[positions[i]] !== null) {
          dirOffset *= -1;
          i = 1;
          if (tries === 0) {
            headPosition = utils.randomCoordinates();
            targetCoord = headPosition.split("")[orientation];
          }
          tries--;
        } else {
          console.log(positions);
          placeShip(ship, positions);
        }
      }
      console.log(positions);
    }
  };

  const receiveAttack = (coordinates) => {
    if (board[coordinates] === null) {
      board[coordinates] = 0;
    } else if (board[coordinates] === 1) {
      board[coordinates] = -1;
      pubsub.emit("receivedAttack", coordinates);
      ships.forEach((ship) => {
        if (ship.isSunk()) {
          pubsub.emit("shipSunk", ship);
        }
      });
    }
    return board[coordinates];
  };

  const allShipsSunk = () => ships.every((ship) => ship.isSunk());

  return { board, placeShip, receiveAttack, allShipsSunk };
}
