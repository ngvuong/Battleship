export function Ship(length) {
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

  const hit = (position) => {
    if (Object.keys(shipPositions).includes(position)) {
      shipPositions[position].isHit = true;
    }
  };

  const isSunk = () => {
    return Object.keys(shipPositions).every(
      (key) => (shipPositions[key].isHit = true)
    );
  };

  return { getLength, hit, getPositions, setPositions, isSunk };
}
