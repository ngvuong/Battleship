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
    colLabels.slice(1).forEach((label, i) => {
      label.className = "label";
      label.textContent = yLabels[i];
    });

    let rowLabels = [
      ...document.querySelectorAll(
        `.${boardClassName} .square:nth-child(11n+1)`
      ),
    ];
    rowLabels[0].className = "label";
    rowLabels.slice(1).forEach((label, i) => {
      label.className = "label";
      label.textContent = xLabels[i];
    });
  };

  labelBoard("player-board");
  labelBoard("enemy-board");

  for (let i = 0; i < 10; i++) {
    const row = document.querySelectorAll(
      `.square:nth-child(n+${13 + 11 * i}):nth-child(-n+${22 + 11 * i})`
    );
    row.forEach((sq, j) =>
      sq.setAttribute("data-position", `${xLabels[i] + yLabels[j % 10]}`)
    );
  }

  const fillSquares = (data) => {
    const positions = data.positions;
    if (data.type) {
      positions.forEach((pos) =>
        document
          .querySelector(`.${data.type}[data-position =${pos}]`)
          .classList.add("occupied")
      );
    }
  };
  pubsub.on("shipPlaced", fillSquares);

  const markMiss = (data) => {
    document
      .querySelector(`.${data.type}[data-position=${data.coordinates}]`)
      .classList.add("missed");
  };
  pubsub.on("attackMissed", markMiss);

  const markHit = (data) => {
    const target = document.querySelector(
      `.${data.type}[data-position=${data.coordinates}]`
    );
    target.classList.add("hit");
    target.textContent = "X";
  };
  pubsub.on("attackHit", markHit);

  const setPosition = (e) => {
    const position = e.target.dataset.position;
    pubsub.emit("attackLaunched", position);
  };
  const squares = document.querySelectorAll(".enemy.square");
  squares.forEach((sq) =>
    sq.addEventListener("click", setPosition, { once: true })
  );

  document.querySelector(".start-btn").addEventListener("click", () => {
    document.querySelector("main").classList.add("start");
  });
})();

export const dragAndDrop = (function () {
  let dragSrcEl;
  let shipPart;

  function handleDragStart(e) {
    // this.style.opacity = "0.4";

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.id);
  }

  function handleDrop(e) {
    // e.stopPropagation();

    if (dragSrcEl !== this) {
      // dragSrcEl.innerHTML = this.innerHTML;
      // this.innerHTML = e.dataTransfer.getData("text/html");
      console.log(e.dataTransfer.getData("text/html"));
      const shipId = e.dataTransfer.getData("text/html");
      const ship = document.getElementById(shipId);
      const offset = shipPart.substr(-1);
      const currentPos = this.dataset.position;
      const headPosition =
        currentPos.substr(0, 1) + (parseInt(currentPos.substr(-1)) - offset);
      console.log(headPosition);
      const headNode = document.querySelector(
        `[data-position=${headPosition}]`
      );
      console.log(headNode);
      if (headNode) {
        this.appendChild(ship);
      }
    }

    return false;
  }
  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    return false;
  }

  const carrier = document.querySelector(".carrier");
  carrier.childNodes.forEach((node) =>
    node.addEventListener("mousedown", (e) => (shipPart = e.target.id))
  );
  carrier.addEventListener("dragstart", handleDragStart);
  carrier.addEventListener("dragover", handleDragOver);

  const squares = document.querySelectorAll(".player.square");
  squares.forEach((square) => {
    square.addEventListener("drop", handleDrop);
    square.addEventListener("dragover", handleDragOver);
  });

  // const playerBoard = document.querySelector(".player-board");
  // playerBoard.addEventListener("drop", handleDrop);
  // playerBoard.addEventListener("dragover", handleDragOver);
})();
