/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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


function Gameboard() {
  const board = {};
  const ships = [];

  const xCoord = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const yCoord = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const gridCoords = xCoord.map((x) => {
    return yCoord.map((y) => x + y);
  });
  gridCoords.forEach((row) =>
    row.forEach((position) => (board[position] = null))
  );

  const placeShip = (ship, positions = []) => {
    const positionsAvailable = positions.every((pos) => board[pos] === null);
    if (positions.length) {
      if (positionsAvailable) {
        ship.setPositions(positions);
        positions.forEach((coord) => (board[coord] = 1));
        ships.push(ship);
        return ship.getPositions();
      }
    } else {
      const shipLength = ship.getLength();
      const xIndex = Math.floor(Math.random() * 10);
      const yIndex = Math.floor(Math.random() * 10);
      const headPosition = xCoord[xIndex] + yCoord[yIndex];
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

/***/ "./src/help.js":
/*!*********************!*\
  !*** ./src/help.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "helpers": () => (/* binding */ helpers)
/* harmony export */ });
function helpers() {
  const x = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // const randomCoordinates = () => {
  //   const xIndex = Math.floor(Math.random() * 10);
  //   const yIndex = Math.floor(Math.random() * 10);
  //   return x[xIndex] + y[yIndex];
  // };
  return { x, y };
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
/* harmony import */ var _help__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./help */ "./src/help.js");


console.log(_help__WEBPACK_IMPORTED_MODULE_0__.helpers.x);
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
  const x = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const attackingAi = {
    randomAttack: (enemyBoard) => {
      const xIndex = Math.floor(Math.random() * 10);
      const yIndex = Math.floor(Math.random() * 10);
      const coordinates = x[xIndex] + y[yIndex];
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




(function GameController() {
  const gb = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();
  console.log(gb);
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBa0M7O0FBRTNCO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNLGdEQUFXO0FBQ2pCO0FBQ0E7QUFDQSxVQUFVLGdEQUFXO0FBQ3JCO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxXQUFXO0FBQ1g7Ozs7Ozs7Ozs7Ozs7OztBQ2xETztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYOzs7Ozs7Ozs7Ozs7Ozs7OztBQ1RpQzs7QUFFakMsWUFBWSw0Q0FBUztBQUNkO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVztBQUNYOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSLEtBQUs7QUFDTDs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUNyQ087QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ25CaUM7O0FBRTNCO0FBQ1A7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLDhDQUFTOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVztBQUNYOzs7Ozs7O1VDaENBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7OztBQ044QjtBQUNVO0FBQ0Y7O0FBRXRDO0FBQ0EsYUFBYSxxREFBUztBQUN0QjtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2hlbHAuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gR2FtZWJvYXJkKCkge1xuICBjb25zdCBib2FyZCA9IHt9O1xuICBjb25zdCBzaGlwcyA9IFtdO1xuXG4gIGNvbnN0IHhDb29yZCA9IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIl07XG4gIGNvbnN0IHlDb29yZCA9IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMF07XG4gIGNvbnN0IGdyaWRDb29yZHMgPSB4Q29vcmQubWFwKCh4KSA9PiB7XG4gICAgcmV0dXJuIHlDb29yZC5tYXAoKHkpID0+IHggKyB5KTtcbiAgfSk7XG4gIGdyaWRDb29yZHMuZm9yRWFjaCgocm93KSA9PlxuICAgIHJvdy5mb3JFYWNoKChwb3NpdGlvbikgPT4gKGJvYXJkW3Bvc2l0aW9uXSA9IG51bGwpKVxuICApO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwLCBwb3NpdGlvbnMgPSBbXSkgPT4ge1xuICAgIGNvbnN0IHBvc2l0aW9uc0F2YWlsYWJsZSA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgaWYgKHBvc2l0aW9uc0F2YWlsYWJsZSkge1xuICAgICAgICBzaGlwLnNldFBvc2l0aW9ucyhwb3NpdGlvbnMpO1xuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaCgoY29vcmQpID0+IChib2FyZFtjb29yZF0gPSAxKSk7XG4gICAgICAgIHNoaXBzLnB1c2goc2hpcCk7XG4gICAgICAgIHJldHVybiBzaGlwLmdldFBvc2l0aW9ucygpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2hpcC5nZXRMZW5ndGgoKTtcbiAgICAgIGNvbnN0IHhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgIGNvbnN0IHlJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbiA9IHhDb29yZFt4SW5kZXhdICsgeUNvb3JkW3lJbmRleF07XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlY2VpdmVBdHRhY2sgPSAoY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSBudWxsKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAwO1xuICAgIH0gZWxzZSBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSAxKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAtMTtcbiAgICAgIHB1YnN1Yi5lbWl0KFwicmVjZWl2ZWRBdHRhY2tcIiwgY29vcmRpbmF0ZXMpO1xuICAgICAgc2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBpZiAoc2hpcC5pc1N1bmsoKSkge1xuICAgICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFN1bmtcIiwgc2hpcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYm9hcmRbY29vcmRpbmF0ZXNdO1xuICB9O1xuXG4gIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKTtcblxuICByZXR1cm4geyBib2FyZCwgcGxhY2VTaGlwLCByZWNlaXZlQXR0YWNrLCBhbGxTaGlwc1N1bmsgfTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBoZWxwZXJzKCkge1xuICBjb25zdCB4ID0gW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkhcIiwgXCJJXCIsIFwiSlwiXTtcbiAgY29uc3QgeSA9IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMF07XG4gIC8vIGNvbnN0IHJhbmRvbUNvb3JkaW5hdGVzID0gKCkgPT4ge1xuICAvLyAgIGNvbnN0IHhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgLy8gICBjb25zdCB5SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gIC8vICAgcmV0dXJuIHhbeEluZGV4XSArIHlbeUluZGV4XTtcbiAgLy8gfTtcbiAgcmV0dXJuIHsgeCwgeSB9O1xufVxuIiwiaW1wb3J0IHsgaGVscGVycyB9IGZyb20gXCIuL2hlbHBcIjtcblxuY29uc29sZS5sb2coaGVscGVycy54KTtcbmV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG5cbiAgY29uc3QgYXR0YWNrID0gKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBlbmVteUJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmRpbmF0ZXMpO1xuICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICByZXR1cm4gb3V0Y29tZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgYXR0YWNrIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBaSgpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcbiAgY29uc3QgYWkgPSBQbGF5ZXIoKTtcbiAgY29uc3QgeCA9IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIl07XG4gIGNvbnN0IHkgPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTBdO1xuXG4gIGNvbnN0IGF0dGFja2luZ0FpID0ge1xuICAgIHJhbmRvbUF0dGFjazogKGVuZW15Qm9hcmQpID0+IHtcbiAgICAgIGNvbnN0IHhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgIGNvbnN0IHlJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0geFt4SW5kZXhdICsgeVt5SW5kZXhdO1xuICAgICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgICAgYWkuYXR0YWNrKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgICAgIH0gZWxzZSByYW5kb21BdHRhY2soZW5lbXlCb2FyZCk7XG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihhaSwgYXR0YWNraW5nQWkpO1xufVxuIiwiZXhwb3J0IGNvbnN0IHB1YnN1YiA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGV2ZW50cyA9IHt9O1xuXG4gIGNvbnN0IG9uID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdIHx8IFtdO1xuICAgIGV2ZW50c1tldnRdLnB1c2goY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IG9mZiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XS5maWx0ZXIoKGNiKSA9PiBjYiAhPT0gY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IGVtaXQgPSAoZXZ0LCBkYXRhKSA9PiB7XG4gICAgaWYgKGV2ZW50c1tldnRdKSB7XG4gICAgICBldmVudHNbZXZ0XS5mb3JFYWNoKChjYikgPT4gY2IoZGF0YSkpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBvbiwgb2ZmLCBlbWl0IH07XG59KSgpO1xuIiwiaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaGlwKGxlbmd0aCkge1xuICBjb25zdCBzaGlwUG9zaXRpb25zID0ge307XG5cbiAgY29uc3QgZ2V0TGVuZ3RoID0gKCkgPT4ge1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH07XG5cbiAgY29uc3QgZ2V0UG9zaXRpb25zID0gKCkgPT4ge1xuICAgIHJldHVybiBzaGlwUG9zaXRpb25zO1xuICB9O1xuXG4gIGNvbnN0IHNldFBvc2l0aW9ucyA9IChwb3NpdGlvbnMpID0+IHtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PiB7XG4gICAgICBzaGlwUG9zaXRpb25zW3Bvc10gPSB7IGlzSGl0OiBmYWxzZSB9O1xuICAgIH0pO1xuICB9O1xuICBjb25zdCBfaGl0ID0gKHBvc2l0aW9uKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NpdGlvbl0uaXNIaXQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwicmVjZWl2ZWRBdHRhY2tcIiwgX2hpdCk7XG5cbiAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5ldmVyeShcbiAgICAgIChrZXkpID0+IHNoaXBQb3NpdGlvbnNba2V5XS5pc0hpdCA9PT0gdHJ1ZVxuICAgICk7XG4gIH07XG5cbiAgcmV0dXJuIHsgZ2V0TGVuZ3RoLCBnZXRQb3NpdGlvbnMsIHNldFBvc2l0aW9ucywgaXNTdW5rIH07XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFNoaXAgfSBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBHYW1lYm9hcmQgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IFBsYXllciwgQWkgfSBmcm9tIFwiLi9wbGF5ZXJcIjtcblxuKGZ1bmN0aW9uIEdhbWVDb250cm9sbGVyKCkge1xuICBjb25zdCBnYiA9IEdhbWVib2FyZCgpO1xuICBjb25zb2xlLmxvZyhnYik7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9