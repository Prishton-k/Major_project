let gameState = "start"; // Initial state
let gridSize = 20;
let cols, rows;
let snake, food, foodColor;
let score = 0;
let level = 1;
let obstacles = [];
let classicButton, adventureButton, infoButton, restartButton;
let classicMode = false; // Flag to distinguish Classic from Adventure mode

function setup() {
  createCanvas(400, 400);
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
  frameRate(10);
  snake = new Snake();
  placeFood();
  setupButtons();
}

function draw() {
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "gameOver") {
    drawGameOverScreen();
  } else if (gameState === "levelUp") {
    drawLevelUpScreen();
  } else if (gameState === "play") {
    drawPlayScreen();
  }
}

function setupButtons() {
  // Classic Button
  classicButton = createButton("Classic");
  classicButton.position(width / 2 - 40, height / 2 + 50);
  classicButton.size(80, 40);
  styleButton(classicButton, "#ffcc66");
  classicButton.mousePressed(() => {
    gameState = "play";
    classicMode = true; // Set the game mode to Classic
    level = 1;
    hideButtons();
    resetGame();
  });

  // Adventure Button
  adventureButton = createButton("Adventure");
  adventureButton.position(width / 2 - 40, height / 2 + 100);
  adventureButton.size(80, 40);
  styleButton(adventureButton, "#66cc66");
  adventureButton.mousePressed(() => {
    gameState = "play";
    classicMode = false; // Set the game mode to Adventure
    level = 1;
    hideButtons();
    resetGame();
  });

  // Info Button
  infoButton = createButton("?");
  infoButton.position(width - 50, 20);
  infoButton.size(40, 40);
  styleButton(infoButton, "white", "20px", "2px solid black", "20px");
  infoButton.mousePressed(() => {
    alert(
      "How to Play:\n" +
        "- Use arrow keys to move the snake.\n" +
        "- Eat food to grow and earn points.\n" +
        "- Classic: Play without levels.\n" +
        "- Adventure: Progress through levels with obstacles!"
    );
  });

  // Restart Button (Initially Hidden)
  restartButton = createButton("Continue");
  restartButton.position(width / 2 - 40, height / 2 + 50);
  restartButton.size(80, 40);
  styleButton(restartButton, "#ffcc66");
  restartButton.mousePressed(() => {
    gameState = "start";
    showButtons();
    restartButton.hide();
  });
  restartButton.hide();
}

function drawStartScreen() {
  background(30, 50, 40);
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("Snake Game", width / 2, height / 3);
  textSize(20);
  fill(200);
  text("Select 'Classic' or 'Adventure' to start", width / 2, height / 2 - 20);
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
  text(`Level ${level - 1} Complete!`, width / 2, height / 3);
  textSize(18);
  text("Press 'G' to start the next level.", width / 2, height / 2);
}

function drawPlayScreen() {
  if (level > 1) {
    drawSandTexture();  // Draw the sand texture when level > 1
  } else {
    background(30, 50, 40);  // Default background for level 1
  }
  
  snake.update();
  snake.show();

  // Draw food
  noStroke();
  fill(foodColor);
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);

  // Draw obstacles (Level 2+)
  if (level > 1) {
    drawObstacles();
  }

  // Draw score and level
  fill(255);
  textSize(16);
  text(`Score: ${score}`, 30, 20);  // Updated coordinates for score
  text(`Level: ${level}`, 30, 40);
}

function drawSandTexture() {
  // Create a grainy sand effect
  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      let noiseVal = noise(x * 0.05, y * 0.05);
      let colorVal = map(noiseVal, 0, 1, 200, 255);  // Color range for sand
      fill(colorVal, colorVal - 40, 20);  // Light brown tones
      noStroke();
      rect(x, y, gridSize, gridSize);
    }
  }
}


function keyPressed() {
  if (gameState === "play") {
    if (keyCode === UP_ARROW && snake.dir.y === 0) snake.setDir(0, -1);
    if (keyCode === DOWN_ARROW && snake.dir.y === 0) snake.setDir(0, 1);
    if (keyCode === LEFT_ARROW && snake.dir.x === 0) snake.setDir(-1, 0);
    if (keyCode === RIGHT_ARROW && snake.dir.x === 0) snake.setDir(1, 0);
  }

  if (gameState === "levelUp" && key === "g") startNextLevel();
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

    // Check for collisions
    if (
      this.body.some((part) => part.x === newHead.x && part.y === newHead.y) ||
      (!classicMode && level > 1 && obstacles.some((obs) => obs.x === newHead.x && obs.y === newHead.y))
    ) {
      gameState = "gameOver";
      return;
    }

    this.body.push(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
      score++;
      if (!classicMode && score >= 20) gameState = "levelUp"; // Adventure mode levels up after 20 points
      placeFood();
    } else {
      this.body.shift();
    }
  };

  this.show = () => {
    fill(0);
    stroke(255);
    for (let segment of this.body) {
      rect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
  };
}

function placeFood() {
  let emptyCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!snake.body.some((seg) => seg.x === c && seg.y === r) && (classicMode || !obstacles.some((obs) => obs.x === c && obs.y === r))) {
        emptyCells.push({ x: c, y: r });
      }
    }
  }

  let spot = random(emptyCells);
  food = spot;
  foodColor = color(random(255), random(255), random(255));
}

function setupObstacles() {
  obstacles = []; // Clear existing obstacles
  for (let i = 0; i < 8; i++) { // Change the number of obstacles if needed
    let x = floor(random(cols));
    let y = floor(random(rows));
    
    // Ensure obstacles don't overlap with snake's body or food position
    while (snake.body.some((seg) => seg.x === x && seg.y === y) || (food && food.x === x && food.y === y)) {
      x = floor(random(cols));
      y = floor(random(rows));
    }
    
    obstacles.push({ x, y });
  }
}


function drawObstacles() {
  fill(150, 50, 50);
  for (let obs of obstacles) {
    rect(obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
  }
}

function startNextLevel() {
  level++;
  resetGame();
  if (!classicMode) setupObstacles();
  gameState = "play";
}

function resetGame() {
  snake = new Snake();
  score = 0; // Adjust score for level continuation in Adventure mode
  placeFood();
  if (!classicMode) setupObstacles();
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

function showButtons() {
  classicButton.show();
  adventureButton.show();
  infoButton.show();
}
