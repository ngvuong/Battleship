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
    if (positions.includes(position)) {
      console.log("hit");
    }
  };

  const isSunk = () => {};

  return { getLength, getPositions, setPositions, isSunk };
}
