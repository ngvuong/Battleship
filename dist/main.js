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
    playerSquare.className = "square";
    playerBoard.appendChild(playerSquare);

    const enemySquare = document.createElement("div");
    enemySquare.className = "square";
    enemyBoard.appendChild(enemySquare);
  }

  const yLabels = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.y;
  let colLabels = [...document.querySelectorAll(".square:nth-child(-n+11")];
  colLabels
    .slice(1)
    .forEach((label, i) => (label.textContent = yLabels[i] + 1));

  const xLabels = _utils__WEBPACK_IMPORTED_MODULE_0__.utils.x;
  let rowLabels = [...document.querySelectorAll(".square:nth-child(11n+1)")];
  rowLabels.slice(1).forEach((label, i) => (label.textContent = xLabels[i]));

  for (let i = 0; i < 10; i++) {
    const row = document.querySelectorAll(
      `.square:nth-child(n+${13 + 11 * i}):nth-child(-n+${22 + 11 * i})`
    );
    row.forEach((sq, j) => (sq.className += ` ${xLabels[i] + yLabels[j]}`));
  }

  const setSquares = (positions) => {
    positions.forEach((pos) =>
      document.querySelector(`.${pos}`).classList.add("occupied")
    );
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("shipPlaced", setSquares);
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



function Gameboard() {
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
        _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipPlaced", positions);
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
    } else if (board[coordinates] === 1) {
      board[coordinates] = -1;
      _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("receivedAttack", coordinates);
      ships.forEach((ship) => {
        if (ship.isSunk()) {
          _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.emit("shipSunk", ship);
        }
      });
    }
    return board[coordinates];
  };

  const allShipsSunk = () => ships.every((ship) => ship.isSunk());

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
      } else randomAttack(enemyBoard);
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
  _pubsub__WEBPACK_IMPORTED_MODULE_0__.pubsub.on("receivedAttack", _hit);

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
  let gb = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();
  const carrier = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(5);
  const battleship = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(4);
  const destroyer = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3);
  const submarine = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(3);
  const patrolBoat = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(2);

  const randomizePlacement = () => {
    gb = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();

    gb.placeShip(carrier);
    gb.placeShip(battleship);
    gb.placeShip(destroyer);
    gb.placeShip(submarine);
    gb.placeShip(patrolBoat);
    console.log(gb.board);
  };

  _pubsub__WEBPACK_IMPORTED_MODULE_4__.pubsub.on("randomized", randomizePlacement);

  console.log(gb.board);
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQWdDO0FBQ0U7O0FBRTNCO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGdEQUFXO0FBQ2YsR0FBRzs7QUFFSCxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLDJDQUFPO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQiwyQ0FBTztBQUN6QjtBQUNBOztBQUVBLGtCQUFrQixRQUFRO0FBQzFCO0FBQ0EsNkJBQTZCLFlBQVksaUJBQWlCLFlBQVk7QUFDdEU7QUFDQSxnREFBZ0Qsd0JBQXdCO0FBQ3hFOztBQUVBO0FBQ0E7QUFDQSxpQ0FBaUMsSUFBSTtBQUNyQztBQUNBO0FBQ0EsRUFBRSw4Q0FBUztBQUNYLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0NpQztBQUNGOztBQUV6QjtBQUNQO0FBQ0E7O0FBRUEsaUJBQWlCLDJDQUFPO0FBQ3hCLGlCQUFpQiwyQ0FBTztBQUN4QjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsZ0RBQVc7QUFDbkI7QUFDQSxRQUFRO0FBQ1IsTUFBTTtBQUNOO0FBQ0EsMkJBQTJCLDJEQUF1QjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHNCQUFzQixnQkFBZ0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU0sZ0RBQVc7QUFDakI7QUFDQTtBQUNBLFVBQVUsZ0RBQVc7QUFDckI7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBOztBQUVBLFdBQVc7QUFDWDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6RWdDOztBQUV6QjtBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWDs7QUFFTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQiwyREFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1IsS0FBSztBQUNMOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2hDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDbkJpQzs7QUFFM0I7QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDs7Ozs7Ozs7Ozs7Ozs7O0FDL0JPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7OztVQ1RBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7O0FDTjhCO0FBQ1U7QUFDRjtBQUNEO0FBQ0g7O0FBRWxDO0FBQ0EsV0FBVyxxREFBUztBQUNwQixrQkFBa0IsMkNBQUk7QUFDdEIscUJBQXFCLDJDQUFJO0FBQ3pCLG9CQUFvQiwyQ0FBSTtBQUN4QixvQkFBb0IsMkNBQUk7QUFDeEIscUJBQXFCLDJDQUFJOztBQUV6QjtBQUNBLFNBQVMscURBQVM7O0FBRWxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUUsOENBQVM7O0FBRVg7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lVUkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBjb25zdCBJbnRlcmZhY2UgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBwbGF5ZXJCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWVyLWJvYXJkXCIpO1xuICBjb25zdCBlbmVteUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5lbmVteS1ib2FyZFwiKTtcbiAgY29uc3QgcmFuZG9tQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yYW5kb20tYnRuXCIpO1xuICByYW5kb21CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIub2NjdXBpZWRcIilcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9jY3VwaWVkXCIpKTtcbiAgICBwdWJzdWIuZW1pdChcInJhbmRvbWl6ZWRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTIxOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXJTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBsYXllclNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZVwiO1xuICAgIHBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclNxdWFyZSk7XG5cbiAgICBjb25zdCBlbmVteVNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZW5lbXlTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmVcIjtcbiAgICBlbmVteUJvYXJkLmFwcGVuZENoaWxkKGVuZW15U3F1YXJlKTtcbiAgfVxuXG4gIGNvbnN0IHlMYWJlbHMgPSB1dGlscy55O1xuICBsZXQgY29sTGFiZWxzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3F1YXJlOm50aC1jaGlsZCgtbisxMVwiKV07XG4gIGNvbExhYmVsc1xuICAgIC5zbGljZSgxKVxuICAgIC5mb3JFYWNoKChsYWJlbCwgaSkgPT4gKGxhYmVsLnRleHRDb250ZW50ID0geUxhYmVsc1tpXSArIDEpKTtcblxuICBjb25zdCB4TGFiZWxzID0gdXRpbHMueDtcbiAgbGV0IHJvd0xhYmVscyA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNxdWFyZTpudGgtY2hpbGQoMTFuKzEpXCIpXTtcbiAgcm93TGFiZWxzLnNsaWNlKDEpLmZvckVhY2goKGxhYmVsLCBpKSA9PiAobGFiZWwudGV4dENvbnRlbnQgPSB4TGFiZWxzW2ldKSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIGAuc3F1YXJlOm50aC1jaGlsZChuKyR7MTMgKyAxMSAqIGl9KTpudGgtY2hpbGQoLW4rJHsyMiArIDExICogaX0pYFxuICAgICk7XG4gICAgcm93LmZvckVhY2goKHNxLCBqKSA9PiAoc3EuY2xhc3NOYW1lICs9IGAgJHt4TGFiZWxzW2ldICsgeUxhYmVsc1tqXX1gKSk7XG4gIH1cblxuICBjb25zdCBzZXRTcXVhcmVzID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtwb3N9YCkuY2xhc3NMaXN0LmFkZChcIm9jY3VwaWVkXCIpXG4gICAgKTtcbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFBsYWNlZFwiLCBzZXRTcXVhcmVzKTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVib2FyZCgpIHtcbiAgY29uc3QgYm9hcmQgPSB7fTtcbiAgY29uc3Qgc2hpcHMgPSBbXTtcblxuICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICBjb25zdCB5Q29vcmQgPSB1dGlscy55O1xuICBjb25zdCBncmlkQ29vcmRzID0geENvb3JkLm1hcCgoeCkgPT4ge1xuICAgIHJldHVybiB5Q29vcmQubWFwKCh5KSA9PiB4ICsgeSk7XG4gIH0pO1xuICBncmlkQ29vcmRzLmZvckVhY2goKHJvdykgPT5cbiAgICByb3cuZm9yRWFjaCgocG9zaXRpb24pID0+IChib2FyZFtwb3NpdGlvbl0gPSBudWxsKSlcbiAgKTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAoc2hpcCwgcG9zaXRpb25zID0gW10pID0+IHtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgcG9zaXRpb25zQXZhaWxhYmxlID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKHBvc2l0aW9uc0F2YWlsYWJsZSkge1xuICAgICAgICBzaGlwLnNldFBvc2l0aW9ucyhwb3NpdGlvbnMpO1xuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaCgoY29vcmQpID0+IChib2FyZFtjb29yZF0gPSAxKSk7XG4gICAgICAgIHNoaXBzLnB1c2goc2hpcCk7XG4gICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFBsYWNlZFwiLCBwb3NpdGlvbnMpO1xuICAgICAgICByZXR1cm4gc2hpcC5nZXRQb3NpdGlvbnMoKTtcbiAgICAgIH0gZWxzZSBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBwb3NpdGlvblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2hpcExlbmd0aCA9IHNoaXAuZ2V0TGVuZ3RoKCk7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb24gPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyT2Zmc2V0ID0gZGlyZWN0aW9uID09PSAwID8gLTEgOiAxO1xuICAgICAgY29uc3QgdGFyZ2V0Q29vcmQgPSBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbb3JpZW50YXRpb25dO1xuXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgIHBvc2l0aW9uc1swXSA9IGhlYWRQb3NpdGlvbjtcblxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB4Q29vcmQuaW5kZXhPZih0YXJnZXRDb29yZCk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIHhDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldICsgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geUNvb3JkLmluZGV4T2YocGFyc2VJbnQodGFyZ2V0Q29vcmQpKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzBdICsgeUNvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsbFZhbGlkID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKGFsbFZhbGlkKSB7XG4gICAgICAgIHBsYWNlU2hpcChzaGlwLCBwb3NpdGlvbnMpO1xuICAgICAgfSBlbHNlIHBsYWNlU2hpcChzaGlwKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVjZWl2ZUF0dGFjayA9IChjb29yZGluYXRlcykgPT4ge1xuICAgIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IG51bGwpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IDA7XG4gICAgfSBlbHNlIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IDEpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IC0xO1xuICAgICAgcHVic3ViLmVtaXQoXCJyZWNlaXZlZEF0dGFja1wiLCBjb29yZGluYXRlcyk7XG4gICAgICBzaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGlmIChzaGlwLmlzU3VuaygpKSB7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCBzaGlwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBib2FyZFtjb29yZGluYXRlc107XG4gIH07XG5cbiAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4gc2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuaXNTdW5rKCkpO1xuXG4gIHJldHVybiB7IGJvYXJkLCBwbGFjZVNoaXAsIHJlY2VpdmVBdHRhY2ssIGFsbFNoaXBzU3VuayB9O1xufVxuIiwiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gUGxheWVyKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuXG4gIGNvbnN0IGF0dGFjayA9IChlbmVteUJvYXJkLCBjb29yZGluYXRlcykgPT4ge1xuICAgIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gZW5lbXlCb2FyZC5yZWNlaXZlQXR0YWNrKGNvb3JkaW5hdGVzKTtcbiAgICAgIGNvb3Jkc0F0dGFja2VkLnB1c2goY29vcmRpbmF0ZXMpO1xuICAgICAgcmV0dXJuIG91dGNvbWU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IGF0dGFjayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWkoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG4gIGNvbnN0IGFpID0gUGxheWVyKCk7XG5cbiAgY29uc3QgYXR0YWNraW5nQWkgPSB7XG4gICAgcmFuZG9tQXR0YWNrOiAoZW5lbXlCb2FyZCkgPT4ge1xuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgICAgYWkuYXR0YWNrKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgICAgIH0gZWxzZSByYW5kb21BdHRhY2soZW5lbXlCb2FyZCk7XG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihhaSwgYXR0YWNraW5nQWkpO1xufVxuIiwiZXhwb3J0IGNvbnN0IHB1YnN1YiA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGV2ZW50cyA9IHt9O1xuXG4gIGNvbnN0IG9uID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdIHx8IFtdO1xuICAgIGV2ZW50c1tldnRdLnB1c2goY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IG9mZiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XS5maWx0ZXIoKGNiKSA9PiBjYiAhPT0gY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IGVtaXQgPSAoZXZ0LCBkYXRhKSA9PiB7XG4gICAgaWYgKGV2ZW50c1tldnRdKSB7XG4gICAgICBldmVudHNbZXZ0XS5mb3JFYWNoKChjYikgPT4gY2IoZGF0YSkpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBvbiwgb2ZmLCBlbWl0IH07XG59KSgpO1xuIiwiaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaGlwKGxlbmd0aCkge1xuICBjb25zdCBzaGlwUG9zaXRpb25zID0ge307XG5cbiAgY29uc3QgZ2V0TGVuZ3RoID0gKCkgPT4ge1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH07XG5cbiAgY29uc3QgZ2V0UG9zaXRpb25zID0gKCkgPT4ge1xuICAgIHJldHVybiBzaGlwUG9zaXRpb25zO1xuICB9O1xuXG4gIGNvbnN0IHNldFBvc2l0aW9ucyA9IChwb3NpdGlvbnMpID0+IHtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PiB7XG4gICAgICBzaGlwUG9zaXRpb25zW3Bvc10gPSB7IGlzSGl0OiBmYWxzZSB9O1xuICAgIH0pO1xuICB9O1xuICBjb25zdCBfaGl0ID0gKHBvc2l0aW9uKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NpdGlvbl0uaXNIaXQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwicmVjZWl2ZWRBdHRhY2tcIiwgX2hpdCk7XG5cbiAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5ldmVyeShcbiAgICAgIChrZXkpID0+IHNoaXBQb3NpdGlvbnNba2V5XS5pc0hpdCA9PT0gdHJ1ZVxuICAgICk7XG4gIH07XG4gIHJldHVybiB7IGdldExlbmd0aCwgZ2V0UG9zaXRpb25zLCBzZXRQb3NpdGlvbnMsIGlzU3VuayB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuICB4OiBbXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiSFwiLCBcIklcIiwgXCJKXCJdLFxuICB5OiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sXG5cbiAgcmFuZG9tQ29vcmRpbmF0ZXM6ICgpID0+IHtcbiAgICBjb25zdCB4SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgY29uc3QgeUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIHJldHVybiB1dGlscy54W3hJbmRleF0gKyB1dGlscy55W3lJbmRleF07XG4gIH0sXG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgR2FtZWJvYXJkIH0gZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgeyBQbGF5ZXIsIEFpIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgeyBJbnRlcmZhY2UgfSBmcm9tIFwiLi9nYW1lVUlcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG4oZnVuY3Rpb24gR2FtZUNvbnRyb2xsZXIoKSB7XG4gIGxldCBnYiA9IEdhbWVib2FyZCgpO1xuICBjb25zdCBjYXJyaWVyID0gU2hpcCg1KTtcbiAgY29uc3QgYmF0dGxlc2hpcCA9IFNoaXAoNCk7XG4gIGNvbnN0IGRlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IHN1Ym1hcmluZSA9IFNoaXAoMyk7XG4gIGNvbnN0IHBhdHJvbEJvYXQgPSBTaGlwKDIpO1xuXG4gIGNvbnN0IHJhbmRvbWl6ZVBsYWNlbWVudCA9ICgpID0+IHtcbiAgICBnYiA9IEdhbWVib2FyZCgpO1xuXG4gICAgZ2IucGxhY2VTaGlwKGNhcnJpZXIpO1xuICAgIGdiLnBsYWNlU2hpcChiYXR0bGVzaGlwKTtcbiAgICBnYi5wbGFjZVNoaXAoZGVzdHJveWVyKTtcbiAgICBnYi5wbGFjZVNoaXAoc3VibWFyaW5lKTtcbiAgICBnYi5wbGFjZVNoaXAocGF0cm9sQm9hdCk7XG4gICAgY29uc29sZS5sb2coZ2IuYm9hcmQpO1xuICB9O1xuXG4gIHB1YnN1Yi5vbihcInJhbmRvbWl6ZWRcIiwgcmFuZG9taXplUGxhY2VtZW50KTtcblxuICBjb25zb2xlLmxvZyhnYi5ib2FyZCk7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9