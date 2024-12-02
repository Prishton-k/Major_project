// Snake game upgraded version
// Digdarshan KC
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let gameState = "start"; // Initial state
let grid;
let gridSize = 20; // Size of each grid cell
let cols, rows;
let snake;
let food;
let score = 0;
let foodColor;
let fade = 255; // For animated text on the start screen
let fadeDirection = -5; // Direction of fade
let stars = []; // Stars for the start screen
let restartButton; // Restart button

function setup() {
  createCanvas(400, 400);
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
  frameRate(10);

  // Initialize grid and snake
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  snake = new Snake();

  // Place initial food
  placeFood();

  // Create stars for the start screen
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(2, 5),
      speed: random(0.5, 1.5),
    });
  }

  // Create the restart button but hide it initially
  restartButton = createButton('Restart');
  restartButton.position(width / 2 - 40, height / 2 + 60);
  restartButton.size(80, 40);
  restartButton.style('font-size', '16px');
  restartButton.style('background-color', '#ff4d4d');
  restartButton.style('color', 'white');
  restartButton.style('border', 'none');
  restartButton.style('border-radius', '5px');
  restartButton.hide();
  restartButton.mousePressed(() => {
    gameState = "start"; // Return to start screen
    restartButton.hide(); // Hide the button
    score = 0; // Reset score
    setup(); // Reinitialize the game
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
  background(170);
  snake.update();
  snake.show();

  // Draw food
  noStroke();
  fill(foodColor);
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);

  // Display score
  fill(0);
  textSize(16);
  text("Score: " + score, 30, 20);
}

function drawStartScreen() {
  // Gradient background
  for (let y = 0; y < height; y++) {
    let gradient = lerpColor(color(30, 50, 180), color(255, 100, 200), y / height);
    stroke(gradient);
    line(0, y, width, y);
  }

  // Animated stars
  noStroke();
  for (let star of stars) {
    fill(255, random(150, 255));
    ellipse(star.x, star.y, star.size);
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0; // Reset star position
    }
  }

  // Title
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("Snake Game", width / 2, height / 3);

  // Animated "Press Enter" text
  textSize(20);
  fill(255, fade);
  text("Press Enter to Start", width / 2, height / 2);
  fade += fadeDirection;
  if (fade <= 100 || fade >= 255) {
    fadeDirection *= -1; // Reverse fade direction
  }
}


function drawGameOverScreen() {
  background(30, 0, 0);

  // Dripping blood effect
  for (let y = 0; y < height; y += 30) {
    fill(255, 0, 0, random(150, 255));
    rect(0, y, width, 10);
  }

  // Pulsing skull
  textAlign(CENTER, CENTER);
  textSize(96 + sin(frameCount * 0.1) * 5); // Pulsing effect
  fill(255);
  text("💀", width / 2, height / 3);

  // Final score display
  textSize(32);
  fill(255, 200, 200);
  text(`Your Score: ${score}`, width / 2, height / 2);

  // Show the restart button
  restartButton.show();
}

function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    gameState = "play"; // Start the game
    restartButton.hide(); // Ensure the button is hidden during gameplay
  }

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
    if (this.dir.x === 0 && this.dir.y === 0){
      return; // No movement initially
    }
    let head = this.body[this.body.length - 1];
    let newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    // Wrap around screen
    if (newHead.x < 0){ 
      newHead.x = cols - 1;
    }
    else if(newHead.x >= cols){
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



