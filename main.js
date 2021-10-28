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
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("gameStarted", null);
  });

  const checkGameStart = () => {
    const ships = document.querySelectorAll(".ship");
    if ([...ships].every((ship) => ship.children.length === 0)) {
      startBtn.disabled = false;
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("shipPositioned", checkGameStart);

  const textConsole = document.querySelector(".console");
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
    // e.preventDefault();
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
          // node.removeEventListener("drop", handleDrop);
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
          ships.splice(ships.indexOf(ship), 1);
          _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipSunk", { ship, type });
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
/* harmony import */ var _pubsub__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pubsub */ "./src/pubsub.js");



function Player() {
  const coordsAttacked = [];

  const attack = (enemyBoard, coordinates) => {
    if (!coordsAttacked.includes(coordinates)) {
      const outcome = enemyBoard.receiveAttack(coordinates);
      console.log(coordinates);
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
      const coordinates = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.randomCoordinates();
      if (!coordsAttacked.includes(coordinates)) {
        const outcome = ai.attack(enemyBoard, coordinates);
        coordsAttacked.push(coordinates);
        return outcome;
      } else attackingAi.randomAttack(enemyBoard);
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
      console.log("An enemy ship was sunk!");
      setTimeout(() => {
        _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("shipSunkMessage", { message: "An enemy ship was sunk!" });
      });
      checkWinner();
    } else if (data.type === "player") {
      console.log("An ally ship was sunk!");
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
      console.log("You lost!");
    } else if (aiBoard.allShipsSunk()) {
      isGameOver = true;
      setTimeout(() => {
        _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.emit("gameEnded", { message: "Player wins!" });
      });
      console.log("You won!");
    }
  };
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QzNCLG9CQUFvQiwyQ0FBSTtBQUN4Qix1QkFBdUIsMkNBQUk7QUFDM0Isc0JBQXNCLDJDQUFJO0FBQzFCLHNCQUFzQiwyQ0FBSTtBQUMxQix1QkFBdUIsMkNBQUk7O0FBRTNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsK0NBQU07QUFDNUIsYUFBYSwyQ0FBRTs7QUFFZjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGdEQUFXLGVBQWUsNkJBQTZCO0FBQ25FO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLFVBQVUsZ0RBQVcsZUFBZSw0QkFBNEI7QUFDaEU7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxFQUFFLDhDQUFTOztBQUVYLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLGdEQUFXLHNCQUFzQixvQ0FBb0M7QUFDN0UsT0FBTztBQUNQO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxRQUFRLGdEQUFXLHNCQUFzQixtQ0FBbUM7QUFDNUUsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLGdEQUFXLGdCQUFnQiwyQkFBMkI7QUFDOUQsT0FBTztBQUNQO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxRQUFRLGdEQUFXLGdCQUFnQix5QkFBeUI7QUFDNUQsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVVSS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3B1YnN1Yi5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGNvbnN0IEludGVyZmFjZSA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHBsYXllckJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXItYm9hcmRcIik7XG4gIGNvbnN0IGVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmVuZW15LWJvYXJkXCIpO1xuXG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFuZG9tLWJ0blwiKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIikuZm9yRWFjaCgoc2hpcCkgPT4gKHNoaXAuaW5uZXJIVE1MID0gXCJcIikpO1xuXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgcHVic3ViLmVtaXQoXCJyYW5kb21pemVkXCIsIG51bGwpO1xuICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gZmFsc2U7XG4gIH0pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTIxOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXJTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBsYXllclNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBwbGF5ZXJcIjtcbiAgICBwbGF5ZXJCb2FyZC5hcHBlbmRDaGlsZChwbGF5ZXJTcXVhcmUpO1xuXG4gICAgY29uc3QgZW5lbXlTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGVuZW15U3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlIGVuZW15XCI7XG4gICAgZW5lbXlCb2FyZC5hcHBlbmRDaGlsZChlbmVteVNxdWFyZSk7XG4gIH1cblxuICBjb25zdCB4TGFiZWxzID0gdXRpbHMueDtcbiAgY29uc3QgeUxhYmVscyA9IHV0aWxzLnk7XG5cbiAgY29uc3QgbGFiZWxCb2FyZCA9IChib2FyZENsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBjb2xMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKC1uKzExYFxuICAgICAgKSxcbiAgICBdO1xuICAgIGNvbExhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4ge1xuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSB5TGFiZWxzW2ldICsgMTtcbiAgICB9KTtcblxuICAgIGxldCByb3dMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKDExbisxKWBcbiAgICAgICksXG4gICAgXTtcbiAgICByb3dMYWJlbHNbMF0uY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgIHJvd0xhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4ge1xuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSB4TGFiZWxzW2ldO1xuICAgIH0pO1xuICB9O1xuXG4gIGxhYmVsQm9hcmQoXCJwbGF5ZXItYm9hcmRcIik7XG4gIGxhYmVsQm9hcmQoXCJlbmVteS1ib2FyZFwiKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYC5zcXVhcmU6bnRoLWNoaWxkKG4rJHsxMyArIDExICogaX0pOm50aC1jaGlsZCgtbiskezIyICsgMTEgKiBpfSlgXG4gICAgKTtcbiAgICByb3cuZm9yRWFjaCgoc3EsIGopID0+XG4gICAgICBzcS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBvc2l0aW9uXCIsIGAke3hMYWJlbHNbaV0gKyB5TGFiZWxzW2ogJSAxMF19YClcbiAgICApO1xuICB9XG5cbiAgY29uc3QgZmlsbFNxdWFyZXMgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHBvc2l0aW9ucyA9IGRhdGEucG9zaXRpb25zO1xuICAgIGlmIChkYXRhLnR5cGUgPT09IFwicGxheWVyXCIpIHtcbiAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoYC5wbGF5ZXJbZGF0YS1wb3NpdGlvbiA9JHtwb3N9XWApXG4gICAgICAgICAgLmNsYXNzTGlzdC5hZGQoXCJvY2N1cGllZFwiKVxuICAgICAgKTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInNoaXBQbGFjZWRcIiwgZmlsbFNxdWFyZXMpO1xuXG4gIGNvbnN0IG1hcmtNaXNzID0gKGRhdGEpID0+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoYC4ke2RhdGEudHlwZX1bZGF0YS1wb3NpdGlvbj0ke2RhdGEuY29vcmRpbmF0ZXN9XWApXG4gICAgICAuY2xhc3NMaXN0LmFkZChcIm1pc3NlZFwiKTtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrTWlzc2VkXCIsIG1hcmtNaXNzKTtcblxuICBjb25zdCBtYXJrSGl0ID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgYC4ke2RhdGEudHlwZX1bZGF0YS1wb3NpdGlvbj0ke2RhdGEuY29vcmRpbmF0ZXN9XWBcbiAgICApO1xuICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKFwiaGl0XCIpO1xuICAgIHRhcmdldC5pbm5lckhUTUwgPSBcIiYjMTAwMDY7XCI7XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja0hpdFwiLCBtYXJrSGl0KTtcblxuICBjb25zdCBhdHRhY2tQb3NpdGlvbiA9IChlKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBlLnRhcmdldC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTGF1bmNoZWRcIiwgcG9zaXRpb24pO1xuICB9O1xuICBjb25zdCBzcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5lbmVteS5zcXVhcmVcIik7XG4gIHNxdWFyZXMuZm9yRWFjaCgoc3EpID0+XG4gICAgc3EuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGF0dGFja1Bvc2l0aW9uLCB7IG9uY2U6IHRydWUgfSlcbiAgKTtcblxuICBjb25zdCBzdGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3RhcnQtYnRuXCIpO1xuICBzdGFydEJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gIHN0YXJ0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIm1haW5cIikuY2xhc3NMaXN0LmFkZChcInN0YXJ0XCIpO1xuICAgIHB1YnN1Yi5lbWl0KFwiZ2FtZVN0YXJ0ZWRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGNvbnN0IGNoZWNrR2FtZVN0YXJ0ID0gKCkgPT4ge1xuICAgIGNvbnN0IHNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpO1xuICAgIGlmIChbLi4uc2hpcHNdLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUG9zaXRpb25lZFwiLCBjaGVja0dhbWVTdGFydCk7XG5cbiAgY29uc3QgdGV4dENvbnNvbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnNvbGVcIik7XG4gIGNvbnN0IHByaW50VG9Db25zb2xlID0gKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YS5hdHRhY2tlcikge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGRhdGEub3V0Y29tZSA9PT0gLTEgPyBcImhpdFwiIDogXCJtaXNzXCI7XG4gICAgICB0ZXh0Q29uc29sZS5pbm5lckhUTUwgKz0gYFRoZSAke2RhdGEuYXR0YWNrZXJ9IGxhdW5jaGVkIGFuIGF0dGFjay4gSXQncyBhICR7b3V0Y29tZX0hPGJyLz5gO1xuICAgIH0gZWxzZSBpZiAoZGF0YS5tZXNzYWdlKSB7XG4gICAgICB0ZXh0Q29uc29sZS5pbm5lckhUTUwgKz0gYCR7ZGF0YS5tZXNzYWdlfTxici8+YDtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja2VkXCIsIHByaW50VG9Db25zb2xlKTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtNZXNzYWdlXCIsIHByaW50VG9Db25zb2xlKTtcbiAgcHVic3ViLm9uKFwiZ2FtZUVuZGVkXCIsIHByaW50VG9Db25zb2xlKTtcbn0pKCk7XG5cbmV4cG9ydCBjb25zdCBkcmFnQW5kRHJvcCA9IChmdW5jdGlvbiAoKSB7XG4gIGxldCBzZWxlY3RlZFBhcnRJZDtcbiAgbGV0IGhvcml6b250YWwgPSB0cnVlO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJvdGF0ZS1idG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZsZWV0XCIpLmNsYXNzTGlzdC50b2dnbGUoXCJ2ZXJ0aWNhbFwiKTtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2hpcFwiKVxuICAgICAgLmZvckVhY2goKHNoaXApID0+IHNoaXAuY2xhc3NMaXN0LnRvZ2dsZShcInZlcnRpY2FsXCIpKTtcbiAgICBob3Jpem9udGFsID0gIWhvcml6b250YWw7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZURyYWdTdGFydChlKSB7XG4gICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRHJvcChlKSB7XG4gICAgLy8gZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IHNlbGVjdGVkUGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdGVkUGFydElkKTtcbiAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2VsZWN0ZWRQYXJ0LnBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGNvbnN0IG9mZnNldCA9IHNlbGVjdGVkUGFydElkLnN1YnN0cigtMSk7XG4gICAgY29uc3QgY3VycmVudFBvcyA9IHRoaXMuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBjb25zdCBzaGlwSWQgPSBzZWxlY3RlZFBhcnQucGFyZW50Tm9kZS5pZDtcblxuICAgIGNvbnN0IG5vZGVMaXN0ID0gW107XG4gICAgY29uc3QgcGFydExpc3QgPSBbXTtcblxuICAgIGlmIChob3Jpem9udGFsKSB7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb25Sb3cgPSBjdXJyZW50UG9zLnN1YnN0cigwLCAxKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbkNvbCA9IHBhcnNlSW50KGN1cnJlbnRQb3Muc3Vic3RyKC0xKSkgLSBvZmZzZXQ7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIGBbZGF0YS1wb3NpdGlvbj0ke2hlYWRQb3NpdGlvblJvdyArIChoZWFkUG9zaXRpb25Db2wgKyBpKX1dYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICBjb25zdCBwYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFydElkKTtcbiAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeENvb3JkID0gdXRpbHMueDtcbiAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvblJvd0luZGV4ID0geENvb3JkLmluZGV4T2YoY3VycmVudFBvcy5zdWJzdHIoMCwgMSkpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uUm93SW5kZXggPSBjdXJyZW50UG9zaXRpb25Sb3dJbmRleCAtIG9mZnNldDtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbkNvbCA9IGN1cnJlbnRQb3Muc3Vic3RyKC0xKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgcm93ID0geENvb3JkW2hlYWRQb3NpdGlvblJvd0luZGV4ICsgaV07XG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIGBbZGF0YS1wb3NpdGlvbj0ke3JvdyArIGhlYWRQb3NpdGlvbkNvbH1dYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICBjb25zdCBwYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFydElkKTtcbiAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYWxsTm9kZXNPcGVuID0gbm9kZUxpc3QuZXZlcnkoKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIHJldHVybiAhWy4uLm5vZGUuY2xhc3NMaXN0XS5pbmNsdWRlcyhcIm9jY3VwaWVkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChhbGxOb2Rlc09wZW4pIHtcbiAgICAgIG5vZGVMaXN0LmZvckVhY2goKG5vZGUsIGkpID0+IHtcbiAgICAgICAgaWYgKHBhcnRMaXN0W2ldKSB7XG4gICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChwYXJ0TGlzdFtpXSk7XG4gICAgICAgICAgLy8gbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBoYW5kbGVEcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBub2RlTGlzdC5tYXAoKG5vZGUpID0+IG5vZGUuZGF0YXNldC5wb3NpdGlvbik7XG4gICAgICBwdWJzdWIuZW1pdChcInNoaXBQb3NpdGlvbmVkXCIsIHBvc2l0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZURyYWdPdmVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGREcmFnTGlzdGVuZXJzKCkge1xuICAgIGNvbnN0IHNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpO1xuICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgIHNoaXAuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCBoYW5kbGVEcmFnU3RhcnQpO1xuICAgICAgc2hpcC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgaGFuZGxlRHJhZ092ZXIpO1xuICAgICAgc2hpcC5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcIm1vdXNlZG93blwiLFxuICAgICAgICAgIChlKSA9PiAoc2VsZWN0ZWRQYXJ0SWQgPSBlLnRhcmdldC5pZClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuICBhZGREcmFnTGlzdGVuZXJzKCk7XG5cbiAgbGV0IGZsZWV0SHRtbDtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgXCJsb2FkXCIsXG4gICAgKCkgPT4gKGZsZWV0SHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmxlZXRcIikub3V0ZXJIVE1MKVxuICApO1xuXG4gIGNvbnN0IHJlc2V0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXNldC1idG5cIik7XG4gIHJlc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5vdXRlckhUTUwgPSBmbGVldEh0bWw7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG4gICAgY29uc3QgdmVydGljYWxJdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmVydGljYWxcIik7XG4gICAgaWYgKHZlcnRpY2FsSXRlbXMpIHtcbiAgICAgIHZlcnRpY2FsSXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwidmVydGljYWxcIikpO1xuICAgICAgaG9yaXpvbnRhbCA9IHRydWU7XG4gICAgfVxuICAgIGFkZERyYWdMaXN0ZW5lcnMoKTtcbiAgICBwdWJzdWIuZW1pdChcImJvYXJkUmVzZXRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnBsYXllci5zcXVhcmVcIik7XG4gIHNxdWFyZXMuZm9yRWFjaCgoc3F1YXJlKSA9PiB7XG4gICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG4gICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGhhbmRsZURyb3ApO1xuICB9KTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVib2FyZCh0eXBlID0gXCJwbGF5ZXJcIikge1xuICBjb25zdCBib2FyZCA9IHt9O1xuICBjb25zdCBzaGlwcyA9IFtdO1xuXG4gIGNvbnN0IHhDb29yZCA9IHV0aWxzLng7XG4gIGNvbnN0IHlDb29yZCA9IHV0aWxzLnk7XG4gIGNvbnN0IGdyaWRDb29yZHMgPSB4Q29vcmQubWFwKCh4KSA9PiB7XG4gICAgcmV0dXJuIHlDb29yZC5tYXAoKHkpID0+IHggKyB5KTtcbiAgfSk7XG4gIGdyaWRDb29yZHMuZm9yRWFjaCgocm93KSA9PlxuICAgIHJvdy5mb3JFYWNoKChwb3NpdGlvbikgPT4gKGJvYXJkW3Bvc2l0aW9uXSA9IG51bGwpKVxuICApO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwLCBwb3NpdGlvbnMgPSBbXSkgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbnNBdmFpbGFibGUgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAocG9zaXRpb25zQXZhaWxhYmxlKSB7XG4gICAgICAgIHNoaXAuc2V0UG9zaXRpb25zKHBvc2l0aW9ucyk7XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChjb29yZCkgPT4gKGJvYXJkW2Nvb3JkXSA9IDEpKTtcbiAgICAgICAgc2hpcHMucHVzaChzaGlwKTtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUGxhY2VkXCIsIHsgcG9zaXRpb25zLCB0eXBlIH0pO1xuICAgICAgICByZXR1cm4gc2hpcC5nZXRQb3NpdGlvbnMoKTtcbiAgICAgIH0gZWxzZSBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBwb3NpdGlvblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2hpcExlbmd0aCA9IHNoaXAuZ2V0TGVuZ3RoKCk7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb24gPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyT2Zmc2V0ID0gZGlyZWN0aW9uID09PSAwID8gLTEgOiAxO1xuICAgICAgY29uc3QgdGFyZ2V0Q29vcmQgPSBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbb3JpZW50YXRpb25dO1xuXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgIHBvc2l0aW9uc1swXSA9IGhlYWRQb3NpdGlvbjtcblxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB4Q29vcmQuaW5kZXhPZih0YXJnZXRDb29yZCk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIHhDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldICsgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geUNvb3JkLmluZGV4T2YocGFyc2VJbnQodGFyZ2V0Q29vcmQpKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzBdICsgeUNvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsbFZhbGlkID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKGFsbFZhbGlkKSB7XG4gICAgICAgIHBsYWNlU2hpcChzaGlwLCBwb3NpdGlvbnMpO1xuICAgICAgfSBlbHNlIHBsYWNlU2hpcChzaGlwKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVjZWl2ZUF0dGFjayA9IChjb29yZGluYXRlcykgPT4ge1xuICAgIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IG51bGwpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IDA7XG4gICAgICBwdWJzdWIuZW1pdChcImF0dGFja01pc3NlZFwiLCB7IGNvb3JkaW5hdGVzLCB0eXBlIH0pO1xuICAgIH0gZWxzZSBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSAxKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAtMTtcbiAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrSGl0XCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG4gICAgICBzaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGlmIChzaGlwLmlzU3VuaygpKSB7XG4gICAgICAgICAgc2hpcHMuc3BsaWNlKHNoaXBzLmluZGV4T2Yoc2hpcCksIDEpO1xuICAgICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFN1bmtcIiwgeyBzaGlwLCB0eXBlIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJvYXJkW2Nvb3JkaW5hdGVzXTtcbiAgfTtcblxuICBjb25zdCBhbGxTaGlwc1N1bmsgPSAoKSA9PiBzaGlwcy5ldmVyeSgoc2hpcCkgPT4gc2hpcC5pc1N1bmsoKSk7XG5cbiAgcmV0dXJuIHsgYm9hcmQsIHNoaXBzLCBwbGFjZVNoaXAsIHJlY2VpdmVBdHRhY2ssIGFsbFNoaXBzU3VuayB9O1xufVxuIiwiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG5cbiAgY29uc3QgYXR0YWNrID0gKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBlbmVteUJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmRpbmF0ZXMpO1xuICAgICAgY29uc29sZS5sb2coY29vcmRpbmF0ZXMpO1xuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICByZXR1cm4gb3V0Y29tZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgYXR0YWNrIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBaSgpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcbiAgY29uc3QgYWkgPSBQbGF5ZXIoKTtcblxuICBjb25zdCBhdHRhY2tpbmdBaSA9IHtcbiAgICByYW5kb21BdHRhY2s6IChlbmVteUJvYXJkKSA9PiB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgICBjb25zdCBvdXRjb21lID0gYWkuYXR0YWNrKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICAgIHJldHVybiBvdXRjb21lO1xuICAgICAgfSBlbHNlIGF0dGFja2luZ0FpLnJhbmRvbUF0dGFjayhlbmVteUJvYXJkKTtcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGFpLCBhdHRhY2tpbmdBaSk7XG59XG4iLCJleHBvcnQgY29uc3QgcHVic3ViID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZXZlbnRzID0ge307XG5cbiAgY29uc3Qgb24gPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0gfHwgW107XG4gICAgZXZlbnRzW2V2dF0ucHVzaChjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3Qgb2ZmID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdLmZpbHRlcigoY2IpID0+IGNiICE9PSBjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3QgZW1pdCA9IChldnQsIGRhdGEpID0+IHtcbiAgICBpZiAoZXZlbnRzW2V2dF0pIHtcbiAgICAgIGV2ZW50c1tldnRdLmZvckVhY2goKGNiKSA9PiBjYihkYXRhKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IG9uLCBvZmYsIGVtaXQgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFNoaXAobGVuZ3RoKSB7XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcblxuICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfTtcblxuICBjb25zdCBnZXRQb3NpdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNoaXBQb3NpdGlvbnM7XG4gIH07XG5cbiAgY29uc3Qgc2V0UG9zaXRpb25zID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zXSA9IHsgaXNIaXQ6IGZhbHNlIH07XG4gICAgfSk7XG4gIH07XG4gIGNvbnN0IF9oaXQgPSAoZGF0YSkgPT4ge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5pbmNsdWRlcyhkYXRhLmNvb3JkaW5hdGVzKSkge1xuICAgICAgc2hpcFBvc2l0aW9uc1tkYXRhLmNvb3JkaW5hdGVzXS5pc0hpdCA9IHRydWU7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tIaXRcIiwgX2hpdCk7XG5cbiAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5ldmVyeShcbiAgICAgIChrZXkpID0+IHNoaXBQb3NpdGlvbnNba2V5XS5pc0hpdCA9PT0gdHJ1ZVxuICAgICk7XG4gIH07XG4gIHJldHVybiB7IGdldExlbmd0aCwgZ2V0UG9zaXRpb25zLCBzZXRQb3NpdGlvbnMsIGlzU3VuayB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuICB4OiBbXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiSFwiLCBcIklcIiwgXCJKXCJdLFxuICB5OiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sXG5cbiAgcmFuZG9tQ29vcmRpbmF0ZXM6ICgpID0+IHtcbiAgICBjb25zdCB4SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgY29uc3QgeUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIHJldHVybiB1dGlscy54W3hJbmRleF0gKyB1dGlscy55W3lJbmRleF07XG4gIH0sXG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgR2FtZWJvYXJkIH0gZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgeyBQbGF5ZXIsIEFpIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgeyBJbnRlcmZhY2UsIGRyYWdBbmREcm9wIH0gZnJvbSBcIi4vZ2FtZVVJXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuKGZ1bmN0aW9uIEdhbWVDb250cm9sbGVyKCkge1xuICAvLyBQbGF5ZXIgYm9hcmRcbiAgbGV0IHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIGNvbnN0IGNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBiYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgZGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3Qgc3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgcGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgY29uc3QgcG9zaXRpb25TaGlwID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoID09PSA1KSB7XG4gICAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoY2FycmllciwgcG9zaXRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDQpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChiYXR0bGVzaGlwLCBwb3NpdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gMykge1xuICAgICAgaWYgKE9iamVjdC5rZXlzKGRlc3Ryb3llci5nZXRQb3NpdGlvbnMoKSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChkZXN0cm95ZXIsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxheWVyQm9hcmQucGxhY2VTaGlwKHN1Ym1hcmluZSwgcG9zaXRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChwYXRyb2xCb2F0LCBwb3NpdGlvbnMpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBvc2l0aW9uZWRcIiwgcG9zaXRpb25TaGlwKTtcblxuICBjb25zdCByYW5kb21pemVQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcblxuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChjYXJyaWVyKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoYmF0dGxlc2hpcCk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGRlc3Ryb3llcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHN1Ym1hcmluZSk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHBhdHJvbEJvYXQpO1xuICB9O1xuICBwdWJzdWIub24oXCJyYW5kb21pemVkXCIsIHJhbmRvbWl6ZVBsYWNlbWVudCk7XG5cbiAgY29uc3QgcmVzZXRCb2FyZCA9ICgpID0+IHtcbiAgICBwbGF5ZXJCb2FyZCA9IEdhbWVib2FyZCgpO1xuICB9O1xuICBwdWJzdWIub24oXCJib2FyZFJlc2V0XCIsIHJlc2V0Qm9hcmQpO1xuXG4gIC8vIEFpIGJvYXJkXG4gIGNvbnN0IGFpQm9hcmQgPSBHYW1lYm9hcmQoXCJlbmVteVwiKTtcbiAgY29uc3QgYWlDYXJyaWVyID0gU2hpcCg1KTtcbiAgY29uc3QgYWlCYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgYWlEZXN0cm95ZXIgPSBTaGlwKDMpO1xuICBjb25zdCBhaVN1Ym1hcmluZSA9IFNoaXAoMyk7XG4gIGNvbnN0IGFpUGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlDYXJyaWVyKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlCYXR0bGVzaGlwKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlEZXN0cm95ZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaVN1Ym1hcmluZSk7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpUGF0cm9sQm9hdCk7XG5cbiAgLy8gUGxheWVyc1xuICBjb25zdCBodW1hblBsYXllciA9IFBsYXllcigpO1xuICBjb25zdCBhaSA9IEFpKCk7XG5cbiAgLy8gR2FtZSBsb29wXG4gIGxldCBpc0dhbWVPdmVyID0gZmFsc2U7XG4gIGxldCB0dXJuID0gMTtcbiAgY29uc3QgcGxheWVyVHVybiA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDEpICUgMjtcblxuICBjb25zdCB0YWtlVHVybiA9IChjb29yZGluYXRlcyA9IG51bGwpID0+IHtcbiAgICBpZiAoIWlzR2FtZU92ZXIpIHtcbiAgICAgIGlmICh0dXJuICUgMiA9PT0gcGxheWVyVHVybikge1xuICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG91dGNvbWUgPSBodW1hblBsYXllci5hdHRhY2soYWlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tlZFwiLCB7IGF0dGFja2VyOiBcInBsYXllclwiLCBvdXRjb21lIH0pO1xuICAgICAgICAgICAgdHVybisrO1xuICAgICAgICAgICAgdGFrZVR1cm4oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3V0Y29tZSA9IGFpLnJhbmRvbUF0dGFjayhwbGF5ZXJCb2FyZCk7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tlZFwiLCB7IGF0dGFja2VyOiBcImVuZW15XCIsIG91dGNvbWUgfSk7XG4gICAgICAgICAgdHVybisrO1xuICAgICAgICAgIHRha2VUdXJuKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrTGF1bmNoZWRcIiwgdGFrZVR1cm4pO1xuXG4gIHB1YnN1Yi5vbihcImdhbWVTdGFydGVkXCIsIHRha2VUdXJuKTtcblxuICBjb25zdCBoYW5kbGVTaGlwU3VuayA9IChkYXRhKSA9PiB7XG4gICAgaWYgKGRhdGEudHlwZSAhPT0gXCJwbGF5ZXJcIikge1xuICAgICAgY29uc29sZS5sb2coXCJBbiBlbmVteSBzaGlwIHdhcyBzdW5rIVwiKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rTWVzc2FnZVwiLCB7IG1lc3NhZ2U6IFwiQW4gZW5lbXkgc2hpcCB3YXMgc3VuayFcIiB9KTtcbiAgICAgIH0pO1xuICAgICAgY2hlY2tXaW5uZXIoKTtcbiAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgY29uc29sZS5sb2coXCJBbiBhbGx5IHNoaXAgd2FzIHN1bmshXCIpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFN1bmtNZXNzYWdlXCIsIHsgbWVzc2FnZTogXCJBbiBhbGx5IHNoaXAgd2FzIHN1bmshXCIgfSk7XG4gICAgICB9KTtcbiAgICAgIGNoZWNrV2lubmVyKCk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwU3Vua1wiLCBoYW5kbGVTaGlwU3Vuayk7XG5cbiAgY29uc3QgY2hlY2tXaW5uZXIgPSAoKSA9PiB7XG4gICAgaWYgKHBsYXllckJvYXJkLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICBpc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcImdhbWVFbmRlZFwiLCB7IG1lc3NhZ2U6IFwiQ29tcHV0ZXIgd2lucyFcIiB9KTtcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coXCJZb3UgbG9zdCFcIik7XG4gICAgfSBlbHNlIGlmIChhaUJvYXJkLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICBpc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcImdhbWVFbmRlZFwiLCB7IG1lc3NhZ2U6IFwiUGxheWVyIHdpbnMhXCIgfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKFwiWW91IHdvbiFcIik7XG4gICAgfVxuICB9O1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==