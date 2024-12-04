let gameState = "start"; // Initial state
let grid;
let gridSize = 20; // Size of each grid cell
let cols, rows;
let snake;
let food;
let score = 0;
let foodColor;
let restartButton; // Restart button
let classicButton; // Classic button
let adventureButton; // Adventure button

function setup() {
  createCanvas(400, 400);
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
  frameRate(10);

  // Initialize grid and snake
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  snake = new Snake();
  placeFood();

  // Create "Classic" button for start screen
  classicButton = createButton("Classic");
  classicButton.position(width / 2 - 40, height / 2 + 50);
  classicButton.size(80, 40);
  classicButton.style("font-size", "16px");
  classicButton.style("background-color", "#ffcc66");
  classicButton.style("color", "black");
  classicButton.style("border", "none");
  classicButton.style("border-radius", "5px");
  classicButton.mousePressed(() => {
    gameState = "play"; // Start the game
    classicButton.hide(); // Hide the button
    adventureButton.hide(); // Hide the adventure button when classic is clicked
  });

  // Create "Adventure" button for start screen
  adventureButton = createButton("Adventure");
  adventureButton.position(width / 2 - 40, height / 2 + 100); // Positioned below "Classic" button
  adventureButton.size(80, 40);
  adventureButton.style("font-size", "16px");
  adventureButton.style("background-color", "#66cc66");
  adventureButton.style("color", "black");
  adventureButton.style("border", "none");
  adventureButton.style("border-radius", "5px");
  adventureButton.mousePressed(() => {
    gameState = "play"; // Start the game
    adventureButton.hide(); // Hide the button
    classicButton.hide(); // Hide the classic button when adventure is clicked
  });

  // Create the "Continue" button for game over screen
  restartButton = createButton("Continue");
  restartButton.position(width / 2 - 40, height / 2 + 50);
  restartButton.size(80, 40);
  restartButton.style("font-size", "16px");
  restartButton.style("background-color", "#ffcc66");
  restartButton.style("color", "black");
  restartButton.style("border", "none");
  restartButton.style("border-radius", "5px");
  restartButton.hide();
  restartButton.mousePressed(() => {
    gameState = "start"; // Return to start screen
    restartButton.hide();
    score = 0; // Reset score
    setup(); // Reinitialize the game
    // Show the classic and adventure buttons again
    classicButton.show();
    adventureButton.show();
  });
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

  // Main gameplay
  drawPlayScreen();
}

function drawStartScreen() {
  background(30, 50, 40); // Dark green background

  // Title
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("Snake Game", width / 2, height / 3);

  // Instructions
  textSize(20);
  fill(200);
  text("Select 'Classic' or 'Adventure' to start", width / 2, height / 2 - 20);
}

function drawGameOverScreen() {
  background(30, 50, 40); // Dark green background

  // Game over pop-up
  fill(200, 100, 50); // Light brown
  rect(width / 2 - 100, height / 2 - 80, 200, 160, 10);

  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  text("Game Over", width / 2, height / 2 - 40);

  textSize(24);
  fill(255);
  text(`Score: ${score}`, width / 2, height / 2);

  restartButton.show(); // Show "Continue" button
}

function drawPlayScreen() {
  // Dark green gameplay background
  background(30, 50, 40);

  // Snake and food
  snake.update();
  snake.show();

  // Draw food
  noStroke();
  fill(foodColor);
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);

  // Display score
  fill(255);
  textSize(16);
  text("Score: " + score, 30, 20);
}

function keyPressed() {
  if (gameState === "play") {
    // Arrow key movement
    if (keyCode === UP_ARROW && snake.dir.y === 0) {
      snake.setDir(0, -1);
    } 
    else if (keyCode === DOWN_ARROW && snake.dir.y === 0) {
      snake.setDir(0, 1);
    } 
    else if (keyCode === LEFT_ARROW && snake.dir.x === 0) {
      snake.setDir(-1, 0);
    } 
    else if (keyCode === RIGHT_ARROW && snake.dir.x === 0) {
      snake.setDir(1, 0);
    }
  }
}

class Snake {
  constructor() {
    this.body = [{ x: floor(cols / 2), y: floor(rows / 2) }];
    this.dir = { x: 0, y: 0 };
    grid[this.body[0].y][this.body[0].x] = 1; // Mark snake's position
  }

  setDir(x, y) {
    this.dir = { x, y };
  }

  update() {
    if (this.dir.x === 0 && this.dir.y === 0) {
      return; // No movement initially
    }
    let head = this.body[this.body.length - 1];
    let newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    // Wrap around screen
    if (newHead.x < 0) {
      newHead.x = cols - 1;
    } 
    else if (newHead.x >= cols) {
      newHead.x = 0;
    }

    if (newHead.y < 0) {
      newHead.y = rows - 1;
    } 
    else if (newHead.y >= rows) {
      newHead.y = 0;
    }

    // Check collision with itself
    if (grid[newHead.y][newHead.x] === 1) {
      gameState = "gameOver"; // Trigger game over
      return;
    }

    // Add new head to the body
    this.body.push(newHead);

    // Check if food is eaten
    if (grid[newHead.y][newHead.x] === 2) {
      score++;
      placeFood();
    } 
    else {
      // Remove tail if no food eaten
      let tail = this.body.shift();
      grid[tail.y][tail.x] = 0;
    }

    // Mark new head position
    grid[newHead.y][newHead.x] = 1;
  }

  show() {
    for (let segment of this.body) {
      stroke(255);
      fill(0);
      rect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
  }
}

function placeFood() {
  let emptyCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) {
        emptyCells.push({ x: c, y: r });
      }
    }
  }

  if (emptyCells.length > 0) {
    let spot = random(emptyCells);
    food = spot;
    grid[food.y][food.x] = 2;
    foodColor = color(random(255), random(255), random(255));
  } 
  else {
    gameState = "gameOver"; // No space left for food
  }
}
