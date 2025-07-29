const SIZE = 10;
const SHIP_SIZES = [2, 3, 4, 5];

const playerBoard = document.getElementById("player-board");
const computerBoard = document.getElementById("computer-board");
const status = document.getElementById("status");

let playerShips = [];
let computerShips = [];
let computerShots = [];
let playerHits = 0;
let computerHits = 0;

let placingShips = true;
let currentShipIndex = 0;
let isHorizontal = true;

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") {
        isHorizontal = !isHorizontal;
        updateStatus();
    }
});

function createBoard(boardElement, isComputer) {
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;

        if (!isComputer) {
            cell.addEventListener("click", () => placePlayerShip(i));
            cell.addEventListener("mouseenter", () => showPreview(i));
            cell.addEventListener("mouseleave", clearPreview);
        } else {
            cell.addEventListener("click", () => playerShoot(i, cell));
        }

        boardElement.appendChild(cell);
    }
}

function indexToCoords(index) {
    return { x: index % SIZE, y: Math.floor(index / SIZE) };
}

function coordsToIndex(x, y) {
    return y * SIZE + x;
}

function isValidPlacement(startIndex, size, taken, horizontal) {
    const { x, y } = indexToCoords(startIndex);
    if (horizontal && x + size > SIZE) return false;
    if (!horizontal && y + size > SIZE) return false;

    for (let i = 0; i < size; i++) {
        const xi = horizontal ? x + i : x;
        const yi = horizontal ? y : y + i;
        const idx = coordsToIndex(xi, yi);
        if (taken.includes(idx)) return false;
    }

    return true;
}

function placePlayerShip(startIndex) {
    if (!placingShips) return;
    const size = SHIP_SIZES[currentShipIndex];
    const { x, y } = indexToCoords(startIndex);
    if (!isValidPlacement(startIndex, size, playerShips, isHorizontal)) return;

    for (let i = 0; i < size; i++) {
        const xi = isHorizontal ? x + i : x;
        const yi = isHorizontal ? y : y + i;
        const index = coordsToIndex(xi, yi);
        playerShips.push(index);
        playerBoard.children[index].classList.add("ship");
    }

    currentShipIndex++;
    if (currentShipIndex === SHIP_SIZES.length) {
        placingShips = false;
        status.innerText = "All ships placed! Your turn.";
        placeComputerShips();
    } else {
        updateStatus();
    }
}

function showPreview(startIndex) {
    if (!placingShips) return;
    const size = SHIP_SIZES[currentShipIndex];
    const { x, y } = indexToCoords(startIndex);
    if ((isHorizontal && x + size > SIZE) || (!isHorizontal && y + size > SIZE)) return;

    for (let i = 0; i < size; i++) {
        const xi = isHorizontal ? x + i : x;
        const yi = isHorizontal ? y : y + i;
        const idx = coordsToIndex(xi, yi);
        if (!playerShips.includes(idx)) {
            playerBoard.children[idx].classList.add("preview");
        }
    }
}

function clearPreview() {
    const cells = playerBoard.querySelectorAll(".cell.preview");
    cells.forEach(cell => cell.classList.remove("preview"));
}

function placeComputerShips() {
    for (let size of SHIP_SIZES) {
        let placed = false;
        while (!placed) {
            let horizontal = Math.random() < 0.5;
            let start = Math.floor(Math.random() * SIZE * SIZE);
            const { x, y } = indexToCoords(start);
            if ((horizontal && x + size > SIZE) || (!horizontal && y + size > SIZE)) continue;

            const positions = [];
            let overlap = false;
            for (let i = 0; i < size; i++) {
                const xi = horizontal ? x + i : x;
                const yi = horizontal ? y : y + i;
                const idx = coordsToIndex(xi, yi);
                if (computerShips.includes(idx)) {
                    overlap = true;
                    break;
                }
                positions.push(idx);
            }

            if (!overlap) {
                computerShips.push(...positions);
                placed = true;
            }
        }
    }
}

function playerShoot(index, cell) {
    if (placingShips) return;
    if (cell.classList.contains("hit") || cell.classList.contains("miss")) return;

    if (computerShips.includes(index)) {
        cell.classList.add("hit");
        playerHits++;
        status.innerText = "Hit!";
    } else {
        cell.classList.add("miss");
        status.innerText = "Miss!";
    }

    checkVictory();
    if (playerHits < totalShipCells()) {
        setTimeout(computerTurn, 700);
    }
}

function computerTurn() {
    let index;
    do {
        index = Math.floor(Math.random() * SIZE * SIZE);
    } while (computerShots.includes(index));
    computerShots.push(index);

    const cell = playerBoard.children[index];
    if (playerShips.includes(index)) {
        cell.classList.add("hit");
        computerHits++;
        status.innerText = "Computer hit your ship!";
    } else {
        cell.classList.add("miss");
        status.innerText = "Computer missed.";
    }

    checkVictory();
}

function checkVictory() {
    if (playerHits === totalShipCells()) {
        status.innerText = "🎉 You win!";
        disableEnemyBoard();
    } else if (computerHits === totalShipCells()) {
        status.innerText = "💥 Computer wins!";
        disableEnemyBoard();
    }
}

function totalShipCells() {
    return SHIP_SIZES.reduce((a, b) => a + b, 0);
}

function disableEnemyBoard() {
    for (const cell of computerBoard.children) {
        cell.style.pointerEvents = "none";
    }
}

function updateStatus() {
    const size = SHIP_SIZES[currentShipIndex];
    const orientation = isHorizontal ? "horizontal" : "vertical";
    status.innerText = `Place ship of size ${size} (${orientation}). Press R to rotate.`;
}

// Initialize
createBoard(playerBoard, false);
createBoard(computerBoard, true);
updateStatus();
