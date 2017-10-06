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

var board;
var xTurn;
var gameOver = false;

document.addEventListener("mousemove", getMousePosition, false);
document.addEventListener("click", handleClick, false);

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
	board = [[' ', ' ', ' '],
			 [' ', ' ', ' '],
			 [' ', ' ', ' ']];

	xTurn = true;
	gameOver = false;

	title.innerHTML = 'Tic Tac Toe';
}

function handleClick(e) {
	if (mouseInCanvas) {
		getMousePosition(e);
		var mouseGridX = getMouseGridPos()[0];
		var mouseGridY = getMouseGridPos()[1];

		if (board[mouseGridY][mouseGridX] == ' ' && gameOver == false) {
			board[mouseGridY][mouseGridX] = (xTurn) ? 'X' : "O";
			if (checkForWin(mouseGridX, mouseGridY)) {
				title.innerHTML = ((xTurn) ? 'X': 'O') + " Wins";
				gameOver = true;
			} else if (checkForScratch()) {
				title.innerHTML = 'Scratch';
				gameOver = true;
			} else {
				xTurn = !xTurn;
			}
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

function checkForScratch() {
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j] == ' ') {
				return false;
			}
		}
	}
	return true;
}

function checkForWin(mouseGridX, mouseGridY) {
	var currentPlayer = (xTurn) ? 'X' : 'O';
	
	var winOffsets = [[[1, 0], [2, 0]],
					  [[-1, 0], [-2, 0]],
					  [[-1, 0], [1, 0]],
					  [[0, 1], [0, 2]],
					  [[0, -1], [0, -2]],
					  [[0, -1], [0, 1]],
					  [[1, 1], [2, 2]],
					  [[-1, -1], [-2, -2]],
					  [[1, -1], [2, -2]],
					  [[-1, 1], [-2, 2]],
					  [[-1, -1], [1, 1]]]; 

	for (var i = 0; i < winOffsets.length; i++) {
		for (var j = 0; j < winOffsets[i].length; j++) {
			var x = winOffsets[i][j][0] + mouseGridX;
			var y = winOffsets[i][j][1] + mouseGridY;

			if (y in board && x in board[y]) {
				if (board[y][x] != currentPlayer || x < 0 || y < 0) {
					break;
				}
			} else {
				break;
			}
			if (j == 1) {
				return true;
			}
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

function drawBoard() {
	drawLine(Math.floor(canvas.width/3), 0, Math.floor(canvas.width/3), canvas.height);
	drawLine(Math.floor(2 * canvas.width/3), 0, Math.floor(2 * canvas.width/3), canvas.height);
	drawLine(0, Math.floor(canvas.height/3), canvas.width, Math.floor(canvas.height/3));
	drawLine(0, Math.floor(2 * canvas.height/3), canvas.width, Math.floor(2 * canvas.height/3));

	for (var y = 0; y < board.length; y++) {
		for (var x = 0; x < board[y].length; x++) {
			drawPlayer([x, y], player=board[y][x]);
		}
	}

	if (mouseInCanvas && gameOver == false) {
		var mouseGridX = getMouseGridPos()[0];
		var mouseGridY = getMouseGridPos()[1];

		if (board[mouseGridY][mouseGridX] == ' ') {
			drawPlayer([mouseGridX, mouseGridY]);
		}
	}
}

function draw() {
	resizeCanvas();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBoard();
}

resetGame();
resizeCanvas(true);
setInterval(draw, 10);