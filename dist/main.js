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
    document.querySelector(".config").style.visibility = "hidden";
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
      console.log(data.outcome);
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
    console.log(board[coordinates]);
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
      // if(outcome === 0) {
      // pubsub.emit("attackMissed", { coordinates, type });

      // } else pubsub.emit("attackHit")
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
      // if (!coordsAttacked.includes(coordinates)) {
      //   const outcome = ai.attack(enemyBoard, coordinates);
      //   coordsAttacked.push(coordinates);
      //   console.log(outcome);
      //   return outcome;
      // } else {
      //   console.log("duplicate", coordinates);
      //   randomAttack(enemyBoard);
      // }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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c2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBjb25zdCBJbnRlcmZhY2UgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBwbGF5ZXJCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWVyLWJvYXJkXCIpO1xuICBjb25zdCBlbmVteUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5lbmVteS1ib2FyZFwiKTtcbiAgY29uc3QgdGV4dENvbnNvbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnNvbGVcIik7XG5cbiAgY29uc3QgcmFuZG9tQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yYW5kb20tYnRuXCIpO1xuICByYW5kb21CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNxdWFyZSAuc2hpcC1wYXJ0XCIpLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwYXJ0KTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2hpcFwiKS5mb3JFYWNoKChzaGlwKSA9PiAoc2hpcC5pbm5lckhUTUwgPSBcIlwiKSk7XG5cbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIub2NjdXBpZWRcIilcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9jY3VwaWVkXCIpKTtcbiAgICBwdWJzdWIuZW1pdChcInJhbmRvbWl6ZWRcIiwgbnVsbCk7XG4gICAgc3RhcnRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcbiAgfSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjE7IGkrKykge1xuICAgIGNvbnN0IHBsYXllclNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGxheWVyU3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlIHBsYXllclwiO1xuICAgIHBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclNxdWFyZSk7XG5cbiAgICBjb25zdCBlbmVteVNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZW5lbXlTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmUgZW5lbXlcIjtcbiAgICBlbmVteUJvYXJkLmFwcGVuZENoaWxkKGVuZW15U3F1YXJlKTtcbiAgfVxuXG4gIGNvbnN0IHhMYWJlbHMgPSB1dGlscy54O1xuICBjb25zdCB5TGFiZWxzID0gdXRpbHMueTtcblxuICBjb25zdCBsYWJlbEJvYXJkID0gKGJvYXJkQ2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGNvbExhYmVscyA9IFtcbiAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIGAuJHtib2FyZENsYXNzTmFtZX0gLnNxdWFyZTpudGgtY2hpbGQoLW4rMTFgXG4gICAgICApLFxuICAgIF07XG4gICAgY29sTGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiB7XG4gICAgICBsYWJlbC5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHlMYWJlbHNbaV0gKyAxO1xuICAgIH0pO1xuXG4gICAgbGV0IHJvd0xhYmVscyA9IFtcbiAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIGAuJHtib2FyZENsYXNzTmFtZX0gLnNxdWFyZTpudGgtY2hpbGQoMTFuKzEpYFxuICAgICAgKSxcbiAgICBdO1xuICAgIHJvd0xhYmVsc1swXS5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgcm93TGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiB7XG4gICAgICBsYWJlbC5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHhMYWJlbHNbaV07XG4gICAgfSk7XG4gIH07XG5cbiAgbGFiZWxCb2FyZChcInBsYXllci1ib2FyZFwiKTtcbiAgbGFiZWxCb2FyZChcImVuZW15LWJvYXJkXCIpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgLnNxdWFyZTpudGgtY2hpbGQobiskezEzICsgMTEgKiBpfSk6bnRoLWNoaWxkKC1uKyR7MjIgKyAxMSAqIGl9KWBcbiAgICApO1xuICAgIHJvdy5mb3JFYWNoKChzcSwgaikgPT5cbiAgICAgIHNxLnNldEF0dHJpYnV0ZShcImRhdGEtcG9zaXRpb25cIiwgYCR7eExhYmVsc1tpXSArIHlMYWJlbHNbaiAlIDEwXX1gKVxuICAgICk7XG4gIH1cblxuICBjb25zdCBmaWxsU3F1YXJlcyA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb25zID0gZGF0YS5wb3NpdGlvbnM7XG4gICAgaWYgKGRhdGEudHlwZSA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT5cbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAucXVlcnlTZWxlY3RvcihgLnBsYXllcltkYXRhLXBvc2l0aW9uID0ke3Bvc31dYClcbiAgICAgICAgICAuY2xhc3NMaXN0LmFkZChcIm9jY3VwaWVkXCIpXG4gICAgICApO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBsYWNlZFwiLCBmaWxsU3F1YXJlcyk7XG5cbiAgY29uc3QgbWFya01pc3MgPSAoZGF0YSkgPT4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uPSR7ZGF0YS5jb29yZGluYXRlc31dYClcbiAgICAgIC5jbGFzc0xpc3QuYWRkKFwibWlzc2VkXCIpO1xuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tNaXNzZWRcIiwgbWFya01pc3MpO1xuXG4gIGNvbnN0IG1hcmtIaXQgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uPSR7ZGF0YS5jb29yZGluYXRlc31dYFxuICAgICk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJoaXRcIik7XG4gICAgdGFyZ2V0LmlubmVySFRNTCA9IFwiJiMxMDAwNjtcIjtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrSGl0XCIsIG1hcmtIaXQpO1xuXG4gIGNvbnN0IGF0dGFja1Bvc2l0aW9uID0gKGUpID0+IHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGUudGFyZ2V0LmRhdGFzZXQucG9zaXRpb247XG4gICAgcHVic3ViLmVtaXQoXCJhdHRhY2tMYXVuY2hlZFwiLCBwb3NpdGlvbik7XG4gIH07XG4gIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmVuZW15LnNxdWFyZVwiKTtcbiAgc3F1YXJlcy5mb3JFYWNoKChzcSkgPT5cbiAgICBzcS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXR0YWNrUG9zaXRpb24sIHsgb25jZTogdHJ1ZSB9KVxuICApO1xuXG4gIGNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdGFydC1idG5cIik7XG4gIHN0YXJ0QnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibWFpblwiKS5jbGFzc0xpc3QuYWRkKFwic3RhcnRcIik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ib2FyZHNcIikuc3R5bGUucGFkZGluZ1JpZ2h0ID0gXCIwXCI7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb25maWdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgZW5lbXlCb2FyZC5zdHlsZS5kaXNwbGF5ID0gXCJncmlkXCI7XG4gICAgdGV4dENvbnNvbGUuY2xhc3NMaXN0LmFkZChcInNob3dcIik7XG4gICAgcHVic3ViLmVtaXQoXCJnYW1lU3RhcnRlZFwiLCBudWxsKTtcbiAgfSk7XG5cbiAgY29uc3QgY2hlY2tHYW1lU3RhcnQgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIik7XG4gICAgaWYgKFsuLi5zaGlwc10uZXZlcnkoKHNoaXApID0+IHNoaXAuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSkge1xuICAgICAgc3RhcnRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInNoaXBQb3NpdGlvbmVkXCIsIGNoZWNrR2FtZVN0YXJ0KTtcblxuICBjb25zdCBwcmludFRvQ29uc29sZSA9IChkYXRhKSA9PiB7XG4gICAgaWYgKGRhdGEuYXR0YWNrZXIpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBkYXRhLm91dGNvbWUgPT09IC0xID8gXCJoaXRcIiA6IFwibWlzc1wiO1xuICAgICAgY29uc29sZS5sb2coZGF0YS5vdXRjb21lKTtcbiAgICAgIHRleHRDb25zb2xlLmlubmVySFRNTCArPSBgVGhlICR7ZGF0YS5hdHRhY2tlcn0gbGF1bmNoZWQgYW4gYXR0YWNrLiBJdCdzIGEgJHtvdXRjb21lfSE8YnIvPmA7XG4gICAgfSBlbHNlIGlmIChkYXRhLm1lc3NhZ2UpIHtcbiAgICAgIHRleHRDb25zb2xlLmlubmVySFRNTCArPSBgJHtkYXRhLm1lc3NhZ2V9PGJyLz5gO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrZWRcIiwgcHJpbnRUb0NvbnNvbGUpO1xuICBwdWJzdWIub24oXCJzaGlwU3Vua01lc3NhZ2VcIiwgcHJpbnRUb0NvbnNvbGUpO1xuICBwdWJzdWIub24oXCJnYW1lRW5kZWRcIiwgcHJpbnRUb0NvbnNvbGUpO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGRyYWdBbmREcm9wID0gKGZ1bmN0aW9uICgpIHtcbiAgbGV0IHNlbGVjdGVkUGFydElkO1xuICBsZXQgaG9yaXpvbnRhbCA9IHRydWU7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucm90YXRlLWJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmxlZXRcIikuY2xhc3NMaXN0LnRvZ2dsZShcInZlcnRpY2FsXCIpO1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpXG4gICAgICAuZm9yRWFjaCgoc2hpcCkgPT4gc2hpcC5jbGFzc0xpc3QudG9nZ2xlKFwidmVydGljYWxcIikpO1xuICAgIGhvcml6b250YWwgPSAhaG9yaXpvbnRhbDtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlRHJhZ1N0YXJ0KGUpIHtcbiAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJtb3ZlXCI7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVEcm9wKGUpIHtcbiAgICAvLyBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRQYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0ZWRQYXJ0SWQpO1xuICAgIGNvbnN0IHNoaXBMZW5ndGggPSBzZWxlY3RlZFBhcnQucGFyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGg7XG4gICAgY29uc3Qgb2Zmc2V0ID0gc2VsZWN0ZWRQYXJ0SWQuc3Vic3RyKC0xKTtcbiAgICBjb25zdCBjdXJyZW50UG9zID0gdGhpcy5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGNvbnN0IHNoaXBJZCA9IHNlbGVjdGVkUGFydC5wYXJlbnROb2RlLmlkO1xuXG4gICAgY29uc3Qgbm9kZUxpc3QgPSBbXTtcbiAgICBjb25zdCBwYXJ0TGlzdCA9IFtdO1xuXG4gICAgaWYgKGhvcml6b250YWwpIHtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvblJvdyA9IGN1cnJlbnRQb3Muc3Vic3RyKDAsIDEpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uQ29sID0gcGFyc2VJbnQoY3VycmVudFBvcy5zdWJzdHIoLTEpKSAtIG9mZnNldDtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgYFtkYXRhLXBvc2l0aW9uPSR7aGVhZFBvc2l0aW9uUm93ICsgKGhlYWRQb3NpdGlvbkNvbCArIGkpfV1gXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHBhcnRJZCA9IGAke3NoaXBJZH0tJHtpfWA7XG4gICAgICAgIGNvbnN0IHBhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJ0SWQpO1xuICAgICAgICBub2RlTGlzdC5wdXNoKG5vZGUpO1xuICAgICAgICBwYXJ0TGlzdC5wdXNoKHBhcnQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICAgICAgY29uc3QgY3VycmVudFBvc2l0aW9uUm93SW5kZXggPSB4Q29vcmQuaW5kZXhPZihjdXJyZW50UG9zLnN1YnN0cigwLCAxKSk7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb25Sb3dJbmRleCA9IGN1cnJlbnRQb3NpdGlvblJvd0luZGV4IC0gb2Zmc2V0O1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uQ29sID0gY3VycmVudFBvcy5zdWJzdHIoLTEpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCByb3cgPSB4Q29vcmRbaGVhZFBvc2l0aW9uUm93SW5kZXggKyBpXTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgYFtkYXRhLXBvc2l0aW9uPSR7cm93ICsgaGVhZFBvc2l0aW9uQ29sfV1gXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHBhcnRJZCA9IGAke3NoaXBJZH0tJHtpfWA7XG4gICAgICAgIGNvbnN0IHBhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJ0SWQpO1xuICAgICAgICBub2RlTGlzdC5wdXNoKG5vZGUpO1xuICAgICAgICBwYXJ0TGlzdC5wdXNoKHBhcnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBhbGxOb2Rlc09wZW4gPSBub2RlTGlzdC5ldmVyeSgobm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuICFbLi4ubm9kZS5jbGFzc0xpc3RdLmluY2x1ZGVzKFwib2NjdXBpZWRcIik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGFsbE5vZGVzT3Blbikge1xuICAgICAgbm9kZUxpc3QuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgICAgICBpZiAocGFydExpc3RbaV0pIHtcbiAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHBhcnRMaXN0W2ldKTtcbiAgICAgICAgICAvLyBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGhhbmRsZURyb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IG5vZGVMaXN0Lm1hcCgobm9kZSkgPT4gbm9kZS5kYXRhc2V0LnBvc2l0aW9uKTtcbiAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFBvc2l0aW9uZWRcIiwgcG9zaXRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZnVuY3Rpb24gaGFuZGxlRHJhZ092ZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZERyYWdMaXN0ZW5lcnMoKSB7XG4gICAgY29uc3Qgc2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIik7XG4gICAgc2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgc2hpcC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIGhhbmRsZURyYWdTdGFydCk7XG4gICAgICBzaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG4gICAgICBzaGlwLmNoaWxkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT5cbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwibW91c2Vkb3duXCIsXG4gICAgICAgICAgKGUpID0+IChzZWxlY3RlZFBhcnRJZCA9IGUudGFyZ2V0LmlkKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuICB9XG4gIGFkZERyYWdMaXN0ZW5lcnMoKTtcblxuICBsZXQgZmxlZXRIdG1sO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICBcImxvYWRcIixcbiAgICAoKSA9PiAoZmxlZXRIdG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5vdXRlckhUTUwpXG4gICk7XG5cbiAgY29uc3QgcmVzZXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJlc2V0LWJ0blwiKTtcbiAgcmVzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnN0YXJ0LWJ0blwiKS5kaXNhYmxlZCA9IHRydWU7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5vdXRlckhUTUwgPSBmbGVldEh0bWw7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG4gICAgY29uc3QgdmVydGljYWxJdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmVydGljYWxcIik7XG4gICAgaWYgKHZlcnRpY2FsSXRlbXMpIHtcbiAgICAgIHZlcnRpY2FsSXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwidmVydGljYWxcIikpO1xuICAgICAgaG9yaXpvbnRhbCA9IHRydWU7XG4gICAgfVxuICAgIGFkZERyYWdMaXN0ZW5lcnMoKTtcbiAgICBwdWJzdWIuZW1pdChcImJvYXJkUmVzZXRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnBsYXllci5zcXVhcmVcIik7XG4gIHNxdWFyZXMuZm9yRWFjaCgoc3F1YXJlKSA9PiB7XG4gICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG4gICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGhhbmRsZURyb3ApO1xuICB9KTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVib2FyZCh0eXBlID0gXCJwbGF5ZXJcIikge1xuICBjb25zdCBib2FyZCA9IHt9O1xuICBjb25zdCBzaGlwcyA9IFtdO1xuXG4gIGNvbnN0IHhDb29yZCA9IHV0aWxzLng7XG4gIGNvbnN0IHlDb29yZCA9IHV0aWxzLnk7XG4gIGNvbnN0IGdyaWRDb29yZHMgPSB4Q29vcmQubWFwKCh4KSA9PiB7XG4gICAgcmV0dXJuIHlDb29yZC5tYXAoKHkpID0+IHggKyB5KTtcbiAgfSk7XG4gIGdyaWRDb29yZHMuZm9yRWFjaCgocm93KSA9PlxuICAgIHJvdy5mb3JFYWNoKChwb3NpdGlvbikgPT4gKGJvYXJkW3Bvc2l0aW9uXSA9IG51bGwpKVxuICApO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwLCBwb3NpdGlvbnMgPSBbXSkgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbnNBdmFpbGFibGUgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAocG9zaXRpb25zQXZhaWxhYmxlKSB7XG4gICAgICAgIHNoaXAuc2V0UG9zaXRpb25zKHBvc2l0aW9ucyk7XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChjb29yZCkgPT4gKGJvYXJkW2Nvb3JkXSA9IDEpKTtcbiAgICAgICAgc2hpcHMucHVzaChzaGlwKTtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUGxhY2VkXCIsIHsgcG9zaXRpb25zLCB0eXBlIH0pO1xuICAgICAgICByZXR1cm4gc2hpcC5nZXRQb3NpdGlvbnMoKTtcbiAgICAgIH0gZWxzZSBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBwb3NpdGlvblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2hpcExlbmd0aCA9IHNoaXAuZ2V0TGVuZ3RoKCk7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb24gPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyT2Zmc2V0ID0gZGlyZWN0aW9uID09PSAwID8gLTEgOiAxO1xuICAgICAgY29uc3QgdGFyZ2V0Q29vcmQgPSBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbb3JpZW50YXRpb25dO1xuXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgIHBvc2l0aW9uc1swXSA9IGhlYWRQb3NpdGlvbjtcblxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB4Q29vcmQuaW5kZXhPZih0YXJnZXRDb29yZCk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIHhDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldICsgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geUNvb3JkLmluZGV4T2YocGFyc2VJbnQodGFyZ2V0Q29vcmQpKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzBdICsgeUNvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsbFZhbGlkID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKGFsbFZhbGlkKSB7XG4gICAgICAgIHBsYWNlU2hpcChzaGlwLCBwb3NpdGlvbnMpO1xuICAgICAgfSBlbHNlIHBsYWNlU2hpcChzaGlwKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVjZWl2ZUF0dGFjayA9IChjb29yZGluYXRlcykgPT4ge1xuICAgIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IG51bGwpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IDA7XG4gICAgICBwdWJzdWIuZW1pdChcImF0dGFja01pc3NlZFwiLCB7IGNvb3JkaW5hdGVzLCB0eXBlIH0pO1xuICAgIH0gZWxzZSBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSAxKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAtMTtcbiAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrSGl0XCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG4gICAgICBzaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGlmIChzaGlwLmlzU3VuaygpKSB7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCB7IHNoaXAsIHR5cGUgfSk7XG4gICAgICAgICAgc2hpcHMuc3BsaWNlKHNoaXBzLmluZGV4T2Yoc2hpcCksIDEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYm9hcmRbY29vcmRpbmF0ZXNdKTtcbiAgICByZXR1cm4gYm9hcmRbY29vcmRpbmF0ZXNdO1xuICB9O1xuXG4gIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKTtcblxuICByZXR1cm4geyBib2FyZCwgc2hpcHMsIHBsYWNlU2hpcCwgcmVjZWl2ZUF0dGFjaywgYWxsU2hpcHNTdW5rIH07XG59XG4iLCJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllcigpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcblxuICBjb25zdCBhdHRhY2sgPSAoZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGVuZW15Qm9hcmQucmVjZWl2ZUF0dGFjayhjb29yZGluYXRlcyk7XG4gICAgICBjb25zb2xlLmxvZyhjb29yZGluYXRlcyk7XG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIC8vIGlmKG91dGNvbWUgPT09IDApIHtcbiAgICAgIC8vIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTWlzc2VkXCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG5cbiAgICAgIC8vIH0gZWxzZSBwdWJzdWIuZW1pdChcImF0dGFja0hpdFwiKVxuICAgICAgcmV0dXJuIG91dGNvbWU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IGF0dGFjayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWkoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG4gIGNvbnN0IGFpID0gUGxheWVyKCk7XG5cbiAgY29uc3QgYXR0YWNraW5nQWkgPSB7XG4gICAgcmFuZG9tQXR0YWNrOiAoZW5lbXlCb2FyZCkgPT4ge1xuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIC8vIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICAvLyAgIGNvbnN0IG91dGNvbWUgPSBhaS5hdHRhY2soZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgLy8gICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIC8vICAgY29uc29sZS5sb2cob3V0Y29tZSk7XG4gICAgICAvLyAgIHJldHVybiBvdXRjb21lO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coXCJkdXBsaWNhdGVcIiwgY29vcmRpbmF0ZXMpO1xuICAgICAgLy8gICByYW5kb21BdHRhY2soZW5lbXlCb2FyZCk7XG4gICAgICAvLyB9XG4gICAgICB3aGlsZSAoY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG91dGNvbWUgPSBhaS5hdHRhY2soZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICByZXR1cm4gb3V0Y29tZTtcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGFpLCBhdHRhY2tpbmdBaSk7XG59XG4iLCJleHBvcnQgY29uc3QgcHVic3ViID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZXZlbnRzID0ge307XG5cbiAgY29uc3Qgb24gPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0gfHwgW107XG4gICAgZXZlbnRzW2V2dF0ucHVzaChjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3Qgb2ZmID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdLmZpbHRlcigoY2IpID0+IGNiICE9PSBjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3QgZW1pdCA9IChldnQsIGRhdGEpID0+IHtcbiAgICBpZiAoZXZlbnRzW2V2dF0pIHtcbiAgICAgIGV2ZW50c1tldnRdLmZvckVhY2goKGNiKSA9PiBjYihkYXRhKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IG9uLCBvZmYsIGVtaXQgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFNoaXAobGVuZ3RoKSB7XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcblxuICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfTtcblxuICBjb25zdCBnZXRQb3NpdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNoaXBQb3NpdGlvbnM7XG4gIH07XG5cbiAgY29uc3Qgc2V0UG9zaXRpb25zID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zXSA9IHsgaXNIaXQ6IGZhbHNlIH07XG4gICAgfSk7XG4gIH07XG4gIGNvbnN0IF9oaXQgPSAoZGF0YSkgPT4ge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5pbmNsdWRlcyhkYXRhLmNvb3JkaW5hdGVzKSkge1xuICAgICAgc2hpcFBvc2l0aW9uc1tkYXRhLmNvb3JkaW5hdGVzXS5pc0hpdCA9IHRydWU7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tIaXRcIiwgX2hpdCk7XG5cbiAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5ldmVyeShcbiAgICAgIChrZXkpID0+IHNoaXBQb3NpdGlvbnNba2V5XS5pc0hpdCA9PT0gdHJ1ZVxuICAgICk7XG4gIH07XG4gIHJldHVybiB7IGdldExlbmd0aCwgZ2V0UG9zaXRpb25zLCBzZXRQb3NpdGlvbnMsIGlzU3VuayB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuICB4OiBbXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiSFwiLCBcIklcIiwgXCJKXCJdLFxuICB5OiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sXG5cbiAgcmFuZG9tQ29vcmRpbmF0ZXM6ICgpID0+IHtcbiAgICBjb25zdCB4SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgY29uc3QgeUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIHJldHVybiB1dGlscy54W3hJbmRleF0gKyB1dGlscy55W3lJbmRleF07XG4gIH0sXG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgR2FtZWJvYXJkIH0gZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgeyBQbGF5ZXIsIEFpIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgeyBJbnRlcmZhY2UsIGRyYWdBbmREcm9wIH0gZnJvbSBcIi4vZ2FtZVVJXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuKGZ1bmN0aW9uIEdhbWVDb250cm9sbGVyKCkge1xuICAvLyBQbGF5ZXIgYm9hcmRcbiAgbGV0IHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIGNvbnN0IGNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBiYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgZGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3Qgc3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgcGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgY29uc3QgcG9zaXRpb25TaGlwID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoID09PSA1KSB7XG4gICAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoY2FycmllciwgcG9zaXRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDQpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChiYXR0bGVzaGlwLCBwb3NpdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gMykge1xuICAgICAgaWYgKE9iamVjdC5rZXlzKGRlc3Ryb3llci5nZXRQb3NpdGlvbnMoKSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChkZXN0cm95ZXIsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxheWVyQm9hcmQucGxhY2VTaGlwKHN1Ym1hcmluZSwgcG9zaXRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChwYXRyb2xCb2F0LCBwb3NpdGlvbnMpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBvc2l0aW9uZWRcIiwgcG9zaXRpb25TaGlwKTtcblxuICBjb25zdCByYW5kb21pemVQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcblxuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChjYXJyaWVyKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoYmF0dGxlc2hpcCk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGRlc3Ryb3llcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHN1Ym1hcmluZSk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHBhdHJvbEJvYXQpO1xuICB9O1xuICBwdWJzdWIub24oXCJyYW5kb21pemVkXCIsIHJhbmRvbWl6ZVBsYWNlbWVudCk7XG5cbiAgY29uc3QgcmVzZXRCb2FyZCA9ICgpID0+IHtcbiAgICBwbGF5ZXJCb2FyZCA9IEdhbWVib2FyZCgpO1xuICB9O1xuICBwdWJzdWIub24oXCJib2FyZFJlc2V0XCIsIHJlc2V0Qm9hcmQpO1xuXG4gIC8vIEFpIGJvYXJkXG4gIGNvbnN0IGFpQm9hcmQgPSBHYW1lYm9hcmQoXCJlbmVteVwiKTtcbiAgY29uc3QgYWlDYXJyaWVyID0gU2hpcCg1KTtcbiAgY29uc3QgYWlCYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgYWlEZXN0cm95ZXIgPSBTaGlwKDMpO1xuICBjb25zdCBhaVN1Ym1hcmluZSA9IFNoaXAoMyk7XG4gIGNvbnN0IGFpUGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlDYXJyaWVyKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlCYXR0bGVzaGlwKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlEZXN0cm95ZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaVN1Ym1hcmluZSk7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpUGF0cm9sQm9hdCk7XG5cbiAgLy8gUGxheWVyc1xuICBjb25zdCBodW1hblBsYXllciA9IFBsYXllcigpO1xuICBjb25zdCBhaSA9IEFpKCk7XG5cbiAgLy8gR2FtZSBsb29wXG4gIGxldCBpc0dhbWVPdmVyID0gZmFsc2U7XG4gIGxldCB0dXJuID0gMTtcbiAgY29uc3QgcGxheWVyVHVybiA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDEpICUgMjtcblxuICBjb25zdCB0YWtlVHVybiA9IChjb29yZGluYXRlcyA9IG51bGwpID0+IHtcbiAgICBpZiAoIWlzR2FtZU92ZXIpIHtcbiAgICAgIGlmICh0dXJuICUgMiA9PT0gcGxheWVyVHVybikge1xuICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG91dGNvbWUgPSBodW1hblBsYXllci5hdHRhY2soYWlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tlZFwiLCB7IGF0dGFja2VyOiBcInBsYXllclwiLCBvdXRjb21lIH0pO1xuICAgICAgICAgICAgdHVybisrO1xuICAgICAgICAgICAgdGFrZVR1cm4oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3V0Y29tZSA9IGFpLnJhbmRvbUF0dGFjayhwbGF5ZXJCb2FyZCk7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tlZFwiLCB7IGF0dGFja2VyOiBcImVuZW15XCIsIG91dGNvbWUgfSk7XG4gICAgICAgICAgdHVybisrO1xuICAgICAgICAgIHRha2VUdXJuKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrTGF1bmNoZWRcIiwgdGFrZVR1cm4pO1xuXG4gIHB1YnN1Yi5vbihcImdhbWVTdGFydGVkXCIsIHRha2VUdXJuKTtcblxuICBjb25zdCBoYW5kbGVTaGlwU3VuayA9IChkYXRhKSA9PiB7XG4gICAgaWYgKGRhdGEudHlwZSAhPT0gXCJwbGF5ZXJcIikge1xuICAgICAgY29uc29sZS5sb2coXCJBbiBlbmVteSBzaGlwIHdhcyBzdW5rIVwiKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rTWVzc2FnZVwiLCB7IG1lc3NhZ2U6IFwiQW4gZW5lbXkgc2hpcCB3YXMgc3VuayFcIiB9KTtcbiAgICAgIH0pO1xuICAgICAgY2hlY2tXaW5uZXIoKTtcbiAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgY29uc29sZS5sb2coXCJBbiBhbGx5IHNoaXAgd2FzIHN1bmshXCIpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFN1bmtNZXNzYWdlXCIsIHsgbWVzc2FnZTogXCJBbiBhbGx5IHNoaXAgd2FzIHN1bmshXCIgfSk7XG4gICAgICB9KTtcbiAgICAgIGNoZWNrV2lubmVyKCk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwU3Vua1wiLCBoYW5kbGVTaGlwU3Vuayk7XG5cbiAgY29uc3QgY2hlY2tXaW5uZXIgPSAoKSA9PiB7XG4gICAgaWYgKHBsYXllckJvYXJkLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICBpc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcImdhbWVFbmRlZFwiLCB7IG1lc3NhZ2U6IFwiQ29tcHV0ZXIgd2lucyFcIiB9KTtcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coXCJZb3UgbG9zdCFcIik7XG4gICAgfSBlbHNlIGlmIChhaUJvYXJkLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICBpc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdWJzdWIuZW1pdChcImdhbWVFbmRlZFwiLCB7IG1lc3NhZ2U6IFwiUGxheWVyIHdpbnMhXCIgfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKFwiWW91IHdvbiFcIik7XG4gICAgfVxuICB9O1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==