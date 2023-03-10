/* eslint-disable no-use-before-define */
import "./style.css";

export const Ship = (x, y, length, orientation) => {
  let hitNumber = 0;
  const components = [];

  if (orientation === "horizontal") {
    for (let i = y; i < y + length; i += 1) {
      components.push([x, i]);
    }
  }
  if (orientation === "vertical") {
    for (let i = x; i < x + length; i += 1) {
      components.push([i, y]);
    }
  }

  const getHit = () => {
    hitNumber += 1;
  };

  const isSunk = () => hitNumber === length;

  const getComponents = () => components;

  return { getHit, isSunk, getComponents };
};

export const Gameboard = (owner) => {
  let board = Array.from({ length: 10 }, () => new Array(10).fill(null));
  const missedAttacks = [];
  const hits = [];

  const getBoard = () => board;
  const getCell = (x, y) => board[x][y];
  const resetBoard = () => {
    board = board.map(() => new Array(10).fill(null));
  };

  const moveExists = (x, y) => {
    if (missedAttacks.some(([a, b]) => a === x && b === y)) return true;
    if (hits.some(([a, b]) => a === x && b === y)) return true;
    return false;
  };

  const placeShip = (x, y, length, orientation) => {
    if (isPlacementValid(x, y, length, orientation)) {
      board[x][y] = Ship(x, y, length, orientation);
    }
    return false;
  };

  const placeShipRandomly = (x, y, length, orientation) => {
    if (isPlacementValid(x, y, length, orientation)) {
      board[x][y] = Ship(x, y, length, orientation);
    } else
      placeShipRandomly(randomNum(), randomNum(), length, randomDirection());
  };

  const isPlacementValid = (x, y, length, orientation) => {
    // this needs refactoring... lots of it...
    const allLocsFlat = () => getAllLocations().flat();

    const getBannedLocs = (array) => {
      const arr = [];
      for (let i = 0; i < array.length; i++) {
        arr.push(locz(array[i][0], array[i][1]));
      }
      return arr;
    };

    const locz = (x, y) => [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
      [x - 1, y - 1],
      [x + 1, y + 1],
      [x + 1, y - 1],
      [x - 1, y + 1],
    ];

    const bannedLocsFlat = () => getBannedLocs(allLocsFlat()).flat();

    if (orientation === "horizontal") {
      if (y + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (bannedLocsFlat().some(([a, b]) => a === x && b === y + i)) {
          return false;
        }
      }
    } else {
      if (x + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (bannedLocsFlat().some(([a, b]) => a === x + i && b === y)) {
          return false;
        }
      }
    }
    return true;
  };

  const randomNum = () => Math.floor(Math.random() * 10);

  const randomDirection = () => {
    if (randomNum() < 5) return "horizontal";
    return "vertical";
  };

  const randomlyPlaceShips = () => {
    placeShipRandomly(randomNum(), randomNum(), 5, randomDirection());
    placeShipRandomly(randomNum(), randomNum(), 4, randomDirection());
    placeShipRandomly(randomNum(), randomNum(), 3, randomDirection());
    placeShipRandomly(randomNum(), randomNum(), 3, randomDirection());
    placeShipRandomly(randomNum(), randomNum(), 2, randomDirection());
  };

  const theDeckof = (x, y) => {
    const allLocs = getAllLocations();
    if (allLocs.some((arr) => arr.some(([a, b]) => a === x && b === y))) {
      const attacked = allLocs.find((arr) =>
        arr.some(([a, b]) => a === x && b === y)
      );
      return getCell(attacked[0][0], attacked[0][1]);
    }
    return false;
  };

  const receiveAttack = (x, y) => {
    if (theDeckof(x, y)) {
      theDeckof(x, y).getHit();
      hits.push([x, y]);
    } else missedAttacks.push([x, y]);
  };

  const getAllLocations = () => {
    const allLocs = [];
    for (let i = 0; i < 10; i += 1) {
      const row = board[i];
      for (let j = 0; j < 10; j += 1) {
        const cell = row[j];
        if (cell instanceof Object) {
          allLocs.push(cell.getComponents());
        }
      }
    }
    return allLocs;
  };

  const areAllShipsSunk = () =>
    board.every((row) => row.every((cell) => cell === null || cell.isSunk()));

  const getOwner = () => owner;

  return {
    placeShip,
    receiveAttack,
    areAllShipsSunk,
    getOwner,
    getCell,
    getBoard,
    resetBoard,
    getAllLocations,
    moveExists,
    randomlyPlaceShips,
    isPlacementValid,
  };
};

export const Player = (name) => {
  const randomCoord = () => {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    return [x, y];
  };

  const attack = (board, x, y) => {
    board.receiveAttack(x, y);
  };

  const getName = () => name;

  return { attack, getName, randomCoord };
};

const displayController = (() => {
  const player1Board = document.querySelector(".player1-gameboard");
  const player2Board = document.querySelector(".player2-gameboard");

  const renderBoard = (board) => {
    const ownerName = board.getOwner().getName();
    for (let i = 0; i < 10; i += 1) {
      const rowElement = document.createElement("div");
      rowElement.classList.add("row");
      for (let j = 0; j < 10; j += 1) {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.x = i;
        cellElement.dataset.y = j;
        if (ownerName === "computer") {
          cellElement.classList.add("enemy");
        }
        rowElement.appendChild(cellElement);

        board.getBoard().forEach((row) => {
          row.forEach((cell) => {
            if (
              cell instanceof Object &&
              cell.getComponents().some(([a, b]) => a === i && b === j)
            ) {
              cellElement.classList.add("ship");
            }
          });
        });
      }
      if (ownerName === "player1") {
        player1Board.appendChild(rowElement);
      } else player2Board.appendChild(rowElement);
    }
  };

  const resetBoard = (board) => {
    if (board === "player1Board") player1Board.innerHTML = "";
    else if (board === "player2Board") player2Board.innerHTML = "";
    else {
      player1Board.innerHTML = "";
      player2Board.innerHTML = "";
    }
  };

  const renderMessage = (msg) => {
    const announcer = document.querySelector(".announcer");
    announcer.textContent = msg;
  };

  const toggleCheckboxVisibility = () => {
    const checkboxContainer = document.querySelector(".checkbox-container");
    if (checkboxContainer.style.visibility === "hidden") {
      checkboxContainer.style.visibility = "visible";
    } else checkboxContainer.style.visibility = "hidden";
  };

  const revealComponent = (cell) => {
    if (cell.classList.contains("ship")) {
      cell.style.backgroundColor = "red";
    }
  };

  const toggleBoardBlur = () => {
    if (player2Board.style.opacity === "0.7") {
      player2Board.style.opacity = "1";
    } else player2Board.style.opacity = "0.7";
  };

  const markShots = (player, x, y) => {
    const targetBoard = document.querySelector(`.${player}-gameboard`);

    const cells = targetBoard.querySelectorAll(".cell");

    cells.forEach((cell) => {
      if (cell.dataset.x == x && cell.dataset.y == y) {
        cell.classList.add("attacked");
        revealComponent(cell);
      }
    });
  };

  const addListeners = () => {
    const enemyCells = document.querySelectorAll(".enemy");
    enemyCells.forEach((cell) =>
      cell.addEventListener("click", () => {
        const { x } = cell.dataset;
        const { y } = cell.dataset;
        gameController.playRound(+x, +y);
      })
    );
  };

  const removeListeners = () => {
    const enemyCells = document.querySelectorAll(".enemy");
    enemyCells.forEach((cell) =>
      cell.removeEventListener("click", () => {
        const { x } = cell.dataset;
        const { y } = cell.dataset;
        gameController.playRound(+x, +y);
      })
    );
  };

  return {
    renderBoard,
    resetBoard,
    renderMessage,
    toggleCheckboxVisibility,
    toggleBoardBlur,
    addListeners,
    removeListeners,
    markShots,
  };
})();

const gameController = (() => {
  const player1 = Player("player1");
  const player2 = Player("computer");
  const player1Board = Gameboard(player1);
  const player2Board = Gameboard(player2);
  let gameOver = false;
  let round = 0;

  const placeShipOnClick = () => {
    const p1Board = document.querySelector(".player1-gameboard");
    const shipSizes = [5, 4, 3, 3, 2];
    let count = 0;
    let orientation = "vertical";

    displayController.renderMessage("place your carrier");

    const updateMsg = () => {
      const messages = [
        "place your battleship",
        "place your destroyer",
        "place your submarine",
        "place your patrol boat",
        "The game begins.. It's your turn.",
      ];
      displayController.renderMessage(messages[count - 1]);
    };

    const switchElement = document.getElementById("ship-orientation-switch");
    switchElement.addEventListener("change", (e) => {
      orientation = e.target.checked ? "horizontal" : "vertical";
    });

    const handlePlacementClick = (e) => {
      const { x, y } = e.target.dataset;
      if (
        count < shipSizes.length &&
        player1Board.isPlacementValid(+x, +y, shipSizes[count], orientation)
      ) {
        player1Board.placeShip(+x, +y, shipSizes[count], orientation);
        count += 1;
      }
      updateMsg();
      console.log(count);
      if (count === 5) {
        displayController.addListeners();
        displayController.toggleCheckboxVisibility();
        p1Board.removeEventListener("click", handlePlacementClick);
      }
      displayController.resetBoard("player1Board");
      displayController.renderBoard(player1Board);
    };

    p1Board.addEventListener("click", handlePlacementClick);

    return true;
  };

  const randomizeBtn = document.querySelector(".randomize-btn");
  randomizeBtn.addEventListener("click", () => {
    if (round > 0) return;
    player1Board.resetBoard();
    displayController.resetBoard("player1Board");
    player1Board.randomlyPlaceShips();
    displayController.renderBoard(player1Board);
  });

  const resetBtn = document.querySelector(".reset-btn");
  resetBtn.addEventListener("click", () => {
    if (round < 0) return;
    displayController.removeListeners();
    player1Board.resetBoard();
    player2Board.resetBoard();
    displayController.resetBoard();
    initGame();
    round = 0;
  });

  const playRound = (x, y) => {
    if (gameOver) {
      return;
    }

    if (!player2Board.moveExists(x, y)) {
      player1.attack(player2Board, x, y);
      displayController.markShots("player2", x, y);
    } else return;
    round += 1;
    displayController.toggleBoardBlur();
    displayController.renderMessage("It's computer's turn.");

    const randomCoords = player2.randomCoord();
    player2.attack(player1Board, ...randomCoords);

    setTimeout(() => {
      displayController.markShots("player1", ...randomCoords);
      displayController.renderMessage("It's your turn.");
      displayController.toggleBoardBlur();
    }, 1200);

    checkWinner();
  };

  const checkWinner = () => {
    if (player1Board.areAllShipsSunk()) {
      displayController.renderMessage("Computer won");
      gameOver = true;
    }
    if (player2Board.areAllShipsSunk()) {
      displayController.renderMessage("player won");
      gameOver = true;
    }
  };
  const initGame = () => {
    placeShipOnClick();
    player2Board.randomlyPlaceShips();
    displayController.renderBoard(player1Board);
    displayController.renderBoard(player2Board);
  };

  initGame();

  return { playRound };
})();
