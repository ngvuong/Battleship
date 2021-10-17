export function Ship(length, positions = []) {
  const getLength = () => {
    return length;
  };

  const hit = (position) => {
    if (positions.includes(position)) {
      console.log("hit");
    }
  };

  const isSunk = () => {};

  return { getLength, hit, isSunk };
}
