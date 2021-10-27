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

  // let fleetHtml;
  // window.addEventListener(
  //   "load",
  //   () => (fleetHtml = document.querySelector(".fleet").outerHTML)
  // );

  // const resetBtn = document.querySelector(".reset-btn");
  // resetBtn.addEventListener("click", () => {
  //   document.querySelector(".fleet").outerHTML = fleetHtml;
  //   document
  //     .querySelectorAll(".occupied")
  //     .forEach((el) => el.classList.remove("occupied"));
  //   document.querySelectorAll(".square .ship-part").forEach((part) => {
  //     part.parentNode.removeChild(part);
  //   });
  // });

  const randomBtn = document.querySelector(".random-btn");
  randomBtn.addEventListener("click", () => {
    document.querySelectorAll(".square .ship-part").forEach((part) => {
      part.parentNode.removeChild(part);
    });

    document
      .querySelectorAll(".occupied")
      .forEach((el) => el.classList.remove("occupied"));
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("randomized", null);
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
    target.textContent = "X";
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("attackHit", markHit);

  const setPosition = (e) => {
    const position = e.target.dataset.position;
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("attackLaunched", position);
  };
  const squares = document.querySelectorAll(".enemy.square");
  squares.forEach((sq) =>
    sq.addEventListener("click", setPosition, { once: true })
  );

  document.querySelector(".start-btn").addEventListener("click", () => {
    document.querySelector("main").classList.add("start");
  });
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
    console.log(selectedPartId);
  }

  function handleDrop(e) {
    // e.preventDefault();
    const selectedPart = document.getElementById(selectedPartId);
    console.log(selectedPartId);
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

    if (nodeList.every((node) => node)) {
      nodeList.forEach((node, i) => {
        if (partList[i]) {
          node.appendChild(partList[i]);
          node.removeEventListener("drop", handleDrop);
        }
      });
      const positions = nodeList.map((node) => node.dataset.position);
      _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("shipPositioned", positions);
    }

    return false;
  }
  function handleDragOver(e) {
    // if (e.preventDefault) {
    e.preventDefault();
    // }

    // return false;
  }

  const ships = document.querySelectorAll(".ship");
  ships.forEach((ship) => {
    ship.addEventListener("dragstart", handleDragStart);
    ship.addEventListener("dragover", handleDragOver);
    ship.childNodes.forEach((node) =>
      node.addEventListener("mousedown", (e) => (selectedPartId = e.target.id))
    );
  });
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
    // pubsub.emit("boardReset", null);

    const squares = document.querySelectorAll(".player.square");
    squares.forEach((square) => {
      square.addEventListener("dragover", handleDragOver);
      square.addEventListener("drop", handleDrop);
    });
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
          console.log("ship sunk");
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
        ai.attack(enemyBoard, coordinates);
        coordsAttacked.push(coordinates);
        return coordinates;
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
  // randomizePlacement();
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("randomized", randomizePlacement);

  // const resetBoard = () => {
  //   playerBoard = Gameboard();
  // };
  // pubsub.on("boardReset", resetBoard);

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
  console.log(playerTurn);

  const takeTurn = (coordinates = null) => {
    if (!isGameOver) {
      console.log("turn" + turn);
      if (turn % 2 === playerTurn) {
        if (coordinates) {
          humanPlayer.attack(aiBoard, coordinates);
          turn++;
          takeTurn();
        }
      } else {
        ai.randomAttack(playerBoard);
        turn++;
        takeTurn();
      }
    }
  };
  takeTurn();
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("attackLaunched", takeTurn);

  const handleShipSunk = (data) => {
    if (data.type !== "player") {
      console.log("An enemy ship was sunk!");
      checkWinner();
    } else {
      console.log("An ally ship was sunk!");
      checkWinner();
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("shipSunk", handleShipSunk);

  const checkWinner = () => {
    if (playerBoard.allShipsSunk()) {
      isGameOver = true;
      console.log("You lost!");
    } else if (aiBoard.allShipsSunk()) {
      isGameOver = true;
      console.log("You won!");
    }
  };
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7O0FBRUE7QUFDQSxzQkFBc0IsK0NBQU07QUFDNUIsYUFBYSwyQ0FBRTs7QUFFZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLDhDQUFTOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZVVJLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcHVic3ViLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3V0aWxzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG5cbiAgLy8gbGV0IGZsZWV0SHRtbDtcbiAgLy8gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gIC8vICAgXCJsb2FkXCIsXG4gIC8vICAgKCkgPT4gKGZsZWV0SHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmxlZXRcIikub3V0ZXJIVE1MKVxuICAvLyApO1xuXG4gIC8vIGNvbnN0IHJlc2V0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXNldC1idG5cIik7XG4gIC8vIHJlc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIC8vICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5vdXRlckhUTUwgPSBmbGVldEh0bWw7XG4gIC8vICAgZG9jdW1lbnRcbiAgLy8gICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gIC8vICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gIC8vICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gIC8vICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gIC8vICAgfSk7XG4gIC8vIH0pO1xuXG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFuZG9tLWJ0blwiKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIub2NjdXBpZWRcIilcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9jY3VwaWVkXCIpKTtcbiAgICBwdWJzdWIuZW1pdChcInJhbmRvbWl6ZWRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTIxOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXJTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBsYXllclNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBwbGF5ZXJcIjtcbiAgICBwbGF5ZXJCb2FyZC5hcHBlbmRDaGlsZChwbGF5ZXJTcXVhcmUpO1xuXG4gICAgY29uc3QgZW5lbXlTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGVuZW15U3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlIGVuZW15XCI7XG4gICAgZW5lbXlCb2FyZC5hcHBlbmRDaGlsZChlbmVteVNxdWFyZSk7XG4gIH1cblxuICBjb25zdCB4TGFiZWxzID0gdXRpbHMueDtcbiAgY29uc3QgeUxhYmVscyA9IHV0aWxzLnk7XG5cbiAgY29uc3QgbGFiZWxCb2FyZCA9IChib2FyZENsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBjb2xMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKC1uKzExYFxuICAgICAgKSxcbiAgICBdO1xuICAgIGNvbExhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4ge1xuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSB5TGFiZWxzW2ldO1xuICAgIH0pO1xuXG4gICAgbGV0IHJvd0xhYmVscyA9IFtcbiAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIGAuJHtib2FyZENsYXNzTmFtZX0gLnNxdWFyZTpudGgtY2hpbGQoMTFuKzEpYFxuICAgICAgKSxcbiAgICBdO1xuICAgIHJvd0xhYmVsc1swXS5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgcm93TGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiB7XG4gICAgICBsYWJlbC5jbGFzc05hbWUgPSBcImxhYmVsXCI7XG4gICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHhMYWJlbHNbaV07XG4gICAgfSk7XG4gIH07XG5cbiAgbGFiZWxCb2FyZChcInBsYXllci1ib2FyZFwiKTtcbiAgbGFiZWxCb2FyZChcImVuZW15LWJvYXJkXCIpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgLnNxdWFyZTpudGgtY2hpbGQobiskezEzICsgMTEgKiBpfSk6bnRoLWNoaWxkKC1uKyR7MjIgKyAxMSAqIGl9KWBcbiAgICApO1xuICAgIHJvdy5mb3JFYWNoKChzcSwgaikgPT5cbiAgICAgIHNxLnNldEF0dHJpYnV0ZShcImRhdGEtcG9zaXRpb25cIiwgYCR7eExhYmVsc1tpXSArIHlMYWJlbHNbaiAlIDEwXX1gKVxuICAgICk7XG4gIH1cblxuICBjb25zdCBmaWxsU3F1YXJlcyA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb25zID0gZGF0YS5wb3NpdGlvbnM7XG4gICAgaWYgKGRhdGEudHlwZSkge1xuICAgICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT5cbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAucXVlcnlTZWxlY3RvcihgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uID0ke3Bvc31dYClcbiAgICAgICAgICAuY2xhc3NMaXN0LmFkZChcIm9jY3VwaWVkXCIpXG4gICAgICApO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBsYWNlZFwiLCBmaWxsU3F1YXJlcyk7XG5cbiAgY29uc3QgbWFya01pc3MgPSAoZGF0YSkgPT4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uPSR7ZGF0YS5jb29yZGluYXRlc31dYClcbiAgICAgIC5jbGFzc0xpc3QuYWRkKFwibWlzc2VkXCIpO1xuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tNaXNzZWRcIiwgbWFya01pc3MpO1xuXG4gIGNvbnN0IG1hcmtIaXQgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uPSR7ZGF0YS5jb29yZGluYXRlc31dYFxuICAgICk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJoaXRcIik7XG4gICAgdGFyZ2V0LnRleHRDb250ZW50ID0gXCJYXCI7XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja0hpdFwiLCBtYXJrSGl0KTtcblxuICBjb25zdCBzZXRQb3NpdGlvbiA9IChlKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBlLnRhcmdldC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTGF1bmNoZWRcIiwgcG9zaXRpb24pO1xuICB9O1xuICBjb25zdCBzcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5lbmVteS5zcXVhcmVcIik7XG4gIHNxdWFyZXMuZm9yRWFjaCgoc3EpID0+XG4gICAgc3EuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNldFBvc2l0aW9uLCB7IG9uY2U6IHRydWUgfSlcbiAgKTtcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnN0YXJ0LWJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJtYWluXCIpLmNsYXNzTGlzdC5hZGQoXCJzdGFydFwiKTtcbiAgfSk7XG59KSgpO1xuXG5leHBvcnQgY29uc3QgZHJhZ0FuZERyb3AgPSAoZnVuY3Rpb24gKCkge1xuICBsZXQgc2VsZWN0ZWRQYXJ0SWQ7XG4gIGxldCBob3Jpem9udGFsID0gdHJ1ZTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yb3RhdGUtYnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5jbGFzc0xpc3QudG9nZ2xlKFwidmVydGljYWxcIik7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIilcbiAgICAgIC5mb3JFYWNoKChzaGlwKSA9PiBzaGlwLmNsYXNzTGlzdC50b2dnbGUoXCJ2ZXJ0aWNhbFwiKSk7XG4gICAgaG9yaXpvbnRhbCA9ICFob3Jpem9udGFsO1xuICB9KTtcblxuICBmdW5jdGlvbiBoYW5kbGVEcmFnU3RhcnQoZSkge1xuICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSBcIm1vdmVcIjtcbiAgICBjb25zb2xlLmxvZyhzZWxlY3RlZFBhcnRJZCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVEcm9wKGUpIHtcbiAgICAvLyBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRQYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0ZWRQYXJ0SWQpO1xuICAgIGNvbnNvbGUubG9nKHNlbGVjdGVkUGFydElkKTtcbiAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2VsZWN0ZWRQYXJ0LnBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGNvbnN0IG9mZnNldCA9IHNlbGVjdGVkUGFydElkLnN1YnN0cigtMSk7XG4gICAgY29uc3QgY3VycmVudFBvcyA9IHRoaXMuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBjb25zdCBzaGlwSWQgPSBzZWxlY3RlZFBhcnQucGFyZW50Tm9kZS5pZDtcblxuICAgIGNvbnN0IG5vZGVMaXN0ID0gW107XG4gICAgY29uc3QgcGFydExpc3QgPSBbXTtcblxuICAgIGlmIChob3Jpem9udGFsKSB7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb25Sb3cgPSBjdXJyZW50UG9zLnN1YnN0cigwLCAxKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbkNvbCA9IHBhcnNlSW50KGN1cnJlbnRQb3Muc3Vic3RyKC0xKSkgLSBvZmZzZXQ7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIGBbZGF0YS1wb3NpdGlvbj0ke2hlYWRQb3NpdGlvblJvdyArIChoZWFkUG9zaXRpb25Db2wgKyBpKX1dYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICBjb25zdCBwYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFydElkKTtcbiAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeENvb3JkID0gdXRpbHMueDtcbiAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvblJvd0luZGV4ID0geENvb3JkLmluZGV4T2YoY3VycmVudFBvcy5zdWJzdHIoMCwgMSkpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uUm93SW5kZXggPSBjdXJyZW50UG9zaXRpb25Sb3dJbmRleCAtIG9mZnNldDtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbkNvbCA9IGN1cnJlbnRQb3Muc3Vic3RyKC0xKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgcm93ID0geENvb3JkW2hlYWRQb3NpdGlvblJvd0luZGV4ICsgaV07XG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIGBbZGF0YS1wb3NpdGlvbj0ke3JvdyArIGhlYWRQb3NpdGlvbkNvbH1dYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBwYXJ0SWQgPSBgJHtzaGlwSWR9LSR7aX1gO1xuICAgICAgICBjb25zdCBwYXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFydElkKTtcbiAgICAgICAgbm9kZUxpc3QucHVzaChub2RlKTtcbiAgICAgICAgcGFydExpc3QucHVzaChwYXJ0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobm9kZUxpc3QuZXZlcnkoKG5vZGUpID0+IG5vZGUpKSB7XG4gICAgICBub2RlTGlzdC5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgICAgIGlmIChwYXJ0TGlzdFtpXSkge1xuICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQocGFydExpc3RbaV0pO1xuICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgaGFuZGxlRHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgcG9zaXRpb25zID0gbm9kZUxpc3QubWFwKChub2RlKSA9PiBub2RlLmRhdGFzZXQucG9zaXRpb24pO1xuICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUG9zaXRpb25lZFwiLCBwb3NpdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVEcmFnT3ZlcihlKSB7XG4gICAgLy8gaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gfVxuXG4gICAgLy8gcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3Qgc2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIik7XG4gIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICBzaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgaGFuZGxlRHJhZ1N0YXJ0KTtcbiAgICBzaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG4gICAgc2hpcC5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+XG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IChzZWxlY3RlZFBhcnRJZCA9IGUudGFyZ2V0LmlkKSlcbiAgICApO1xuICB9KTtcbiAgbGV0IGZsZWV0SHRtbDtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgXCJsb2FkXCIsXG4gICAgKCkgPT4gKGZsZWV0SHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmxlZXRcIikub3V0ZXJIVE1MKVxuICApO1xuXG4gIGNvbnN0IHJlc2V0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXNldC1idG5cIik7XG4gIHJlc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mbGVldFwiKS5vdXRlckhUTUwgPSBmbGVldEh0bWw7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmUgLnNoaXAtcGFydFwiKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFydCk7XG4gICAgfSk7XG4gICAgY29uc3Qgc2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNoaXBcIik7XG4gICAgc2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgc2hpcC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIGhhbmRsZURyYWdTdGFydCk7XG4gICAgICBzaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG4gICAgICBzaGlwLmNoaWxkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT5cbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwibW91c2Vkb3duXCIsXG4gICAgICAgICAgKGUpID0+IChzZWxlY3RlZFBhcnRJZCA9IGUudGFyZ2V0LmlkKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuICAgIC8vIHB1YnN1Yi5lbWl0KFwiYm9hcmRSZXNldFwiLCBudWxsKTtcblxuICAgIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnBsYXllci5zcXVhcmVcIik7XG4gICAgc3F1YXJlcy5mb3JFYWNoKChzcXVhcmUpID0+IHtcbiAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgaGFuZGxlRHJhZ092ZXIpO1xuICAgICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGhhbmRsZURyb3ApO1xuICAgIH0pO1xuICB9KTtcblxuICBjb25zdCBzcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5wbGF5ZXIuc3F1YXJlXCIpO1xuICBzcXVhcmVzLmZvckVhY2goKHNxdWFyZSkgPT4ge1xuICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgaGFuZGxlRHJhZ092ZXIpO1xuICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBoYW5kbGVEcm9wKTtcbiAgfSk7XG5cbiAgLy8gY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgLy8gcGxheWVyQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgaGFuZGxlRHJvcCk7XG4gIC8vIHBsYXllckJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBoYW5kbGVEcmFnT3Zlcik7XG59KSgpO1xuIiwiaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5pbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBHYW1lYm9hcmQodHlwZSA9IFwicGxheWVyXCIpIHtcbiAgY29uc3QgYm9hcmQgPSB7fTtcbiAgY29uc3Qgc2hpcHMgPSBbXTtcblxuICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICBjb25zdCB5Q29vcmQgPSB1dGlscy55O1xuICBjb25zdCBncmlkQ29vcmRzID0geENvb3JkLm1hcCgoeCkgPT4ge1xuICAgIHJldHVybiB5Q29vcmQubWFwKCh5KSA9PiB4ICsgeSk7XG4gIH0pO1xuICBncmlkQ29vcmRzLmZvckVhY2goKHJvdykgPT5cbiAgICByb3cuZm9yRWFjaCgocG9zaXRpb24pID0+IChib2FyZFtwb3NpdGlvbl0gPSBudWxsKSlcbiAgKTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAoc2hpcCwgcG9zaXRpb25zID0gW10pID0+IHtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgcG9zaXRpb25zQXZhaWxhYmxlID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKHBvc2l0aW9uc0F2YWlsYWJsZSkge1xuICAgICAgICBzaGlwLnNldFBvc2l0aW9ucyhwb3NpdGlvbnMpO1xuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaCgoY29vcmQpID0+IChib2FyZFtjb29yZF0gPSAxKSk7XG4gICAgICAgIHNoaXBzLnB1c2goc2hpcCk7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFBsYWNlZFwiLCB7IHBvc2l0aW9ucywgdHlwZSB9KTtcbiAgICAgICAgcmV0dXJuIHNoaXAuZ2V0UG9zaXRpb25zKCk7XG4gICAgICB9IGVsc2UgY29uc29sZS5lcnJvcihcIkludmFsaWQgcG9zaXRpb25cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNoaXBMZW5ndGggPSBzaGlwLmdldExlbmd0aCgpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpck9mZnNldCA9IGRpcmVjdGlvbiA9PT0gMCA/IC0xIDogMTtcbiAgICAgIGNvbnN0IHRhcmdldENvb3JkID0gaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpW29yaWVudGF0aW9uXTtcblxuICAgICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgICBwb3NpdGlvbnNbMF0gPSBoZWFkUG9zaXRpb247XG5cbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geENvb3JkLmluZGV4T2YodGFyZ2V0Q29vcmQpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICB4Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXSArIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHlDb29yZC5pbmRleE9mKHBhcnNlSW50KHRhcmdldENvb3JkKSk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVswXSArIHlDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBhbGxWYWxpZCA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICAgIGlmIChhbGxWYWxpZCkge1xuICAgICAgICBwbGFjZVNoaXAoc2hpcCwgcG9zaXRpb25zKTtcbiAgICAgIH0gZWxzZSBwbGFjZVNoaXAoc2hpcCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlY2VpdmVBdHRhY2sgPSAoY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSBudWxsKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAwO1xuICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tNaXNzZWRcIiwgeyBjb29yZGluYXRlcywgdHlwZSB9KTtcbiAgICB9IGVsc2UgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gMSkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gLTE7XG4gICAgICBwdWJzdWIuZW1pdChcImF0dGFja0hpdFwiLCB7IGNvb3JkaW5hdGVzLCB0eXBlIH0pO1xuICAgICAgc2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBpZiAoc2hpcC5pc1N1bmsoKSkge1xuICAgICAgICAgIHNoaXBzLnNwbGljZShzaGlwcy5pbmRleE9mKHNoaXApLCAxKTtcbiAgICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rXCIsIHsgc2hpcCwgdHlwZSB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNoaXAgc3Vua1wiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBib2FyZFtjb29yZGluYXRlc107XG4gIH07XG5cbiAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4gc2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuaXNTdW5rKCkpO1xuXG4gIHJldHVybiB7IGJvYXJkLCBzaGlwcywgcGxhY2VTaGlwLCByZWNlaXZlQXR0YWNrLCBhbGxTaGlwc1N1bmsgfTtcbn1cbiIsImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUGxheWVyKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuXG4gIGNvbnN0IGF0dGFjayA9IChlbmVteUJvYXJkLCBjb29yZGluYXRlcykgPT4ge1xuICAgIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gZW5lbXlCb2FyZC5yZWNlaXZlQXR0YWNrKGNvb3JkaW5hdGVzKTtcblxuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICByZXR1cm4gb3V0Y29tZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgYXR0YWNrIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBaSgpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcbiAgY29uc3QgYWkgPSBQbGF5ZXIoKTtcblxuICBjb25zdCBhdHRhY2tpbmdBaSA9IHtcbiAgICByYW5kb21BdHRhY2s6IChlbmVteUJvYXJkKSA9PiB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgICBhaS5hdHRhY2soZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xuICAgICAgfSBlbHNlIGF0dGFja2luZ0FpLnJhbmRvbUF0dGFjayhlbmVteUJvYXJkKTtcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGFpLCBhdHRhY2tpbmdBaSk7XG59XG4iLCJleHBvcnQgY29uc3QgcHVic3ViID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZXZlbnRzID0ge307XG5cbiAgY29uc3Qgb24gPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0gfHwgW107XG4gICAgZXZlbnRzW2V2dF0ucHVzaChjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3Qgb2ZmID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdLmZpbHRlcigoY2IpID0+IGNiICE9PSBjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3QgZW1pdCA9IChldnQsIGRhdGEpID0+IHtcbiAgICBpZiAoZXZlbnRzW2V2dF0pIHtcbiAgICAgIGV2ZW50c1tldnRdLmZvckVhY2goKGNiKSA9PiBjYihkYXRhKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IG9uLCBvZmYsIGVtaXQgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFNoaXAobGVuZ3RoKSB7XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcblxuICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfTtcblxuICBjb25zdCBnZXRQb3NpdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNoaXBQb3NpdGlvbnM7XG4gIH07XG5cbiAgY29uc3Qgc2V0UG9zaXRpb25zID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zXSA9IHsgaXNIaXQ6IGZhbHNlIH07XG4gICAgfSk7XG4gIH07XG4gIGNvbnN0IF9oaXQgPSAoZGF0YSkgPT4ge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5pbmNsdWRlcyhkYXRhLmNvb3JkaW5hdGVzKSkge1xuICAgICAgc2hpcFBvc2l0aW9uc1tkYXRhLmNvb3JkaW5hdGVzXS5pc0hpdCA9IHRydWU7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tIaXRcIiwgX2hpdCk7XG5cbiAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5ldmVyeShcbiAgICAgIChrZXkpID0+IHNoaXBQb3NpdGlvbnNba2V5XS5pc0hpdCA9PT0gdHJ1ZVxuICAgICk7XG4gIH07XG4gIHJldHVybiB7IGdldExlbmd0aCwgZ2V0UG9zaXRpb25zLCBzZXRQb3NpdGlvbnMsIGlzU3VuayB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuICB4OiBbXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiSFwiLCBcIklcIiwgXCJKXCJdLFxuICB5OiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sXG5cbiAgcmFuZG9tQ29vcmRpbmF0ZXM6ICgpID0+IHtcbiAgICBjb25zdCB4SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgY29uc3QgeUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIHJldHVybiB1dGlscy54W3hJbmRleF0gKyB1dGlscy55W3lJbmRleF07XG4gIH0sXG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgR2FtZWJvYXJkIH0gZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgeyBQbGF5ZXIsIEFpIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgeyBJbnRlcmZhY2UsIGRyYWdBbmREcm9wIH0gZnJvbSBcIi4vZ2FtZVVJXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuKGZ1bmN0aW9uIEdhbWVDb250cm9sbGVyKCkge1xuICAvLyBQbGF5ZXIgYm9hcmRcbiAgbGV0IHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIGNvbnN0IGNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBiYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgZGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3Qgc3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgcGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgY29uc3QgcG9zaXRpb25TaGlwID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoID09PSA1KSB7XG4gICAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoY2FycmllciwgcG9zaXRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDQpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChiYXR0bGVzaGlwLCBwb3NpdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gMykge1xuICAgICAgaWYgKE9iamVjdC5rZXlzKGRlc3Ryb3llci5nZXRQb3NpdGlvbnMoKSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChkZXN0cm95ZXIsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxheWVyQm9hcmQucGxhY2VTaGlwKHN1Ym1hcmluZSwgcG9zaXRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChwYXRyb2xCb2F0LCBwb3NpdGlvbnMpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBvc2l0aW9uZWRcIiwgcG9zaXRpb25TaGlwKTtcblxuICBjb25zdCByYW5kb21pemVQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcblxuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChjYXJyaWVyKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoYmF0dGxlc2hpcCk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGRlc3Ryb3llcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHN1Ym1hcmluZSk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHBhdHJvbEJvYXQpO1xuICB9O1xuICAvLyByYW5kb21pemVQbGFjZW1lbnQoKTtcbiAgcHVic3ViLm9uKFwicmFuZG9taXplZFwiLCByYW5kb21pemVQbGFjZW1lbnQpO1xuXG4gIC8vIGNvbnN0IHJlc2V0Qm9hcmQgPSAoKSA9PiB7XG4gIC8vICAgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgLy8gfTtcbiAgLy8gcHVic3ViLm9uKFwiYm9hcmRSZXNldFwiLCByZXNldEJvYXJkKTtcblxuICAvLyBBaSBib2FyZFxuICBjb25zdCBhaUJvYXJkID0gR2FtZWJvYXJkKFwiZW5lbXlcIik7XG4gIGNvbnN0IGFpQ2FycmllciA9IFNoaXAoNSk7XG4gIGNvbnN0IGFpQmF0dGxlc2hpcCA9IFNoaXAoNCk7XG4gIGNvbnN0IGFpRGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3QgYWlTdWJtYXJpbmUgPSBTaGlwKDMpO1xuICBjb25zdCBhaVBhdHJvbEJvYXQgPSBTaGlwKDIpO1xuXG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpQ2Fycmllcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpQmF0dGxlc2hpcCk7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpRGVzdHJveWVyKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlTdWJtYXJpbmUpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaVBhdHJvbEJvYXQpO1xuXG4gIC8vIFBsYXllcnNcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBQbGF5ZXIoKTtcbiAgY29uc3QgYWkgPSBBaSgpO1xuXG4gIC8vIEdhbWUgbG9vcFxuICBsZXQgaXNHYW1lT3ZlciA9IGZhbHNlO1xuICBsZXQgdHVybiA9IDE7XG4gIGNvbnN0IHBsYXllclR1cm4gPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAxKSAlIDI7XG4gIGNvbnNvbGUubG9nKHBsYXllclR1cm4pO1xuXG4gIGNvbnN0IHRha2VUdXJuID0gKGNvb3JkaW5hdGVzID0gbnVsbCkgPT4ge1xuICAgIGlmICghaXNHYW1lT3Zlcikge1xuICAgICAgY29uc29sZS5sb2coXCJ0dXJuXCIgKyB0dXJuKTtcbiAgICAgIGlmICh0dXJuICUgMiA9PT0gcGxheWVyVHVybikge1xuICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICBodW1hblBsYXllci5hdHRhY2soYWlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgIHR1cm4rKztcbiAgICAgICAgICB0YWtlVHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhaS5yYW5kb21BdHRhY2socGxheWVyQm9hcmQpO1xuICAgICAgICB0dXJuKys7XG4gICAgICAgIHRha2VUdXJuKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICB0YWtlVHVybigpO1xuICBwdWJzdWIub24oXCJhdHRhY2tMYXVuY2hlZFwiLCB0YWtlVHVybik7XG5cbiAgY29uc3QgaGFuZGxlU2hpcFN1bmsgPSAoZGF0YSkgPT4ge1xuICAgIGlmIChkYXRhLnR5cGUgIT09IFwicGxheWVyXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQW4gZW5lbXkgc2hpcCB3YXMgc3VuayFcIik7XG4gICAgICBjaGVja1dpbm5lcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkFuIGFsbHkgc2hpcCB3YXMgc3VuayFcIik7XG4gICAgICBjaGVja1dpbm5lcigpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtcIiwgaGFuZGxlU2hpcFN1bmspO1xuXG4gIGNvbnN0IGNoZWNrV2lubmVyID0gKCkgPT4ge1xuICAgIGlmIChwbGF5ZXJCb2FyZC5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgaXNHYW1lT3ZlciA9IHRydWU7XG4gICAgICBjb25zb2xlLmxvZyhcIllvdSBsb3N0IVwiKTtcbiAgICB9IGVsc2UgaWYgKGFpQm9hcmQuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgIGlzR2FtZU92ZXIgPSB0cnVlO1xuICAgICAgY29uc29sZS5sb2coXCJZb3Ugd29uIVwiKTtcbiAgICB9XG4gIH07XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9