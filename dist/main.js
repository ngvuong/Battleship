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

  const markAttack = (coordinates) => {
    document
      .querySelector(`[data-position=${coordinates}]`)
      .classList.add("attacked");
  };
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
      // pubsub.emit("attackMissed", coordinates);
    } else if (board[coordinates] === 1) {
      board[coordinates] = -1;
      // pubsub.emit("attackHit", coordinates);
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
      if (outcome === 0) {
        _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("attackMissed", { enemyBoard, coordinates });
      } else _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("attackHit", { enemyBoard, coordinates });
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
  const _hit = (position) => {
    if (Object.keys(shipPositions).includes(position)) {
      shipPositions[position].isHit = true;
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
  let isAttacking = true;
  const takeTurn = (player) => {
    if (player === humanPlayer) {
      player.attack();
    } else player.randomAttack();
  };

  let coordinates;

  if (isAttacking) {
    const squares = document.querySelectorAll(".enemy.square");
    squares.forEach((square) =>
      square.addEventListener(
        "click",
        (e) => {
          coordinates = e.target.dataset.position;
          console.log(humanPlayer.attack(aiBoard, coordinates));
        },
        true
      )
    );
  }

  function logit() {
    console.log(coordinates);
  }

  // // while (!isGameOver) {
  // if (turn % 2 === playerTurn) {
  //   isAttacking = !isAttacking;
  //   console.log(humanPlayer.attack(aiBoard, coordinates));
  //   isAttacking = false;
  // } else console.log("not");
  // console.log("took turn");
  // turn++;
  // }
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7OztBQ044QjtBQUNVO0FBQ0Y7QUFDRDtBQUNIOztBQUVsQztBQUNBO0FBQ0Esb0JBQW9CLHFEQUFTO0FBQzdCLGtCQUFrQiwyQ0FBSTtBQUN0QixxQkFBcUIsMkNBQUk7QUFDekIsb0JBQW9CLDJDQUFJO0FBQ3hCLG9CQUFvQiwyQ0FBSTtBQUN4QixxQkFBcUIsMkNBQUk7O0FBRXpCO0FBQ0Esa0JBQWtCLHFEQUFTOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsRUFBRSw4Q0FBUzs7QUFFWDtBQUNBLGtCQUFrQixxREFBUztBQUMzQixvQkFBb0IsMkNBQUk7QUFDeEIsdUJBQXVCLDJDQUFJO0FBQzNCLHNCQUFzQiwyQ0FBSTtBQUMxQixzQkFBc0IsMkNBQUk7QUFDMUIsdUJBQXVCLDJDQUFJOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLCtDQUFNO0FBQzVCLGFBQWEsMkNBQUU7O0FBRWY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVVSS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3B1YnN1Yi5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGNvbnN0IEludGVyZmFjZSA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHBsYXllckJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXItYm9hcmRcIik7XG4gIGNvbnN0IGVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmVuZW15LWJvYXJkXCIpO1xuICBjb25zdCByYW5kb21CdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJhbmRvbS1idG5cIik7XG4gIHJhbmRvbUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5vY2N1cGllZFwiKVxuICAgICAgLmZvckVhY2goKGVsKSA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKFwib2NjdXBpZWRcIikpO1xuICAgIHB1YnN1Yi5lbWl0KFwicmFuZG9taXplZFwiLCBudWxsKTtcbiAgfSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjE7IGkrKykge1xuICAgIGNvbnN0IHBsYXllclNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGxheWVyU3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlIHBsYXllclwiO1xuICAgIHBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclNxdWFyZSk7XG5cbiAgICBjb25zdCBlbmVteVNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZW5lbXlTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmUgZW5lbXlcIjtcbiAgICBlbmVteUJvYXJkLmFwcGVuZENoaWxkKGVuZW15U3F1YXJlKTtcbiAgfVxuXG4gIGNvbnN0IHhMYWJlbHMgPSB1dGlscy54O1xuICBjb25zdCB5TGFiZWxzID0gdXRpbHMueTtcblxuICBjb25zdCBsYWJlbEJvYXJkID0gKGJvYXJkQ2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGNvbExhYmVscyA9IFtcbiAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIGAuJHtib2FyZENsYXNzTmFtZX0gLnNxdWFyZTpudGgtY2hpbGQoLW4rMTFgXG4gICAgICApLFxuICAgIF07XG4gICAgY29sTGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiAobGFiZWwudGV4dENvbnRlbnQgPSB5TGFiZWxzW2ldKSk7XG5cbiAgICBsZXQgcm93TGFiZWxzID0gW1xuICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYC4ke2JvYXJkQ2xhc3NOYW1lfSAuc3F1YXJlOm50aC1jaGlsZCgxMW4rMSlgXG4gICAgICApLFxuICAgIF07XG4gICAgcm93TGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiAobGFiZWwudGV4dENvbnRlbnQgPSB4TGFiZWxzW2ldKSk7XG4gIH07XG5cbiAgbGFiZWxCb2FyZChcInBsYXllci1ib2FyZFwiKTtcbiAgbGFiZWxCb2FyZChcImVuZW15LWJvYXJkXCIpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgLnNxdWFyZTpudGgtY2hpbGQobiskezEzICsgMTEgKiBpfSk6bnRoLWNoaWxkKC1uKyR7MjIgKyAxMSAqIGl9KWBcbiAgICApO1xuICAgIHJvdy5mb3JFYWNoKChzcSwgaikgPT5cbiAgICAgIHNxLnNldEF0dHJpYnV0ZShcImRhdGEtcG9zaXRpb25cIiwgYCR7eExhYmVsc1tpXSArIHlMYWJlbHNbaiAlIDEwXX1gKVxuICAgICk7XG4gIH1cblxuICBjb25zdCBmaWxsU3F1YXJlcyA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb25zID0gZGF0YS5wb3NpdGlvbnM7XG4gICAgaWYgKGRhdGEudHlwZSkge1xuICAgICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT5cbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAucXVlcnlTZWxlY3RvcihgLiR7ZGF0YS50eXBlfVtkYXRhLXBvc2l0aW9uID0ke3Bvc31dYClcbiAgICAgICAgICAuY2xhc3NMaXN0LmFkZChcIm9jY3VwaWVkXCIpXG4gICAgICApO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBsYWNlZFwiLCBmaWxsU3F1YXJlcyk7XG5cbiAgY29uc3QgbWFya0F0dGFjayA9IChjb29yZGluYXRlcykgPT4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249JHtjb29yZGluYXRlc31dYClcbiAgICAgIC5jbGFzc0xpc3QuYWRkKFwiYXR0YWNrZWRcIik7XG4gIH07XG59KSgpO1xuIiwiaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5pbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBHYW1lYm9hcmQodHlwZSA9IFwicGxheWVyXCIpIHtcbiAgY29uc3QgYm9hcmQgPSB7fTtcbiAgY29uc3Qgc2hpcHMgPSBbXTtcblxuICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICBjb25zdCB5Q29vcmQgPSB1dGlscy55O1xuICBjb25zdCBncmlkQ29vcmRzID0geENvb3JkLm1hcCgoeCkgPT4ge1xuICAgIHJldHVybiB5Q29vcmQubWFwKCh5KSA9PiB4ICsgeSk7XG4gIH0pO1xuICBncmlkQ29vcmRzLmZvckVhY2goKHJvdykgPT5cbiAgICByb3cuZm9yRWFjaCgocG9zaXRpb24pID0+IChib2FyZFtwb3NpdGlvbl0gPSBudWxsKSlcbiAgKTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAoc2hpcCwgcG9zaXRpb25zID0gW10pID0+IHtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgcG9zaXRpb25zQXZhaWxhYmxlID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKHBvc2l0aW9uc0F2YWlsYWJsZSkge1xuICAgICAgICBzaGlwLnNldFBvc2l0aW9ucyhwb3NpdGlvbnMpO1xuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaCgoY29vcmQpID0+IChib2FyZFtjb29yZF0gPSAxKSk7XG4gICAgICAgIHNoaXBzLnB1c2goc2hpcCk7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFBsYWNlZFwiLCB7IHBvc2l0aW9ucywgdHlwZSB9KTtcbiAgICAgICAgcmV0dXJuIHNoaXAuZ2V0UG9zaXRpb25zKCk7XG4gICAgICB9IGVsc2UgY29uc29sZS5lcnJvcihcIkludmFsaWQgcG9zaXRpb25cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNoaXBMZW5ndGggPSBzaGlwLmdldExlbmd0aCgpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpck9mZnNldCA9IGRpcmVjdGlvbiA9PT0gMCA/IC0xIDogMTtcbiAgICAgIGNvbnN0IHRhcmdldENvb3JkID0gaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpW29yaWVudGF0aW9uXTtcblxuICAgICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgICBwb3NpdGlvbnNbMF0gPSBoZWFkUG9zaXRpb247XG5cbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geENvb3JkLmluZGV4T2YodGFyZ2V0Q29vcmQpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICB4Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXSArIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHlDb29yZC5pbmRleE9mKHBhcnNlSW50KHRhcmdldENvb3JkKSk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVswXSArIHlDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBhbGxWYWxpZCA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICAgIGlmIChhbGxWYWxpZCkge1xuICAgICAgICBwbGFjZVNoaXAoc2hpcCwgcG9zaXRpb25zKTtcbiAgICAgIH0gZWxzZSBwbGFjZVNoaXAoc2hpcCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlY2VpdmVBdHRhY2sgPSAoY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSBudWxsKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAwO1xuICAgICAgLy8gcHVic3ViLmVtaXQoXCJhdHRhY2tNaXNzZWRcIiwgY29vcmRpbmF0ZXMpO1xuICAgIH0gZWxzZSBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSAxKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAtMTtcbiAgICAgIC8vIHB1YnN1Yi5lbWl0KFwiYXR0YWNrSGl0XCIsIGNvb3JkaW5hdGVzKTtcbiAgICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgaWYgKHNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICBzaGlwcy5zcGxpY2Uoc2hpcHMuaW5kZXhPZihzaGlwKSwgMSk7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCBzaGlwKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNoaXAgc3Vua1wiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBib2FyZFtjb29yZGluYXRlc107XG4gIH07XG5cbiAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4gc2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuaXNTdW5rKCkpO1xuXG4gIHJldHVybiB7IGJvYXJkLCBzaGlwcywgcGxhY2VTaGlwLCByZWNlaXZlQXR0YWNrLCBhbGxTaGlwc1N1bmsgfTtcbn1cbiIsImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUGxheWVyKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuXG4gIGNvbnN0IGF0dGFjayA9IChlbmVteUJvYXJkLCBjb29yZGluYXRlcykgPT4ge1xuICAgIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gZW5lbXlCb2FyZC5yZWNlaXZlQXR0YWNrKGNvb3JkaW5hdGVzKTtcbiAgICAgIGlmIChvdXRjb21lID09PSAwKSB7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTWlzc2VkXCIsIHsgZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMgfSk7XG4gICAgICB9IGVsc2UgcHVic3ViLmVtaXQoXCJhdHRhY2tIaXRcIiwgeyBlbmVteUJvYXJkLCBjb29yZGluYXRlcyB9KTtcbiAgICAgIGNvb3Jkc0F0dGFja2VkLnB1c2goY29vcmRpbmF0ZXMpO1xuICAgICAgcmV0dXJuIG91dGNvbWU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IGF0dGFjayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWkoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG4gIGNvbnN0IGFpID0gUGxheWVyKCk7XG5cbiAgY29uc3QgYXR0YWNraW5nQWkgPSB7XG4gICAgcmFuZG9tQXR0YWNrOiAoZW5lbXlCb2FyZCkgPT4ge1xuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgICAgYWkuYXR0YWNrKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgICAgIH0gZWxzZSBhdHRhY2tpbmdBaS5yYW5kb21BdHRhY2soZW5lbXlCb2FyZCk7XG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihhaSwgYXR0YWNraW5nQWkpO1xufVxuIiwiZXhwb3J0IGNvbnN0IHB1YnN1YiA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGV2ZW50cyA9IHt9O1xuXG4gIGNvbnN0IG9uID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdIHx8IFtdO1xuICAgIGV2ZW50c1tldnRdLnB1c2goY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IG9mZiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XS5maWx0ZXIoKGNiKSA9PiBjYiAhPT0gY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IGVtaXQgPSAoZXZ0LCBkYXRhKSA9PiB7XG4gICAgaWYgKGV2ZW50c1tldnRdKSB7XG4gICAgICBldmVudHNbZXZ0XS5mb3JFYWNoKChjYikgPT4gY2IoZGF0YSkpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBvbiwgb2ZmLCBlbWl0IH07XG59KSgpO1xuIiwiaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaGlwKGxlbmd0aCkge1xuICBjb25zdCBzaGlwUG9zaXRpb25zID0ge307XG5cbiAgY29uc3QgZ2V0TGVuZ3RoID0gKCkgPT4ge1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH07XG5cbiAgY29uc3QgZ2V0UG9zaXRpb25zID0gKCkgPT4ge1xuICAgIHJldHVybiBzaGlwUG9zaXRpb25zO1xuICB9O1xuXG4gIGNvbnN0IHNldFBvc2l0aW9ucyA9IChwb3NpdGlvbnMpID0+IHtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PiB7XG4gICAgICBzaGlwUG9zaXRpb25zW3Bvc10gPSB7IGlzSGl0OiBmYWxzZSB9O1xuICAgIH0pO1xuICB9O1xuICBjb25zdCBfaGl0ID0gKHBvc2l0aW9uKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NpdGlvbl0uaXNIaXQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrSGl0XCIsIF9oaXQpO1xuXG4gIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuZXZlcnkoXG4gICAgICAoa2V5KSA9PiBzaGlwUG9zaXRpb25zW2tleV0uaXNIaXQgPT09IHRydWVcbiAgICApO1xuICB9O1xuICByZXR1cm4geyBnZXRMZW5ndGgsIGdldFBvc2l0aW9ucywgc2V0UG9zaXRpb25zLCBpc1N1bmsgfTtcbn1cbiIsImV4cG9ydCBjb25zdCB1dGlscyA9IHtcbiAgeDogW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkhcIiwgXCJJXCIsIFwiSlwiXSxcbiAgeTogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuXG4gIHJhbmRvbUNvb3JkaW5hdGVzOiAoKSA9PiB7XG4gICAgY29uc3QgeEluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIGNvbnN0IHlJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICByZXR1cm4gdXRpbHMueFt4SW5kZXhdICsgdXRpbHMueVt5SW5kZXhdO1xuICB9LFxufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIjtcbmltcG9ydCB7IEdhbWVib2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgUGxheWVyLCBBaSB9IGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IHsgSW50ZXJmYWNlIH0gZnJvbSBcIi4vZ2FtZVVJXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuKGZ1bmN0aW9uIEdhbWVDb250cm9sbGVyKCkge1xuICAvLyBQbGF5ZXIgYm9hcmRcbiAgbGV0IHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIGNvbnN0IGNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBiYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgZGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3Qgc3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgcGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgY29uc3QgcmFuZG9taXplUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgIHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG5cbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoY2Fycmllcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGJhdHRsZXNoaXApO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChkZXN0cm95ZXIpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChzdWJtYXJpbmUpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChwYXRyb2xCb2F0KTtcbiAgfTtcblxuICBwdWJzdWIub24oXCJyYW5kb21pemVkXCIsIHJhbmRvbWl6ZVBsYWNlbWVudCk7XG5cbiAgLy8gQWkgYm9hcmRcbiAgY29uc3QgYWlCb2FyZCA9IEdhbWVib2FyZChcImVuZW15XCIpO1xuICBjb25zdCBhaUNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBhaUJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBhaURlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IGFpU3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgYWlQYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBhaUJvYXJkLnBsYWNlU2hpcChhaUNhcnJpZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaUJhdHRsZXNoaXApO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaURlc3Ryb3llcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpU3VibWFyaW5lKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlQYXRyb2xCb2F0KTtcblxuICAvLyBQbGF5ZXJzXG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKCk7XG4gIGNvbnN0IGFpID0gQWkoKTtcblxuICBsZXQgaXNHYW1lT3ZlciA9IGZhbHNlO1xuICBsZXQgdHVybiA9IDE7XG4gIGNvbnN0IHBsYXllclR1cm4gPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAxKSAlIDI7XG4gIGNvbnNvbGUubG9nKHBsYXllclR1cm4pO1xuICBsZXQgaXNBdHRhY2tpbmcgPSB0cnVlO1xuICBjb25zdCB0YWtlVHVybiA9IChwbGF5ZXIpID0+IHtcbiAgICBpZiAocGxheWVyID09PSBodW1hblBsYXllcikge1xuICAgICAgcGxheWVyLmF0dGFjaygpO1xuICAgIH0gZWxzZSBwbGF5ZXIucmFuZG9tQXR0YWNrKCk7XG4gIH07XG5cbiAgbGV0IGNvb3JkaW5hdGVzO1xuXG4gIGlmIChpc0F0dGFja2luZykge1xuICAgIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmVuZW15LnNxdWFyZVwiKTtcbiAgICBzcXVhcmVzLmZvckVhY2goKHNxdWFyZSkgPT5cbiAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBcImNsaWNrXCIsXG4gICAgICAgIChlKSA9PiB7XG4gICAgICAgICAgY29vcmRpbmF0ZXMgPSBlLnRhcmdldC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGh1bWFuUGxheWVyLmF0dGFjayhhaUJvYXJkLCBjb29yZGluYXRlcykpO1xuICAgICAgICB9LFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ2l0KCkge1xuICAgIGNvbnNvbGUubG9nKGNvb3JkaW5hdGVzKTtcbiAgfVxuXG4gIC8vIC8vIHdoaWxlICghaXNHYW1lT3Zlcikge1xuICAvLyBpZiAodHVybiAlIDIgPT09IHBsYXllclR1cm4pIHtcbiAgLy8gICBpc0F0dGFja2luZyA9ICFpc0F0dGFja2luZztcbiAgLy8gICBjb25zb2xlLmxvZyhodW1hblBsYXllci5hdHRhY2soYWlCb2FyZCwgY29vcmRpbmF0ZXMpKTtcbiAgLy8gICBpc0F0dGFja2luZyA9IGZhbHNlO1xuICAvLyB9IGVsc2UgY29uc29sZS5sb2coXCJub3RcIik7XG4gIC8vIGNvbnNvbGUubG9nKFwidG9vayB0dXJuXCIpO1xuICAvLyB0dXJuKys7XG4gIC8vIH1cbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=