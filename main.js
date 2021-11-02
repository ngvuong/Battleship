/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/gameUI.js":
/*!***********************!*\
  !*** ./src/gameUI.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Interface": () => (/* binding */ Interface),
/* harmony export */   "dragAndDrop": () => (/* binding */ dragAndDrop)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.js");
/* harmony import */ var _pubsub__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pubsub */ "./src/pubsub.js");



const Interface = (function () {
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
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("randomized", null);
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

  const xLabels = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.x;
  const yLabels = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.y;

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
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("shipPlaced", fillSquares);

  const markMiss = (data) => {
    document
      .querySelector(`.${data.type}[data-position=${data.coordinates}]`)
      .classList.add("missed");
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("attackMissed", markMiss);

  const markHit = (data) => {
    const target = document.querySelector(
      `.${data.type}[data-position=${data.coordinates}]`
    );
    target.classList.add("hit");
    target.innerHTML = "&#10006;";
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("attackHit", markHit);

  const attackPosition = (e) => {
    const position = e.target.dataset.position;
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("attackLaunched", position);
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
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("gameStarted", null);
  });

  const checkGameStart = () => {
    const ships = document.querySelectorAll(".ship");
    if ([...ships].every((ship) => ship.children.length === 0)) {
      startBtn.disabled = false;
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("shipPositioned", checkGameStart);

  const printToConsole = (data) => {
    if (data.attacker) {
      const outcome = data.outcome === -1 ? "hit" : "miss";
      textConsole.innerHTML += `The ${data.attacker} launched an attack. It's a ${outcome}!<br/>`;
    } else if (data.message) {
      textConsole.innerHTML += `${data.message}<br/>`;
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("attacked", printToConsole);
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("shipSunkMessage", printToConsole);
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("gameEnded", printToConsole);

  const displayEndScreen = (data) => {
    document.querySelector(".display-overlay").classList.add("visible");
    const message = document.querySelector(".message");
    message.textContent = data.message;

    document
      .querySelector(".restart-btn")
      .addEventListener("click", () => window.location.reload());
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("gameEnded", displayEndScreen);
})();

// Drag and drop for placing ships manually
const dragAndDrop = (function () {
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
        const xCoord = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.x;
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
        _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("shipPositioned", positions);
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
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("boardReset", null);
  });

  const squares = document.querySelectorAll(".player.square");
  squares.forEach((square) => {
    square.addEventListener("dragover", handleDragOver);
    square.addEventListener("drop", handleDrop);
  });
})();


/***/ }),

/***/ "./src/gameboard.js":
/*!**************************!*\
  !*** ./src/gameboard.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Gameboard": () => (/* binding */ Gameboard)
/* harmony export */ });
/* harmony import */ var _pubsub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pubsub */ "./src/pubsub.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/utils.js");



function Gameboard(type = "player") {
  const board = {};
  const ships = [];

  const xCoord = _utils__WEBPACK_IMPORTED_MODULE_1__.utils.x;
  const yCoord = _utils__WEBPACK_IMPORTED_MODULE_1__.utils.y;

  // Set up 10x10 grid
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
        _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipPlaced", { positions, type });
        return ship.getPositions();
      } else console.error("Invalid position");
    } else {
      // Picking positions based on a random head position and direction
      const shipLength = ship.getLength();
      const headPosition = _utils__WEBPACK_IMPORTED_MODULE_1__.utils.randomCoordinates();
      const orientation = Math.floor(Math.random() * 2);
      const direction = Math.floor(Math.random() * 2);
      const dirOffset = direction === 0 ? -1 : 1;
      const targetCoord = headPosition.split("")[orientation];

      const positions = [];
      positions[0] = headPosition;

      for (let i = 1; i < shipLength; i++) {
        if (orientation === 0) {
          const index = xCoord.indexOf(targetCoord);
          positions[i] =
            xCoord[index + dirOffset * i] + headPosition.split("")[1];
        } else {
          const index = yCoord.indexOf(parseInt(targetCoord));
          positions[i] =
            headPosition.split("")[0] + yCoord[index + dirOffset * i];
        }
      }
      const allValid = positions.every((pos) => board[pos] === null);
      if (allValid) {
        placeShip(ship, positions);
      } else placeShip(ship);
    }
  };

  const receiveAttack = (coordinates) => {
    if (board[coordinates] === null) {
      board[coordinates] = 0;
      _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("attackMissed", { coordinates, type });
    } else if (board[coordinates] === 1) {
      board[coordinates] = -1;
      _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("attackHit", { coordinates, type });
      ships.forEach((ship) => {
        if (ship.isSunk()) {
          ships.splice(ships.indexOf(ship), 1);
          _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipSunk", { ship, type });
        }
      });
    }
    return board[coordinates];
  };

  const allShipsSunk = () => ships.length === 0;

  return { board, placeShip, receiveAttack, allShipsSunk };
}


/***/ }),

/***/ "./src/player.js":
/*!***********************!*\
  !*** ./src/player.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Player": () => (/* binding */ Player),
/* harmony export */   "Ai": () => (/* binding */ Ai)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.js");


function Player() {
  const coordsAttacked = [];

  const attack = (enemyBoard, coordinates) => {
    if (!coordsAttacked.includes(coordinates)) {
      const outcome = enemyBoard.receiveAttack(coordinates);
      coordsAttacked.push(coordinates);

      return outcome;
    }
  };

  return { attack };
}

// Ai extends Player to allow random attacks
function Ai() {
  const coordsAttacked = [];
  const ai = Player();

  const attackingAi = {
    randomAttack: (enemyBoard) => {
      let coordinates = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.randomCoordinates();

      while (coordsAttacked.includes(coordinates)) {
        coordinates = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.randomCoordinates();
      }
      const outcome = ai.attack(enemyBoard, coordinates);
      coordsAttacked.push(coordinates);
      return outcome;
    },
  };

  return Object.assign(ai, attackingAi);
}


/***/ }),

/***/ "./src/pubsub.js":
/*!***********************!*\
  !*** ./src/pubsub.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pubsub": () => (/* binding */ pubsub)
/* harmony export */ });
const pubsub = (function () {
  const events = {};

  const on = (evt, callback) => {
    events[evt] = events[evt] || [];
    events[evt].push(callback);
  };

  const off = (evt, callback) => {
    events[evt] = events[evt].filter((cb) => cb !== callback);
  };

  const emit = (evt, data) => {
    if (events[evt]) {
      events[evt].forEach((cb) => cb(data));
    }
  };

  return { on, off, emit };
})();


/***/ }),

/***/ "./src/ship.js":
/*!*********************!*\
  !*** ./src/ship.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Ship": () => (/* binding */ Ship)
/* harmony export */ });
/* harmony import */ var _pubsub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pubsub */ "./src/pubsub.js");


function Ship(length, type = "player") {
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
  _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.on("attackHit", _hit);

  const isSunk = () => {
    return Object.keys(shipPositions).every(
      (key) => shipPositions[key].isHit === true
    );
  };
  return { getLength, getPositions, setPositions, isSunk };
}


/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "utils": () => (/* binding */ utils)
/* harmony export */ });
const utils = {
  x: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  y: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

  randomCoordinates: () => {
    const xIndex = Math.floor(Math.random() * 10);
    const yIndex = Math.floor(Math.random() * 10);
    return utils.x[xIndex] + utils.y[yIndex];
  },
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ship */ "./src/ship.js");
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./player */ "./src/player.js");
/* harmony import */ var _gameUI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gameUI */ "./src/gameUI.js");
/* harmony import */ var _pubsub__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pubsub */ "./src/pubsub.js");






(function GameController() {
  // Player board
  let playerBoard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();
  const carrier = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(5);
  const battleship = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(4);
  const destroyer = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3);
  const submarine = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3);
  const patrolBoat = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(2);
  // Drag and Drop ships for placement based on length
  const positionShip = (positions) => {
    if (positions.length === 5) {
      playerBoard.placeShip(carrier, positions);
    } else if (positions.length === 4) {
      playerBoard.placeShip(battleship, positions);
    } else if (positions.length === 3) {
      if (Object.keys(destroyer.getPositions()).length === 0) {
        playerBoard.placeShip(destroyer, positions);
      } else playerBoard.placeShip(submarine, positions);
    } else if (positions.length === 2) {
      playerBoard.placeShip(patrolBoat, positions);
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("shipPositioned", positionShip);

  const randomizePlacement = () => {
    playerBoard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();

    playerBoard.placeShip(carrier);
    playerBoard.placeShip(battleship);
    playerBoard.placeShip(destroyer);
    playerBoard.placeShip(submarine);
    playerBoard.placeShip(patrolBoat);
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("randomized", randomizePlacement);

  const resetBoard = () => {
    playerBoard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("boardReset", resetBoard);

  // Ai board
  const aiBoard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)("enemy");
  const aiCarrier = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(5, "enemy");
  const aiBattleship = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(4, "enemy");
  const aiDestroyer = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3, "enemy");
  const aiSubmarine = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3, "enemy");
  const aiPatrolBoat = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(2, "enemy");

  aiBoard.placeShip(aiCarrier);
  aiBoard.placeShip(aiBattleship);
  aiBoard.placeShip(aiDestroyer);
  aiBoard.placeShip(aiSubmarine);
  aiBoard.placeShip(aiPatrolBoat);

  // Players
  const humanPlayer = (0,_player__WEBPACK_IMPORTED_MODULE_2__.Player)();
  const ai = (0,_player__WEBPACK_IMPORTED_MODULE_2__.Ai)();

  // Game loop
  let isGameOver = false;
  let turn = 1;
  const playerTurn = (Math.floor(Math.random() * 2) + 1) % 2;

  const takeTurn = (coordinates = null) => {
    if (!isGameOver) {
      if (turn % 2 === playerTurn) {
        if (coordinates) {
          setTimeout(() => {
            const outcome = humanPlayer.attack(aiBoard, coordinates);
            _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("attacked", { attacker: "player", outcome });
            turn++;
            takeTurn();
          });
        }
      } else {
        setTimeout(() => {
          const outcome = ai.randomAttack(playerBoard);
          _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("attacked", { attacker: "enemy", outcome });
          turn++;
          takeTurn();
        });
      }
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("attackLaunched", takeTurn);

  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("gameStarted", takeTurn);

  const handleShipSunk = (data) => {
    if (data.type !== "player") {
      setTimeout(() => {
        _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("shipSunkMessage", { message: "An enemy ship was sunk!" });
      });
      checkWinner();
    } else if (data.type === "player") {
      setTimeout(() => {
        _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("shipSunkMessage", { message: "An ally ship was sunk!" });
      });
      checkWinner();
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("shipSunk", handleShipSunk);

  const checkWinner = () => {
    if (playerBoard.allShipsSunk()) {
      isGameOver = true;
      setTimeout(() => {
        _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("gameEnded", { message: "Computer wins!" });
      });
    } else if (aiBoard.allShipsSunk()) {
      isGameOver = true;
      setTimeout(() => {
        _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("gameEnded", { message: "Player wins!" });
      });
    }
  };
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0Esa0JBQWtCLHFEQUFTOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLDhDQUFTOztBQUVYO0FBQ0Esa0JBQWtCLHFEQUFTO0FBQzNCO0FBQ0EsRUFBRSw4Q0FBUzs7QUFFWDtBQUNBLGtCQUFrQixxREFBUztBQUMzQixvQkFBb0IsMkNBQUk7QUFDeEIsdUJBQXVCLDJDQUFJO0FBQzNCLHNCQUFzQiwyQ0FBSTtBQUMxQixzQkFBc0IsMkNBQUk7QUFDMUIsdUJBQXVCLDJDQUFJOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLCtDQUFNO0FBQzVCLGFBQWEsMkNBQUU7O0FBRWY7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxnREFBVyxlQUFlLDZCQUE2QjtBQUNuRTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxVQUFVLGdEQUFXLGVBQWUsNEJBQTRCO0FBQ2hFO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsRUFBRSw4Q0FBUzs7QUFFWCxFQUFFLDhDQUFTOztBQUVYO0FBQ0E7QUFDQTtBQUNBLFFBQVEsZ0RBQVcsc0JBQXNCLG9DQUFvQztBQUM3RSxPQUFPO0FBQ1A7QUFDQSxNQUFNO0FBQ047QUFDQSxRQUFRLGdEQUFXLHNCQUFzQixtQ0FBbUM7QUFDNUUsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLGdEQUFXLGdCQUFnQiwyQkFBMkI7QUFDOUQsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBO0FBQ0EsUUFBUSxnREFBVyxnQkFBZ0IseUJBQXlCO0FBQzVELE9BQU87QUFDUDtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZVVJLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcHVic3ViLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3V0aWxzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG4gIGNvbnN0IHRleHRDb25zb2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb25zb2xlXCIpO1xuXG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFuZG9tLWJ0blwiKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIikuZm9yRWFjaCgoc2hpcCkgPT4gKHNoaXAuaW5uZXJIVE1MID0gXCJcIikpO1xuXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgcHVic3ViLmVtaXQoXCJyYW5kb21pemVkXCIsIG51bGwpO1xuICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gZmFsc2U7XG4gIH0pO1xuICAvLyBDcmVhdGluZyBncmlkcyBmb3IgZ2FtZSBib2FyZHNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjE7IGkrKykge1xuICAgIGNvbnN0IHBsYXllclNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGxheWVyU3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlIHBsYXllclwiO1xuICAgIHBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclNxdWFyZSk7XG5cbiAgICBjb25zdCBlbmVteVNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZW5lbXlTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmUgZW5lbXlcIjtcbiAgICBlbmVteUJvYXJkLmFwcGVuZENoaWxkKGVuZW15U3F1YXJlKTtcbiAgfVxuXG4gIGNvbnN0IHhMYWJlbHMgPSB1dGlscy54O1xuICBjb25zdCB5TGFiZWxzID0gdXRpbHMueTtcblxuICBjb25zdCBsYWJlbEJvYXJkID0gKGJvYXJkQ2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGNvbExhYmVscyA9IFtcbiAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIGAuJHtib2FyZENsYXNzTmFtZX0gLnNxdWFyZTpudGgtY2hpbGQoLW4rMTFgXG4gICAgICApLFxuICAgIF07XG4gICAgY29sTGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiB7XG4gICAgICBsYWJlbC5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHlMYWJlbHNbaV0gKyAxO1xuICAgIH0pO1xuXG4gICAgbGV0IHJvd0xhYmVscyA9IFtcbiAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIGAuJHtib2FyZENsYXNzTmFtZX0gLnNxdWFyZTpudGgtY2hpbGQoMTFuKzEpYFxuICAgICAgKSxcbiAgICBdO1xuICAgIHJvd0xhYmVsc1swXS5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgcm93TGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiB7XG4gICAgICBsYWJlbC5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHhMYWJlbHNbaV07XG4gICAgfSk7XG4gIH07XG5cbiAgbGFiZWxCb2FyZChcInBsYXllci1ib2FyZFwiKTtcbiAgbGFiZWxCb2FyZChcImVuZW15LWJvYXJkXCIpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgLnNxdWFyZTpudGgtY2hpbGQobiskezEzICsgMTEgKiBpfSk6bnRoLWNoaWxkKC1uKyR7MjIgKyAxMSAqIGl9KWBcbiAgICApO1xuICAgIHJvdy5mb3JFYWNoKChzcSwgaikgPT5cbiAgICAgIHNxLnNldEF0dHJpYnV0ZShcImRhdGEtcG9zaXRpb25cIiwgYCR7eExhYmVsc1tpXSArIHlMYWJlbHNbaiAlIDEwXX1gKVxuICAgICk7XG4gIH1cblxuICBjb25zdCBmaWxsU3F1YXJlcyA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb25zID0gZGF0YS5wb3NpdGlvbnM7XG4gICAgaWYgKGRhdGEudHlwZSA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT5cbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAucXVlcnlTZWxlY3RvcihgLnBsYXllcltkYXRhLXBvc2l0aW9uID0ke3Bvc31dYClcbiAgICAgICAgICAuY2xhc3NMaXN0LmFkZChcIm9jY3VwaWVkXCIpXG4gICAgICApO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBsYWNlZFwiLCBmaWxsU3F1YXJlcyk7XG5cbiAgY29uc3QgbWFya01pc3MgPSAoZGF0YSkgPT4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uPSR7ZGF0YS5jb29yZGluYXRlc31dYClcbiAgICAgIC5jbGFzc0xpc3QuYWRkKFwibWlzc2VkXCIpO1xuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tNaXNzZWRcIiwgbWFya01pc3MpO1xuXG4gIGNvbnN0IG1hcmtIaXQgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uPSR7ZGF0YS5jb29yZGluYXRlc31dYFxuICAgICk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJoaXRcIik7XG4gICAgdGFyZ2V0LmlubmVySFRNTCA9IFwiJiMxMDAwNjtcIjtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrSGl0XCIsIG1hcmtIaXQpO1xuXG4gIGNvbnN0IGF0dGFja1Bvc2l0aW9uID0gKGUpID0+IHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGUudGFyZ2V0LmRhdGFzZXQucG9zaXRpb247XG4gICAgcHVic3ViLmVtaXQoXCJhdHRhY2tMYXVuY2hlZFwiLCBwb3NpdGlvbik7XG4gIH07XG4gIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmVuZW15LnNxdWFyZVwiKTtcbiAgc3F1YXJlcy5mb3JFYWNoKChzcSkgPT5cbiAgICBzcS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXR0YWNrUG9zaXRpb24sIHsgb25jZTogdHJ1ZSB9KVxuICApO1xuXG4gIGNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdGFydC1idG5cIik7XG4gIHN0YXJ0QnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibWFpblwiKS5jbGFzc0xpc3QuYWRkKFwic3RhcnRcIik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ib2FyZHNcIikuc3R5bGUucGFkZGluZ1JpZ2h0ID0gXCIwXCI7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb25maWdcIikuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG4gICAgZW5lbXlCb2FyZC5zdHlsZS5kaXNwbGF5ID0gXCJncmlkXCI7XG4gICAgdGV4dENvbnNvbGUuY2xhc3NMaXN0LmFkZChcInNob3dcIik7XG4gICAgcHVic3ViLmVtaXQoXCJnYW1lU3RhcnRlZFwiLCBudWxsKTtcbiAgfSk7XG5cbiAgY29uc3QgY2hlY2tHYW1lU3RhcnQgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIik7XG4gICAgaWYgKFsuLi5zaGlwc10uZXZlcnkoKHNoaXApID0+IHNoaXAuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSkge1xuICAgICAgc3RhcnRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInNoaXBQb3NpdGlvbmVkXCIsIGNoZWNrR2FtZVN0YXJ0KTtcblxuICBjb25zdCBwcmludFRvQ29uc29sZSA9IChkYXRhKSA9PiB7XG4gICAgaWYgKGRhdGEuYXR0YWNrZXIpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBkYXRhLm91dGNvbWUgPT09IC0xID8gXCJoaXRcIiA6IFwibWlzc1wiO1xuICAgICAgdGV4dENvbnNvbGUuaW5uZXJIVE1MICs9IGBUaGUgJHtkYXRhLmF0dGFja2VyfSBsYXVuY2hlZCBhbiBhdHRhY2suIEl0J3MgYSAke291dGNvbWV9ITxici8+YDtcbiAgICB9IGVsc2UgaWYgKGRhdGEubWVzc2FnZSkge1xuICAgICAgdGV4dENvbnNvbGUuaW5uZXJIVE1MICs9IGAke2RhdGEubWVzc2FnZX08YnIvPmA7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tlZFwiLCBwcmludFRvQ29uc29sZSk7XG4gIHB1YnN1Yi5vbihcInNoaXBTdW5rTWVzc2FnZVwiLCBwcmludFRvQ29uc29sZSk7XG4gIHB1YnN1Yi5vbihcImdhbWVFbmRlZFwiLCBwcmludFRvQ29uc29sZSk7XG5cbiAgY29uc3QgZGlzcGxheUVuZFNjcmVlbiA9IChkYXRhKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kaXNwbGF5LW92ZXJsYXlcIikuY2xhc3NMaXN0LmFkZChcInZpc2libGVcIik7XG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gZGF0YS5tZXNzYWdlO1xuXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnJlc3RhcnQtYnRuXCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKSk7XG4gIH07XG4gIHB1YnN1Yi5vbihcImdhbWVFbmRlZFwiLCBkaXNwbGF5RW5kU2NyZWVuKTtcbn0pKCk7XG5cbi8vIERyYWcgYW5kIGRyb3AgZm9yIHBsYWNpbmcgc2hpcHMgbWFudWFsbHlcbmV4cG9ydCBjb25zdCBkcmFnQW5kRHJvcCA9IChmdW5jdGlvbiAoKSB7XG4gIGxldCBzZWxlY3RlZFBhcnRJZDtcbiAgbGV0IGhvcml6b250YWwgPSB0cnVlO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJvdGF0ZS1idG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZsZWV0XCIpLmNsYXNzTGlzdC50b2dnbGUoXCJ2ZXJ0aWNhbFwiKTtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2hpcFwiKVxuICAgICAgLmZvckVhY2goKHNoaXApID0+IHNoaXAuY2xhc3NMaXN0LnRvZ2dsZShcInZlcnRpY2FsXCIpKTtcbiAgICBob3Jpem9udGFsID0gIWhvcml6b250YWw7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZURyYWdTdGFydChlKSB7XG4gICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRHJvcChlKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRQYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0ZWRQYXJ0SWQpO1xuICAgIGlmIChzZWxlY3RlZFBhcnQpIHtcbiAgICAgIGNvbnN0IHNoaXBMZW5ndGggPSBzZWxlY3RlZFBhcnQucGFyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICBjb25zdCBvZmZzZXQgPSBzZWxlY3RlZFBhcnRJZC5zdWJzdHIoLTEpO1xuICAgICAgY29uc3Qgc2hpcElkID0gc2VsZWN0ZWRQYXJ0LnBhcmVudE5vZGUuaWQ7XG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQb3MgPSB0aGlzLmRhdGFzZXQucG9zaXRpb247XG5cbiAgICAgIGNvbnN0IG5vZGVMaXN0ID0gW107XG4gICAgICBjb25zdCBwYXJ0TGlzdCA9IFtdO1xuXG4gICAgICBpZiAoaG9yaXpvbnRhbCkge1xuICAgICAgICBjb25zdCBoZWFkUG9zaXRpb25Sb3cgPSBjdXJyZW50UG9zLnN1YnN0cigwLCAxKTtcbiAgICAgICAgY29uc3QgaGVhZFBvc2l0aW9uQ29sID0gcGFyc2VJbnQoY3VycmVudFBvcy5zdWJzdHIoLTEpKSAtIG9mZnNldDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgYFtkYXRhLXBvc2l0aW9uPSR7aGVhZFBvc2l0aW9uUm93ICsgKGhlYWRQb3NpdGlvbkNvbCArIGkpfV1gXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICAgIGNvbnN0IHBhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJ0SWQpO1xuICAgICAgICAgIG5vZGVMaXN0LnB1c2gobm9kZSk7XG4gICAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeENvb3JkID0gdXRpbHMueDtcbiAgICAgICAgY29uc3QgY3VycmVudFBvc2l0aW9uUm93SW5kZXggPSB4Q29vcmQuaW5kZXhPZihjdXJyZW50UG9zLnN1YnN0cigwLCAxKSk7XG4gICAgICAgIGNvbnN0IGhlYWRQb3NpdGlvblJvd0luZGV4ID0gY3VycmVudFBvc2l0aW9uUm93SW5kZXggLSBvZmZzZXQ7XG4gICAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbkNvbCA9IGN1cnJlbnRQb3Muc3Vic3RyKC0xKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHJvdyA9IHhDb29yZFtoZWFkUG9zaXRpb25Sb3dJbmRleCArIGldO1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgYFtkYXRhLXBvc2l0aW9uPSR7cm93ICsgaGVhZFBvc2l0aW9uQ29sfV1gXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICAgIGNvbnN0IHBhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJ0SWQpO1xuICAgICAgICAgIG5vZGVMaXN0LnB1c2gobm9kZSk7XG4gICAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgYWxsTm9kZXNPcGVuID0gbm9kZUxpc3QuZXZlcnkoKG5vZGUpID0+IHtcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICByZXR1cm4gIVsuLi5ub2RlLmNsYXNzTGlzdF0uaW5jbHVkZXMoXCJvY2N1cGllZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoYWxsTm9kZXNPcGVuKSB7XG4gICAgICAgIG5vZGVMaXN0LmZvckVhY2goKG5vZGUsIGkpID0+IHtcbiAgICAgICAgICBpZiAocGFydExpc3RbaV0pIHtcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQocGFydExpc3RbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IG5vZGVMaXN0Lm1hcCgobm9kZSkgPT4gbm9kZS5kYXRhc2V0LnBvc2l0aW9uKTtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUG9zaXRpb25lZFwiLCBwb3NpdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZURyYWdPdmVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGREcmFnTGlzdGVuZXJzKCkge1xuICAgIGNvbnN0IHNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpO1xuICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgIHNoaXAuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCBoYW5kbGVEcmFnU3RhcnQpO1xuICAgICAgc2hpcC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgaGFuZGxlRHJhZ092ZXIpO1xuICAgICAgc2hpcC5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcIm1vdXNlZG93blwiLFxuICAgICAgICAgIChlKSA9PiAoc2VsZWN0ZWRQYXJ0SWQgPSBlLnRhcmdldC5pZClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuICBhZGREcmFnTGlzdGVuZXJzKCk7XG5cbiAgbGV0IGZsZWV0SHRtbDtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgXCJsb2FkXCIsXG4gICAgKCkgPT4gKGZsZWV0SHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmxlZXRcIikub3V0ZXJIVE1MKVxuICApO1xuXG4gIGNvbnN0IHJlc2V0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXNldC1idG5cIik7XG4gIHJlc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdGFydC1idG5cIikuZGlzYWJsZWQgPSB0cnVlO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmxlZXRcIikub3V0ZXJIVE1MID0gZmxlZXRIdG1sO1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5vY2N1cGllZFwiKVxuICAgICAgLmZvckVhY2goKGVsKSA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKFwib2NjdXBpZWRcIikpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3F1YXJlIC5zaGlwLXBhcnRcIikuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBhcnQpO1xuICAgIH0pO1xuICAgIGNvbnN0IHZlcnRpY2FsSXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnZlcnRpY2FsXCIpO1xuICAgIGlmICh2ZXJ0aWNhbEl0ZW1zKSB7XG4gICAgICB2ZXJ0aWNhbEl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcInZlcnRpY2FsXCIpKTtcbiAgICAgIGhvcml6b250YWwgPSB0cnVlO1xuICAgIH1cbiAgICBhZGREcmFnTGlzdGVuZXJzKCk7XG4gICAgcHVic3ViLmVtaXQoXCJib2FyZFJlc2V0XCIsIG51bGwpO1xuICB9KTtcblxuICBjb25zdCBzcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5wbGF5ZXIuc3F1YXJlXCIpO1xuICBzcXVhcmVzLmZvckVhY2goKHNxdWFyZSkgPT4ge1xuICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgaGFuZGxlRHJhZ092ZXIpO1xuICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBoYW5kbGVEcm9wKTtcbiAgfSk7XG59KSgpO1xuIiwiaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5pbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBHYW1lYm9hcmQodHlwZSA9IFwicGxheWVyXCIpIHtcbiAgY29uc3QgYm9hcmQgPSB7fTtcbiAgY29uc3Qgc2hpcHMgPSBbXTtcblxuICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICBjb25zdCB5Q29vcmQgPSB1dGlscy55O1xuXG4gIC8vIFNldCB1cCAxMHgxMCBncmlkXG4gIGNvbnN0IGdyaWRDb29yZHMgPSB4Q29vcmQubWFwKCh4KSA9PiB7XG4gICAgcmV0dXJuIHlDb29yZC5tYXAoKHkpID0+IHggKyB5KTtcbiAgfSk7XG4gIGdyaWRDb29yZHMuZm9yRWFjaCgocm93KSA9PlxuICAgIHJvdy5mb3JFYWNoKChwb3NpdGlvbikgPT4gKGJvYXJkW3Bvc2l0aW9uXSA9IG51bGwpKVxuICApO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwLCBwb3NpdGlvbnMgPSBbXSkgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbnNBdmFpbGFibGUgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAocG9zaXRpb25zQXZhaWxhYmxlKSB7XG4gICAgICAgIHNoaXAuc2V0UG9zaXRpb25zKHBvc2l0aW9ucyk7XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChjb29yZCkgPT4gKGJvYXJkW2Nvb3JkXSA9IDEpKTtcbiAgICAgICAgc2hpcHMucHVzaChzaGlwKTtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUGxhY2VkXCIsIHsgcG9zaXRpb25zLCB0eXBlIH0pO1xuICAgICAgICByZXR1cm4gc2hpcC5nZXRQb3NpdGlvbnMoKTtcbiAgICAgIH0gZWxzZSBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBwb3NpdGlvblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUGlja2luZyBwb3NpdGlvbnMgYmFzZWQgb24gYSByYW5kb20gaGVhZCBwb3NpdGlvbiBhbmQgZGlyZWN0aW9uXG4gICAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2hpcC5nZXRMZW5ndGgoKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbiA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBjb25zdCBvcmllbnRhdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJPZmZzZXQgPSBkaXJlY3Rpb24gPT09IDAgPyAtMSA6IDE7XG4gICAgICBjb25zdCB0YXJnZXRDb29yZCA9IGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVtvcmllbnRhdGlvbl07XG5cbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgcG9zaXRpb25zWzBdID0gaGVhZFBvc2l0aW9uO1xuXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob3JpZW50YXRpb24gPT09IDApIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHhDb29yZC5pbmRleE9mKHRhcmdldENvb3JkKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgeENvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV0gKyBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB5Q29vcmQuaW5kZXhPZihwYXJzZUludCh0YXJnZXRDb29yZCkpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMF0gKyB5Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgYWxsVmFsaWQgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAoYWxsVmFsaWQpIHtcbiAgICAgICAgcGxhY2VTaGlwKHNoaXAsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxhY2VTaGlwKHNoaXApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWNlaXZlQXR0YWNrID0gKGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gbnVsbCkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gMDtcbiAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTWlzc2VkXCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG4gICAgfSBlbHNlIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IDEpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IC0xO1xuICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tIaXRcIiwgeyBjb29yZGluYXRlcywgdHlwZSB9KTtcbiAgICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgaWYgKHNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICBzaGlwcy5zcGxpY2Uoc2hpcHMuaW5kZXhPZihzaGlwKSwgMSk7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCB7IHNoaXAsIHR5cGUgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYm9hcmRbY29vcmRpbmF0ZXNdO1xuICB9O1xuXG4gIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHNoaXBzLmxlbmd0aCA9PT0gMDtcblxuICByZXR1cm4geyBib2FyZCwgcGxhY2VTaGlwLCByZWNlaXZlQXR0YWNrLCBhbGxTaGlwc1N1bmsgfTtcbn1cbiIsImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllcigpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcblxuICBjb25zdCBhdHRhY2sgPSAoZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGVuZW15Qm9hcmQucmVjZWl2ZUF0dGFjayhjb29yZGluYXRlcyk7XG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcblxuICAgICAgcmV0dXJuIG91dGNvbWU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IGF0dGFjayB9O1xufVxuXG4vLyBBaSBleHRlbmRzIFBsYXllciB0byBhbGxvdyByYW5kb20gYXR0YWNrc1xuZXhwb3J0IGZ1bmN0aW9uIEFpKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuICBjb25zdCBhaSA9IFBsYXllcigpO1xuXG4gIGNvbnN0IGF0dGFja2luZ0FpID0ge1xuICAgIHJhbmRvbUF0dGFjazogKGVuZW15Qm9hcmQpID0+IHtcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG5cbiAgICAgIHdoaWxlIChjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0Y29tZSA9IGFpLmF0dGFjayhlbmVteUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWksIGF0dGFja2luZ0FpKTtcbn1cbiIsImV4cG9ydCBjb25zdCBwdWJzdWIgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBldmVudHMgPSB7fTtcblxuICBjb25zdCBvbiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XSB8fCBbXTtcbiAgICBldmVudHNbZXZ0XS5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBvZmYgPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0uZmlsdGVyKChjYikgPT4gY2IgIT09IGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBlbWl0ID0gKGV2dCwgZGF0YSkgPT4ge1xuICAgIGlmIChldmVudHNbZXZ0XSkge1xuICAgICAgZXZlbnRzW2V2dF0uZm9yRWFjaCgoY2IpID0+IGNiKGRhdGEpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgb24sIG9mZiwgZW1pdCB9O1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hpcChsZW5ndGgsIHR5cGUgPSBcInBsYXllclwiKSB7XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcblxuICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfTtcblxuICBjb25zdCBnZXRQb3NpdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNoaXBQb3NpdGlvbnM7XG4gIH07XG5cbiAgY29uc3Qgc2V0UG9zaXRpb25zID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zXSA9IHsgaXNIaXQ6IGZhbHNlIH07XG4gICAgfSk7XG4gIH07XG4gIC8vIE9ubHkgdGhlIGNvcnJlY3Qgc2hpcCBnZXRzIGhpdCB1c2luZyB0eXBlIGFuZCBzaGlwIHBvc2l0aW9uc1xuICBjb25zdCBfaGl0ID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBpc0FTaGlwUG9zaXRpb24gPSBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5pbmNsdWRlcyhcbiAgICAgIGRhdGEuY29vcmRpbmF0ZXNcbiAgICApO1xuICAgIGlmIChpc0FTaGlwUG9zaXRpb24gJiYgZGF0YS50eXBlID09PSB0eXBlKSB7XG4gICAgICBzaGlwUG9zaXRpb25zW2RhdGEuY29vcmRpbmF0ZXNdW1wiaXNIaXRcIl0gPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrSGl0XCIsIF9oaXQpO1xuXG4gIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuZXZlcnkoXG4gICAgICAoa2V5KSA9PiBzaGlwUG9zaXRpb25zW2tleV0uaXNIaXQgPT09IHRydWVcbiAgICApO1xuICB9O1xuICByZXR1cm4geyBnZXRMZW5ndGgsIGdldFBvc2l0aW9ucywgc2V0UG9zaXRpb25zLCBpc1N1bmsgfTtcbn1cbiIsImV4cG9ydCBjb25zdCB1dGlscyA9IHtcbiAgeDogW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkhcIiwgXCJJXCIsIFwiSlwiXSxcbiAgeTogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuXG4gIHJhbmRvbUNvb3JkaW5hdGVzOiAoKSA9PiB7XG4gICAgY29uc3QgeEluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIGNvbnN0IHlJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICByZXR1cm4gdXRpbHMueFt4SW5kZXhdICsgdXRpbHMueVt5SW5kZXhdO1xuICB9LFxufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIjtcbmltcG9ydCB7IEdhbWVib2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgUGxheWVyLCBBaSB9IGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IHsgSW50ZXJmYWNlLCBkcmFnQW5kRHJvcCB9IGZyb20gXCIuL2dhbWVVSVwiO1xuaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbihmdW5jdGlvbiBHYW1lQ29udHJvbGxlcigpIHtcbiAgLy8gUGxheWVyIGJvYXJkXG4gIGxldCBwbGF5ZXJCb2FyZCA9IEdhbWVib2FyZCgpO1xuICBjb25zdCBjYXJyaWVyID0gU2hpcCg1KTtcbiAgY29uc3QgYmF0dGxlc2hpcCA9IFNoaXAoNCk7XG4gIGNvbnN0IGRlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IHN1Ym1hcmluZSA9IFNoaXAoMyk7XG4gIGNvbnN0IHBhdHJvbEJvYXQgPSBTaGlwKDIpO1xuICAvLyBEcmFnIGFuZCBEcm9wIHNoaXBzIGZvciBwbGFjZW1lbnQgYmFzZWQgb24gbGVuZ3RoXG4gIGNvbnN0IHBvc2l0aW9uU2hpcCA9IChwb3NpdGlvbnMpID0+IHtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gNSkge1xuICAgICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGNhcnJpZXIsIHBvc2l0aW9ucyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbnMubGVuZ3RoID09PSA0KSB7XG4gICAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoYmF0dGxlc2hpcCwgcG9zaXRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDMpIHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyhkZXN0cm95ZXIuZ2V0UG9zaXRpb25zKCkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoZGVzdHJveWVyLCBwb3NpdGlvbnMpO1xuICAgICAgfSBlbHNlIHBsYXllckJvYXJkLnBsYWNlU2hpcChzdWJtYXJpbmUsIHBvc2l0aW9ucyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbnMubGVuZ3RoID09PSAyKSB7XG4gICAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAocGF0cm9sQm9hdCwgcG9zaXRpb25zKTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInNoaXBQb3NpdGlvbmVkXCIsIHBvc2l0aW9uU2hpcCk7XG5cbiAgY29uc3QgcmFuZG9taXplUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgIHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG5cbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoY2Fycmllcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGJhdHRsZXNoaXApO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChkZXN0cm95ZXIpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChzdWJtYXJpbmUpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChwYXRyb2xCb2F0KTtcbiAgfTtcbiAgcHVic3ViLm9uKFwicmFuZG9taXplZFwiLCByYW5kb21pemVQbGFjZW1lbnQpO1xuXG4gIGNvbnN0IHJlc2V0Qm9hcmQgPSAoKSA9PiB7XG4gICAgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYm9hcmRSZXNldFwiLCByZXNldEJvYXJkKTtcblxuICAvLyBBaSBib2FyZFxuICBjb25zdCBhaUJvYXJkID0gR2FtZWJvYXJkKFwiZW5lbXlcIik7XG4gIGNvbnN0IGFpQ2FycmllciA9IFNoaXAoNSwgXCJlbmVteVwiKTtcbiAgY29uc3QgYWlCYXR0bGVzaGlwID0gU2hpcCg0LCBcImVuZW15XCIpO1xuICBjb25zdCBhaURlc3Ryb3llciA9IFNoaXAoMywgXCJlbmVteVwiKTtcbiAgY29uc3QgYWlTdWJtYXJpbmUgPSBTaGlwKDMsIFwiZW5lbXlcIik7XG4gIGNvbnN0IGFpUGF0cm9sQm9hdCA9IFNoaXAoMiwgXCJlbmVteVwiKTtcblxuICBhaUJvYXJkLnBsYWNlU2hpcChhaUNhcnJpZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaUJhdHRsZXNoaXApO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaURlc3Ryb3llcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpU3VibWFyaW5lKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlQYXRyb2xCb2F0KTtcblxuICAvLyBQbGF5ZXJzXG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKCk7XG4gIGNvbnN0IGFpID0gQWkoKTtcblxuICAvLyBHYW1lIGxvb3BcbiAgbGV0IGlzR2FtZU92ZXIgPSBmYWxzZTtcbiAgbGV0IHR1cm4gPSAxO1xuICBjb25zdCBwbGF5ZXJUdXJuID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMSkgJSAyO1xuXG4gIGNvbnN0IHRha2VUdXJuID0gKGNvb3JkaW5hdGVzID0gbnVsbCkgPT4ge1xuICAgIGlmICghaXNHYW1lT3Zlcikge1xuICAgICAgaWYgKHR1cm4gJSAyID09PSBwbGF5ZXJUdXJuKSB7XG4gICAgICAgIGlmIChjb29yZGluYXRlcykge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3V0Y29tZSA9IGh1bWFuUGxheWVyLmF0dGFjayhhaUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICAgICAgICBwdWJzdWIuZW1pdChcImF0dGFja2VkXCIsIHsgYXR0YWNrZXI6IFwicGxheWVyXCIsIG91dGNvbWUgfSk7XG4gICAgICAgICAgICB0dXJuKys7XG4gICAgICAgICAgICB0YWtlVHVybigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBvdXRjb21lID0gYWkucmFuZG9tQXR0YWNrKHBsYXllckJvYXJkKTtcbiAgICAgICAgICBwdWJzdWIuZW1pdChcImF0dGFja2VkXCIsIHsgYXR0YWNrZXI6IFwiZW5lbXlcIiwgb3V0Y29tZSB9KTtcbiAgICAgICAgICB0dXJuKys7XG4gICAgICAgICAgdGFrZVR1cm4oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tMYXVuY2hlZFwiLCB0YWtlVHVybik7XG5cbiAgcHVic3ViLm9uKFwiZ2FtZVN0YXJ0ZWRcIiwgdGFrZVR1cm4pO1xuXG4gIGNvbnN0IGhhbmRsZVNoaXBTdW5rID0gKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YS50eXBlICE9PSBcInBsYXllclwiKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua01lc3NhZ2VcIiwgeyBtZXNzYWdlOiBcIkFuIGVuZW15IHNoaXAgd2FzIHN1bmshXCIgfSk7XG4gICAgICB9KTtcbiAgICAgIGNoZWNrV2lubmVyKCk7XG4gICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09IFwicGxheWVyXCIpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rTWVzc2FnZVwiLCB7IG1lc3NhZ2U6IFwiQW4gYWxseSBzaGlwIHdhcyBzdW5rIVwiIH0pO1xuICAgICAgfSk7XG4gICAgICBjaGVja1dpbm5lcigpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtcIiwgaGFuZGxlU2hpcFN1bmspO1xuXG4gIGNvbnN0IGNoZWNrV2lubmVyID0gKCkgPT4ge1xuICAgIGlmIChwbGF5ZXJCb2FyZC5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgaXNHYW1lT3ZlciA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJnYW1lRW5kZWRcIiwgeyBtZXNzYWdlOiBcIkNvbXB1dGVyIHdpbnMhXCIgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGFpQm9hcmQuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgIGlzR2FtZU92ZXIgPSB0cnVlO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwiZ2FtZUVuZGVkXCIsIHsgbWVzc2FnZTogXCJQbGF5ZXIgd2lucyFcIiB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=