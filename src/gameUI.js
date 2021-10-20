export const Interface = (function () {
  const playerBoard = document.querySelector(".player-board");
  const enemyBoard = document.querySelector(".enemy-board");

  for (let i = 0; i < 100; i++) {
    const square = document.createElement("div");
    square.className = "square";
    // for (let j = 0; j < 10; j++) {
    //   const square = document.createElement("div");
    //   square.className = "square";
    //   row.appendChild(square);
    // }
    playerBoard.appendChild(square);
  }
})();
