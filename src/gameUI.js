import { utils } from "./utils";
import { pubsub } from "./pubsub";

export const Interface = (function () {
  const playerBoard = document.querySelector(".player-board");
  const enemyBoard = document.querySelector(".enemy-board");
  const textConsole = document.querySelector(".console");

  const randomBtn = document.querySelector(".random-btn");
  randomBtn.addEventListener("click", () => {
    document.querySelectorAll(".square .ship-part").forEach((part) => {
      part.parentNode.removeChild(part);
    });

    document.querySelectorAll(".ship").forEach((ship) => (ship.innerHTML = ""));

    document
      .querySelectorAll(".occupied")
      .forEach((el) => el.classList.remove("occupied"));
    pubsub.emit("randomized", null);
    startBtn.disabled = false;
  });
  // Creating grids for game boards
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
      label.textContent = yLabels[i] + 1;
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
    if (data.type === "player") {
      positions.forEach((pos) =>
        document
          .querySelector(`.player[data-position =${pos}]`)
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
    target.innerHTML = "&#10006;";
  };
  pubsub.on("attackHit", markHit);

  const attackPosition = (e) => {
    const position = e.target.dataset.position;
    pubsub.emit("attackLaunched", position);
  };
  const squares = document.querySelectorAll(".enemy.square");
  squares.forEach((sq) =>
    sq.addEventListener("click", attackPosition, { once: true })
  );

  const startBtn = document.querySelector(".start-btn");
  startBtn.disabled = true;
  startBtn.addEventListener("click", () => {
    document.querySelector("main").classList.add("start");
    document.querySelector(".boards").style.paddingRight = "0";
    document.querySelector(".config").classList.add("hide");
    enemyBoard.style.display = "grid";
    textConsole.classList.add("show");
    pubsub.emit("gameStarted", null);
  });

  const checkGameStart = () => {
    const ships = document.querySelectorAll(".ship");
    if ([...ships].every((ship) => ship.children.length === 0)) {
      startBtn.disabled = false;
    }
  };
  pubsub.on("shipPositioned", checkGameStart);

  const printToConsole = (data) => {
    if (data.attacker) {
      const outcome = data.outcome === -1 ? "hit" : "miss";
      textConsole.innerHTML += `The ${data.attacker} launched an attack. It's a ${outcome}!<br/>`;
    } else if (data.message) {
      textConsole.innerHTML += `${data.message}<br/>`;
    }
  };
  pubsub.on("attacked", printToConsole);
  pubsub.on("shipSunkMessage", printToConsole);
  pubsub.on("gameEnded", printToConsole);

  const displayEndScreen = (data) => {
    document.querySelector(".display-overlay").classList.add("visible");
    const message = document.querySelector(".message");
    message.textContent = data.message;

    document
      .querySelector(".restart-btn")
      .addEventListener("click", () => window.location.reload());
  };
  pubsub.on("gameEnded", displayEndScreen);
})();

// Drag and drop for placing ships manually
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
    const selectedPart = document.getElementById(selectedPartId);
    if (selectedPart) {
      const shipLength = selectedPart.parentNode.children.length;
      const offset = selectedPartId.substr(-1);
      const shipId = selectedPart.parentNode.id;

      const currentPos = this.dataset.position;

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
      } else {
        const xCoord = utils.x;
        const currentPositionRowIndex = xCoord.indexOf(currentPos.substr(0, 1));
        const headPositionRowIndex = currentPositionRowIndex - offset;
        const headPositionCol = currentPos.substr(-1);

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
      const allNodesOpen = nodeList.every((node) => {
        if (node) {
          return ![...node.classList].includes("occupied");
        }
      });
      if (allNodesOpen) {
        nodeList.forEach((node, i) => {
          if (partList[i]) {
            node.appendChild(partList[i]);
          }
        });
        const positions = nodeList.map((node) => node.dataset.position);
        pubsub.emit("shipPositioned", positions);
      }

      return false;
    }
  }
  function handleDragOver(e) {
    e.preventDefault();
  }

  function addDragListeners() {
    const ships = document.querySelectorAll(".ship");
    ships.forEach((ship) => {
      ship.addEventListener("dragstart", handleDragStart);
      ship.addEventListener("dragover", handleDragOver);
      ship.childNodes.forEach((node) =>
        node.addEventListener(
          "mousedown",
          (e) => (selectedPartId = e.target.id)
        )
      );
    });
  }
  addDragListeners();

  let fleetHtml;
  window.addEventListener(
    "load",
    () => (fleetHtml = document.querySelector(".fleet").outerHTML)
  );

  const resetBtn = document.querySelector(".reset-btn");
  resetBtn.addEventListener("click", () => {
    document.querySelector(".start-btn").disabled = true;
    document.querySelector(".fleet").outerHTML = fleetHtml;
    document
      .querySelectorAll(".occupied")
      .forEach((el) => el.classList.remove("occupied"));
    document.querySelectorAll(".square .ship-part").forEach((part) => {
      part.parentNode.removeChild(part);
    });
    const verticalItems = document.querySelectorAll(".vertical");
    if (verticalItems) {
      verticalItems.forEach((item) => item.classList.remove("vertical"));
      horizontal = true;
    }
    addDragListeners();
    pubsub.emit("boardReset", null);
  });

  const squares = document.querySelectorAll(".player.square");
  squares.forEach((square) => {
    square.addEventListener("dragover", handleDragOver);
    square.addEventListener("drop", handleDrop);
  });
})();
