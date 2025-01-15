let gameState = "start"; // Initial state
let gridSize = 20;
let cols, rows;
let snake, food, foodColor;
let score = 0;
let level = 1;
let maxLevel = 10;
let obstacles = [];
let classicButton, levelButton, infoButton, restartButton, backToStartButton;
let classicMode = false;
let coinSound; // Sound effect

const buttonStyles = {
  classic: { bgColor: "#ffcc66", size: [80, 40] },
  level: { bgColor: "#66ccff", size: [80, 40] },
  restart: { bgColor: "#ffcc66", size: [80, 40] },
  backToStart: { bgColor: "#ff9966", size: [120, 40] },
  info: { bgColor: "white", size: [40, 40], fontSize: "20px", border: "2px solid black" }
};

function preload() {
  coinSound = loadSound("coin.mp3"); // Load the sound file
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
  } 
  else if (gameState === "gameOver") {
    drawGameOverScreen();
  } 
  else if (gameState === "levelUp") {
    drawLevelUpScreen();
  } 
  else if (gameState === "congratulations") {
    drawCongratulationsScreen();
  } 
  else if (gameState === "play") {
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
    hideButtons();
    resetGame();
  });

  levelButton = createButton("Levels");
  levelButton.position(width / 2 - 40, height / 2 + 50);
  styleButton(levelButton, "level");
  levelButton.mousePressed(() => {
    gameState = "play";
    classicMode = false;
    level = 1;
    score = 0;
    hideButtons();
    resetGame();
  });

  infoButton = createButton("?");
  infoButton.position(width - 50, 20);
  styleButton(infoButton, "info");
  infoButton.mousePressed(() => {
    alert(
      "How to Play:\n" +
        "- Use arrow keys to move the snake.\n" +
        "- Eat food to grow and earn points and in level mode need 5 food to get on to the next level.\n" +
        "-Press enter to move onto next level.\n" +
        "- Classic mode is endless, Levels mode has challenges!"
    );
  });

  restartButton = createButton("Restart");
  restartButton.position(width / 2 - 40, height / 2 + 50);
  styleButton(restartButton, "restart");
  restartButton.mousePressed(() => {
    gameState = "start";
    showButtons();
    restartButton.hide();
  });
  restartButton.hide();

  backToStartButton = createButton("Back to Start");
  backToStartButton.position(width / 2 - 60, height / 2 + 110);
  styleButton(backToStartButton, "backToStart");
  backToStartButton.mousePressed(() => {
    gameState = "start";
    level = 1;
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
}

function drawLevelUpScreen() {
  background(30, 50, 40);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text(`Level ${level} Complete!`, width / 2, height / 3);
  textSize(18);
  text("Press Enter to continue", width / 2, height / 2);
}

function drawCongratulationsScreen() {
  background(50, 150, 200);
  fill(255, 223, 0);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("Congratulations!", width / 2, height / 3);
  textSize(24);
  fill(255);
  text("You completed all levels!", width / 2, height / 2);
  hideButtons();
  backToStartButton.show();
}

function drawPlayScreen() {
  background(30, 50, 40);
  snake.update();
  snake.show();
  noStroke();
  fill(foodColor);
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);
  if (!classicMode && level > 1) {
    drawObstacles();
  }
  fill(255);
  textSize(16);
  text(`Score: ${score}`, 30, 20);
  if (!classicMode) {
    text(`Level: ${level}`, 30, 40);
  }
}

function keyPressed() {
  if (gameState === "play") {
    if (keyCode === UP_ARROW && snake.dir.y === 0){
      snake.setDir(0, -1);
    } 
    if (keyCode === DOWN_ARROW && snake.dir.y === 0){
      snake.setDir(0, 1);
    } 
    if (keyCode === LEFT_ARROW && snake.dir.x === 0) {
      snake.setDir(-1, 0);
    }
    if (keyCode === RIGHT_ARROW && snake.dir.x === 0){
      snake.setDir(1, 0);
    }
  } 
  else if (gameState === "levelUp" && keyCode === ENTER) {
    startNextLevel();
  }
}

function startNextLevel() {
  if (level === maxLevel) {
    gameState = "congratulations";
    return;
  }
  level++;
  resetGame();
  setupObstacles();
  gameState = "play";
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

  // Wrapping around the screen
  newHead.x = (newHead.x + cols) % cols;
  newHead.y = (newHead.y + rows) % rows;

  // Check for collisions
  if (
    this.body.some((part) => part.x === newHead.x && part.y === newHead.y) ||
    (!classicMode && level > 1 && obstacles.some((obs) => obs.x === newHead.x && obs.y === newHead.y))
  ) {
    gameState = "gameOver";
    return;
  }

  this.body.push(newHead);

  // Check if food is eaten
  if (newHead.x === food.x && newHead.y === food.y) {
    score += classicMode ? 5 : 1;

    if (coinSound.isLoaded()) {
      coinSound.rate(1.5); // Set playback speed to 1.5x
      coinSound.play();
    }

    if (!classicMode && level === maxLevel && score >= 5) {
      gameState = "congratulations";
<<<<<<< Updated upstream
    } 
    else if (!classicMode && score >= 5) {
=======
    } else if (!classicMode && score >= 2) {
>>>>>>> Stashed changes
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
  let potentialPositions = [];
  
  // Collect all valid positions on the grid
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let isSnakeSegment = snake.body.some((seg) => seg.x === x && seg.y === y);
      let isObstacle = obstacles.some((obs) => obs.x === x && obs.y === y);
      if (!isSnakeSegment && !isObstacle) {
        potentialPositions.push({ x, y });
      }
    }
  }
  
  // Check if there are valid positions available
  if (potentialPositions.length > 0) {
    // Randomly select a position from the valid list
    let chosenPos = random(potentialPositions);
    food = chosenPos;
    foodColor = color(random(255), random(255), random(255));
  } else {
    // Fallback if no valid positions are found
    console.error("No valid position for food placement.");
    food = { x: 0, y: 0 }; // Default location
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
