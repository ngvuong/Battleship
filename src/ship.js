import { pubsub } from "./pubsub";

export function Ship(length, type = "player") {
  const shipPositions = {};

  const getLength = () => {
    return length;
  };

  const getPositions = () => {
    return shipPositions;
  };

  const setPositions = (positions) => {
    positions.forEach((pos) => {
      shipPositions[pos] = { isHit: false };
    });
  };
  // Only the correct ship gets hit using type and ship positions
  const _hit = (data) => {
    const isAShipPosition = Object.keys(shipPositions).includes(
      data.coordinates
    );
    if (isAShipPosition && data.type === type) {
      shipPositions[data.coordinates]["isHit"] = true;
    }
  };
  pubsub.on("attackHit", _hit);

  const isSunk = () => {
    return Object.keys(shipPositions).every(
      (key) => shipPositions[key].isHit === true
    );
  };
  return { getLength, getPositions, setPositions, isSunk };
}
