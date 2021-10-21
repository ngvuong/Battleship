import { utils } from "./utils";
import { pubsub } from "./pubsub";

export const Interface = (function () {
  const playerBoard = document.querySelector(".player-board");
  const enemyBoard = document.querySelector(".enemy-board");
  const randomBtn = document.querySelector(".random-btn");
  randomBtn.addEventListener("click", () => {
    document
      .querySelectorAll(".occupied")
      .forEach((el) => el.classList.remove("occupied"));
    pubsub.emit("randomized", null);
  });

  for (let i = 0; i < 121; i++) {
    const playerSquare = document.createElement("div");
    playerSquare.className = "square player";
    playerBoard.appendChild(playerSquare);

    const enemySquare = document.createElement("div");
    enemySquare.className = "square enemy";
    enemyBoard.appendChild(enemySquare);
  }

  const xLabels = utils.x;
  const yLabels = utils.y;

  const labelBoard = (boardClassName) => {
    let colLabels = [
      ...document.querySelectorAll(
        `.${boardClassName} .square:nth-child(-n+11`
      ),
    ];
    colLabels.slice(1).forEach((label, i) => (label.textContent = yLabels[i]));

    let rowLabels = [
      ...document.querySelectorAll(
        `.${boardClassName} .square:nth-child(11n+1)`
      ),
    ];
    rowLabels.slice(1).forEach((label, i) => (label.textContent = xLabels[i]));
  };

  labelBoard("player-board");
  labelBoard("enemy-board");

  for (let i = 0; i < 10; i++) {
    const row = document.querySelectorAll(
      `.square:nth-child(n+${13 + 11 * i}):nth-child(-n+${22 + 11 * i})`
    );
    row.forEach(
      (sq, j) => (sq.className += ` ${xLabels[i] + yLabels[j % 10]}`)
    );
  }

  const fillSquares = (data) => {
    const positions = data.positions;
    if (data.type === "player") {
      positions.forEach((pos) =>
        document.querySelector(`.player.${pos}`).classList.add("occupied")
      );
    }
  };
  pubsub.on("shipPlaced", fillSquares);
})();
