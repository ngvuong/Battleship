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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsOENBQVM7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLDhDQUFTOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZVVJLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcHVic3ViLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3V0aWxzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuXG5leHBvcnQgY29uc3QgSW50ZXJmYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGxheWVyQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllci1ib2FyZFwiKTtcbiAgY29uc3QgZW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZW5lbXktYm9hcmRcIik7XG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFuZG9tLWJ0blwiKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm9jY3VwaWVkXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvY2N1cGllZFwiKSk7XG4gICAgcHVic3ViLmVtaXQoXCJyYW5kb21pemVkXCIsIG51bGwpO1xuICB9KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyMTsgaSsrKSB7XG4gICAgY29uc3QgcGxheWVyU3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBwbGF5ZXJTcXVhcmUuY2xhc3NOYW1lID0gXCJzcXVhcmUgcGxheWVyXCI7XG4gICAgcGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyU3F1YXJlKTtcblxuICAgIGNvbnN0IGVuZW15U3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlbmVteVNxdWFyZS5jbGFzc05hbWUgPSBcInNxdWFyZSBlbmVteVwiO1xuICAgIGVuZW15Qm9hcmQuYXBwZW5kQ2hpbGQoZW5lbXlTcXVhcmUpO1xuICB9XG5cbiAgY29uc3QgeExhYmVscyA9IHV0aWxzLng7XG4gIGNvbnN0IHlMYWJlbHMgPSB1dGlscy55O1xuXG4gIGNvbnN0IGxhYmVsQm9hcmQgPSAoYm9hcmRDbGFzc05hbWUpID0+IHtcbiAgICBsZXQgY29sTGFiZWxzID0gW1xuICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYC4ke2JvYXJkQ2xhc3NOYW1lfSAuc3F1YXJlOm50aC1jaGlsZCgtbisxMWBcbiAgICAgICksXG4gICAgXTtcbiAgICBjb2xMYWJlbHMuc2xpY2UoMSkuZm9yRWFjaCgobGFiZWwsIGkpID0+IHtcbiAgICAgIGxhYmVsLmNsYXNzTmFtZSA9IFwibGFiZWxcIjtcbiAgICAgIGxhYmVsLnRleHRDb250ZW50ID0geUxhYmVsc1tpXTtcbiAgICB9KTtcblxuICAgIGxldCByb3dMYWJlbHMgPSBbXG4gICAgICAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBgLiR7Ym9hcmRDbGFzc05hbWV9IC5zcXVhcmU6bnRoLWNoaWxkKDExbisxKWBcbiAgICAgICksXG4gICAgXTtcbiAgICByb3dMYWJlbHNbMF0uY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgIHJvd0xhYmVscy5zbGljZSgxKS5mb3JFYWNoKChsYWJlbCwgaSkgPT4ge1xuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gXCJsYWJlbFwiO1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSB4TGFiZWxzW2ldO1xuICAgIH0pO1xuICB9O1xuXG4gIGxhYmVsQm9hcmQoXCJwbGF5ZXItYm9hcmRcIik7XG4gIGxhYmVsQm9hcmQoXCJlbmVteS1ib2FyZFwiKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYC5zcXVhcmU6bnRoLWNoaWxkKG4rJHsxMyArIDExICogaX0pOm50aC1jaGlsZCgtbiskezIyICsgMTEgKiBpfSlgXG4gICAgKTtcbiAgICByb3cuZm9yRWFjaCgoc3EsIGopID0+XG4gICAgICBzcS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBvc2l0aW9uXCIsIGAke3hMYWJlbHNbaV0gKyB5TGFiZWxzW2ogJSAxMF19YClcbiAgICApO1xuICB9XG5cbiAgY29uc3QgZmlsbFNxdWFyZXMgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHBvc2l0aW9ucyA9IGRhdGEucG9zaXRpb25zO1xuICAgIGlmIChkYXRhLnR5cGUpIHtcbiAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoYC4ke2RhdGEudHlwZX1bZGF0YS1wb3NpdGlvbiA9JHtwb3N9XWApXG4gICAgICAgICAgLmNsYXNzTGlzdC5hZGQoXCJvY2N1cGllZFwiKVxuICAgICAgKTtcbiAgICB9XG4gIH07XG4gIHB1YnN1Yi5vbihcInNoaXBQbGFjZWRcIiwgZmlsbFNxdWFyZXMpO1xuXG4gIGNvbnN0IG1hcmtNaXNzID0gKGRhdGEpID0+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoYC4ke2RhdGEudHlwZX1bZGF0YS1wb3NpdGlvbj0ke2RhdGEuY29vcmRpbmF0ZXN9XWApXG4gICAgICAuY2xhc3NMaXN0LmFkZChcIm1pc3NlZFwiKTtcbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrTWlzc2VkXCIsIG1hcmtNaXNzKTtcblxuICBjb25zdCBtYXJrSGl0ID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgYC4ke2RhdGEudHlwZX1bZGF0YS1wb3NpdGlvbj0ke2RhdGEuY29vcmRpbmF0ZXN9XWBcbiAgICApO1xuICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKFwiaGl0XCIpO1xuICAgIHRhcmdldC50ZXh0Q29udGVudCA9IFwiWFwiO1xuICB9O1xuICBwdWJzdWIub24oXCJhdHRhY2tIaXRcIiwgbWFya0hpdCk7XG5cbiAgY29uc3QgZ2V0UG9zaXRpb24gPSAoZSkgPT4ge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gZS50YXJnZXQuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBwdWJzdWIuZW1pdChcImF0dGFja0xhdW5jaGVkXCIsIHBvc2l0aW9uKTtcbiAgfTtcbiAgY29uc3Qgc3F1YXJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZW5lbXkuc3F1YXJlXCIpO1xuICBzcXVhcmVzLmZvckVhY2goKHNxKSA9PlxuICAgIHNxLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRQb3NpdGlvbiwgeyBvbmNlOiB0cnVlIH0pXG4gICk7XG5cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdGFydC1idG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibWFpblwiKS5jbGFzc0xpc3QuYWRkKFwic3RhcnRcIik7XG4gIH0pO1xufSkoKTtcbiIsImltcG9ydCB7IHB1YnN1YiB9IGZyb20gXCIuL3B1YnN1YlwiO1xuaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gR2FtZWJvYXJkKHR5cGUgPSBcInBsYXllclwiKSB7XG4gIGNvbnN0IGJvYXJkID0ge307XG4gIGNvbnN0IHNoaXBzID0gW107XG5cbiAgY29uc3QgeENvb3JkID0gdXRpbHMueDtcbiAgY29uc3QgeUNvb3JkID0gdXRpbHMueTtcbiAgY29uc3QgZ3JpZENvb3JkcyA9IHhDb29yZC5tYXAoKHgpID0+IHtcbiAgICByZXR1cm4geUNvb3JkLm1hcCgoeSkgPT4geCArIHkpO1xuICB9KTtcbiAgZ3JpZENvb3Jkcy5mb3JFYWNoKChyb3cpID0+XG4gICAgcm93LmZvckVhY2goKHBvc2l0aW9uKSA9PiAoYm9hcmRbcG9zaXRpb25dID0gbnVsbCkpXG4gICk7XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHNoaXAsIHBvc2l0aW9ucyA9IFtdKSA9PiB7XG4gICAgaWYgKHBvc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uc0F2YWlsYWJsZSA9IHBvc2l0aW9ucy5ldmVyeSgocG9zKSA9PiBib2FyZFtwb3NdID09PSBudWxsKTtcbiAgICAgIGlmIChwb3NpdGlvbnNBdmFpbGFibGUpIHtcbiAgICAgICAgc2hpcC5zZXRQb3NpdGlvbnMocG9zaXRpb25zKTtcbiAgICAgICAgcG9zaXRpb25zLmZvckVhY2goKGNvb3JkKSA9PiAoYm9hcmRbY29vcmRdID0gMSkpO1xuICAgICAgICBzaGlwcy5wdXNoKHNoaXApO1xuICAgICAgICBwdWJzdWIuZW1pdChcInNoaXBQbGFjZWRcIiwgeyBwb3NpdGlvbnMsIHR5cGUgfSk7XG4gICAgICAgIHJldHVybiBzaGlwLmdldFBvc2l0aW9ucygpO1xuICAgICAgfSBlbHNlIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHBvc2l0aW9uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzaGlwTGVuZ3RoID0gc2hpcC5nZXRMZW5ndGgoKTtcbiAgICAgIGNvbnN0IGhlYWRQb3NpdGlvbiA9IHV0aWxzLnJhbmRvbUNvb3JkaW5hdGVzKCk7XG4gICAgICBjb25zdCBvcmllbnRhdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XG4gICAgICBjb25zdCBkaXJPZmZzZXQgPSBkaXJlY3Rpb24gPT09IDAgPyAtMSA6IDE7XG4gICAgICBjb25zdCB0YXJnZXRDb29yZCA9IGhlYWRQb3NpdGlvbi5zcGxpdChcIlwiKVtvcmllbnRhdGlvbl07XG5cbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgcG9zaXRpb25zWzBdID0gaGVhZFBvc2l0aW9uO1xuXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob3JpZW50YXRpb24gPT09IDApIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHhDb29yZC5pbmRleE9mKHRhcmdldENvb3JkKTtcbiAgICAgICAgICBwb3NpdGlvbnNbaV0gPVxuICAgICAgICAgICAgeENvb3JkW2luZGV4ICsgZGlyT2Zmc2V0ICogaV0gKyBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB5Q29vcmQuaW5kZXhPZihwYXJzZUludCh0YXJnZXRDb29yZCkpO1xuICAgICAgICAgIHBvc2l0aW9uc1tpXSA9XG4gICAgICAgICAgICBoZWFkUG9zaXRpb24uc3BsaXQoXCJcIilbMF0gKyB5Q29vcmRbaW5kZXggKyBkaXJPZmZzZXQgKiBpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgYWxsVmFsaWQgPSBwb3NpdGlvbnMuZXZlcnkoKHBvcykgPT4gYm9hcmRbcG9zXSA9PT0gbnVsbCk7XG4gICAgICBpZiAoYWxsVmFsaWQpIHtcbiAgICAgICAgcGxhY2VTaGlwKHNoaXAsIHBvc2l0aW9ucyk7XG4gICAgICB9IGVsc2UgcGxhY2VTaGlwKHNoaXApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWNlaXZlQXR0YWNrID0gKGNvb3JkaW5hdGVzKSA9PiB7XG4gICAgaWYgKGJvYXJkW2Nvb3JkaW5hdGVzXSA9PT0gbnVsbCkge1xuICAgICAgYm9hcmRbY29vcmRpbmF0ZXNdID0gMDtcbiAgICAgIHB1YnN1Yi5lbWl0KFwiYXR0YWNrTWlzc2VkXCIsIHsgY29vcmRpbmF0ZXMsIHR5cGUgfSk7XG4gICAgfSBlbHNlIGlmIChib2FyZFtjb29yZGluYXRlc10gPT09IDEpIHtcbiAgICAgIGJvYXJkW2Nvb3JkaW5hdGVzXSA9IC0xO1xuICAgICAgcHVic3ViLmVtaXQoXCJhdHRhY2tIaXRcIiwgeyBjb29yZGluYXRlcywgdHlwZSB9KTtcbiAgICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgaWYgKHNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICBzaGlwcy5zcGxpY2Uoc2hpcHMuaW5kZXhPZihzaGlwKSwgMSk7XG4gICAgICAgICAgcHVic3ViLmVtaXQoXCJzaGlwU3Vua1wiLCB7IHNoaXAsIHR5cGUgfSk7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzaGlwIHN1bmtcIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYm9hcmRbY29vcmRpbmF0ZXNdO1xuICB9O1xuXG4gIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKTtcblxuICByZXR1cm4geyBib2FyZCwgc2hpcHMsIHBsYWNlU2hpcCwgcmVjZWl2ZUF0dGFjaywgYWxsU2hpcHNTdW5rIH07XG59XG4iLCJpbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllcigpIHtcbiAgY29uc3QgY29vcmRzQXR0YWNrZWQgPSBbXTtcblxuICBjb25zdCBhdHRhY2sgPSAoZW5lbXlCb2FyZCwgY29vcmRpbmF0ZXMpID0+IHtcbiAgICBpZiAoIWNvb3Jkc0F0dGFja2VkLmluY2x1ZGVzKGNvb3JkaW5hdGVzKSkge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGVuZW15Qm9hcmQucmVjZWl2ZUF0dGFjayhjb29yZGluYXRlcyk7XG5cbiAgICAgIGNvb3Jkc0F0dGFja2VkLnB1c2goY29vcmRpbmF0ZXMpO1xuICAgICAgcmV0dXJuIG91dGNvbWU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IGF0dGFjayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWkoKSB7XG4gIGNvbnN0IGNvb3Jkc0F0dGFja2VkID0gW107XG4gIGNvbnN0IGFpID0gUGxheWVyKCk7XG5cbiAgY29uc3QgYXR0YWNraW5nQWkgPSB7XG4gICAgcmFuZG9tQXR0YWNrOiAoZW5lbXlCb2FyZCkgPT4ge1xuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSB1dGlscy5yYW5kb21Db29yZGluYXRlcygpO1xuICAgICAgaWYgKCFjb29yZHNBdHRhY2tlZC5pbmNsdWRlcyhjb29yZGluYXRlcykpIHtcbiAgICAgICAgYWkuYXR0YWNrKGVuZW15Qm9hcmQsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgY29vcmRzQXR0YWNrZWQucHVzaChjb29yZGluYXRlcyk7XG4gICAgICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgICAgIH0gZWxzZSBhdHRhY2tpbmdBaS5yYW5kb21BdHRhY2soZW5lbXlCb2FyZCk7XG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihhaSwgYXR0YWNraW5nQWkpO1xufVxuIiwiZXhwb3J0IGNvbnN0IHB1YnN1YiA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGV2ZW50cyA9IHt9O1xuXG4gIGNvbnN0IG9uID0gKGV2dCwgY2FsbGJhY2spID0+IHtcbiAgICBldmVudHNbZXZ0XSA9IGV2ZW50c1tldnRdIHx8IFtdO1xuICAgIGV2ZW50c1tldnRdLnB1c2goY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IG9mZiA9IChldnQsIGNhbGxiYWNrKSA9PiB7XG4gICAgZXZlbnRzW2V2dF0gPSBldmVudHNbZXZ0XS5maWx0ZXIoKGNiKSA9PiBjYiAhPT0gY2FsbGJhY2spO1xuICB9O1xuXG4gIGNvbnN0IGVtaXQgPSAoZXZ0LCBkYXRhKSA9PiB7XG4gICAgaWYgKGV2ZW50c1tldnRdKSB7XG4gICAgICBldmVudHNbZXZ0XS5mb3JFYWNoKChjYikgPT4gY2IoZGF0YSkpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBvbiwgb2ZmLCBlbWl0IH07XG59KSgpO1xuIiwiaW1wb3J0IHsgcHVic3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaGlwKGxlbmd0aCkge1xuICBjb25zdCBzaGlwUG9zaXRpb25zID0ge307XG5cbiAgY29uc3QgZ2V0TGVuZ3RoID0gKCkgPT4ge1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH07XG5cbiAgY29uc3QgZ2V0UG9zaXRpb25zID0gKCkgPT4ge1xuICAgIHJldHVybiBzaGlwUG9zaXRpb25zO1xuICB9O1xuXG4gIGNvbnN0IHNldFBvc2l0aW9ucyA9IChwb3NpdGlvbnMpID0+IHtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PiB7XG4gICAgICBzaGlwUG9zaXRpb25zW3Bvc10gPSB7IGlzSGl0OiBmYWxzZSB9O1xuICAgIH0pO1xuICB9O1xuICBjb25zdCBfaGl0ID0gKGRhdGEpID0+IHtcbiAgICBpZiAoT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuaW5jbHVkZXMoZGF0YS5jb29yZGluYXRlcykpIHtcbiAgICAgIHNoaXBQb3NpdGlvbnNbZGF0YS5jb29yZGluYXRlc10uaXNIaXQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwiYXR0YWNrSGl0XCIsIF9oaXQpO1xuXG4gIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuZXZlcnkoXG4gICAgICAoa2V5KSA9PiBzaGlwUG9zaXRpb25zW2tleV0uaXNIaXQgPT09IHRydWVcbiAgICApO1xuICB9O1xuICByZXR1cm4geyBnZXRMZW5ndGgsIGdldFBvc2l0aW9ucywgc2V0UG9zaXRpb25zLCBpc1N1bmsgfTtcbn1cbiIsImV4cG9ydCBjb25zdCB1dGlscyA9IHtcbiAgeDogW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkhcIiwgXCJJXCIsIFwiSlwiXSxcbiAgeTogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuXG4gIHJhbmRvbUNvb3JkaW5hdGVzOiAoKSA9PiB7XG4gICAgY29uc3QgeEluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIGNvbnN0IHlJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICByZXR1cm4gdXRpbHMueFt4SW5kZXhdICsgdXRpbHMueVt5SW5kZXhdO1xuICB9LFxufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIjtcbmltcG9ydCB7IEdhbWVib2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgUGxheWVyLCBBaSB9IGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IHsgSW50ZXJmYWNlIH0gZnJvbSBcIi4vZ2FtZVVJXCI7XG5pbXBvcnQgeyBwdWJzdWIgfSBmcm9tIFwiLi9wdWJzdWJcIjtcblxuKGZ1bmN0aW9uIEdhbWVDb250cm9sbGVyKCkge1xuICAvLyBQbGF5ZXIgYm9hcmRcbiAgbGV0IHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIGNvbnN0IGNhcnJpZXIgPSBTaGlwKDUpO1xuICBjb25zdCBiYXR0bGVzaGlwID0gU2hpcCg0KTtcbiAgY29uc3QgZGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3Qgc3VibWFyaW5lID0gU2hpcCgzKTtcbiAgY29uc3QgcGF0cm9sQm9hdCA9IFNoaXAoMik7XG5cbiAgY29uc3QgcmFuZG9taXplUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgIHBsYXllckJvYXJkID0gR2FtZWJvYXJkKCk7XG5cbiAgICBwbGF5ZXJCb2FyZC5wbGFjZVNoaXAoY2Fycmllcik7XG4gICAgcGxheWVyQm9hcmQucGxhY2VTaGlwKGJhdHRsZXNoaXApO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChkZXN0cm95ZXIpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChzdWJtYXJpbmUpO1xuICAgIHBsYXllckJvYXJkLnBsYWNlU2hpcChwYXRyb2xCb2F0KTtcbiAgfTtcbiAgcmFuZG9taXplUGxhY2VtZW50KCk7XG4gIHB1YnN1Yi5vbihcInJhbmRvbWl6ZWRcIiwgcmFuZG9taXplUGxhY2VtZW50KTtcblxuICAvLyBBaSBib2FyZFxuICBjb25zdCBhaUJvYXJkID0gR2FtZWJvYXJkKFwiZW5lbXlcIik7XG4gIGNvbnN0IGFpQ2FycmllciA9IFNoaXAoNSk7XG4gIGNvbnN0IGFpQmF0dGxlc2hpcCA9IFNoaXAoNCk7XG4gIGNvbnN0IGFpRGVzdHJveWVyID0gU2hpcCgzKTtcbiAgY29uc3QgYWlTdWJtYXJpbmUgPSBTaGlwKDMpO1xuICBjb25zdCBhaVBhdHJvbEJvYXQgPSBTaGlwKDIpO1xuXG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpQ2Fycmllcik7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpQmF0dGxlc2hpcCk7XG4gIGFpQm9hcmQucGxhY2VTaGlwKGFpRGVzdHJveWVyKTtcbiAgYWlCb2FyZC5wbGFjZVNoaXAoYWlTdWJtYXJpbmUpO1xuICBhaUJvYXJkLnBsYWNlU2hpcChhaVBhdHJvbEJvYXQpO1xuXG4gIC8vIFBsYXllcnNcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBQbGF5ZXIoKTtcbiAgY29uc3QgYWkgPSBBaSgpO1xuXG4gIC8vIEdhbWUgbG9vcFxuICBsZXQgaXNHYW1lT3ZlciA9IGZhbHNlO1xuICBsZXQgdHVybiA9IDE7XG4gIGNvbnN0IHBsYXllclR1cm4gPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAxKSAlIDI7XG4gIGNvbnNvbGUubG9nKHBsYXllclR1cm4pO1xuXG4gIGNvbnN0IHRha2VUdXJuID0gKGNvb3JkaW5hdGVzID0gbnVsbCkgPT4ge1xuICAgIGlmICghaXNHYW1lT3Zlcikge1xuICAgICAgY29uc29sZS5sb2coXCJ0dXJuXCIgKyB0dXJuKTtcbiAgICAgIGlmICh0dXJuICUgMiA9PT0gcGxheWVyVHVybikge1xuICAgICAgICBpZiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICBodW1hblBsYXllci5hdHRhY2soYWlCb2FyZCwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgIHR1cm4rKztcbiAgICAgICAgICB0YWtlVHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhaS5yYW5kb21BdHRhY2socGxheWVyQm9hcmQpO1xuICAgICAgICB0dXJuKys7XG4gICAgICAgIHRha2VUdXJuKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICB0YWtlVHVybigpO1xuICBwdWJzdWIub24oXCJhdHRhY2tMYXVuY2hlZFwiLCB0YWtlVHVybik7XG5cbiAgY29uc3QgaGFuZGxlU2hpcFN1bmsgPSAoZGF0YSkgPT4ge1xuICAgIGlmIChkYXRhLnR5cGUgIT09IFwicGxheWVyXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQW4gZW5lbXkgc2hpcCB3YXMgc3VuayFcIik7XG4gICAgICBjaGVja1dpbm5lcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkFuIGFsbHkgc2hpcCB3YXMgc3VuayFcIik7XG4gICAgICBjaGVja1dpbm5lcigpO1xuICAgIH1cbiAgfTtcbiAgcHVic3ViLm9uKFwic2hpcFN1bmtcIiwgaGFuZGxlU2hpcFN1bmspO1xuXG4gIGNvbnN0IGNoZWNrV2lubmVyID0gKCkgPT4ge1xuICAgIGlmIChwbGF5ZXJCb2FyZC5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgaXNHYW1lT3ZlciA9IHRydWU7XG4gICAgICBjb25zb2xlLmxvZyhcIllvdSBsb3N0IVwiKTtcbiAgICB9IGVsc2UgaWYgKGFpQm9hcmQuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgIGlzR2FtZU92ZXIgPSB0cnVlO1xuICAgICAgY29uc29sZS5sb2coXCJZb3Ugd29uIVwiKTtcbiAgICB9XG4gIH07XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9