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
/* harmony export */   "Interface": () => (/* binding */ Interface)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.js");
/* harmony import */ var _pubsub__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pubsub */ "./src/pubsub.js");



const Interface = (function () {
  const playerBoard = document.querySelector(".player-board");
  const enemyBoard = document.querySelector(".enemy-board");
  const randomBtn = document.querySelector(".random-btn");
  randomBtn.addEventListener("click", () => {
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
          _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipSunk", ship);
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

  const randomizePlacement = () => {
    playerBoard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();

    playerBoard.placeShip(carrier);
    playerBoard.placeShip(battleship);
    playerBoard.placeShip(destroyer);
    playerBoard.placeShip(submarine);
    playerBoard.placeShip(patrolBoat);
  };

  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("randomized", randomizePlacement);

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

  let isGameOver = false;
  let turn = 1;
  const playerTurn = (Math.floor(Math.random() * 2) + 1) % 2;
  console.log(playerTurn);
  let isAttacking = false;

  let coordinates;

  const play = (e) => {
    coordinates = e.target.dataset.position;
    console.log(humanPlayer.attack(aiBoard, coordinates));
    takeTurn();
  };

  const takeTurn = () => {
    if (!isGameOver) {
      if (turn % 2 === playerTurn) {
        const squares = document.querySelectorAll(".enemy.square");
        squares.forEach((square) => square.addEventListener("click", play));
        turn++;
      } else {
        ai.randomAttack(playerBoard);
        turn++;
        takeTurn();
      }
    }
  };
  takeTurn();

  const announce = (ship) => {};
  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("shipSunk", announce);
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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L2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcHVic3ViLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3V0aWxzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFuZG9tLWJ0blwiKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgcHVic3ViLmVtaXQoXCJyYW5kb21pemVkXCIsIG51bGwpO1xuICB9KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyMTsgaSsrKSB7XG4gICAgY29uc3QgcGxheWVyU3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBwbGF5ZXJTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmUgcGxheWVyXCI7XG4gICAgcGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyU3F1YXJlKTtcblxuICAgIGNvbnN0IGVuZW15U3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlbmVteVNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBlbmVteVwiO1xuICAgIGVuZW15Qm9hcmQuYXBwZW5kQ2hpbGQoZW5lbXlTcXVhcmUpO1xuICB9XG5cbiAgY29uc3QgeExhYmVscyA9IHV0aWxzLng7XG4gIGNvbnN0IHlMYWJlbHMgPSB1dGlscy55O1xuXG4gIGNvbnN0IGxhYmVsQm9hcmQgPSAoYm9hcmRDbGFzc05hbWUpID0+IHtcbiAgICBsZXQgY29sTGFiZWxzID0gW1xuICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYC4ke2JvYXJkQ2xhc3NOYW1lfSAuc3F1YXJlOm50aC1jaGlsZCgtbisxMWBcbiAgICAgICksXG4gICAgXTtcbiAgICBjb2xMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IChsYWJlbC50ZXh0Q29udGVudCA9IHlMYWJlbHNbaV0pKTtcblxuICAgIGxldCByb3dMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKDExbisxKWBcbiAgICAgICksXG4gICAgXTtcbiAgICByb3dMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IChsYWJlbC50ZXh0Q29udGVudCA9IHhMYWJlbHNbaV0pKTtcbiAgfTtcblxuICBsYWJlbEJvYXJkKFwicGxheWVyLWJvYXJkXCIpO1xuICBsYWJlbEJvYXJkKFwiZW5lbXktYm9hcmRcIik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIGAuc3F1YXJlOm50aC1jaGlsZChuKyR7MTMgKyAxMSAqIGl9KTpudGgtY2hpbGQoLW4rJHsyMiArIDExICogaX0pYFxuICAgICk7XG4gICAgcm93LmZvckVhY2goKHNxLCBqKSA9PlxuICAgICAgc3Euc2V0QXR0cmlidXRlKFwiZGF0YS1wb3NpdGlvblwiLCBgJHt4TGFiZWxzW2ldICsgeUxhYmVsc1tqICUgMTBdfWApXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGZpbGxTcXVhcmVzID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBkYXRhLnBvc2l0aW9ucztcbiAgICBpZiAoZGF0YS50eXBlKSB7XG4gICAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PlxuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb24gPSR7cG9zfV1gKVxuICAgICAgICAgIC5jbGFzc0xpc3QuYWRkKFwib2NjdXBpZWRcIilcbiAgICAgICk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUGxhY2VkXCIsIGZpbGxTcXVhcmVzKTtcblxuICBjb25zdCBtYXJrTWlzcyA9IChkYXRhKSA9PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb249JHtkYXRhLmNvb3JkaW5hdGVzfV1gKVxuICAgICAgLmNsYXNzTGlzdC5hZGQoXCJtaXNzZWRcIik7XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja01pc3NlZFwiLCBtYXJrTWlzcyk7XG5cbiAgY29uc3QgbWFya0hpdCA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb249JHtkYXRhLmNvb3JkaW5hdGVzfV1gXG4gICAgKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZChcImhpdFwiKTtcbiAgICB0YXJnZXQudGV4dENvbnRlbnQgPSBcIlhcIjtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrSGl0XCIsIG1hcmtIaXQpO1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gR2FtZWJvYXJkKHR5cGUgPSBcInBsYXllclwiKSB7XG4gIGNvbnN0IGJvYXJkID0ge307XG4gIGNvbnN0IHNoaXBzID0gW107XG5cbiAgY29uc3QgeENvb3JkID0gdXRpbHMueDtcbiAgY29uc3QgeUNvb3JkID0gdXRpbHMueTtcbiAgY29uc3QgZ3JpZENvb3JkcyA9IHhDb29yZC5tYXAoKHgpID0+IHtcbiAgICByZXR1cm4geUNvb3JkLm1hcCgoeSkgPT4geCArIHkpO1xuICB9KTtcbiAgZ3JpZENvb3Jkcy5mb3JFYWNoKChyb3cpID0+XG4gICAgcm93LmZvckVhY2goKHBvc2l0aW9uKSA9PiAoYm9hcmRbcG9zaXRpb25dID0gbnVsbCkpXG4gICk7XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHNoaXAsIHBvc2l0aW9ucyA9IFtdKSA9PiB7XG4gICAgaWYgKHBvc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uc0F2YWlsYWJsZSA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICAgIGlmIChwb3NpdGlvbnNBdmFpbGFibGUpIHtcbiAgICAgICAgc2hpcC5zZXRQb3NpdGlvbnMocG9zaXRpb25zKTtcbiAgICAgICAgcG9zaXRpb25zLmZvckVhY2goKGNvb3JkKSA9PiAoYm9hcmRbY29vcmRdID0gMSkpO1xuICAgICAgICBzaGlwcy5wdXNoKHNoaXApO1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBQbGFjZWRcIiwgeyBwb3NpdGlvbnMsIHR5cGUgfSk7XG4gICAgICAgIHJldHVybiBzaGlwLmdldFBvc2l0aW9ucygpO1xuICAgICAgfSBlbHNlIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHBvc2l0aW9uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2hpcC5nZXRMZW5ndGgoKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbiA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBjb25zdCBvcmllbnRhdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJPZmZzZXQgPSBkaXJlY3Rpb24gPT09IDAgPyAtMSA6IDE7XG4gICAgICBjb25zdCB0YXJnZXRDb29yZCA9IGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVtvcmllbnRhdGlvbl07XG5cbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgcG9zaXRpb25zWzBdID0gaGVhZFBvc2l0aW9uO1xuXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob3JpZW50YXRpb24gPT09IDApIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHhDb29yZC5pbmRleE9mKHRhcmdldENvb3JkKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgeENvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV0gKyBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB5Q29vcmQuaW5kZXhPZihwYXJzZUludCh0YXJnZXRDb29yZCkpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMF0gKyB5Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgYWxsVmFsaWQgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAoYWxsVmFsaWQpIHtcbiAgICAgICAgcGxhY2VTaGlwKHNoaXAsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxhY2VTaGlwKHNoaXApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWNlaXZlQXR0YWNrID0gKGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gbnVsbCkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gMDtcbiAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTWlzc2VkXCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG4gICAgfSBlbHNlIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IDEpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IC0xO1xuICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tIaXRcIiwgeyBjb29yZGluYXRlcywgdHlwZSB9KTtcbiAgICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgaWYgKHNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICBzaGlwcy5zcGxpY2Uoc2hpcHMuaW5kZXhPZihzaGlwKSwgMSk7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCBzaGlwKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNoaXAgc3Vua1wiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBib2FyZFtjb29yZGluYXRlc107XG4gIH07XG5cbiAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4gc2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuaXNTdW5rKCkpO1xuXG4gIHJldHVybiB7IGJvYXJkLCBzaGlwcywgcGxhY2VTaGlwLCByZWNlaXZlQXR0YWNrLCBhbGxTaGlwc1N1bmsgfTtcbn1cbiIsImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUGxheWVyKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuXG4gIGNvbnN0IGF0dGFjayA9IChlbmVteUJvYXJkLCBjb29yZGluYXRlcykgPT4ge1xuICAgIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gZW5lbXlCb2FyZC5yZWNlaXZlQXR0YWNrKGNvb3JkaW5hdGVzKTtcblxuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICByZXR1cm4gb3V0Y29tZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgYXR0YWNrIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBaSgpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcbiAgY29uc3QgYWkgPSBQbGF5ZXIoKTtcblxuICBjb25zdCBhdHRhY2tpbmdBaSA9IHtcbiAgICByYW5kb21BdHRhY2s6IChlbmVteUJvYXJkKSA9PiB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgICBhaS5hdHRhY2soZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xuICAgICAgfSBlbHNlIGF0dGFja2luZ0FpLnJhbmRvbUF0dGFjayhlbmVteUJvYXJkKTtcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGFpLCBhdHRhY2tpbmdBaSk7XG59XG4iLCJleHBvcnQgY29uc3QgcHVic3ViID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZXZlbnRzID0ge307XG5cbiAgY29uc3Qgb24gPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0gfHwgW107XG4gICAgZXZlbnRzW2V2dF0ucHVzaChjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3Qgb2ZmID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdLmZpbHRlcigoY2IpID0+IGNiICE9PSBjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3QgZW1pdCA9IChldnQsIGRhdGEpID0+IHtcbiAgICBpZiAoZXZlbnRzW2V2dF0pIHtcbiAgICAgIGV2ZW50c1tldnRdLmZvckVhY2goKGNiKSA9PiBjYihkYXRhKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IG9uLCBvZmYsIGVtaXQgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFNoaXAobGVuZ3RoKSB7XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcblxuICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfTtcblxuICBjb25zdCBnZXRQb3NpdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNoaXBQb3NpdGlvbnM7XG4gIH07XG5cbiAgY29uc3Qgc2V0UG9zaXRpb25zID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zXSA9IHsgaXNIaXQ6IGZhbHNlIH07XG4gICAgfSk7XG4gIH07XG4gIGNvbnN0IF9oaXQgPSAoZGF0YSkgPT4ge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5pbmNsdWRlcyhkYXRhLmNvb3JkaW5hdGVzKSkge1xuICAgICAgc2hpcFBvc2l0aW9uc1tkYXRhLmNvb3JkaW5hdGVzXS5pc0hpdCA9IHRydWU7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tIaXRcIiwgX2hpdCk7XG5cbiAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5ldmVyeShcbiAgICAgIChrZXkpID0+IHNoaXBQb3NpdGlvbnNba2V5XS5pc0hpdCA9PT0gdHJ1ZVxuICAgICk7XG4gIH07XG4gIHJldHVybiB7IGdldExlbmd0aCwgZ2V0UG9zaXRpb25zLCBzZXRQb3NpdGlvbnMsIGlzU3VuayB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuICB4OiBbXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiSFwiLCBcIklcIiwgXCJKXCJdLFxuICB5OiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sXG5cbiAgcmFuZG9tQ29vcmRpbmF0ZXM6ICgpID0+IHtcbiAgICBjb25zdCB4SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgY29uc3QgeUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIHJldHVybiB1dGlscy54W3hJbmRleF0gKyB1dGlscy55W3lJbmRleF07XG4gIH0sXG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgR2FtZWJvYXJkIH0gZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgeyBQbGF5ZXIsIEFpIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgeyBJbnRlcmZhY2UgfSBmcm9tIFwiLi9nYW1lVUlcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG4oZnVuY3Rpb24gR2FtZUNvbnRyb2xsZXIoKSB7XG4gIC8vIFBsYXllciBib2FyZFxuICBsZXQgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgY29uc3QgY2FycmllciA9IFNoaXAoNSk7XG4gIGNvbnN0IGJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBkZXN0cm95ZXIgPSBTaGlwKDMpO1xuICBjb25zdCBzdWJtYXJpbmUgPSBTaGlwKDMpO1xuICBjb25zdCBwYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBjb25zdCByYW5kb21pemVQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgcGxheWVyQm9hcmQgPSBHYW1lYm9hcmQoKTtcblxuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChjYXJyaWVyKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoYmF0dGxlc2hpcCk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGRlc3Ryb3llcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHN1Ym1hcmluZSk7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKHBhdHJvbEJvYXQpO1xuICB9O1xuXG4gIHB1YnN1Yi5vbihcInJhbmRvbWl6ZWRcIiwgcmFuZG9taXplUGxhY2VtZW50KTtcblxuICAvLyBBaSBib2FyZFxuICBjb25zdCBhaUJvYXJkID0gR2FtZWJvYXJkKFwiZW5lbXlcIik7XG4gIGNvbnN0IGFpQ2FycmllciA9IFNoaXAoNSk7XG4gIGNvbnN0IGFpQmF0dGxlc2hpcCA9IFNoaXAoNCk7XG4gIGNvbnN0IGFpRGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3QgYWlTdWJtYXJpbmUgPSBTaGlwKDMpO1xuICBjb25zdCBhaVBhdHJvbEJvYXQgPSBTaGlwKDIpO1xuXG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpQ2Fycmllcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpQmF0dGxlc2hpcCk7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpRGVzdHJveWVyKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlTdWJtYXJpbmUpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaVBhdHJvbEJvYXQpO1xuXG4gIC8vIFBsYXllcnNcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBQbGF5ZXIoKTtcbiAgY29uc3QgYWkgPSBBaSgpO1xuXG4gIGxldCBpc0dhbWVPdmVyID0gZmFsc2U7XG4gIGxldCB0dXJuID0gMTtcbiAgY29uc3QgcGxheWVyVHVybiA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDEpICUgMjtcbiAgY29uc29sZS5sb2cocGxheWVyVHVybik7XG4gIGxldCBpc0F0dGFja2luZyA9IGZhbHNlO1xuXG4gIGxldCBjb29yZGluYXRlcztcblxuICBjb25zdCBwbGF5ID0gKGUpID0+IHtcbiAgICBjb29yZGluYXRlcyA9IGUudGFyZ2V0LmRhdGFzZXQucG9zaXRpb247XG4gICAgY29uc29sZS5sb2coaHVtYW5QbGF5ZXIuYXR0YWNrKGFpQm9hcmQsIGNvb3JkaW5hdGVzKSk7XG4gICAgdGFrZVR1cm4oKTtcbiAgfTtcblxuICBjb25zdCB0YWtlVHVybiA9ICgpID0+IHtcbiAgICBpZiAoIWlzR2FtZU92ZXIpIHtcbiAgICAgIGlmICh0dXJuICUgMiA9PT0gcGxheWVyVHVybikge1xuICAgICAgICBjb25zdCBzcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5lbmVteS5zcXVhcmVcIik7XG4gICAgICAgIHNxdWFyZXMuZm9yRWFjaCgoc3F1YXJlKSA9PiBzcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHBsYXkpKTtcbiAgICAgICAgdHVybisrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWkucmFuZG9tQXR0YWNrKHBsYXllckJvYXJkKTtcbiAgICAgICAgdHVybisrO1xuICAgICAgICB0YWtlVHVybigpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgdGFrZVR1cm4oKTtcblxuICBjb25zdCBhbm5vdW5jZSA9IChzaGlwKSA9PiB7fTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtcIiwgYW5ub3VuY2UpO1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==