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

    row.forEach((sq, j) =>
      sq.setAttribute("data-index", `${i}-${i * 10 + j + 1}`)
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
  let selectedPartId;
  let horizontal = true;
  document.querySelector(".rotate-btn").addEventListener("click", () => {
    document.querySelector(".fleet").classList.toggle("vertical");
    document
      .querySelectorAll(".ship")
      .forEach((ship) => ship.classList.toggle("vertical"));
    horizontal = !horizontal;
  });

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e) {
    e.preventDefault();
    const selectedPart = document.getElementById(selectedPartId);
    const shipLength = selectedPart.parentNode.children.length;
    const offset = selectedPartId.substr(-1);
    const currentPos = this.dataset.position;
    const shipId = selectedPart.parentNode.id;

    const nodeList = [];
    const partList = [];

    if (horizontal) {
      const headPositionRow = currentPos.substr(0, 1);
      const headPositionCol = parseInt(currentPos.substr(-1)) - offset;

      for (let i = 0; i < shipLength; i++) {
        const node = document.querySelector(
          `[data-position=${headPositionRow + (headPositionCol + i)}]`
        );
        const partId = `${shipId}-${i}`;
        const part = document.getElementById(partId);
        nodeList.push(node);
        partList.push(part);
      }
      console.log(nodeList);
    } else {
      const xCoord = utils.x;
      const currentPositionRowIndex = xCoord.indexOf(currentPos.substr(0, 1));
      const headPositionRowIndex = currentPositionRowIndex - offset;
      const headPositionCol = currentPos.substr(-1);
      console.log(headPositionRowIndex);

      for (let i = 0; i < shipLength; i++) {
        const row = xCoord[headPositionRowIndex + i];
        const node = document.querySelector(
          `[data-position=${row + headPositionCol}]`
        );
        const partId = `${shipId}-${i}`;
        const part = document.getElementById(partId);
        nodeList.push(node);
        partList.push(part);
      }
    }

    if (nodeList.every((node) => node)) {
      nodeList.forEach((node, i) => {
        if (partList[i]) {
          node.appendChild(partList[i]);
          node.removeEventListener("drop", handleDrop);
        }
      });
      const positions = nodeList.map((node) => node.dataset.position);
      console.log(positions);
      pubsub.emit("shipPlaced", nodeList);
    }

    return false;
  }
  function handleDragOver(e) {
    // if (e.preventDefault) {
    e.preventDefault();
    // }

    // return false;
  }

  const ships = document.querySelectorAll(".ship ");
  ships.forEach((ship) => {
    ship.addEventListener("dragstart", handleDragStart);
    ship.addEventListener("dragover", handleDragOver);
    ship.childNodes.forEach((node) =>
      node.addEventListener("mousedown", (e) => (selectedPartId = e.target.id))
    );
  });

  const squares = document.querySelectorAll(".player.square");
  squares.forEach((square) => {
    square.addEventListener("dragover", handleDragOver);
    square.addEventListener("drop", handleDrop);
  });

  // const playerBoard = document.querySelector(".player-board");
  // playerBoard.addEventListener("drop", handleDrop);
  // playerBoard.addEventListener("dragover", handleDragOver);
})();
