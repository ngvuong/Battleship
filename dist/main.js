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
    row.forEach(
      (sq, j) => (sq.className += ` ${xLabels[i] + yLabels[j % 10]}`)
    );
  }

  const fillSquares = (data) => {
    const positions = data.positions;
    if (data.type === "player") {
      positions.forEach((pos) =>
        document.querySelector(`.player.${pos}`).classList.add("occupied")
      );
    }
  };
  _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.on("shipPlaced", fillSquares);
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
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7O0FDTjhCO0FBQ1U7QUFDRjtBQUNEO0FBQ0g7O0FBRWxDO0FBQ0E7QUFDQSxvQkFBb0IscURBQVM7QUFDN0Isa0JBQWtCLDJDQUFJO0FBQ3RCLHFCQUFxQiwyQ0FBSTtBQUN6QixvQkFBb0IsMkNBQUk7QUFDeEIsb0JBQW9CLDJDQUFJO0FBQ3hCLHFCQUFxQiwyQ0FBSTs7QUFFekI7QUFDQSxrQkFBa0IscURBQVM7O0FBRTNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxFQUFFLDhDQUFTOztBQUVYO0FBQ0Esa0JBQWtCLHFEQUFTO0FBQzNCLG9CQUFvQiwyQ0FBSTtBQUN4Qix1QkFBdUIsMkNBQUk7QUFDM0Isc0JBQXNCLDJDQUFJO0FBQzFCLHNCQUFzQiwyQ0FBSTtBQUMxQix1QkFBdUIsMkNBQUk7O0FBRTNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lVUkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBjb25zdCBJbnRlcmZhY2UgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBwbGF5ZXJCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWVyLWJvYXJkXCIpO1xuICBjb25zdCBlbmVteUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5lbmVteS1ib2FyZFwiKTtcbiAgY29uc3QgcmFuZG9tQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yYW5kb20tYnRuXCIpO1xuICByYW5kb21CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIub2NjdXBpZWRcIilcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9jY3VwaWVkXCIpKTtcbiAgICBwdWJzdWIuZW1pdChcInJhbmRvbWl6ZWRcIiwgbnVsbCk7XG4gIH0pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTIxOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXJTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBsYXllclNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBwbGF5ZXJcIjtcbiAgICBwbGF5ZXJCb2FyZC5hcHBlbmRDaGlsZChwbGF5ZXJTcXVhcmUpO1xuXG4gICAgY29uc3QgZW5lbXlTcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGVuZW15U3F1YXJlLmNsYXNzTmFtZSA9IFwic3F1YXJlIGVuZW15XCI7XG4gICAgZW5lbXlCb2FyZC5hcHBlbmRDaGlsZChlbmVteVNxdWFyZSk7XG4gIH1cblxuICBjb25zdCB4TGFiZWxzID0gdXRpbHMueDtcbiAgY29uc3QgeUxhYmVscyA9IHV0aWxzLnk7XG5cbiAgY29uc3QgbGFiZWxCb2FyZCA9IChib2FyZENsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBjb2xMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKC1uKzExYFxuICAgICAgKSxcbiAgICBdO1xuICAgIGNvbExhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4gKGxhYmVsLnRleHRDb250ZW50ID0geUxhYmVsc1tpXSkpO1xuXG4gICAgbGV0IHJvd0xhYmVscyA9IFtcbiAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIGAuJHtib2FyZENsYXNzTmFtZX0gLnNxdWFyZTpudGgtY2hpbGQoMTFuKzEpYFxuICAgICAgKSxcbiAgICBdO1xuICAgIHJvd0xhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4gKGxhYmVsLnRleHRDb250ZW50ID0geExhYmVsc1tpXSkpO1xuICB9O1xuXG4gIGxhYmVsQm9hcmQoXCJwbGF5ZXItYm9hcmRcIik7XG4gIGxhYmVsQm9hcmQoXCJlbmVteS1ib2FyZFwiKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYC5zcXVhcmU6bnRoLWNoaWxkKG4rJHsxMyArIDExICogaX0pOm50aC1jaGlsZCgtbiskezIyICsgMTEgKiBpfSlgXG4gICAgKTtcbiAgICByb3cuZm9yRWFjaChcbiAgICAgIChzcSwgaikgPT4gKHNxLmNsYXNzTmFtZSArPSBgICR7eExhYmVsc1tpXSArIHlMYWJlbHNbaiAlIDEwXX1gKVxuICAgICk7XG4gIH1cblxuICBjb25zdCBmaWxsU3F1YXJlcyA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb25zID0gZGF0YS5wb3NpdGlvbnM7XG4gICAgaWYgKGRhdGEudHlwZSA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnBsYXllci4ke3Bvc31gKS5jbGFzc0xpc3QuYWRkKFwib2NjdXBpZWRcIilcbiAgICAgICk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUGxhY2VkXCIsIGZpbGxTcXVhcmVzKTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVib2FyZCh0eXBlID0gXCJwbGF5ZXJcIikge1xuICBjb25zdCBib2FyZCA9IHt9O1xuICBjb25zdCBzaGlwcyA9IFtdO1xuXG4gIGNvbnN0IHhDb29yZCA9IHV0aWxzLng7XG4gIGNvbnN0IHlDb29yZCA9IHV0aWxzLnk7XG4gIGNvbnN0IGdyaWRDb29yZHMgPSB4Q29vcmQubWFwKCh4KSA9PiB7XG4gICAgcmV0dXJuIHlDb29yZC5tYXAoKHkpID0+IHggKyB5KTtcbiAgfSk7XG4gIGdyaWRDb29yZHMuZm9yRWFjaCgocm93KSA9PlxuICAgIHJvdy5mb3JFYWNoKChwb3NpdGlvbikgPT4gKGJvYXJkW3Bvc2l0aW9uXSA9IG51bGwpKVxuICApO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwLCBwb3NpdGlvbnMgPSBbXSkgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbnNBdmFpbGFibGUgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAocG9zaXRpb25zQXZhaWxhYmxlKSB7XG4gICAgICAgIHNoaXAuc2V0UG9zaXRpb25zKHBvc2l0aW9ucyk7XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChjb29yZCkgPT4gKGJvYXJkW2Nvb3JkXSA9IDEpKTtcbiAgICAgICAgc2hpcHMucHVzaChzaGlwKTtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUGxhY2VkXCIsIHsgcG9zaXRpb25zLCB0eXBlIH0pO1xuICAgICAgICByZXR1cm4gc2hpcC5nZXRQb3NpdGlvbnMoKTtcbiAgICAgIH0gZWxzZSBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBwb3NpdGlvblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2hpcExlbmd0aCA9IHNoaXAuZ2V0TGVuZ3RoKCk7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb24gPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyT2Zmc2V0ID0gZGlyZWN0aW9uID09PSAwID8gLTEgOiAxO1xuICAgICAgY29uc3QgdGFyZ2V0Q29vcmQgPSBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbb3JpZW50YXRpb25dO1xuXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgIHBvc2l0aW9uc1swXSA9IGhlYWRQb3NpdGlvbjtcblxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB4Q29vcmQuaW5kZXhPZih0YXJnZXRDb29yZCk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIHhDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldICsgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geUNvb3JkLmluZGV4T2YocGFyc2VJbnQodGFyZ2V0Q29vcmQpKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzBdICsgeUNvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsbFZhbGlkID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKGFsbFZhbGlkKSB7XG4gICAgICAgIHBsYWNlU2hpcChzaGlwLCBwb3NpdGlvbnMpO1xuICAgICAgfSBlbHNlIHBsYWNlU2hpcChzaGlwKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVjZWl2ZUF0dGFjayA9IChjb29yZGluYXRlcykgPT4ge1xuICAgIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IG51bGwpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IDA7XG4gICAgfSBlbHNlIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IDEpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IC0xO1xuICAgICAgcHVic3ViLmVtaXQoXCJyZWNlaXZlZEF0dGFja1wiLCBjb29yZGluYXRlcyk7XG4gICAgICBzaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGlmIChzaGlwLmlzU3VuaygpKSB7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCBzaGlwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBib2FyZFtjb29yZGluYXRlc107XG4gIH07XG5cbiAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4gc2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuaXNTdW5rKCkpO1xuXG4gIHJldHVybiB7IGJvYXJkLCBzaGlwcywgcGxhY2VTaGlwLCByZWNlaXZlQXR0YWNrLCBhbGxTaGlwc1N1bmsgfTtcbn1cbiIsImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllcigpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcblxuICBjb25zdCBhdHRhY2sgPSAoZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGVuZW15Qm9hcmQucmVjZWl2ZUF0dGFjayhjb29yZGluYXRlcyk7XG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBhdHRhY2sgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFpKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuICBjb25zdCBhaSA9IFBsYXllcigpO1xuXG4gIGNvbnN0IGF0dGFja2luZ0FpID0ge1xuICAgIHJhbmRvbUF0dGFjazogKGVuZW15Qm9hcmQpID0+IHtcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICAgIGFpLmF0dGFjayhlbmVteUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICAgIGNvb3Jkc0F0dGFja2VkLnB1c2goY29vcmRpbmF0ZXMpO1xuICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gICAgICB9IGVsc2UgcmFuZG9tQXR0YWNrKGVuZW15Qm9hcmQpO1xuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWksIGF0dGFja2luZ0FpKTtcbn1cbiIsImV4cG9ydCBjb25zdCBwdWJzdWIgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBldmVudHMgPSB7fTtcblxuICBjb25zdCBvbiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XSB8fCBbXTtcbiAgICBldmVudHNbZXZ0XS5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBvZmYgPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0uZmlsdGVyKChjYikgPT4gY2IgIT09IGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBlbWl0ID0gKGV2dCwgZGF0YSkgPT4ge1xuICAgIGlmIChldmVudHNbZXZ0XSkge1xuICAgICAgZXZlbnRzW2V2dF0uZm9yRWFjaCgoY2IpID0+IGNiKGRhdGEpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgb24sIG9mZiwgZW1pdCB9O1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hpcChsZW5ndGgpIHtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuXG4gIGNvbnN0IGdldExlbmd0aCA9ICgpID0+IHtcbiAgICByZXR1cm4gbGVuZ3RoO1xuICB9O1xuXG4gIGNvbnN0IGdldFBvc2l0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gc2hpcFBvc2l0aW9ucztcbiAgfTtcblxuICBjb25zdCBzZXRQb3NpdGlvbnMgPSAocG9zaXRpb25zKSA9PiB7XG4gICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT4ge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NdID0geyBpc0hpdDogZmFsc2UgfTtcbiAgICB9KTtcbiAgfTtcbiAgY29uc3QgX2hpdCA9IChwb3NpdGlvbikgPT4ge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5pbmNsdWRlcyhwb3NpdGlvbikpIHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbcG9zaXRpb25dLmlzSGl0ID0gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInJlY2VpdmVkQXR0YWNrXCIsIF9oaXQpO1xuXG4gIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuZXZlcnkoXG4gICAgICAoa2V5KSA9PiBzaGlwUG9zaXRpb25zW2tleV0uaXNIaXQgPT09IHRydWVcbiAgICApO1xuICB9O1xuICByZXR1cm4geyBnZXRMZW5ndGgsIGdldFBvc2l0aW9ucywgc2V0UG9zaXRpb25zLCBpc1N1bmsgfTtcbn1cbiIsImV4cG9ydCBjb25zdCB1dGlscyA9IHtcbiAgeDogW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkhcIiwgXCJJXCIsIFwiSlwiXSxcbiAgeTogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuXG4gIHJhbmRvbUNvb3JkaW5hdGVzOiAoKSA9PiB7XG4gICAgY29uc3QgeEluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIGNvbnN0IHlJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICByZXR1cm4gdXRpbHMueFt4SW5kZXhdICsgdXRpbHMueVt5SW5kZXhdO1xuICB9LFxufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIjtcbmltcG9ydCB7IEdhbWVib2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgUGxheWVyLCBBaSB9IGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IHsgSW50ZXJmYWNlIH0gZnJvbSBcIi4vZ2FtZVVJXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuKGZ1bmN0aW9uIEdhbWVDb250cm9sbGVyKCkge1xuICAvLyBQbGF5ZXIgYm9hcmRcbiAgbGV0IHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIGNvbnN0IGNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBiYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgZGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3Qgc3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgcGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgY29uc3QgcmFuZG9taXplUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgIHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG5cbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoY2Fycmllcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGJhdHRsZXNoaXApO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChkZXN0cm95ZXIpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChzdWJtYXJpbmUpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChwYXRyb2xCb2F0KTtcbiAgfTtcblxuICBwdWJzdWIub24oXCJyYW5kb21pemVkXCIsIHJhbmRvbWl6ZVBsYWNlbWVudCk7XG5cbiAgLy8gQWkgYm9hcmRcbiAgY29uc3QgYWlCb2FyZCA9IEdhbWVib2FyZChcImVuZW15XCIpO1xuICBjb25zdCBhaUNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBhaUJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBhaURlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IGFpU3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgYWlQYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBhaUJvYXJkLnBsYWNlU2hpcChhaUNhcnJpZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaUJhdHRsZXNoaXApO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaURlc3Ryb3llcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpU3VibWFyaW5lKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlQYXRyb2xCb2F0KTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=