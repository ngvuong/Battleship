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


const Interface = (function () {
  const playerBoard = document.querySelector(".player-board");
  const enemyBoard = document.querySelector(".enemy-board");

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





(function GameController() {
  const gb = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();
  const ship = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(5);
  gb.placeShip(ship, ["A1", "B1", "C1", "D1", "E1"]);
  const ship2 = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.Ship)(5);
  gb.placeShip(ship2);
  console.log(gb.board);
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBZ0M7O0FBRXpCO0FBQ1A7QUFDQTs7QUFFQSxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLDJDQUFPO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQiwyQ0FBTztBQUN6QjtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6QmlDO0FBQ0Y7O0FBRXpCO0FBQ1A7QUFDQTs7QUFFQSxpQkFBaUIsMkNBQU87QUFDeEIsaUJBQWlCLDJDQUFPO0FBQ3hCO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1IsTUFBTTtBQUNOO0FBQ0EsMkJBQTJCLDJEQUF1QjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHNCQUFzQixnQkFBZ0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU0sZ0RBQVc7QUFDakI7QUFDQTtBQUNBLFVBQVUsZ0RBQVc7QUFDckI7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBOztBQUVBLFdBQVc7QUFDWDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4RWdDOztBQUV6QjtBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWDs7QUFFTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQiwyREFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1IsS0FBSztBQUNMOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2hDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDbkJpQzs7QUFFM0I7QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDs7Ozs7Ozs7Ozs7Ozs7O0FDL0JPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7OztVQ1RBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNOOEI7QUFDVTtBQUNGO0FBQ0Q7O0FBRXJDO0FBQ0EsYUFBYSxxREFBUztBQUN0QixlQUFlLDJDQUFJO0FBQ25CO0FBQ0EsZ0JBQWdCLDJDQUFJO0FBQ3BCO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lVUkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjE7IGkrKykge1xuICAgIGNvbnN0IHBsYXllclNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGxheWVyU3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlXCI7XG4gICAgcGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyU3F1YXJlKTtcblxuICAgIGNvbnN0IGVuZW15U3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlbmVteVNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZVwiO1xuICAgIGVuZW15Qm9hcmQuYXBwZW5kQ2hpbGQoZW5lbXlTcXVhcmUpO1xuICB9XG5cbiAgY29uc3QgeUxhYmVscyA9IHV0aWxzLnk7XG4gIGxldCBjb2xMYWJlbHMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmU6bnRoLWNoaWxkKC1uKzExXCIpXTtcbiAgY29sTGFiZWxzXG4gICAgLnNsaWNlKDEpXG4gICAgLmZvckVhY2goKGxhYmVsLCBpKSA9PiAobGFiZWwudGV4dENvbnRlbnQgPSB5TGFiZWxzW2ldICsgMSkpO1xuXG4gIGNvbnN0IHhMYWJlbHMgPSB1dGlscy54O1xuICBsZXQgcm93TGFiZWxzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3F1YXJlOm50aC1jaGlsZCgxMW4rMSlcIildO1xuICByb3dMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IChsYWJlbC50ZXh0Q29udGVudCA9IHhMYWJlbHNbaV0pKTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVib2FyZCgpIHtcbiAgY29uc3QgYm9hcmQgPSB7fTtcbiAgY29uc3Qgc2hpcHMgPSBbXTtcblxuICBjb25zdCB4Q29vcmQgPSB1dGlscy54O1xuICBjb25zdCB5Q29vcmQgPSB1dGlscy55O1xuICBjb25zdCBncmlkQ29vcmRzID0geENvb3JkLm1hcCgoeCkgPT4ge1xuICAgIHJldHVybiB5Q29vcmQubWFwKCh5KSA9PiB4ICsgeSk7XG4gIH0pO1xuICBncmlkQ29vcmRzLmZvckVhY2goKHJvdykgPT5cbiAgICByb3cuZm9yRWFjaCgocG9zaXRpb24pID0+IChib2FyZFtwb3NpdGlvbl0gPSBudWxsKSlcbiAgKTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAoc2hpcCwgcG9zaXRpb25zID0gW10pID0+IHtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgcG9zaXRpb25zQXZhaWxhYmxlID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKHBvc2l0aW9uc0F2YWlsYWJsZSkge1xuICAgICAgICBzaGlwLnNldFBvc2l0aW9ucyhwb3NpdGlvbnMpO1xuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaCgoY29vcmQpID0+IChib2FyZFtjb29yZF0gPSAxKSk7XG4gICAgICAgIHNoaXBzLnB1c2goc2hpcCk7XG4gICAgICAgIHJldHVybiBzaGlwLmdldFBvc2l0aW9ucygpO1xuICAgICAgfSBlbHNlIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHBvc2l0aW9uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2hpcC5nZXRMZW5ndGgoKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbiA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBjb25zdCBvcmllbnRhdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJPZmZzZXQgPSBkaXJlY3Rpb24gPT09IDAgPyAtMSA6IDE7XG4gICAgICBjb25zdCB0YXJnZXRDb29yZCA9IGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVtvcmllbnRhdGlvbl07XG5cbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgcG9zaXRpb25zWzBdID0gaGVhZFBvc2l0aW9uO1xuXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob3JpZW50YXRpb24gPT09IDApIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHhDb29yZC5pbmRleE9mKHRhcmdldENvb3JkKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgeENvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV0gKyBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB5Q29vcmQuaW5kZXhPZihwYXJzZUludCh0YXJnZXRDb29yZCkpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMF0gKyB5Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgYWxsVmFsaWQgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAoYWxsVmFsaWQpIHtcbiAgICAgICAgcGxhY2VTaGlwKHNoaXAsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxhY2VTaGlwKHNoaXApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWNlaXZlQXR0YWNrID0gKGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gbnVsbCkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gMDtcbiAgICB9IGVsc2UgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gMSkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gLTE7XG4gICAgICBwdWJzdWIuZW1pdChcInJlY2VpdmVkQXR0YWNrXCIsIGNvb3JkaW5hdGVzKTtcbiAgICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgaWYgKHNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBTdW5rXCIsIHNoaXApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJvYXJkW2Nvb3JkaW5hdGVzXTtcbiAgfTtcblxuICBjb25zdCBhbGxTaGlwc1N1bmsgPSAoKSA9PiBzaGlwcy5ldmVyeSgoc2hpcCkgPT4gc2hpcC5pc1N1bmsoKSk7XG5cbiAgcmV0dXJuIHsgYm9hcmQsIHBsYWNlU2hpcCwgcmVjZWl2ZUF0dGFjaywgYWxsU2hpcHNTdW5rIH07XG59XG4iLCJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG5cbiAgY29uc3QgYXR0YWNrID0gKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBlbmVteUJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmRpbmF0ZXMpO1xuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICByZXR1cm4gb3V0Y29tZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgYXR0YWNrIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBaSgpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcbiAgY29uc3QgYWkgPSBQbGF5ZXIoKTtcblxuICBjb25zdCBhdHRhY2tpbmdBaSA9IHtcbiAgICByYW5kb21BdHRhY2s6IChlbmVteUJvYXJkKSA9PiB7XG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgICBhaS5hdHRhY2soZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xuICAgICAgfSBlbHNlIHJhbmRvbUF0dGFjayhlbmVteUJvYXJkKTtcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGFpLCBhdHRhY2tpbmdBaSk7XG59XG4iLCJleHBvcnQgY29uc3QgcHVic3ViID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZXZlbnRzID0ge307XG5cbiAgY29uc3Qgb24gPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0gfHwgW107XG4gICAgZXZlbnRzW2V2dF0ucHVzaChjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3Qgb2ZmID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdLmZpbHRlcigoY2IpID0+IGNiICE9PSBjYWxsYmFjayk7XG4gIH07XG5cbiAgY29uc3QgZW1pdCA9IChldnQsIGRhdGEpID0+IHtcbiAgICBpZiAoZXZlbnRzW2V2dF0pIHtcbiAgICAgIGV2ZW50c1tldnRdLmZvckVhY2goKGNiKSA9PiBjYihkYXRhKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IG9uLCBvZmYsIGVtaXQgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFNoaXAobGVuZ3RoKSB7XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcblxuICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfTtcblxuICBjb25zdCBnZXRQb3NpdGlvbnMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNoaXBQb3NpdGlvbnM7XG4gIH07XG5cbiAgY29uc3Qgc2V0UG9zaXRpb25zID0gKHBvc2l0aW9ucykgPT4ge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zXSA9IHsgaXNIaXQ6IGZhbHNlIH07XG4gICAgfSk7XG4gIH07XG4gIGNvbnN0IF9oaXQgPSAocG9zaXRpb24pID0+IHtcbiAgICBpZiAoT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuaW5jbHVkZXMocG9zaXRpb24pKSB7XG4gICAgICBzaGlwUG9zaXRpb25zW3Bvc2l0aW9uXS5pc0hpdCA9IHRydWU7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJyZWNlaXZlZEF0dGFja1wiLCBfaGl0KTtcblxuICBjb25zdCBpc1N1bmsgPSAoKSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmV2ZXJ5KFxuICAgICAgKGtleSkgPT4gc2hpcFBvc2l0aW9uc1trZXldLmlzSGl0ID09PSB0cnVlXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHsgZ2V0TGVuZ3RoLCBnZXRQb3NpdGlvbnMsIHNldFBvc2l0aW9ucywgaXNTdW5rIH07XG59XG4iLCJleHBvcnQgY29uc3QgdXRpbHMgPSB7XG4gIHg6IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIl0sXG4gIHk6IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcblxuICByYW5kb21Db29yZGluYXRlczogKCkgPT4ge1xuICAgIGNvbnN0IHhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICBjb25zdCB5SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgcmV0dXJuIHV0aWxzLnhbeEluZGV4XSArIHV0aWxzLnlbeUluZGV4XTtcbiAgfSxcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFNoaXAgfSBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBHYW1lYm9hcmQgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IFBsYXllciwgQWkgfSBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCB7IEludGVyZmFjZSB9IGZyb20gXCIuL2dhbWVVSVwiO1xuXG4oZnVuY3Rpb24gR2FtZUNvbnRyb2xsZXIoKSB7XG4gIGNvbnN0IGdiID0gR2FtZWJvYXJkKCk7XG4gIGNvbnN0IHNoaXAgPSBTaGlwKDUpO1xuICBnYi5wbGFjZVNoaXAoc2hpcCwgW1wiQTFcIiwgXCJCMVwiLCBcIkMxXCIsIFwiRDFcIiwgXCJFMVwiXSk7XG4gIGNvbnN0IHNoaXAyID0gU2hpcCg1KTtcbiAgZ2IucGxhY2VTaGlwKHNoaXAyKTtcbiAgY29uc29sZS5sb2coZ2IuYm9hcmQpO1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==