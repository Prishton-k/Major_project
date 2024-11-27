// Snake game upgraded version
// Digdarshan KC
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let gameState = "start";
let grid;
let gridSize = 20; // Size of each grid cell
let cols, rows;
let snake;
let food;
let score = 0;
let gameOver = false;
let foodColor; // This will store the random color of the food


function setup() {
  createCanvas(400, 400);
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
  frameRate(10);
  // Initialize grid as a 2D array
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  snake = new Snake();

  // Place initial food
  placeFood();

}


function draw() {
  if (gameOver) {
    background(0);
    fill(255, 0, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 20);
    textSize(16);
    text("Final Score: " + score, width / 2, height / 2 + 20);
    text("Press 'R' to Restart", width / 2, height / 2 + 50);
    return;
  }

  background(170);
  snake.update();
  snake.show();

  // Draw the food with the random color
  fill(foodColor); // Use the random color for food
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);

  fill(0);
  textSize(16);
  text("Score: " + score, 10,20);

  if (gameState === "start"){
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    textAlign("Sanke Game",width/2 , height/3);
    textSize(16);
    text("Press Enter to Start", width/2, height/2);
    return;
  }
}


function placeFood() {
  let emptyCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Track empty cells
      if (grid[r][c] === 0 && emptyCells.push({x :c , y :r})){} 
    }
  }

  if (emptyCells.length > 0) {
    // Pick a random empty cell
    let spot = random(emptyCells); 
    food = spot;
    // Mark food on the grid
    grid[food.y][food.x] = 2; 
    // Assign a random color to the food
    foodColor = color(random(255), random(255), random(255)); 
  } 
  else {
    gameOver = true; // No space left for food
  }
}

function keyPressed() {
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
  // W, A, S, D keys
  else if ((key === 'W' || key === 'w') && snake.dir.y === 0) {
    snake.setDir(0, -1);
  } 
  else if ((key === 'S' || key === 's') && snake.dir.y === 0) {
    snake.setDir(0, 1);
  } 
  else if ((key === 'A' || key === 'a') && snake.dir.x === 0) {
    snake.setDir(-1, 0);
  } 
  else if ((key === 'D' || key === 'd') && snake.dir.x === 0) {
    snake.setDir(1, 0);
  } 
  else if (key === 'R' || key === 'r') {
    restartGame();
  }
}

function restartGame() {
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  snake = new Snake();
  score = 0;
  gameOver = false;
  frameRate(10);
  placeFood(); // Re-place food
}

class Snake {
  constructor() {
    this.body = [{ x: floor(cols / 2), y: floor(rows / 2) }];
    this.dir = { x: 0, y: 0 };

    // Mark the initial snake position on the grid
    grid[this.body[0].y][this.body[0].x] = 1;
  }
  
  setDir(x, y) {
    this.dir = { x, y };
  }

  update() {
    if (this.dir.x === 0 && this.dir.y === 0){
      return; // No movement initially
    }
    // Get the current head and calculate new head position
    let head = this.body[this.body.length - 1];
    let newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    // Wrap the snake around the screen
    if (newHead.x < 0){
      newHead.x = cols -1;
    } 
    else if (newHead.x >= cols){ 
      newHead.x = 0;
    }
    if (newHead.y < 0) {
      newHead.y = rows - 1;
    }
    else if (newHead.y >= rows) {
      newHead.y = 0;
    }

    // Check the collisions with itself
    if (
      newHead.x < 0 || newHead.x >= cols ||
      newHead.y < 0 || newHead.y >= rows ||
      grid[newHead.y][newHead.x] === 1
    ) {

      gameOver = true;
      return;
    }

    // Add the new head to the body
    this.body.push(newHead);

    // Check if food is eaten
    if (grid[newHead.y][newHead.x] === 2) {
      score++;
      placeFood(); // Re-place food with random color
    } 
    else {
      // Remove the tail if no food was eaten
      let tail = this.body.shift();
      grid[tail.y][tail.x] = 0; // Clear the tail from the grid
    }

    // Update the grid with the new head position
    grid[newHead.y][newHead.x] = 1;
  }

  show() {
    for (let segment of this.body) {
      fill(0);
      rect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
  }
}
