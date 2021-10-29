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
          _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipSunk", { ship, type });
          ships.splice(ships.indexOf(ship), 1);
        }
      });
    }
    return board[coordinates];
  };

  const allShipsSunk = () => ships.every((ship) => ship.isSunk());

  return { board, ships, placeShip, receiveAttack, allShipsSunk };
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


function Ship(length) {
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
  const _hit = (data) => {
    if (Object.keys(shipPositions).includes(data.coordinates)) {
      shipPositions[data.coordinates].isHit = true;
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
  const aiCarrier = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(5);
  const aiBattleship = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(4);
  const aiDestroyer = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3);
  const aiSubmarine = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3);
  const aiPatrolBoat = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(2);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LDhDQUFTOztBQUVYO0FBQ0Esa0JBQWtCLHFEQUFTO0FBQzNCO0FBQ0EsRUFBRSw4Q0FBUzs7QUFFWDtBQUNBLGtCQUFrQixxREFBUztBQUMzQixvQkFBb0IsMkNBQUk7QUFDeEIsdUJBQXVCLDJDQUFJO0FBQzNCLHNCQUFzQiwyQ0FBSTtBQUMxQixzQkFBc0IsMkNBQUk7QUFDMUIsdUJBQXVCLDJDQUFJOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLCtDQUFNO0FBQzVCLGFBQWEsMkNBQUU7O0FBRWY7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxnREFBVyxlQUFlLDZCQUE2QjtBQUNuRTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxVQUFVLGdEQUFXLGVBQWUsNEJBQTRCO0FBQ2hFO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsRUFBRSw4Q0FBUzs7QUFFWCxFQUFFLDhDQUFTOztBQUVYO0FBQ0E7QUFDQTtBQUNBLFFBQVEsZ0RBQVcsc0JBQXNCLG9DQUFvQztBQUM3RSxPQUFPO0FBQ1A7QUFDQSxNQUFNO0FBQ047QUFDQSxRQUFRLGdEQUFXLHNCQUFzQixtQ0FBbUM7QUFDNUUsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLGdEQUFXLGdCQUFnQiwyQkFBMkI7QUFDOUQsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBO0FBQ0EsUUFBUSxnREFBVyxnQkFBZ0IseUJBQXlCO0FBQzVELE9BQU87QUFDUDtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZVVJLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcHVic3ViLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3V0aWxzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG4gIGNvbnN0IHRleHRDb25zb2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb25zb2xlXCIpO1xuXG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFuZG9tLWJ0blwiKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIikuZm9yRWFjaCgoc2hpcCkgPT4gKHNoaXAuaW5uZXJIVE1MID0gXCJcIikpO1xuXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgcHVic3ViLmVtaXQoXCJyYW5kb21pemVkXCIsIG51bGwpO1xuICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gZmFsc2U7XG4gIH0pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTIxOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXJTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBsYXllclNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBwbGF5ZXJcIjtcbiAgICBwbGF5ZXJCb2FyZC5hcHBlbmRDaGlsZChwbGF5ZXJTcXVhcmUpO1xuXG4gICAgY29uc3QgZW5lbXlTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGVuZW15U3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlIGVuZW15XCI7XG4gICAgZW5lbXlCb2FyZC5hcHBlbmRDaGlsZChlbmVteVNxdWFyZSk7XG4gIH1cblxuICBjb25zdCB4TGFiZWxzID0gdXRpbHMueDtcbiAgY29uc3QgeUxhYmVscyA9IHV0aWxzLnk7XG5cbiAgY29uc3QgbGFiZWxCb2FyZCA9IChib2FyZENsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBjb2xMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKC1uKzExYFxuICAgICAgKSxcbiAgICBdO1xuICAgIGNvbExhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4ge1xuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSB5TGFiZWxzW2ldICsgMTtcbiAgICB9KTtcblxuICAgIGxldCByb3dMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKDExbisxKWBcbiAgICAgICksXG4gICAgXTtcbiAgICByb3dMYWJlbHNbMF0uY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgIHJvd0xhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4ge1xuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSB4TGFiZWxzW2ldO1xuICAgIH0pO1xuICB9O1xuXG4gIGxhYmVsQm9hcmQoXCJwbGF5ZXItYm9hcmRcIik7XG4gIGxhYmVsQm9hcmQoXCJlbmVteS1ib2FyZFwiKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYC5zcXVhcmU6bnRoLWNoaWxkKG4rJHsxMyArIDExICogaX0pOm50aC1jaGlsZCgtbiskezIyICsgMTEgKiBpfSlgXG4gICAgKTtcbiAgICByb3cuZm9yRWFjaCgoc3EsIGopID0+XG4gICAgICBzcS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBvc2l0aW9uXCIsIGAke3hMYWJlbHNbaV0gKyB5TGFiZWxzW2ogJSAxMF19YClcbiAgICApO1xuICB9XG5cbiAgY29uc3QgZmlsbFNxdWFyZXMgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHBvc2l0aW9ucyA9IGRhdGEucG9zaXRpb25zO1xuICAgIGlmIChkYXRhLnR5cGUgPT09IFwicGxheWVyXCIpIHtcbiAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoYC5wbGF5ZXJbZGF0YS1wb3NpdGlvbiA9JHtwb3N9XWApXG4gICAgICAgICAgLmNsYXNzTGlzdC5hZGQoXCJvY2N1cGllZFwiKVxuICAgICAgKTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInNoaXBQbGFjZWRcIiwgZmlsbFNxdWFyZXMpO1xuXG4gIGNvbnN0IG1hcmtNaXNzID0gKGRhdGEpID0+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoYC4ke2RhdGEudHlwZX1bZGF0YS1wb3NpdGlvbj0ke2RhdGEuY29vcmRpbmF0ZXN9XWApXG4gICAgICAuY2xhc3NMaXN0LmFkZChcIm1pc3NlZFwiKTtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrTWlzc2VkXCIsIG1hcmtNaXNzKTtcblxuICBjb25zdCBtYXJrSGl0ID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgYC4ke2RhdGEudHlwZX1bZGF0YS1wb3NpdGlvbj0ke2RhdGEuY29vcmRpbmF0ZXN9XWBcbiAgICApO1xuICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKFwiaGl0XCIpO1xuICAgIHRhcmdldC5pbm5lckhUTUwgPSBcIiYjMTAwMDY7XCI7XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja0hpdFwiLCBtYXJrSGl0KTtcblxuICBjb25zdCBhdHRhY2tQb3NpdGlvbiA9IChlKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBlLnRhcmdldC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTGF1bmNoZWRcIiwgcG9zaXRpb24pO1xuICB9O1xuICBjb25zdCBzcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5lbmVteS5zcXVhcmVcIik7XG4gIHNxdWFyZXMuZm9yRWFjaCgoc3EpID0+XG4gICAgc3EuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGF0dGFja1Bvc2l0aW9uLCB7IG9uY2U6IHRydWUgfSlcbiAgKTtcblxuICBjb25zdCBzdGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3RhcnQtYnRuXCIpO1xuICBzdGFydEJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gIHN0YXJ0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIm1haW5cIikuY2xhc3NMaXN0LmFkZChcInN0YXJ0XCIpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYm9hcmRzXCIpLnN0eWxlLnBhZGRpbmdSaWdodCA9IFwiMFwiO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29uZmlnXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuICAgIGVuZW15Qm9hcmQuc3R5bGUuZGlzcGxheSA9IFwiZ3JpZFwiO1xuICAgIHRleHRDb25zb2xlLmNsYXNzTGlzdC5hZGQoXCJzaG93XCIpO1xuICAgIHB1YnN1Yi5lbWl0KFwiZ2FtZVN0YXJ0ZWRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGNvbnN0IGNoZWNrR2FtZVN0YXJ0ID0gKCkgPT4ge1xuICAgIGNvbnN0IHNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpO1xuICAgIGlmIChbLi4uc2hpcHNdLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUG9zaXRpb25lZFwiLCBjaGVja0dhbWVTdGFydCk7XG5cbiAgY29uc3QgcHJpbnRUb0NvbnNvbGUgPSAoZGF0YSkgPT4ge1xuICAgIGlmIChkYXRhLmF0dGFja2VyKSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gZGF0YS5vdXRjb21lID09PSAtMSA/IFwiaGl0XCIgOiBcIm1pc3NcIjtcbiAgICAgIHRleHRDb25zb2xlLmlubmVySFRNTCArPSBgVGhlICR7ZGF0YS5hdHRhY2tlcn0gbGF1bmNoZWQgYW4gYXR0YWNrLiBJdCdzIGEgJHtvdXRjb21lfSE8YnIvPmA7XG4gICAgfSBlbHNlIGlmIChkYXRhLm1lc3NhZ2UpIHtcbiAgICAgIHRleHRDb25zb2xlLmlubmVySFRNTCArPSBgJHtkYXRhLm1lc3NhZ2V9PGJyLz5gO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrZWRcIiwgcHJpbnRUb0NvbnNvbGUpO1xuICBwdWJzdWIub24oXCJzaGlwU3Vua01lc3NhZ2VcIiwgcHJpbnRUb0NvbnNvbGUpO1xuICBwdWJzdWIub24oXCJnYW1lRW5kZWRcIiwgcHJpbnRUb0NvbnNvbGUpO1xuXG4gIGNvbnN0IGRpc3BsYXlFbmRTY3JlZW4gPSAoZGF0YSkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZGlzcGxheS1vdmVybGF5XCIpLmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IGRhdGEubWVzc2FnZTtcblxuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihcIi5yZXN0YXJ0LWJ0blwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCkpO1xuICB9O1xuICBwdWJzdWIub24oXCJnYW1lRW5kZWRcIiwgZGlzcGxheUVuZFNjcmVlbik7XG59KSgpO1xuXG5leHBvcnQgY29uc3QgZHJhZ0FuZERyb3AgPSAoZnVuY3Rpb24gKCkge1xuICBsZXQgc2VsZWN0ZWRQYXJ0SWQ7XG4gIGxldCBob3Jpem9udGFsID0gdHJ1ZTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yb3RhdGUtYnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5jbGFzc0xpc3QudG9nZ2xlKFwidmVydGljYWxcIik7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIilcbiAgICAgIC5mb3JFYWNoKChzaGlwKSA9PiBzaGlwLmNsYXNzTGlzdC50b2dnbGUoXCJ2ZXJ0aWNhbFwiKSk7XG4gICAgaG9yaXpvbnRhbCA9ICFob3Jpem9udGFsO1xuICB9KTtcblxuICBmdW5jdGlvbiBoYW5kbGVEcmFnU3RhcnQoZSkge1xuICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSBcIm1vdmVcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZURyb3AoZSkge1xuICAgIGNvbnN0IHNlbGVjdGVkUGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdGVkUGFydElkKTtcbiAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2VsZWN0ZWRQYXJ0LnBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGNvbnN0IG9mZnNldCA9IHNlbGVjdGVkUGFydElkLnN1YnN0cigtMSk7XG4gICAgY29uc3QgY3VycmVudFBvcyA9IHRoaXMuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBjb25zdCBzaGlwSWQgPSBzZWxlY3RlZFBhcnQucGFyZW50Tm9kZS5pZDtcblxuICAgIGNvbnN0IG5vZGVMaXN0ID0gW107XG4gICAgY29uc3QgcGFydExpc3QgPSBbXTtcblxuICAgIGlmIChob3Jpem9udGFsKSB7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb25Sb3cgPSBjdXJyZW50UG9zLnN1YnN0cigwLCAxKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbkNvbCA9IHBhcnNlSW50KGN1cnJlbnRQb3Muc3Vic3RyKC0xKSkgLSBvZmZzZXQ7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIGBbZGF0YS1wb3NpdGlvbj0ke2hlYWRQb3NpdGlvblJvdyArIChoZWFkUG9zaXRpb25Db2wgKyBpKX1dYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICBjb25zdCBwYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFydElkKTtcbiAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeENvb3JkID0gdXRpbHMueDtcbiAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvblJvd0luZGV4ID0geENvb3JkLmluZGV4T2YoY3VycmVudFBvcy5zdWJzdHIoMCwgMSkpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uUm93SW5kZXggPSBjdXJyZW50UG9zaXRpb25Sb3dJbmRleCAtIG9mZnNldDtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbkNvbCA9IGN1cnJlbnRQb3Muc3Vic3RyKC0xKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgcm93ID0geENvb3JkW2hlYWRQb3NpdGlvblJvd0luZGV4ICsgaV07XG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIGBbZGF0YS1wb3NpdGlvbj0ke3JvdyArIGhlYWRQb3NpdGlvbkNvbH1dYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICBjb25zdCBwYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFydElkKTtcbiAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYWxsTm9kZXNPcGVuID0gbm9kZUxpc3QuZXZlcnkoKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIHJldHVybiAhWy4uLm5vZGUuY2xhc3NMaXN0XS5pbmNsdWRlcyhcIm9jY3VwaWVkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChhbGxOb2Rlc09wZW4pIHtcbiAgICAgIG5vZGVMaXN0LmZvckVhY2goKG5vZGUsIGkpID0+IHtcbiAgICAgICAgaWYgKHBhcnRMaXN0W2ldKSB7XG4gICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChwYXJ0TGlzdFtpXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgcG9zaXRpb25zID0gbm9kZUxpc3QubWFwKChub2RlKSA9PiBub2RlLmRhdGFzZXQucG9zaXRpb24pO1xuICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUG9zaXRpb25lZFwiLCBwb3NpdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVEcmFnT3ZlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkRHJhZ0xpc3RlbmVycygpIHtcbiAgICBjb25zdCBzaGlwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2hpcFwiKTtcbiAgICBzaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICBzaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgaGFuZGxlRHJhZ1N0YXJ0KTtcbiAgICAgIHNoaXAuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIGhhbmRsZURyYWdPdmVyKTtcbiAgICAgIHNoaXAuY2hpbGROb2Rlcy5mb3JFYWNoKChub2RlKSA9PlxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgXCJtb3VzZWRvd25cIixcbiAgICAgICAgICAoZSkgPT4gKHNlbGVjdGVkUGFydElkID0gZS50YXJnZXQuaWQpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbiAgYWRkRHJhZ0xpc3RlbmVycygpO1xuXG4gIGxldCBmbGVldEh0bWw7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgIFwibG9hZFwiLFxuICAgICgpID0+IChmbGVldEh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZsZWV0XCIpLm91dGVySFRNTClcbiAgKTtcblxuICBjb25zdCByZXNldEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmVzZXQtYnRuXCIpO1xuICByZXNldEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3RhcnQtYnRuXCIpLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZsZWV0XCIpLm91dGVySFRNTCA9IGZsZWV0SHRtbDtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIub2NjdXBpZWRcIilcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9jY3VwaWVkXCIpKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNxdWFyZSAuc2hpcC1wYXJ0XCIpLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwYXJ0KTtcbiAgICB9KTtcbiAgICBjb25zdCB2ZXJ0aWNhbEl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi52ZXJ0aWNhbFwiKTtcbiAgICBpZiAodmVydGljYWxJdGVtcykge1xuICAgICAgdmVydGljYWxJdGVtcy5mb3JFYWNoKChpdGVtKSA9PiBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJ2ZXJ0aWNhbFwiKSk7XG4gICAgICBob3Jpem9udGFsID0gdHJ1ZTtcbiAgICB9XG4gICAgYWRkRHJhZ0xpc3RlbmVycygpO1xuICAgIHB1YnN1Yi5lbWl0KFwiYm9hcmRSZXNldFwiLCBudWxsKTtcbiAgfSk7XG5cbiAgY29uc3Qgc3F1YXJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucGxheWVyLnNxdWFyZVwiKTtcbiAgc3F1YXJlcy5mb3JFYWNoKChzcXVhcmUpID0+IHtcbiAgICBzcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIGhhbmRsZURyYWdPdmVyKTtcbiAgICBzcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgaGFuZGxlRHJvcCk7XG4gIH0pO1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gR2FtZWJvYXJkKHR5cGUgPSBcInBsYXllclwiKSB7XG4gIGNvbnN0IGJvYXJkID0ge307XG4gIGNvbnN0IHNoaXBzID0gW107XG5cbiAgY29uc3QgeENvb3JkID0gdXRpbHMueDtcbiAgY29uc3QgeUNvb3JkID0gdXRpbHMueTtcbiAgY29uc3QgZ3JpZENvb3JkcyA9IHhDb29yZC5tYXAoKHgpID0+IHtcbiAgICByZXR1cm4geUNvb3JkLm1hcCgoeSkgPT4geCArIHkpO1xuICB9KTtcbiAgZ3JpZENvb3Jkcy5mb3JFYWNoKChyb3cpID0+XG4gICAgcm93LmZvckVhY2goKHBvc2l0aW9uKSA9PiAoYm9hcmRbcG9zaXRpb25dID0gbnVsbCkpXG4gICk7XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHNoaXAsIHBvc2l0aW9ucyA9IFtdKSA9PiB7XG4gICAgaWYgKHBvc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uc0F2YWlsYWJsZSA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICAgIGlmIChwb3NpdGlvbnNBdmFpbGFibGUpIHtcbiAgICAgICAgc2hpcC5zZXRQb3NpdGlvbnMocG9zaXRpb25zKTtcbiAgICAgICAgcG9zaXRpb25zLmZvckVhY2goKGNvb3JkKSA9PiAoYm9hcmRbY29vcmRdID0gMSkpO1xuICAgICAgICBzaGlwcy5wdXNoKHNoaXApO1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBQbGFjZWRcIiwgeyBwb3NpdGlvbnMsIHR5cGUgfSk7XG4gICAgICAgIHJldHVybiBzaGlwLmdldFBvc2l0aW9ucygpO1xuICAgICAgfSBlbHNlIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHBvc2l0aW9uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2hpcC5nZXRMZW5ndGgoKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbiA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBjb25zdCBvcmllbnRhdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJPZmZzZXQgPSBkaXJlY3Rpb24gPT09IDAgPyAtMSA6IDE7XG4gICAgICBjb25zdCB0YXJnZXRDb29yZCA9IGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVtvcmllbnRhdGlvbl07XG5cbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgcG9zaXRpb25zWzBdID0gaGVhZFBvc2l0aW9uO1xuXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob3JpZW50YXRpb24gPT09IDApIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHhDb29yZC5pbmRleE9mKHRhcmdldENvb3JkKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgeENvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV0gKyBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB5Q29vcmQuaW5kZXhPZihwYXJzZUludCh0YXJnZXRDb29yZCkpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMF0gKyB5Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgYWxsVmFsaWQgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAoYWxsVmFsaWQpIHtcbiAgICAgICAgcGxhY2VTaGlwKHNoaXAsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxhY2VTaGlwKHNoaXApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWNlaXZlQXR0YWNrID0gKGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gbnVsbCkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gMDtcbiAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTWlzc2VkXCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG4gICAgfSBlbHNlIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IDEpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IC0xO1xuICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tIaXRcIiwgeyBjb29yZGluYXRlcywgdHlwZSB9KTtcbiAgICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgaWYgKHNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rXCIsIHsgc2hpcCwgdHlwZSB9KTtcbiAgICAgICAgICBzaGlwcy5zcGxpY2Uoc2hpcHMuaW5kZXhPZihzaGlwKSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYm9hcmRbY29vcmRpbmF0ZXNdO1xuICB9O1xuXG4gIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKTtcblxuICByZXR1cm4geyBib2FyZCwgc2hpcHMsIHBsYWNlU2hpcCwgcmVjZWl2ZUF0dGFjaywgYWxsU2hpcHNTdW5rIH07XG59XG4iLCJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG5cbiAgY29uc3QgYXR0YWNrID0gKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBlbmVteUJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmRpbmF0ZXMpO1xuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG5cbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBhdHRhY2sgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFpKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuICBjb25zdCBhaSA9IFBsYXllcigpO1xuXG4gIGNvbnN0IGF0dGFja2luZ0FpID0ge1xuICAgIHJhbmRvbUF0dGFjazogKGVuZW15Qm9hcmQpID0+IHtcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG5cbiAgICAgIHdoaWxlIChjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0Y29tZSA9IGFpLmF0dGFjayhlbmVteUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWksIGF0dGFja2luZ0FpKTtcbn1cbiIsImV4cG9ydCBjb25zdCBwdWJzdWIgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBldmVudHMgPSB7fTtcblxuICBjb25zdCBvbiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XSB8fCBbXTtcbiAgICBldmVudHNbZXZ0XS5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBvZmYgPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0uZmlsdGVyKChjYikgPT4gY2IgIT09IGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBlbWl0ID0gKGV2dCwgZGF0YSkgPT4ge1xuICAgIGlmIChldmVudHNbZXZ0XSkge1xuICAgICAgZXZlbnRzW2V2dF0uZm9yRWFjaCgoY2IpID0+IGNiKGRhdGEpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgb24sIG9mZiwgZW1pdCB9O1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hpcChsZW5ndGgpIHtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuXG4gIGNvbnN0IGdldExlbmd0aCA9ICgpID0+IHtcbiAgICByZXR1cm4gbGVuZ3RoO1xuICB9O1xuXG4gIGNvbnN0IGdldFBvc2l0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gc2hpcFBvc2l0aW9ucztcbiAgfTtcblxuICBjb25zdCBzZXRQb3NpdGlvbnMgPSAocG9zaXRpb25zKSA9PiB7XG4gICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT4ge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NdID0geyBpc0hpdDogZmFsc2UgfTtcbiAgICB9KTtcbiAgfTtcbiAgY29uc3QgX2hpdCA9IChkYXRhKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmluY2x1ZGVzKGRhdGEuY29vcmRpbmF0ZXMpKSB7XG4gICAgICBzaGlwUG9zaXRpb25zW2RhdGEuY29vcmRpbmF0ZXNdLmlzSGl0ID0gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja0hpdFwiLCBfaGl0KTtcblxuICBjb25zdCBpc1N1bmsgPSAoKSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmV2ZXJ5KFxuICAgICAgKGtleSkgPT4gc2hpcFBvc2l0aW9uc1trZXldLmlzSGl0ID09PSB0cnVlXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHsgZ2V0TGVuZ3RoLCBnZXRQb3NpdGlvbnMsIHNldFBvc2l0aW9ucywgaXNTdW5rIH07XG59XG4iLCJleHBvcnQgY29uc3QgdXRpbHMgPSB7XG4gIHg6IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIl0sXG4gIHk6IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcblxuICByYW5kb21Db29yZGluYXRlczogKCkgPT4ge1xuICAgIGNvbnN0IHhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICBjb25zdCB5SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgcmV0dXJuIHV0aWxzLnhbeEluZGV4XSArIHV0aWxzLnlbeUluZGV4XTtcbiAgfSxcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFNoaXAgfSBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBHYW1lYm9hcmQgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IFBsYXllciwgQWkgfSBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCB7IEludGVyZmFjZSwgZHJhZ0FuZERyb3AgfSBmcm9tIFwiLi9nYW1lVUlcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG4oZnVuY3Rpb24gR2FtZUNvbnRyb2xsZXIoKSB7XG4gIC8vIFBsYXllciBib2FyZFxuICBsZXQgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgY29uc3QgY2FycmllciA9IFNoaXAoNSk7XG4gIGNvbnN0IGJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBkZXN0cm95ZXIgPSBTaGlwKDMpO1xuICBjb25zdCBzdWJtYXJpbmUgPSBTaGlwKDMpO1xuICBjb25zdCBwYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBjb25zdCBwb3NpdGlvblNoaXAgPSAocG9zaXRpb25zKSA9PiB7XG4gICAgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDUpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChjYXJyaWVyLCBwb3NpdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gNCkge1xuICAgICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGJhdHRsZXNoaXAsIHBvc2l0aW9ucyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbnMubGVuZ3RoID09PSAzKSB7XG4gICAgICBpZiAoT2JqZWN0LmtleXMoZGVzdHJveWVyLmdldFBvc2l0aW9ucygpKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGRlc3Ryb3llciwgcG9zaXRpb25zKTtcbiAgICAgIH0gZWxzZSBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoc3VibWFyaW5lLCBwb3NpdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gMikge1xuICAgICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHBhdHJvbEJvYXQsIHBvc2l0aW9ucyk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUG9zaXRpb25lZFwiLCBwb3NpdGlvblNoaXApO1xuXG4gIGNvbnN0IHJhbmRvbWl6ZVBsYWNlbWVudCA9ICgpID0+IHtcbiAgICBwbGF5ZXJCb2FyZCA9IEdhbWVib2FyZCgpO1xuXG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGNhcnJpZXIpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChiYXR0bGVzaGlwKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoZGVzdHJveWVyKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoc3VibWFyaW5lKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAocGF0cm9sQm9hdCk7XG4gIH07XG4gIHB1YnN1Yi5vbihcInJhbmRvbWl6ZWRcIiwgcmFuZG9taXplUGxhY2VtZW50KTtcblxuICBjb25zdCByZXNldEJvYXJkID0gKCkgPT4ge1xuICAgIHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIH07XG4gIHB1YnN1Yi5vbihcImJvYXJkUmVzZXRcIiwgcmVzZXRCb2FyZCk7XG5cbiAgLy8gQWkgYm9hcmRcbiAgY29uc3QgYWlCb2FyZCA9IEdhbWVib2FyZChcImVuZW15XCIpO1xuICBjb25zdCBhaUNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBhaUJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBhaURlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IGFpU3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgYWlQYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBhaUJvYXJkLnBsYWNlU2hpcChhaUNhcnJpZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaUJhdHRsZXNoaXApO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaURlc3Ryb3llcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpU3VibWFyaW5lKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlQYXRyb2xCb2F0KTtcblxuICAvLyBQbGF5ZXJzXG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKCk7XG4gIGNvbnN0IGFpID0gQWkoKTtcblxuICAvLyBHYW1lIGxvb3BcbiAgbGV0IGlzR2FtZU92ZXIgPSBmYWxzZTtcbiAgbGV0IHR1cm4gPSAxO1xuICBjb25zdCBwbGF5ZXJUdXJuID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMSkgJSAyO1xuXG4gIGNvbnN0IHRha2VUdXJuID0gKGNvb3JkaW5hdGVzID0gbnVsbCkgPT4ge1xuICAgIGlmICghaXNHYW1lT3Zlcikge1xuICAgICAgaWYgKHR1cm4gJSAyID09PSBwbGF5ZXJUdXJuKSB7XG4gICAgICAgIGlmIChjb29yZGluYXRlcykge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3V0Y29tZSA9IGh1bWFuUGxheWVyLmF0dGFjayhhaUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICAgICAgICBwdWJzdWIuZW1pdChcImF0dGFja2VkXCIsIHsgYXR0YWNrZXI6IFwicGxheWVyXCIsIG91dGNvbWUgfSk7XG4gICAgICAgICAgICB0dXJuKys7XG4gICAgICAgICAgICB0YWtlVHVybigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBvdXRjb21lID0gYWkucmFuZG9tQXR0YWNrKHBsYXllckJvYXJkKTtcbiAgICAgICAgICBwdWJzdWIuZW1pdChcImF0dGFja2VkXCIsIHsgYXR0YWNrZXI6IFwiZW5lbXlcIiwgb3V0Y29tZSB9KTtcbiAgICAgICAgICB0dXJuKys7XG4gICAgICAgICAgdGFrZVR1cm4oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tMYXVuY2hlZFwiLCB0YWtlVHVybik7XG5cbiAgcHVic3ViLm9uKFwiZ2FtZVN0YXJ0ZWRcIiwgdGFrZVR1cm4pO1xuXG4gIGNvbnN0IGhhbmRsZVNoaXBTdW5rID0gKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YS50eXBlICE9PSBcInBsYXllclwiKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua01lc3NhZ2VcIiwgeyBtZXNzYWdlOiBcIkFuIGVuZW15IHNoaXAgd2FzIHN1bmshXCIgfSk7XG4gICAgICB9KTtcbiAgICAgIGNoZWNrV2lubmVyKCk7XG4gICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09IFwicGxheWVyXCIpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rTWVzc2FnZVwiLCB7IG1lc3NhZ2U6IFwiQW4gYWxseSBzaGlwIHdhcyBzdW5rIVwiIH0pO1xuICAgICAgfSk7XG4gICAgICBjaGVja1dpbm5lcigpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtcIiwgaGFuZGxlU2hpcFN1bmspO1xuXG4gIGNvbnN0IGNoZWNrV2lubmVyID0gKCkgPT4ge1xuICAgIGlmIChwbGF5ZXJCb2FyZC5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgaXNHYW1lT3ZlciA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJnYW1lRW5kZWRcIiwgeyBtZXNzYWdlOiBcIkNvbXB1dGVyIHdpbnMhXCIgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGFpQm9hcmQuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgIGlzR2FtZU92ZXIgPSB0cnVlO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwiZ2FtZUVuZGVkXCIsIHsgbWVzc2FnZTogXCJQbGF5ZXIgd2lucyFcIiB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=