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
  const shipsSunk = [];

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
      console.log(coordinates);
      ships.forEach((ship) => {
        if (ship.isSunk()) {
          console.log(ship.getPositions());
          shipsSunk.push(...ships.splice(ships.indexOf(ship), 1));
          _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipSunk", { ship, type });
        }
      });
    }
    return board[coordinates];
  };

  // const allShipsSunk = () => ships.every((ship) => ship.isSunk());
  const allShipsSunk = () => shipsSunk.length === 5;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSw4Q0FBUzs7QUFFWDtBQUNBLGtCQUFrQixxREFBUztBQUMzQjtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQSxrQkFBa0IscURBQVM7QUFDM0Isb0JBQW9CLDJDQUFJO0FBQ3hCLHVCQUF1QiwyQ0FBSTtBQUMzQixzQkFBc0IsMkNBQUk7QUFDMUIsc0JBQXNCLDJDQUFJO0FBQzFCLHVCQUF1QiwyQ0FBSTs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQiwrQ0FBTTtBQUM1QixhQUFhLDJDQUFFOztBQUVmO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksZ0RBQVcsZUFBZSw2QkFBNkI7QUFDbkU7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EsVUFBVSxnREFBVyxlQUFlLDRCQUE0QjtBQUNoRTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVgsRUFBRSw4Q0FBUzs7QUFFWDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGdEQUFXLHNCQUFzQixvQ0FBb0M7QUFDN0UsT0FBTztBQUNQO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsUUFBUSxnREFBVyxzQkFBc0IsbUNBQW1DO0FBQzVFLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxFQUFFLDhDQUFTOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxnREFBVyxnQkFBZ0IsMkJBQTJCO0FBQzlELE9BQU87QUFDUCxNQUFNO0FBQ047QUFDQTtBQUNBLFFBQVEsZ0RBQVcsZ0JBQWdCLHlCQUF5QjtBQUM1RCxPQUFPO0FBQ1A7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVVSS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3B1YnN1Yi5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGNvbnN0IEludGVyZmFjZSA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHBsYXllckJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXItYm9hcmRcIik7XG4gIGNvbnN0IGVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmVuZW15LWJvYXJkXCIpO1xuICBjb25zdCB0ZXh0Q29uc29sZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29uc29sZVwiKTtcblxuICBjb25zdCByYW5kb21CdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJhbmRvbS1idG5cIik7XG4gIHJhbmRvbUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3F1YXJlIC5zaGlwLXBhcnRcIikuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBhcnQpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpLmZvckVhY2goKHNoaXApID0+IChzaGlwLmlubmVySFRNTCA9IFwiXCIpKTtcblxuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5vY2N1cGllZFwiKVxuICAgICAgLmZvckVhY2goKGVsKSA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKFwib2NjdXBpZWRcIikpO1xuICAgIHB1YnN1Yi5lbWl0KFwicmFuZG9taXplZFwiLCBudWxsKTtcbiAgICBzdGFydEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICB9KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyMTsgaSsrKSB7XG4gICAgY29uc3QgcGxheWVyU3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBwbGF5ZXJTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmUgcGxheWVyXCI7XG4gICAgcGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyU3F1YXJlKTtcblxuICAgIGNvbnN0IGVuZW15U3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlbmVteVNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBlbmVteVwiO1xuICAgIGVuZW15Qm9hcmQuYXBwZW5kQ2hpbGQoZW5lbXlTcXVhcmUpO1xuICB9XG5cbiAgY29uc3QgeExhYmVscyA9IHV0aWxzLng7XG4gIGNvbnN0IHlMYWJlbHMgPSB1dGlscy55O1xuXG4gIGNvbnN0IGxhYmVsQm9hcmQgPSAoYm9hcmRDbGFzc05hbWUpID0+IHtcbiAgICBsZXQgY29sTGFiZWxzID0gW1xuICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYC4ke2JvYXJkQ2xhc3NOYW1lfSAuc3F1YXJlOm50aC1jaGlsZCgtbisxMWBcbiAgICAgICksXG4gICAgXTtcbiAgICBjb2xMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IHtcbiAgICAgIGxhYmVsLmNsYXNzTmFtZSA9IFwibGFiZWxcIjtcbiAgICAgIGxhYmVsLnRleHRDb250ZW50ID0geUxhYmVsc1tpXSArIDE7XG4gICAgfSk7XG5cbiAgICBsZXQgcm93TGFiZWxzID0gW1xuICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYC4ke2JvYXJkQ2xhc3NOYW1lfSAuc3F1YXJlOm50aC1jaGlsZCgxMW4rMSlgXG4gICAgICApLFxuICAgIF07XG4gICAgcm93TGFiZWxzWzBdLmNsYXNzTmFtZSA9IFwibGFiZWxcIjtcbiAgICByb3dMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IHtcbiAgICAgIGxhYmVsLmNsYXNzTmFtZSA9IFwibGFiZWxcIjtcbiAgICAgIGxhYmVsLnRleHRDb250ZW50ID0geExhYmVsc1tpXTtcbiAgICB9KTtcbiAgfTtcblxuICBsYWJlbEJvYXJkKFwicGxheWVyLWJvYXJkXCIpO1xuICBsYWJlbEJvYXJkKFwiZW5lbXktYm9hcmRcIik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIGAuc3F1YXJlOm50aC1jaGlsZChuKyR7MTMgKyAxMSAqIGl9KTpudGgtY2hpbGQoLW4rJHsyMiArIDExICogaX0pYFxuICAgICk7XG4gICAgcm93LmZvckVhY2goKHNxLCBqKSA9PlxuICAgICAgc3Euc2V0QXR0cmlidXRlKFwiZGF0YS1wb3NpdGlvblwiLCBgJHt4TGFiZWxzW2ldICsgeUxhYmVsc1tqICUgMTBdfWApXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGZpbGxTcXVhcmVzID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBkYXRhLnBvc2l0aW9ucztcbiAgICBpZiAoZGF0YS50eXBlID09PSBcInBsYXllclwiKSB7XG4gICAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PlxuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKGAucGxheWVyW2RhdGEtcG9zaXRpb24gPSR7cG9zfV1gKVxuICAgICAgICAgIC5jbGFzc0xpc3QuYWRkKFwib2NjdXBpZWRcIilcbiAgICAgICk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUGxhY2VkXCIsIGZpbGxTcXVhcmVzKTtcblxuICBjb25zdCBtYXJrTWlzcyA9IChkYXRhKSA9PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb249JHtkYXRhLmNvb3JkaW5hdGVzfV1gKVxuICAgICAgLmNsYXNzTGlzdC5hZGQoXCJtaXNzZWRcIik7XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja01pc3NlZFwiLCBtYXJrTWlzcyk7XG5cbiAgY29uc3QgbWFya0hpdCA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb249JHtkYXRhLmNvb3JkaW5hdGVzfV1gXG4gICAgKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZChcImhpdFwiKTtcbiAgICB0YXJnZXQuaW5uZXJIVE1MID0gXCImIzEwMDA2O1wiO1xuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tIaXRcIiwgbWFya0hpdCk7XG5cbiAgY29uc3QgYXR0YWNrUG9zaXRpb24gPSAoZSkgPT4ge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gZS50YXJnZXQuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBwdWJzdWIuZW1pdChcImF0dGFja0xhdW5jaGVkXCIsIHBvc2l0aW9uKTtcbiAgfTtcbiAgY29uc3Qgc3F1YXJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZW5lbXkuc3F1YXJlXCIpO1xuICBzcXVhcmVzLmZvckVhY2goKHNxKSA9PlxuICAgIHNxLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhdHRhY2tQb3NpdGlvbiwgeyBvbmNlOiB0cnVlIH0pXG4gICk7XG5cbiAgY29uc3Qgc3RhcnRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnN0YXJ0LWJ0blwiKTtcbiAgc3RhcnRCdG4uZGlzYWJsZWQgPSB0cnVlO1xuICBzdGFydEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJtYWluXCIpLmNsYXNzTGlzdC5hZGQoXCJzdGFydFwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJvYXJkc1wiKS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBcIjBcIjtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbmZpZ1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcbiAgICBlbmVteUJvYXJkLnN0eWxlLmRpc3BsYXkgPSBcImdyaWRcIjtcbiAgICB0ZXh0Q29uc29sZS5jbGFzc0xpc3QuYWRkKFwic2hvd1wiKTtcbiAgICBwdWJzdWIuZW1pdChcImdhbWVTdGFydGVkXCIsIG51bGwpO1xuICB9KTtcblxuICBjb25zdCBjaGVja0dhbWVTdGFydCA9ICgpID0+IHtcbiAgICBjb25zdCBzaGlwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2hpcFwiKTtcbiAgICBpZiAoWy4uLnNoaXBzXS5ldmVyeSgoc2hpcCkgPT4gc2hpcC5jaGlsZHJlbi5sZW5ndGggPT09IDApKSB7XG4gICAgICBzdGFydEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBvc2l0aW9uZWRcIiwgY2hlY2tHYW1lU3RhcnQpO1xuXG4gIGNvbnN0IHByaW50VG9Db25zb2xlID0gKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YS5hdHRhY2tlcikge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGRhdGEub3V0Y29tZSA9PT0gLTEgPyBcImhpdFwiIDogXCJtaXNzXCI7XG4gICAgICB0ZXh0Q29uc29sZS5pbm5lckhUTUwgKz0gYFRoZSAke2RhdGEuYXR0YWNrZXJ9IGxhdW5jaGVkIGFuIGF0dGFjay4gSXQncyBhICR7b3V0Y29tZX0hPGJyLz5gO1xuICAgIH0gZWxzZSBpZiAoZGF0YS5tZXNzYWdlKSB7XG4gICAgICB0ZXh0Q29uc29sZS5pbm5lckhUTUwgKz0gYCR7ZGF0YS5tZXNzYWdlfTxici8+YDtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja2VkXCIsIHByaW50VG9Db25zb2xlKTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtNZXNzYWdlXCIsIHByaW50VG9Db25zb2xlKTtcbiAgcHVic3ViLm9uKFwiZ2FtZUVuZGVkXCIsIHByaW50VG9Db25zb2xlKTtcblxuICBjb25zdCBkaXNwbGF5RW5kU2NyZWVuID0gKGRhdGEpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRpc3BsYXktb3ZlcmxheVwiKS5jbGFzc0xpc3QuYWRkKFwidmlzaWJsZVwiKTtcbiAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBkYXRhLm1lc3NhZ2U7XG5cbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIucmVzdGFydC1idG5cIilcbiAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpKTtcbiAgfTtcbiAgcHVic3ViLm9uKFwiZ2FtZUVuZGVkXCIsIGRpc3BsYXlFbmRTY3JlZW4pO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGRyYWdBbmREcm9wID0gKGZ1bmN0aW9uICgpIHtcbiAgbGV0IHNlbGVjdGVkUGFydElkO1xuICBsZXQgaG9yaXpvbnRhbCA9IHRydWU7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucm90YXRlLWJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmxlZXRcIikuY2xhc3NMaXN0LnRvZ2dsZShcInZlcnRpY2FsXCIpO1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpXG4gICAgICAuZm9yRWFjaCgoc2hpcCkgPT4gc2hpcC5jbGFzc0xpc3QudG9nZ2xlKFwidmVydGljYWxcIikpO1xuICAgIGhvcml6b250YWwgPSAhaG9yaXpvbnRhbDtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlRHJhZ1N0YXJ0KGUpIHtcbiAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJtb3ZlXCI7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVEcm9wKGUpIHtcbiAgICBjb25zdCBzZWxlY3RlZFBhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RlZFBhcnRJZCk7XG4gICAgaWYgKHNlbGVjdGVkUGFydCkge1xuICAgICAgY29uc3Qgc2hpcExlbmd0aCA9IHNlbGVjdGVkUGFydC5wYXJlbnROb2RlLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgIGNvbnN0IG9mZnNldCA9IHNlbGVjdGVkUGFydElkLnN1YnN0cigtMSk7XG4gICAgICBjb25zdCBzaGlwSWQgPSBzZWxlY3RlZFBhcnQucGFyZW50Tm9kZS5pZDtcblxuICAgICAgY29uc3QgY3VycmVudFBvcyA9IHRoaXMuZGF0YXNldC5wb3NpdGlvbjtcblxuICAgICAgY29uc3Qgbm9kZUxpc3QgPSBbXTtcbiAgICAgIGNvbnN0IHBhcnRMaXN0ID0gW107XG5cbiAgICAgIGlmIChob3Jpem9udGFsKSB7XG4gICAgICAgIGNvbnN0IGhlYWRQb3NpdGlvblJvdyA9IGN1cnJlbnRQb3Muc3Vic3RyKDAsIDEpO1xuICAgICAgICBjb25zdCBoZWFkUG9zaXRpb25Db2wgPSBwYXJzZUludChjdXJyZW50UG9zLnN1YnN0cigtMSkpIC0gb2Zmc2V0O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICBgW2RhdGEtcG9zaXRpb249JHtoZWFkUG9zaXRpb25Sb3cgKyAoaGVhZFBvc2l0aW9uQ29sICsgaSl9XWBcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IHBhcnRJZCA9IGAke3NoaXBJZH0tJHtpfWA7XG4gICAgICAgICAgY29uc3QgcGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcnRJZCk7XG4gICAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgICBwYXJ0TGlzdC5wdXNoKHBhcnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICAgICAgICBjb25zdCBjdXJyZW50UG9zaXRpb25Sb3dJbmRleCA9IHhDb29yZC5pbmRleE9mKGN1cnJlbnRQb3Muc3Vic3RyKDAsIDEpKTtcbiAgICAgICAgY29uc3QgaGVhZFBvc2l0aW9uUm93SW5kZXggPSBjdXJyZW50UG9zaXRpb25Sb3dJbmRleCAtIG9mZnNldDtcbiAgICAgICAgY29uc3QgaGVhZFBvc2l0aW9uQ29sID0gY3VycmVudFBvcy5zdWJzdHIoLTEpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3Qgcm93ID0geENvb3JkW2hlYWRQb3NpdGlvblJvd0luZGV4ICsgaV07XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICBgW2RhdGEtcG9zaXRpb249JHtyb3cgKyBoZWFkUG9zaXRpb25Db2x9XWBcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IHBhcnRJZCA9IGAke3NoaXBJZH0tJHtpfWA7XG4gICAgICAgICAgY29uc3QgcGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcnRJZCk7XG4gICAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgICBwYXJ0TGlzdC5wdXNoKHBhcnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBhbGxOb2Rlc09wZW4gPSBub2RlTGlzdC5ldmVyeSgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgIHJldHVybiAhWy4uLm5vZGUuY2xhc3NMaXN0XS5pbmNsdWRlcyhcIm9jY3VwaWVkXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChhbGxOb2Rlc09wZW4pIHtcbiAgICAgICAgbm9kZUxpc3QuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgICAgICAgIGlmIChwYXJ0TGlzdFtpXSkge1xuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChwYXJ0TGlzdFtpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gbm9kZUxpc3QubWFwKChub2RlKSA9PiBub2RlLmRhdGFzZXQucG9zaXRpb24pO1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBQb3NpdGlvbmVkXCIsIHBvc2l0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gaGFuZGxlRHJhZ092ZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZERyYWdMaXN0ZW5lcnMoKSB7XG4gICAgY29uc3Qgc2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIik7XG4gICAgc2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgc2hpcC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIGhhbmRsZURyYWdTdGFydCk7XG4gICAgICBzaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG4gICAgICBzaGlwLmNoaWxkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT5cbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwibW91c2Vkb3duXCIsXG4gICAgICAgICAgKGUpID0+IChzZWxlY3RlZFBhcnRJZCA9IGUudGFyZ2V0LmlkKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuICB9XG4gIGFkZERyYWdMaXN0ZW5lcnMoKTtcblxuICBsZXQgZmxlZXRIdG1sO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICBcImxvYWRcIixcbiAgICAoKSA9PiAoZmxlZXRIdG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5vdXRlckhUTUwpXG4gICk7XG5cbiAgY29uc3QgcmVzZXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJlc2V0LWJ0blwiKTtcbiAgcmVzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnN0YXJ0LWJ0blwiKS5kaXNhYmxlZCA9IHRydWU7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5vdXRlckhUTUwgPSBmbGVldEh0bWw7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG4gICAgY29uc3QgdmVydGljYWxJdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmVydGljYWxcIik7XG4gICAgaWYgKHZlcnRpY2FsSXRlbXMpIHtcbiAgICAgIHZlcnRpY2FsSXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwidmVydGljYWxcIikpO1xuICAgICAgaG9yaXpvbnRhbCA9IHRydWU7XG4gICAgfVxuICAgIGFkZERyYWdMaXN0ZW5lcnMoKTtcbiAgICBwdWJzdWIuZW1pdChcImJvYXJkUmVzZXRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnBsYXllci5zcXVhcmVcIik7XG4gIHNxdWFyZXMuZm9yRWFjaCgoc3F1YXJlKSA9PiB7XG4gICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG4gICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGhhbmRsZURyb3ApO1xuICB9KTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVib2FyZCh0eXBlID0gXCJwbGF5ZXJcIikge1xuICBjb25zdCBib2FyZCA9IHt9O1xuICBjb25zdCBzaGlwcyA9IFtdO1xuICBjb25zdCBzaGlwc1N1bmsgPSBbXTtcblxuICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICBjb25zdCB5Q29vcmQgPSB1dGlscy55O1xuICBjb25zdCBncmlkQ29vcmRzID0geENvb3JkLm1hcCgoeCkgPT4ge1xuICAgIHJldHVybiB5Q29vcmQubWFwKCh5KSA9PiB4ICsgeSk7XG4gIH0pO1xuICBncmlkQ29vcmRzLmZvckVhY2goKHJvdykgPT5cbiAgICByb3cuZm9yRWFjaCgocG9zaXRpb24pID0+IChib2FyZFtwb3NpdGlvbl0gPSBudWxsKSlcbiAgKTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAoc2hpcCwgcG9zaXRpb25zID0gW10pID0+IHtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgcG9zaXRpb25zQXZhaWxhYmxlID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKHBvc2l0aW9uc0F2YWlsYWJsZSkge1xuICAgICAgICBzaGlwLnNldFBvc2l0aW9ucyhwb3NpdGlvbnMpO1xuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaCgoY29vcmQpID0+IChib2FyZFtjb29yZF0gPSAxKSk7XG4gICAgICAgIHNoaXBzLnB1c2goc2hpcCk7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFBsYWNlZFwiLCB7IHBvc2l0aW9ucywgdHlwZSB9KTtcbiAgICAgICAgcmV0dXJuIHNoaXAuZ2V0UG9zaXRpb25zKCk7XG4gICAgICB9IGVsc2UgY29uc29sZS5lcnJvcihcIkludmFsaWQgcG9zaXRpb25cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNoaXBMZW5ndGggPSBzaGlwLmdldExlbmd0aCgpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpck9mZnNldCA9IGRpcmVjdGlvbiA9PT0gMCA/IC0xIDogMTtcbiAgICAgIGNvbnN0IHRhcmdldENvb3JkID0gaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpW29yaWVudGF0aW9uXTtcblxuICAgICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgICBwb3NpdGlvbnNbMF0gPSBoZWFkUG9zaXRpb247XG5cbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geENvb3JkLmluZGV4T2YodGFyZ2V0Q29vcmQpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICB4Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXSArIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHlDb29yZC5pbmRleE9mKHBhcnNlSW50KHRhcmdldENvb3JkKSk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVswXSArIHlDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBhbGxWYWxpZCA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICAgIGlmIChhbGxWYWxpZCkge1xuICAgICAgICBwbGFjZVNoaXAoc2hpcCwgcG9zaXRpb25zKTtcbiAgICAgIH0gZWxzZSBwbGFjZVNoaXAoc2hpcCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlY2VpdmVBdHRhY2sgPSAoY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSBudWxsKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAwO1xuICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tNaXNzZWRcIiwgeyBjb29yZGluYXRlcywgdHlwZSB9KTtcbiAgICB9IGVsc2UgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gMSkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gLTE7XG4gICAgICBwdWJzdWIuZW1pdChcImF0dGFja0hpdFwiLCB7IGNvb3JkaW5hdGVzLCB0eXBlIH0pO1xuICAgICAgY29uc29sZS5sb2coY29vcmRpbmF0ZXMpO1xuICAgICAgc2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBpZiAoc2hpcC5pc1N1bmsoKSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHNoaXAuZ2V0UG9zaXRpb25zKCkpO1xuICAgICAgICAgIHNoaXBzU3Vuay5wdXNoKC4uLnNoaXBzLnNwbGljZShzaGlwcy5pbmRleE9mKHNoaXApLCAxKSk7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCB7IHNoaXAsIHR5cGUgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYm9hcmRbY29vcmRpbmF0ZXNdO1xuICB9O1xuXG4gIC8vIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKTtcbiAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4gc2hpcHNTdW5rLmxlbmd0aCA9PT0gNTtcblxuICByZXR1cm4geyBib2FyZCwgc2hpcHMsIHBsYWNlU2hpcCwgcmVjZWl2ZUF0dGFjaywgYWxsU2hpcHNTdW5rIH07XG59XG4iLCJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG5cbiAgY29uc3QgYXR0YWNrID0gKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBlbmVteUJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmRpbmF0ZXMpO1xuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG5cbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBhdHRhY2sgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFpKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuICBjb25zdCBhaSA9IFBsYXllcigpO1xuXG4gIGNvbnN0IGF0dGFja2luZ0FpID0ge1xuICAgIHJhbmRvbUF0dGFjazogKGVuZW15Qm9hcmQpID0+IHtcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG5cbiAgICAgIHdoaWxlIChjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0Y29tZSA9IGFpLmF0dGFjayhlbmVteUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWksIGF0dGFja2luZ0FpKTtcbn1cbiIsImV4cG9ydCBjb25zdCBwdWJzdWIgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBldmVudHMgPSB7fTtcblxuICBjb25zdCBvbiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XSB8fCBbXTtcbiAgICBldmVudHNbZXZ0XS5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBvZmYgPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0uZmlsdGVyKChjYikgPT4gY2IgIT09IGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBlbWl0ID0gKGV2dCwgZGF0YSkgPT4ge1xuICAgIGlmIChldmVudHNbZXZ0XSkge1xuICAgICAgZXZlbnRzW2V2dF0uZm9yRWFjaCgoY2IpID0+IGNiKGRhdGEpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgb24sIG9mZiwgZW1pdCB9O1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hpcChsZW5ndGgpIHtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuXG4gIGNvbnN0IGdldExlbmd0aCA9ICgpID0+IHtcbiAgICByZXR1cm4gbGVuZ3RoO1xuICB9O1xuXG4gIGNvbnN0IGdldFBvc2l0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gc2hpcFBvc2l0aW9ucztcbiAgfTtcblxuICBjb25zdCBzZXRQb3NpdGlvbnMgPSAocG9zaXRpb25zKSA9PiB7XG4gICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT4ge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NdID0geyBpc0hpdDogZmFsc2UgfTtcbiAgICB9KTtcbiAgfTtcbiAgY29uc3QgX2hpdCA9IChkYXRhKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmluY2x1ZGVzKGRhdGEuY29vcmRpbmF0ZXMpKSB7XG4gICAgICBzaGlwUG9zaXRpb25zW2RhdGEuY29vcmRpbmF0ZXNdLmlzSGl0ID0gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja0hpdFwiLCBfaGl0KTtcblxuICBjb25zdCBpc1N1bmsgPSAoKSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmV2ZXJ5KFxuICAgICAgKGtleSkgPT4gc2hpcFBvc2l0aW9uc1trZXldLmlzSGl0ID09PSB0cnVlXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHsgZ2V0TGVuZ3RoLCBnZXRQb3NpdGlvbnMsIHNldFBvc2l0aW9ucywgaXNTdW5rIH07XG59XG4iLCJleHBvcnQgY29uc3QgdXRpbHMgPSB7XG4gIHg6IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIl0sXG4gIHk6IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcblxuICByYW5kb21Db29yZGluYXRlczogKCkgPT4ge1xuICAgIGNvbnN0IHhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICBjb25zdCB5SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgcmV0dXJuIHV0aWxzLnhbeEluZGV4XSArIHV0aWxzLnlbeUluZGV4XTtcbiAgfSxcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFNoaXAgfSBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBHYW1lYm9hcmQgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IFBsYXllciwgQWkgfSBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCB7IEludGVyZmFjZSwgZHJhZ0FuZERyb3AgfSBmcm9tIFwiLi9nYW1lVUlcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG4oZnVuY3Rpb24gR2FtZUNvbnRyb2xsZXIoKSB7XG4gIC8vIFBsYXllciBib2FyZFxuICBsZXQgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgY29uc3QgY2FycmllciA9IFNoaXAoNSk7XG4gIGNvbnN0IGJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBkZXN0cm95ZXIgPSBTaGlwKDMpO1xuICBjb25zdCBzdWJtYXJpbmUgPSBTaGlwKDMpO1xuICBjb25zdCBwYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBjb25zdCBwb3NpdGlvblNoaXAgPSAocG9zaXRpb25zKSA9PiB7XG4gICAgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDUpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChjYXJyaWVyLCBwb3NpdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gNCkge1xuICAgICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGJhdHRsZXNoaXAsIHBvc2l0aW9ucyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbnMubGVuZ3RoID09PSAzKSB7XG4gICAgICBpZiAoT2JqZWN0LmtleXMoZGVzdHJveWVyLmdldFBvc2l0aW9ucygpKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGRlc3Ryb3llciwgcG9zaXRpb25zKTtcbiAgICAgIH0gZWxzZSBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoc3VibWFyaW5lLCBwb3NpdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gMikge1xuICAgICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHBhdHJvbEJvYXQsIHBvc2l0aW9ucyk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUG9zaXRpb25lZFwiLCBwb3NpdGlvblNoaXApO1xuXG4gIGNvbnN0IHJhbmRvbWl6ZVBsYWNlbWVudCA9ICgpID0+IHtcbiAgICBwbGF5ZXJCb2FyZCA9IEdhbWVib2FyZCgpO1xuXG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGNhcnJpZXIpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChiYXR0bGVzaGlwKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoZGVzdHJveWVyKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoc3VibWFyaW5lKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAocGF0cm9sQm9hdCk7XG4gIH07XG4gIHB1YnN1Yi5vbihcInJhbmRvbWl6ZWRcIiwgcmFuZG9taXplUGxhY2VtZW50KTtcblxuICBjb25zdCByZXNldEJvYXJkID0gKCkgPT4ge1xuICAgIHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIH07XG4gIHB1YnN1Yi5vbihcImJvYXJkUmVzZXRcIiwgcmVzZXRCb2FyZCk7XG5cbiAgLy8gQWkgYm9hcmRcbiAgY29uc3QgYWlCb2FyZCA9IEdhbWVib2FyZChcImVuZW15XCIpO1xuICBjb25zdCBhaUNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBhaUJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBhaURlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IGFpU3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgYWlQYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBhaUJvYXJkLnBsYWNlU2hpcChhaUNhcnJpZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaUJhdHRsZXNoaXApO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaURlc3Ryb3llcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpU3VibWFyaW5lKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlQYXRyb2xCb2F0KTtcblxuICAvLyBQbGF5ZXJzXG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKCk7XG4gIGNvbnN0IGFpID0gQWkoKTtcblxuICAvLyBHYW1lIGxvb3BcbiAgbGV0IGlzR2FtZU92ZXIgPSBmYWxzZTtcbiAgbGV0IHR1cm4gPSAxO1xuICBjb25zdCBwbGF5ZXJUdXJuID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMSkgJSAyO1xuXG4gIGNvbnN0IHRha2VUdXJuID0gKGNvb3JkaW5hdGVzID0gbnVsbCkgPT4ge1xuICAgIGlmICghaXNHYW1lT3Zlcikge1xuICAgICAgaWYgKHR1cm4gJSAyID09PSBwbGF5ZXJUdXJuKSB7XG4gICAgICAgIGlmIChjb29yZGluYXRlcykge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3V0Y29tZSA9IGh1bWFuUGxheWVyLmF0dGFjayhhaUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICAgICAgICBwdWJzdWIuZW1pdChcImF0dGFja2VkXCIsIHsgYXR0YWNrZXI6IFwicGxheWVyXCIsIG91dGNvbWUgfSk7XG4gICAgICAgICAgICB0dXJuKys7XG4gICAgICAgICAgICB0YWtlVHVybigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBvdXRjb21lID0gYWkucmFuZG9tQXR0YWNrKHBsYXllckJvYXJkKTtcbiAgICAgICAgICBwdWJzdWIuZW1pdChcImF0dGFja2VkXCIsIHsgYXR0YWNrZXI6IFwiZW5lbXlcIiwgb3V0Y29tZSB9KTtcbiAgICAgICAgICB0dXJuKys7XG4gICAgICAgICAgdGFrZVR1cm4oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tMYXVuY2hlZFwiLCB0YWtlVHVybik7XG5cbiAgcHVic3ViLm9uKFwiZ2FtZVN0YXJ0ZWRcIiwgdGFrZVR1cm4pO1xuXG4gIGNvbnN0IGhhbmRsZVNoaXBTdW5rID0gKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YS50eXBlICE9PSBcInBsYXllclwiKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua01lc3NhZ2VcIiwgeyBtZXNzYWdlOiBcIkFuIGVuZW15IHNoaXAgd2FzIHN1bmshXCIgfSk7XG4gICAgICB9KTtcbiAgICAgIGNoZWNrV2lubmVyKCk7XG4gICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09IFwicGxheWVyXCIpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rTWVzc2FnZVwiLCB7IG1lc3NhZ2U6IFwiQW4gYWxseSBzaGlwIHdhcyBzdW5rIVwiIH0pO1xuICAgICAgfSk7XG4gICAgICBjaGVja1dpbm5lcigpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtcIiwgaGFuZGxlU2hpcFN1bmspO1xuXG4gIGNvbnN0IGNoZWNrV2lubmVyID0gKCkgPT4ge1xuICAgIGlmIChwbGF5ZXJCb2FyZC5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgaXNHYW1lT3ZlciA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJnYW1lRW5kZWRcIiwgeyBtZXNzYWdlOiBcIkNvbXB1dGVyIHdpbnMhXCIgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGFpQm9hcmQuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgIGlzR2FtZU92ZXIgPSB0cnVlO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwiZ2FtZUVuZGVkXCIsIHsgbWVzc2FnZTogXCJQbGF5ZXIgd2lucyFcIiB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=