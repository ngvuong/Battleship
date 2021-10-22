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

  const getPosition = (e) => {
    const position = e.target.dataset.position;
    _pubsub__WEBPACK_IMPORTED_MODULE_1__.pubsub.emit("attackLaunched", position);
  };
  const squares = document.querySelectorAll(".enemy.square");
  squares.forEach((sq) =>
    sq.addEventListener("click", getPosition, { once: true })
  );

  document.querySelector(".start-btn").addEventListener("click", () => {
    document.querySelector("main").classList.add("start");
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

  const randomizePlacement = () => {
    playerBoard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__.Gameboard)();

    playerBoard.placeShip(carrier);
    playerBoard.placeShip(battleship);
    playerBoard.placeShip(destroyer);
    playerBoard.placeShip(submarine);
    playerBoard.placeShip(patrolBoat);
  };
  randomizePlacement();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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OENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLDhDQUFTOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZVVJLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcHVic3ViLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3V0aWxzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFuZG9tLWJ0blwiKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgcHVic3ViLmVtaXQoXCJyYW5kb21pemVkXCIsIG51bGwpO1xuICB9KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyMTsgaSsrKSB7XG4gICAgY29uc3QgcGxheWVyU3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBwbGF5ZXJTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmUgcGxheWVyXCI7XG4gICAgcGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyU3F1YXJlKTtcblxuICAgIGNvbnN0IGVuZW15U3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlbmVteVNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBlbmVteVwiO1xuICAgIGVuZW15Qm9hcmQuYXBwZW5kQ2hpbGQoZW5lbXlTcXVhcmUpO1xuICB9XG5cbiAgY29uc3QgeExhYmVscyA9IHV0aWxzLng7XG4gIGNvbnN0IHlMYWJlbHMgPSB1dGlscy55O1xuXG4gIGNvbnN0IGxhYmVsQm9hcmQgPSAoYm9hcmRDbGFzc05hbWUpID0+IHtcbiAgICBsZXQgY29sTGFiZWxzID0gW1xuICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYC4ke2JvYXJkQ2xhc3NOYW1lfSAuc3F1YXJlOm50aC1jaGlsZCgtbisxMWBcbiAgICAgICksXG4gICAgXTtcbiAgICBjb2xMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IChsYWJlbC50ZXh0Q29udGVudCA9IHlMYWJlbHNbaV0pKTtcblxuICAgIGxldCByb3dMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKDExbisxKWBcbiAgICAgICksXG4gICAgXTtcbiAgICByb3dMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IChsYWJlbC50ZXh0Q29udGVudCA9IHhMYWJlbHNbaV0pKTtcbiAgfTtcblxuICBsYWJlbEJvYXJkKFwicGxheWVyLWJvYXJkXCIpO1xuICBsYWJlbEJvYXJkKFwiZW5lbXktYm9hcmRcIik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIGAuc3F1YXJlOm50aC1jaGlsZChuKyR7MTMgKyAxMSAqIGl9KTpudGgtY2hpbGQoLW4rJHsyMiArIDExICogaX0pYFxuICAgICk7XG4gICAgcm93LmZvckVhY2goKHNxLCBqKSA9PlxuICAgICAgc3Euc2V0QXR0cmlidXRlKFwiZGF0YS1wb3NpdGlvblwiLCBgJHt4TGFiZWxzW2ldICsgeUxhYmVsc1tqICUgMTBdfWApXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGZpbGxTcXVhcmVzID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBkYXRhLnBvc2l0aW9ucztcbiAgICBpZiAoZGF0YS50eXBlKSB7XG4gICAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PlxuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb24gPSR7cG9zfV1gKVxuICAgICAgICAgIC5jbGFzc0xpc3QuYWRkKFwib2NjdXBpZWRcIilcbiAgICAgICk7XG4gICAgfVxuICB9O1xuICBwdWJzdWIub24oXCJzaGlwUGxhY2VkXCIsIGZpbGxTcXVhcmVzKTtcblxuICBjb25zdCBtYXJrTWlzcyA9IChkYXRhKSA9PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb249JHtkYXRhLmNvb3JkaW5hdGVzfV1gKVxuICAgICAgLmNsYXNzTGlzdC5hZGQoXCJtaXNzZWRcIik7XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja01pc3NlZFwiLCBtYXJrTWlzcyk7XG5cbiAgY29uc3QgbWFya0hpdCA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHtkYXRhLnR5cGV9W2RhdGEtcG9zaXRpb249JHtkYXRhLmNvb3JkaW5hdGVzfV1gXG4gICAgKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZChcImhpdFwiKTtcbiAgICB0YXJnZXQudGV4dENvbnRlbnQgPSBcIlhcIjtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrSGl0XCIsIG1hcmtIaXQpO1xuXG4gIGNvbnN0IGdldFBvc2l0aW9uID0gKGUpID0+IHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGUudGFyZ2V0LmRhdGFzZXQucG9zaXRpb247XG4gICAgcHVic3ViLmVtaXQoXCJhdHRhY2tMYXVuY2hlZFwiLCBwb3NpdGlvbik7XG4gIH07XG4gIGNvbnN0IHNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmVuZW15LnNxdWFyZVwiKTtcbiAgc3F1YXJlcy5mb3JFYWNoKChzcSkgPT5cbiAgICBzcS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0UG9zaXRpb24sIHsgb25jZTogdHJ1ZSB9KVxuICApO1xuXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3RhcnQtYnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIm1haW5cIikuY2xhc3NMaXN0LmFkZChcInN0YXJ0XCIpO1xuICB9KTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVib2FyZCh0eXBlID0gXCJwbGF5ZXJcIikge1xuICBjb25zdCBib2FyZCA9IHt9O1xuICBjb25zdCBzaGlwcyA9IFtdO1xuXG4gIGNvbnN0IHhDb29yZCA9IHV0aWxzLng7XG4gIGNvbnN0IHlDb29yZCA9IHV0aWxzLnk7XG4gIGNvbnN0IGdyaWRDb29yZHMgPSB4Q29vcmQubWFwKCh4KSA9PiB7XG4gICAgcmV0dXJuIHlDb29yZC5tYXAoKHkpID0+IHggKyB5KTtcbiAgfSk7XG4gIGdyaWRDb29yZHMuZm9yRWFjaCgocm93KSA9PlxuICAgIHJvdy5mb3JFYWNoKChwb3NpdGlvbikgPT4gKGJvYXJkW3Bvc2l0aW9uXSA9IG51bGwpKVxuICApO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwLCBwb3NpdGlvbnMgPSBbXSkgPT4ge1xuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbnNBdmFpbGFibGUgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAocG9zaXRpb25zQXZhaWxhYmxlKSB7XG4gICAgICAgIHNoaXAuc2V0UG9zaXRpb25zKHBvc2l0aW9ucyk7XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChjb29yZCkgPT4gKGJvYXJkW2Nvb3JkXSA9IDEpKTtcbiAgICAgICAgc2hpcHMucHVzaChzaGlwKTtcbiAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwUGxhY2VkXCIsIHsgcG9zaXRpb25zLCB0eXBlIH0pO1xuICAgICAgICByZXR1cm4gc2hpcC5nZXRQb3NpdGlvbnMoKTtcbiAgICAgIH0gZWxzZSBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBwb3NpdGlvblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2hpcExlbmd0aCA9IHNoaXAuZ2V0TGVuZ3RoKCk7XG4gICAgICBjb25zdCBoZWFkUG9zaXRpb24gPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyT2Zmc2V0ID0gZGlyZWN0aW9uID09PSAwID8gLTEgOiAxO1xuICAgICAgY29uc3QgdGFyZ2V0Q29vcmQgPSBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbb3JpZW50YXRpb25dO1xuXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgIHBvc2l0aW9uc1swXSA9IGhlYWRQb3NpdGlvbjtcblxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB4Q29vcmQuaW5kZXhPZih0YXJnZXRDb29yZCk7XG4gICAgICAgICAgcG9zaXRpb25zW2ldID1cbiAgICAgICAgICAgIHhDb29yZFtpbmRleCArIGRpck9mZnNldCAqIGldICsgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0geUNvb3JkLmluZGV4T2YocGFyc2VJbnQodGFyZ2V0Q29vcmQpKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgaGVhZFBvc2l0aW9uLnNwbGl0KFwiXCIpWzBdICsgeUNvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsbFZhbGlkID0gcG9zaXRpb25zLmV2ZXJ5KChwb3MpID0+IGJvYXJkW3Bvc10gPT09IG51bGwpO1xuICAgICAgaWYgKGFsbFZhbGlkKSB7XG4gICAgICAgIHBsYWNlU2hpcChzaGlwLCBwb3NpdGlvbnMpO1xuICAgICAgfSBlbHNlIHBsYWNlU2hpcChzaGlwKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVjZWl2ZUF0dGFjayA9IChjb29yZGluYXRlcykgPT4ge1xuICAgIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IG51bGwpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IDA7XG4gICAgICBwdWJzdWIuZW1pdChcImF0dGFja01pc3NlZFwiLCB7IGNvb3JkaW5hdGVzLCB0eXBlIH0pO1xuICAgIH0gZWxzZSBpZiAoYm9hcmRbY29vcmRpbmF0ZXNdID09PSAxKSB7XG4gICAgICBib2FyZFtjb29yZGluYXRlc10gPSAtMTtcbiAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrSGl0XCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG4gICAgICBzaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGlmIChzaGlwLmlzU3VuaygpKSB7XG4gICAgICAgICAgc2hpcHMuc3BsaWNlKHNoaXBzLmluZGV4T2Yoc2hpcCksIDEpO1xuICAgICAgICAgIHB1YnN1Yi5lbWl0KFwic2hpcFN1bmtcIiwgeyBzaGlwLCB0eXBlIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwic2hpcCBzdW5rXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJvYXJkW2Nvb3JkaW5hdGVzXTtcbiAgfTtcblxuICBjb25zdCBhbGxTaGlwc1N1bmsgPSAoKSA9PiBzaGlwcy5ldmVyeSgoc2hpcCkgPT4gc2hpcC5pc1N1bmsoKSk7XG5cbiAgcmV0dXJuIHsgYm9hcmQsIHNoaXBzLCBwbGFjZVNoaXAsIHJlY2VpdmVBdHRhY2ssIGFsbFNoaXBzU3VuayB9O1xufVxuIiwiaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG5cbiAgY29uc3QgYXR0YWNrID0gKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBlbmVteUJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmRpbmF0ZXMpO1xuXG4gICAgICBjb29yZHNBdHRhY2tlZC5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIHJldHVybiBvdXRjb21lO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBhdHRhY2sgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFpKCkge1xuICBjb25zdCBjb29yZHNBdHRhY2tlZCA9IFtdO1xuICBjb25zdCBhaSA9IFBsYXllcigpO1xuXG4gIGNvbnN0IGF0dGFja2luZ0FpID0ge1xuICAgIHJhbmRvbUF0dGFjazogKGVuZW15Qm9hcmQpID0+IHtcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdXRpbHMucmFuZG9tQ29vcmRpbmF0ZXMoKTtcbiAgICAgIGlmICghY29vcmRzQXR0YWNrZWQuaW5jbHVkZXMoY29vcmRpbmF0ZXMpKSB7XG4gICAgICAgIGFpLmF0dGFjayhlbmVteUJvYXJkLCBjb29yZGluYXRlcyk7XG4gICAgICAgIGNvb3Jkc0F0dGFja2VkLnB1c2goY29vcmRpbmF0ZXMpO1xuICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gICAgICB9IGVsc2UgYXR0YWNraW5nQWkucmFuZG9tQXR0YWNrKGVuZW15Qm9hcmQpO1xuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWksIGF0dGFja2luZ0FpKTtcbn1cbiIsImV4cG9ydCBjb25zdCBwdWJzdWIgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBldmVudHMgPSB7fTtcblxuICBjb25zdCBvbiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XSB8fCBbXTtcbiAgICBldmVudHNbZXZ0XS5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBvZmYgPSAoZXZ0LCBjYWxsYmFjaykgPT4ge1xuICAgIGV2ZW50c1tldnRdID0gZXZlbnRzW2V2dF0uZmlsdGVyKChjYikgPT4gY2IgIT09IGNhbGxiYWNrKTtcbiAgfTtcblxuICBjb25zdCBlbWl0ID0gKGV2dCwgZGF0YSkgPT4ge1xuICAgIGlmIChldmVudHNbZXZ0XSkge1xuICAgICAgZXZlbnRzW2V2dF0uZm9yRWFjaCgoY2IpID0+IGNiKGRhdGEpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgb24sIG9mZiwgZW1pdCB9O1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hpcChsZW5ndGgpIHtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuXG4gIGNvbnN0IGdldExlbmd0aCA9ICgpID0+IHtcbiAgICByZXR1cm4gbGVuZ3RoO1xuICB9O1xuXG4gIGNvbnN0IGdldFBvc2l0aW9ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gc2hpcFBvc2l0aW9ucztcbiAgfTtcblxuICBjb25zdCBzZXRQb3NpdGlvbnMgPSAocG9zaXRpb25zKSA9PiB7XG4gICAgcG9zaXRpb25zLmZvckVhY2goKHBvcykgPT4ge1xuICAgICAgc2hpcFBvc2l0aW9uc1twb3NdID0geyBpc0hpdDogZmFsc2UgfTtcbiAgICB9KTtcbiAgfTtcbiAgY29uc3QgX2hpdCA9IChkYXRhKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmluY2x1ZGVzKGRhdGEuY29vcmRpbmF0ZXMpKSB7XG4gICAgICBzaGlwUG9zaXRpb25zW2RhdGEuY29vcmRpbmF0ZXNdLmlzSGl0ID0gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcImF0dGFja0hpdFwiLCBfaGl0KTtcblxuICBjb25zdCBpc1N1bmsgPSAoKSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmV2ZXJ5KFxuICAgICAgKGtleSkgPT4gc2hpcFBvc2l0aW9uc1trZXldLmlzSGl0ID09PSB0cnVlXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHsgZ2V0TGVuZ3RoLCBnZXRQb3NpdGlvbnMsIHNldFBvc2l0aW9ucywgaXNTdW5rIH07XG59XG4iLCJleHBvcnQgY29uc3QgdXRpbHMgPSB7XG4gIHg6IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIl0sXG4gIHk6IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcblxuICByYW5kb21Db29yZGluYXRlczogKCkgPT4ge1xuICAgIGNvbnN0IHhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICBjb25zdCB5SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgcmV0dXJuIHV0aWxzLnhbeEluZGV4XSArIHV0aWxzLnlbeUluZGV4XTtcbiAgfSxcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFNoaXAgfSBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBHYW1lYm9hcmQgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IFBsYXllciwgQWkgfSBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCB7IEludGVyZmFjZSB9IGZyb20gXCIuL2dhbWVVSVwiO1xuaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbihmdW5jdGlvbiBHYW1lQ29udHJvbGxlcigpIHtcbiAgLy8gUGxheWVyIGJvYXJkXG4gIGxldCBwbGF5ZXJCb2FyZCA9IEdhbWVib2FyZCgpO1xuICBjb25zdCBjYXJyaWVyID0gU2hpcCg1KTtcbiAgY29uc3QgYmF0dGxlc2hpcCA9IFNoaXAoNCk7XG4gIGNvbnN0IGRlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IHN1Ym1hcmluZSA9IFNoaXAoMyk7XG4gIGNvbnN0IHBhdHJvbEJvYXQgPSBTaGlwKDIpO1xuXG4gIGNvbnN0IHJhbmRvbWl6ZVBsYWNlbWVudCA9ICgpID0+IHtcbiAgICBwbGF5ZXJCb2FyZCA9IEdhbWVib2FyZCgpO1xuXG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGNhcnJpZXIpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChiYXR0bGVzaGlwKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoZGVzdHJveWVyKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoc3VibWFyaW5lKTtcbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAocGF0cm9sQm9hdCk7XG4gIH07XG4gIHJhbmRvbWl6ZVBsYWNlbWVudCgpO1xuICBwdWJzdWIub24oXCJyYW5kb21pemVkXCIsIHJhbmRvbWl6ZVBsYWNlbWVudCk7XG5cbiAgLy8gQWkgYm9hcmRcbiAgY29uc3QgYWlCb2FyZCA9IEdhbWVib2FyZChcImVuZW15XCIpO1xuICBjb25zdCBhaUNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBhaUJhdHRsZXNoaXAgPSBTaGlwKDQpO1xuICBjb25zdCBhaURlc3Ryb3llciA9IFNoaXAoMyk7XG4gIGNvbnN0IGFpU3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgYWlQYXRyb2xCb2F0ID0gU2hpcCgyKTtcblxuICBhaUJvYXJkLnBsYWNlU2hpcChhaUNhcnJpZXIpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaUJhdHRsZXNoaXApO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaURlc3Ryb3llcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpU3VibWFyaW5lKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlQYXRyb2xCb2F0KTtcblxuICAvLyBQbGF5ZXJzXG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKCk7XG4gIGNvbnN0IGFpID0gQWkoKTtcblxuICAvLyBHYW1lIGxvb3BcbiAgbGV0IGlzR2FtZU92ZXIgPSBmYWxzZTtcbiAgbGV0IHR1cm4gPSAxO1xuICBjb25zdCBwbGF5ZXJUdXJuID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMSkgJSAyO1xuICBjb25zb2xlLmxvZyhwbGF5ZXJUdXJuKTtcblxuICBjb25zdCB0YWtlVHVybiA9IChjb29yZGluYXRlcyA9IG51bGwpID0+IHtcbiAgICBpZiAoIWlzR2FtZU92ZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidHVyblwiICsgdHVybik7XG4gICAgICBpZiAodHVybiAlIDIgPT09IHBsYXllclR1cm4pIHtcbiAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgaHVtYW5QbGF5ZXIuYXR0YWNrKGFpQm9hcmQsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICB0dXJuKys7XG4gICAgICAgICAgdGFrZVR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWkucmFuZG9tQXR0YWNrKHBsYXllckJvYXJkKTtcbiAgICAgICAgdHVybisrO1xuICAgICAgICB0YWtlVHVybigpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgdGFrZVR1cm4oKTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrTGF1bmNoZWRcIiwgdGFrZVR1cm4pO1xuXG4gIGNvbnN0IGhhbmRsZVNoaXBTdW5rID0gKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YS50eXBlICE9PSBcInBsYXllclwiKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkFuIGVuZW15IHNoaXAgd2FzIHN1bmshXCIpO1xuICAgICAgY2hlY2tXaW5uZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJBbiBhbGx5IHNoaXAgd2FzIHN1bmshXCIpO1xuICAgICAgY2hlY2tXaW5uZXIoKTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInNoaXBTdW5rXCIsIGhhbmRsZVNoaXBTdW5rKTtcblxuICBjb25zdCBjaGVja1dpbm5lciA9ICgpID0+IHtcbiAgICBpZiAocGxheWVyQm9hcmQuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgIGlzR2FtZU92ZXIgPSB0cnVlO1xuICAgICAgY29uc29sZS5sb2coXCJZb3UgbG9zdCFcIik7XG4gICAgfSBlbHNlIGlmIChhaUJvYXJkLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICBpc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUubG9nKFwiWW91IHdvbiFcIik7XG4gICAgfVxuICB9O1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==