// BIG TODO: The game assumes that the ai will always be O

var title = document.getElementById("game-title");
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

var mousePosition = [0, 0]
var mouseInCanvas = false;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var maxSize = canvas.width;
var minSize = 250;

var xImage = new Image();
xImage.src = "resources/images/x.png";
var oImage = new Image();
oImage.src = "resources/images/o.png";

var currentBoard;
var xTurn;
var gameOver = false;

var aiOn = false;
var aiPlayer = 'O';

document.addEventListener("mousemove", getMousePosition, false);
document.addEventListener("click", handleClick, false);

function deepcopyBoard(board) {
	let newBoard = [];
	for (let i = 0; i < board.length; i++) {
		let newRow = [];
		for (let j = 0; j < board[i].length; j++) {
			newRow.push(board[i][j]);
		}
		newBoard.push(newRow);
	}
	return newBoard;
}

function getPossibleMoves(board, currentPlayer) {
	let possibleMoves = []
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[i].length; j++) {
			if (board[i][j] == ' ') {
				let copiedBoard = deepcopyBoard(board);
				copiedBoard[i][j] = currentPlayer;
				possibleMoves.push([copiedBoard, [j, i]]);
			}
		}
	}
	return possibleMoves;
}

function depthFirstSearch(rootBoard, currentTurn) {
	let currentPlayer = (currentTurn) ? 'X' : 'O';
	let moves = getPossibleMoves(rootBoard, currentPlayer);

	for (let i = 0; i < moves.length; i++) {
		let board = moves[i][0];
		let moveX = moves[i][1][0];
		let moveY = moves[i][1][1];

		if (checkForWin(moveX, moveY, board, currentPlayer)) {
			return [currentPlayer, moveX, moveY];
		} else if (checkForScratch(board)) {
			return [null, moveX, moveY];
		}
	}

	let ties = [];
	let losses = [];

	for (let i = 0; i < moves.length; i++) {
		let board = moves[i][0];
		let moveX = moves[i][1][0];
		let moveY = moves[i][1][1];

		let winner = depthFirstSearch(board, !currentTurn)[0];
		if (winner == currentPlayer) {
			return [winner, moveX, moveY];
		} else if (winner === null) {
			ties.push([winner, moveX, moveY]);
		} else if (winner != currentPlayer) {
			losses.push([winner, moveX, moveY]);
		}
	}

	if (ties.length > 0) {
		return ties[Math.floor(Math.random() * ties.length)]
	} else if (losses.length > 0) {
		return losses[Math.floor(Math.random() * losses.length)]
	}
}

function resizeCanvas(resize=false) {
	if (windowWidth != window.innerWidth || windowHeight != window.innerHeight || resize) {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;

		// clamp the canvas size between the min and max sizes
		var fitWidth = Math.max(Math.min(Math.floor(window.innerWidth / 2), maxSize), minSize);
		var fitHeight = Math.max(Math.min(Math.floor(window.innerHeight / 2), maxSize), minSize);
		var canvasSize = Math.min(fitWidth, fitHeight);

		canvas.width = canvasSize;
		canvas.height = canvasSize;
	}
}

function resetGame() {
	currentBoard = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];

	xTurn = true;
	gameOver = false;

	title.innerHTML = 'Tic Tac Toe';
}

function isGameOver(mouseGridX, mouseGridY, board, currentPlayer) {
	if (checkForWin(mouseGridX, mouseGridY, board, currentPlayer)) {
		title.innerHTML = currentPlayer + " Wins";
		gameOver = true;
	} else if (checkForScratch(board)) {
		title.innerHTML = 'Scratch';
		gameOver = true;
	}
}

function aiMove() {
	let currentPlayer = (xTurn) ? 'X' : 'O';
	if (gameOver == false) {
		let ai = depthFirstSearch(currentBoard, xTurn);
		let aiMoveX = ai[1];
		let aiMoveY = ai[2];
		if (currentBoard[aiMoveY][aiMoveX] == ' ') {
			currentBoard[aiMoveY][aiMoveX] = currentPlayer;
			isGameOver(aiMoveX, aiMoveY, currentBoard, currentPlayer);
			xTurn = !xTurn;
		}
	}
}

function makeMove(mouseGridX, mouseGridY) {
	let currentPlayer = (xTurn) ? 'X' : 'O';
	if (currentBoard[mouseGridY][mouseGridX] == ' ' && gameOver == false) {
		currentBoard[mouseGridY][mouseGridX] = currentPlayer;
		isGameOver(mouseGridX, mouseGridY, currentBoard, currentPlayer);
		xTurn = !xTurn;

		if (aiOn) {
			aiMove();
		}
	}
}

function handleClick(e) {
	if (mouseInCanvas) {
		getMousePosition(e);
		var mouseGridX = getMouseGridPos()[0];
		var mouseGridY = getMouseGridPos()[1];

		if (aiOn) {
			if ((xTurn) ? 'X' : 'O' != aiPlayer) {
				makeMove(mouseGridX, mouseGridY);
			}
		} else {
			makeMove(mouseGridX, mouseGridY);
		}
	}
}

function getMousePosition(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX - rect.left;
	var mouseY = e.clientY - rect.top;

	if (mouseX < 0 || mouseX > canvas.width || mouseY < 0 || mouseY > canvas.height) {
		mouseInCanvas = false;
	} else {
		mouseInCanvas = true;
	}

	mousePosition = [mouseX, mouseY];
}

function getMouseGridPos() {
	var mouseX = mousePosition[0];
	var mouseY = mousePosition[1];

	var mouseGridX;
	if (mouseX < canvas.width / 3) {
		mouseGridX = 0;
	} else if (mouseX > canvas.width / 3 && mouseX < 2 * (canvas.width / 3)) {
		mouseGridX = 1;
	} else {
		mouseGridX = 2;
	}

	var mouseGridY;
	if (mouseY < canvas.height / 3) {
		mouseGridY = 0;
	} else if (mouseY > canvas.height / 3 && mouseY < 2 * (canvas.width / 3)) {
		mouseGridY = 1;
	} else {
		mouseGridY = 2;
	}

	return [mouseGridX, mouseGridY];
}

function checkForScratch(board) {
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j] == ' ') {
				return false;
			}
		}
	}
	return true;
}

function sum(numbers) {
	let total = 0;
	for (let i = 0; i < numbers.length; i++) {
		total += numbers[i];
	}
	return total;
}

function checkForWin(gridX, gridY, board, player) {
	let magicSquare = [[8, 1, 6], [3, 5, 7], [4, 9, 2]];
	let magicBoard = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[i].length; j++) {
			if (player == board[i][j]) {
				magicBoard[i][j] = magicSquare[i][j];
			}
		}
	}

	let horizontal = magicBoard[gridY];
	let vertical = [magicBoard[0][gridX], magicBoard[1][gridX], magicBoard[2][gridX]];
	let diagonal1 = [magicBoard[0][0], magicBoard[1][1], magicBoard[2][2]];
	let diagonal2 = [magicBoard[0][2], magicBoard[1][1], magicBoard[2][0]];

	let winPatterns = [horizontal, vertical, diagonal1, diagonal2];

	for (let i = 0; i < winPatterns.length; i++) {
		let winPattern = winPatterns[i];
		if (sum(winPattern) == 15) {
			return true;
		}
	}

	return false;
}

function drawPlayer(gridPosition, player=null) {
	var cellSize = canvas.width / 3;

	x = gridPosition[0] * cellSize;
	y = gridPosition[1] * cellSize;

	if (player == null) {
		if (xTurn) {
			image = xImage;
		} else {
			image = oImage;
		}
	} else {
		if (player == 'X') {
			image = xImage;
		} else if (player == 'O') {
			image = oImage;
		} else {
			image = null;
		}
	}

	if (image != null) {
		ctx.drawImage(image, x, y, cellSize, cellSize);
	}
}

function drawLine(x1, y1, x2, y2, color="rgb(220, 220, 220)") {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineWidth = 6;
	ctx.strokeStyle = color;
	ctx.stroke();
}

function drawCurrentBoard() {
	drawLine(Math.floor(canvas.width/3), 0, Math.floor(canvas.width/3), canvas.height);
	drawLine(Math.floor(2 * canvas.width/3), 0, Math.floor(2 * canvas.width/3), canvas.height);
	drawLine(0, Math.floor(canvas.height/3), canvas.width, Math.floor(canvas.height/3));
	drawLine(0, Math.floor(2 * canvas.height/3), canvas.width, Math.floor(2 * canvas.height/3));

	for (var y = 0; y < currentBoard.length; y++) {
		for (var x = 0; x < currentBoard[y].length; x++) {
			drawPlayer([x, y], player=currentBoard[y][x]);
		}
	}

	if (mouseInCanvas && gameOver == false) {
		var mouseGridX = getMouseGridPos()[0];
		var mouseGridY = getMouseGridPos()[1];

		if (aiOn == false || (xTurn) ? 'X' : 'O' != aiPlayer) {
			if (currentBoard[mouseGridY][mouseGridX] == ' ') {
				drawPlayer([mouseGridX, mouseGridY]);
			}
		}
	}
}

function draw() {
	resizeCanvas();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawCurrentBoard();
}

resetGame();
resizeCanvas(true);
setInterval(draw, 10);