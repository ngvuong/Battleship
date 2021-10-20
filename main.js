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

  for (let i = 0; i < 10; i++) {
    const row = document.querySelectorAll(
      `.square:nth-child(n+${13 + 11 * i}):nth-child(-n+${22 + 11 * i})`
    );
    row.forEach((sq, j) => (sq.className += ` ${xLabels[i] + yLabels[j]}`));
  }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBZ0M7O0FBRXpCO0FBQ1A7QUFDQTs7QUFFQSxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLDJDQUFPO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQiwyQ0FBTztBQUN6QjtBQUNBOztBQUVBLGtCQUFrQixRQUFRO0FBQzFCO0FBQ0EsNkJBQTZCLFlBQVksaUJBQWlCLFlBQVk7QUFDdEU7QUFDQSxnREFBZ0Qsd0JBQXdCO0FBQ3hFO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQ2lDO0FBQ0Y7O0FBRXpCO0FBQ1A7QUFDQTs7QUFFQSxpQkFBaUIsMkNBQU87QUFDeEIsaUJBQWlCLDJDQUFPO0FBQ3hCO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1IsTUFBTTtBQUNOO0FBQ0EsMkJBQTJCLDJEQUF1QjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHNCQUFzQixnQkFBZ0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU0sZ0RBQVc7QUFDakI7QUFDQTtBQUNBLFVBQVUsZ0RBQVc7QUFDckI7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBOztBQUVBLFdBQVc7QUFDWDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4RWdDOztBQUV6QjtBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWDs7QUFFTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQiwyREFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1IsS0FBSztBQUNMOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2hDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDbkJpQzs7QUFFM0I7QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDs7Ozs7Ozs7Ozs7Ozs7O0FDL0JPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7OztVQ1RBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNOOEI7QUFDVTtBQUNGO0FBQ0Q7O0FBRXJDO0FBQ0EsYUFBYSxxREFBUztBQUN0QixlQUFlLDJDQUFJO0FBQ25CO0FBQ0EsZ0JBQWdCLDJDQUFJO0FBQ3BCO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lVUkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjE7IGkrKykge1xuICAgIGNvbnN0IHBsYXllclNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGxheWVyU3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlXCI7XG4gICAgcGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyU3F1YXJlKTtcblxuICAgIGNvbnN0IGVuZW15U3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlbmVteVNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZVwiO1xuICAgIGVuZW15Qm9hcmQuYXBwZW5kQ2hpbGQoZW5lbXlTcXVhcmUpO1xuICB9XG5cbiAgY29uc3QgeUxhYmVscyA9IHV0aWxzLnk7XG4gIGxldCBjb2xMYWJlbHMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zcXVhcmU6bnRoLWNoaWxkKC1uKzExXCIpXTtcbiAgY29sTGFiZWxzXG4gICAgLnNsaWNlKDEpXG4gICAgLmZvckVhY2goKGxhYmVsLCBpKSA9PiAobGFiZWwudGV4dENvbnRlbnQgPSB5TGFiZWxzW2ldICsgMSkpO1xuXG4gIGNvbnN0IHhMYWJlbHMgPSB1dGlscy54O1xuICBsZXQgcm93TGFiZWxzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3F1YXJlOm50aC1jaGlsZCgxMW4rMSlcIildO1xuICByb3dMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IChsYWJlbC50ZXh0Q29udGVudCA9IHhMYWJlbHNbaV0pKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYC5zcXVhcmU6bnRoLWNoaWxkKG4rJHsxMyArIDExICogaX0pOm50aC1jaGlsZCgtbiskezIyICsgMTEgKiBpfSlgXG4gICAgKTtcbiAgICByb3cuZm9yRWFjaCgoc3EsIGopID0+IChzcS5jbGFzc05hbWUgKz0gYCAke3hMYWJlbHNbaV0gKyB5TGFiZWxzW2pdfWApKTtcbiAgfVxufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gR2FtZWJvYXJkKCkge1xuICBjb25zdCBib2FyZCA9IHt9O1xuICBjb25zdCBzaGlwcyA9IFtdO1xuXG4gIGNvbnN0IHhDb29yZCA9IHV0aWxzLng7XG4gIGNvbnN0IHlDb29yZCA9IHV0aWxzLnk7XG4gIGNvbnN0IGdyaWRDb29yZHMgPSB4Q29vcmQubWFwKCh4KSA9PiB7XG4gICAgcmV0dXJuIHlDb29yZC5tYXAoKHkpID0+IHggKyB5KTtcbiAgfSk7XG4gIGdyaWRDb29yZHMuZm9yRWFjaCgocm93KSA9PlxuICAgIHJvdy5mb3JFYWNoKChwb3NpdGlvbikgPT4gKGJvYXJkW3Bvc2l0aW9uXSA9IG51bGwpKVxuICApO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwLCBwb3NpdGlvbnMgPSBbXSkgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbnNBdmFpbGFibGUgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAocG9zaXRpb25zQXZhaWxhYmxlKSB7XG4gICAgICAgIHNoaXAuc2V0UG9zaXRpb25zKHBvc2l0aW9ucyk7XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChjb29yZCkgPT4gKGJvYXJkW2Nvb3JkXSA9IDEpKTtcbiAgICAgICAgc2hpcHMucHVzaChzaGlwKTtcbiAgICAgICAgcmV0dXJuIHNoaXAuZ2V0UG9zaXRpb25zKCk7XG4gICAgICB9IGVsc2UgY29uc29sZS5lcnJvcihcIkludmFsaWQgcG9zaXRpb25cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNoaXBMZW5ndGggPSBzaGlwLmdldExlbmd0aCgpO1xuICAgICAgY29uc3QgaGVhZFBvc2l0aW9uID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpck9mZnNldCA9IGRpcmVjdGlvbiA9PT0gMCA/IC0xIDogMTtcbiAgICAgIGNvbnN0IHRhcmdldENvb3JkID0gaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpW29yaWVudGF0aW9uXTtcblxuICAgICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgICBwb3NpdGlvbnNbMF0gPSBoZWFkUG9zaXRpb247XG5cbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geENvb3JkLmluZGV4T2YodGFyZ2V0Q29vcmQpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICB4Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXSArIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHlDb29yZC5pbmRleE9mKHBhcnNlSW50KHRhcmdldENvb3JkKSk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVswXSArIHlDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBhbGxWYWxpZCA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICAgIGlmIChhbGxWYWxpZCkge1xuICAgICAgICBwbGFjZVNoaXAoc2hpcCwgcG9zaXRpb25zKTtcbiAgICAgIH0gZWxzZSBwbGFjZVNoaXAoc2hpcCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlY2VpdmVBdHRhY2sgPSAoY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSBudWxsKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAwO1xuICAgIH0gZWxzZSBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSAxKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAtMTtcbiAgICAgIHB1YnN1Yi5lbWl0KFwicmVjZWl2ZWRBdHRhY2tcIiwgY29vcmRpbmF0ZXMpO1xuICAgICAgc2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBpZiAoc2hpcC5pc1N1bmsoKSkge1xuICAgICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFN1bmtcIiwgc2hpcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYm9hcmRbY29vcmRpbmF0ZXNdO1xuICB9O1xuXG4gIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKTtcblxuICByZXR1cm4geyBib2FyZCwgcGxhY2VTaGlwLCByZWNlaXZlQXR0YWNrLCBhbGxTaGlwc1N1bmsgfTtcbn1cbiIsImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllcigpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcblxuICBjb25zdCBhdHRhY2sgPSAoZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGVuZW15Qm9hcmQucmVjZWl2ZUF0dGFjayhjb29yZGluYXRlcyk7XG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBhdHRhY2sgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFpKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuICBjb25zdCBhaSA9IFBsYXllcigpO1xuXG4gIGNvbnN0IGF0dGFja2luZ0FpID0ge1xuICAgIHJhbmRvbUF0dGFjazogKGVuZW15Qm9hcmQpID0+IHtcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICAgIGFpLmF0dGFjayhlbmVteUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICAgIGNvb3Jkc0F0dGFja2VkLnB1c2goY29vcmRpbmF0ZXMpO1xuICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gICAgICB9IGVsc2UgcmFuZG9tQXR0YWNrKGVuZW15Qm9hcmQpO1xuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWksIGF0dGFja2luZ0FpKTtcbn1cbiIsImV4cG9ydCBjb25zdCBwdWJzdWIgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBldmVudHMgPSB7fTtcblxuICBjb25zdCBvbiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XSB8fCBbXTtcbiAgICBldmVudHNbZXZ0XS5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBvZmYgPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0uZmlsdGVyKChjYikgPT4gY2IgIT09IGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBlbWl0ID0gKGV2dCwgZGF0YSkgPT4ge1xuICAgIGlmIChldmVudHNbZXZ0XSkge1xuICAgICAgZXZlbnRzW2V2dF0uZm9yRWFjaCgoY2IpID0+IGNiKGRhdGEpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgb24sIG9mZiwgZW1pdCB9O1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hpcChsZW5ndGgpIHtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuXG4gIGNvbnN0IGdldExlbmd0aCA9ICgpID0+IHtcbiAgICByZXR1cm4gbGVuZ3RoO1xuICB9O1xuXG4gIGNvbnN0IGdldFBvc2l0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gc2hpcFBvc2l0aW9ucztcbiAgfTtcblxuICBjb25zdCBzZXRQb3NpdGlvbnMgPSAocG9zaXRpb25zKSA9PiB7XG4gICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT4ge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NdID0geyBpc0hpdDogZmFsc2UgfTtcbiAgICB9KTtcbiAgfTtcbiAgY29uc3QgX2hpdCA9IChwb3NpdGlvbikgPT4ge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5pbmNsdWRlcyhwb3NpdGlvbikpIHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zaXRpb25dLmlzSGl0ID0gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInJlY2VpdmVkQXR0YWNrXCIsIF9oaXQpO1xuXG4gIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuZXZlcnkoXG4gICAgICAoa2V5KSA9PiBzaGlwUG9zaXRpb25zW2tleV0uaXNIaXQgPT09IHRydWVcbiAgICApO1xuICB9O1xuICByZXR1cm4geyBnZXRMZW5ndGgsIGdldFBvc2l0aW9ucywgc2V0UG9zaXRpb25zLCBpc1N1bmsgfTtcbn1cbiIsImV4cG9ydCBjb25zdCB1dGlscyA9IHtcbiAgeDogW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkhcIiwgXCJJXCIsIFwiSlwiXSxcbiAgeTogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuXG4gIHJhbmRvbUNvb3JkaW5hdGVzOiAoKSA9PiB7XG4gICAgY29uc3QgeEluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIGNvbnN0IHlJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICByZXR1cm4gdXRpbHMueFt4SW5kZXhdICsgdXRpbHMueVt5SW5kZXhdO1xuICB9LFxufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIjtcbmltcG9ydCB7IEdhbWVib2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgUGxheWVyLCBBaSB9IGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IHsgSW50ZXJmYWNlIH0gZnJvbSBcIi4vZ2FtZVVJXCI7XG5cbihmdW5jdGlvbiBHYW1lQ29udHJvbGxlcigpIHtcbiAgY29uc3QgZ2IgPSBHYW1lYm9hcmQoKTtcbiAgY29uc3Qgc2hpcCA9IFNoaXAoNSk7XG4gIGdiLnBsYWNlU2hpcChzaGlwLCBbXCJBMVwiLCBcIkIxXCIsIFwiQzFcIiwgXCJEMVwiLCBcIkUxXCJdKTtcbiAgY29uc3Qgc2hpcDIgPSBTaGlwKDUpO1xuICBnYi5wbGFjZVNoaXAoc2hpcDIpO1xuICBjb25zb2xlLmxvZyhnYi5ib2FyZCk7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9