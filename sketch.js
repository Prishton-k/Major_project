let gameState = "start"; // Initial state
let grid;
let gridSize = 20; // Size of each grid cell
let cols, rows;
let snake;
let food;
let score = 0;
let level = 1; // Game level
let foodColor;
let obstacles = []; // Obstacles for Level 2
let restartButton, classicButton, adventureButton, infoButton; // UI buttons

function setup() {
  createCanvas(400, 400);
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
  frameRate(10);

  // Initialize grid and snake
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  snake = new Snake();
  placeFood();

  // Create buttons for start screen
  setupButtons();
}

function draw() {
  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "gameOver") {
    drawGameOverScreen();
    return;
  }

  if (gameState === "levelUp") {
    drawLevelUpScreen();
    return;
  }

  // Main gameplay
  drawPlayScreen();
}

function setupButtons() {
  // "Classic" button
  classicButton = createButton("Classic");
  classicButton.position(width / 2 - 40, height / 2 + 50);
  classicButton.size(80, 40);
  styleButton(classicButton, "#ffcc66");
  classicButton.mousePressed(() => {
    gameState = "play"; // Start classic mode
    hideButtons();
  });

  // "Adventure" button
  adventureButton = createButton("Adventure");
  adventureButton.position(width / 2 - 40, height / 2 + 100);
  adventureButton.size(80, 40);
  styleButton(adventureButton, "#66cc66");
  adventureButton.mousePressed(() => {
    gameState = "play";
    level = 1; // Start Level 1
    hideButtons();
  });

  // "Info" button
  infoButton = createButton("?");
  infoButton.position(width - 50, 20);
  infoButton.size(40, 40);
  styleButton(infoButton, "white", "20px", "2px solid black", "20px");
  infoButton.mousePressed(() => {
    alert(
      "How to Play:\n" +
      "- Use arrow keys to move the snake.\n" +
      "- Eat food to grow and earn points.\n" +
      "- Classic: No levels, free play.\n" +
      "- Adventure: Clear levels with increasing difficulty!"
    );
  });

  // "Continue" button for game over
  restartButton = createButton("Continue");
  restartButton.position(width / 2 - 40, height / 2 + 50);
  restartButton.size(80, 40);
  styleButton(restartButton, "#ffcc66");
  restartButton.hide();
  restartButton.mousePressed(() => {
    gameState = "start"; // Return to start screen
    resetGame();
  });
}

function drawStartScreen() {
  background(30, 50, 40); // Dark green
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("Snake Game", width / 2, height / 3);
  textSize(20);
  fill(200);
  text("Select 'Classic' or 'Adventure' to start", width / 2, height / 2 - 20);
}

function drawGameOverScreen() {
  background(30, 50, 40); // Dark green
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
  background(30, 50, 40); // Dark green
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text(`Congratulations! You completed Level ${level - 1}!`, width / 2, height / 3);
  textSize(18);
  text("Press 'G' to start the next level.", width / 2, height / 2);
}

function drawPlayScreen() {
  background(30, 50, 40); // Dark green
  snake.update();
  snake.show();

  // Draw food
  noStroke();
  fill(foodColor);
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);

  // Draw obstacles in Level 2
  if (level === 2) {
    drawObstacles();
  }

  fill(255);
  textSize(16);
  text("Score: " + score, 30, 20);
  text("Level: " + level, 30, 40);
}

function keyPressed() {
  if (gameState === "play") {
    if (keyCode === UP_ARROW && snake.dir.y === 0) {
      snake.setDir(0, -1);
    } else if (keyCode === DOWN_ARROW && snake.dir.y === 0) {
      snake.setDir(0, 1);
    } else if (keyCode === LEFT_ARROW && snake.dir.x === 0) {
      snake.setDir(-1, 0);
    } else if (keyCode === RIGHT_ARROW && snake.dir.x === 0) {
      snake.setDir(1, 0);
    }
  }

  // Progress to next level
  if (gameState === "levelUp" && key === "g") {
    startNextLevel();
  }
}

function Snake() {
  this.body = [{ x: floor(cols / 2), y: floor(rows / 2) }];
  this.dir = { x: 0, y: 0 };

  this.setDir = (x, y) => (this.dir = { x, y });

  this.update = () => {
    if (this.dir.x === 0 && this.dir.y === 0) return;

    let head = this.body[this.body.length - 1];
    let newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    // Wrap around the screen
    newHead.x = (newHead.x + cols) % cols;
    newHead.y = (newHead.y + rows) % rows;

    // Collision detection
    if (grid[newHead.y][newHead.x] === 1 || (level === 2 && isObstacle(newHead))) {
      gameState = "gameOver";
      return;
    }

    this.body.push(newHead);

    if (grid[newHead.y][newHead.x] === 2) {
      score++;
      if (level === 1 && score >= 15) {
        gameState = "levelUp";
        return;
      }
      placeFood();
    } else {
      let tail = this.body.shift();
      grid[tail.y][tail.x] = 0;
    }

    grid[newHead.y][newHead.x] = 1;
  };

  this.show = () => {
    for (let segment of this.body) {
      fill(0);
      stroke(255);
      rect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
  };
}

function placeFood() {
  let emptyCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0 && !isObstacle({ x: c, y: r })) {
        emptyCells.push({ x: c, y: r });
      }
    }
  }

  let spot = random(emptyCells);
  food = spot;
  grid[food.y][food.x] = 2;
  foodColor = color(random(255), random(255), random(255));
}

function startNextLevel() {
  level = 2;
  gameState = "play";
  resetGame();
  setupObstacles();
}

function setupObstacles() {
  obstacles = [];
  for (let i = 0; i < 10; i++) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    if (grid[y][x] === 0) {
      obstacles.push({ x, y });
      grid[y][x] = -1;
    }
  }
}

function drawObstacles() {
  fill(150, 0, 0);
  for (let obs of obstacles) {
    rect(obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
  }
}

function isObstacle(cell) {
  return obstacles.some(obs => obs.x === cell.x && obs.y === cell.y);
}

function resetGame() {
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  snake = new Snake();
  placeFood();
  score = 0;
}

function styleButton(button, bgColor, fontSize = "16px", border = "none", borderRadius = "5px") {
  button.style("background-color", bgColor);
  button.style("color", "black");
  button.style("border", border);
  button.style("border-radius", borderRadius);
  button.style("font-size", fontSize);
}

function hideButtons() {
  classicButton.hide();
  adventureButton.hide();
  infoButton.hide();
}
