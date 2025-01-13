let gameState = "start"; // Initial state
let gridSize = 20;
let cols, rows;
let snake, food, foodColor;
let score = 0;
let level = 1;
let maxLevel = 10;
let obstacles = [];
let classicButton, levelButton, restartButton, backToStartButton, infoButton;
let classicMode = false;
let coinSound, gameOverSound; // Sound effects
let gameOverSoundPlayed = false; // Track if the game over sound has played

const buttonStyles = {
  classic: { bgColor: "#ffcc66", size: [80, 40] },
  level: { bgColor: "#66ccff", size: [80, 40] },
  restart: { bgColor: "#ffcc66", size: [80, 40] },
  backToStart: { bgColor: "#ff9966", size: [120, 40] },
  info: { bgColor: "white", size: [40, 40], fontSize: "20px", border: "2px solid black" }
};

function preload() {
  coinSound = loadSound("coin.mp3"); // Load coin sound
  gameOverSound = loadSound("game over.mp3"); // Load game over sound
}

function setup() {
  createCanvas(400, 400);
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
  frameRate(10); // Constant speed
  snake = new Snake();
  placeFood();
  setupButtons();
}

function draw() {
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "gameOver") {
    if (!gameOverSoundPlayed) {
      gameOverSound.play(); // Play the sound
      gameOverSoundPlayed = true; // Mark as played
    }
    drawGameOverScreen();
  } else if (gameState === "play") {
    drawPlayScreen();
  }
}

function setupButtons() {
  classicButton = createButton("Classic");
  classicButton.position(width / 2 - 40, height / 2);
  styleButton(classicButton, "classic");
  classicButton.mousePressed(() => {
    gameState = "play";
    classicMode = true;
    score = 0;
    resetGame();
    hideButtons();
  });

  levelButton = createButton("Levels");
  levelButton.position(width / 2 - 40, height / 2 + 50);
  styleButton(levelButton, "level");
  levelButton.mousePressed(() => {
    gameState = "play";
    classicMode = false;
    level = 1;
    score = 0;
    resetGame();
    hideButtons();
  });

  infoButton = createButton("?");
  infoButton.position(width - 50, 20);
  styleButton(infoButton, "info");
  infoButton.mousePressed(() => {
    alert(
      "How to Play:\n" +
        "- Use arrow keys to move the snake.\n" +
        "- Eat food to grow and earn points.\n" +
        "- Classic mode is endless, Levels mode has challenges!"
    );
  });

  restartButton = createButton("Restart");
  restartButton.position(width / 2 - 40, height / 2 + 50);
  styleButton(restartButton, "restart");
  restartButton.mousePressed(() => {
    gameState = "start";
    stopGameOverSound();
    resetGame();
    showButtons();
    restartButton.hide();
  });
  restartButton.hide();

  backToStartButton = createButton("Back to Start");
  backToStartButton.position(width / 2 - 60, height / 2 + 110);
  styleButton(backToStartButton, "backToStart");
  backToStartButton.mousePressed(() => {
    gameState = "start";
    stopGameOverSound();
    resetGame();
    showButtons();
    backToStartButton.hide();
  });
  backToStartButton.hide();
}

function styleButton(button, type) {
  let style = buttonStyles[type];
  button.style("background-color", style.bgColor);
  button.style("color", "black");
  button.style("border", style.border || "none");
  button.style("border-radius", "5px");
  button.style("font-size", style.fontSize || "16px");
  button.size(style.size[0], style.size[1]);
}

function drawStartScreen() {
  background(30, 50, 40);
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("Snake Game", width / 2, height / 3);
  textSize(20);
  fill(200);
  text("Choose a mode to begin", width / 2, height / 2 - 20);
}

function drawGameOverScreen() {
  background(30, 50, 40);
  fill(200, 100, 50);
  rect(width / 2 - 100, height / 2 - 80, 200, 160, 10);
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(24);
  text(`Score: ${score}`, width / 2, height / 2);
  restartButton.show();
  backToStartButton.show();
}

function drawPlayScreen() {
  background(30, 50, 40);
  snake.update();
  snake.show();
  noStroke();
  fill(foodColor);
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);
  fill(255);
  textSize(16);
  text(`Score: ${score}`, 30, 20);
}

function stopGameOverSound() {
  if (gameOverSound.isPlaying()) {
    gameOverSound.stop();
  }
  gameOverSoundPlayed = false; // Reset the flag
}

function Snake() {
  this.body = [{ x: floor(cols / 2), y: floor(rows / 2) }];
  this.dir = { x: 0, y: 0 };
}

Snake.prototype.setDir = function (x, y) {
  this.dir = { x, y };
};

Snake.prototype.update = function () {
  if (this.dir.x === 0 && this.dir.y === 0) {
    return;
  }

  let head = this.body[this.body.length - 1];
  let newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

  newHead.x = (newHead.x + cols) % cols;
  newHead.y = (newHead.y + rows) % rows;

  if (
    this.body.some((part) => part.x === newHead.x && part.y === newHead.y) ||
    (!classicMode &&
      level > 1 &&
      obstacles.some((obs) => obs.x === newHead.x && obs.y === newHead.y))
  ) {
    gameState = "gameOver";
    return;
  }

  this.body.push(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += classicMode ? 5 : 1;

    if (coinSound.isLoaded()) {
      coinSound.play();
    }

    if (!classicMode && level === maxLevel && score >= 2) {
      gameState = "congratulations";
    } else if (!classicMode && score >= 2) {
      gameState = "levelUp";
    }
    placeFood();
  } else {
    this.body.shift();
  }
};

Snake.prototype.show = function () {
  fill(0);
  stroke(255);
  for (let segment of this.body) {
    rect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  }
};

function placeFood() {
  let availablePositions = [];

  // Generate a list of all grid positions
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      // Exclude positions occupied by the snake or obstacles
      if (
        !snake.body.some((seg) => seg.x === x && seg.y === y) &&
        !obstacles.some((obs) => obs.x === x && obs.y === y)
      ) {
        availablePositions.push({ x, y });
      }
    }
  }

  // Check if there are available positions
  if (availablePositions.length > 0) {
    // Pick a random valid position
    let chosenPosition = random(availablePositions);
    food = chosenPosition;
    foodColor = color(random(255), random(255), random(255)); // Random color for food
  } else {
    console.error("No valid positions available for food!");
    gameState = "gameOver"; // End the game if no space for food
  }
}

function setupObstacles() {
  obstacles = [];
  for (let i = 0; i < level * 3; i++) {
    let x, y;
    do {
      x = floor(random(cols));
      y = floor(random(rows));
    } while (
      snake.body.some((seg) => seg.x === x && seg.y === y) ||
      obstacles.some((obs) => obs.x === x && obs.y === y)
    );
    obstacles.push({ x, y });
  }
}

function drawObstacles() {
  fill(150, 50, 50);
  for (let obs of obstacles) {
    rect(obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
  }
}

function resetGame() {
  gameState = "play";
  snake = new Snake();
  score = 0;
  placeFood();
  if (!classicMode) {
    setupObstacles();
  }
  snake.setDir(0, 0);
}

function hideButtons() {
  classicButton.hide();
  levelButton.hide();
  infoButton.hide();
}

function showButtons() {
  classicButton.show();
  levelButton.show();
  infoButton.show();
}
