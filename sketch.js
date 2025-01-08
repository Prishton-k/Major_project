let gameState = "start"; // Initial state
let gridSize = 20;
let cols, rows;
let snake, food, foodColor;
let score = 0;
let level = 1;
let maxLevel = 5;
let obstacles = [];
let classicButton, adventureButton, infoButton, restartButton;
let classicMode = false; // Flag to distinguish Classic from Adventure mode
let backToStartButton;

const buttonStyles = {
  classic: { bgColor: "#ffcc66", size: [80, 40] },
  adventure: { bgColor: "#66cc66", size: [80, 40] },
  restart: { bgColor: "#ffcc66", size: [80, 40] },
  backToStart: { bgColor: "#ff9966", size: [120, 40] },
  info: { bgColor: "white", size: [40, 40], fontSize: "20px", border: "2px solid black" }
};

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
  classicButton.position(width / 2 - 40, height / 2 + 50);
  classicButton.size(80, 40);
  styleButton(classicButton, "classic");
  classicButton.mousePressed(() => {
    gameState = "play";
    classicMode = true;
    level = 1;
    score = 0;
    hideButtons();
    resetGame();
  });

  adventureButton = createButton("Adventure");
  adventureButton.position(width / 2 - 40, height / 2 + 100);
  adventureButton.size(80, 40);
  styleButton(adventureButton, "adventure");
  adventureButton.mousePressed(() => {
    gameState = "play";
    classicMode = false;
    level = 1;
    hideButtons();
    resetGame();
  });

  infoButton = createButton("?");
  infoButton.position(width - 50, 20);
  infoButton.size(40, 40);
  styleButton(infoButton, "info");
  infoButton.mousePressed(() => {
    alert(
      "How to Play:\n" +
        "- Use arrow keys to move the snake.\n" +
        "- Eat food to grow and earn points.\n" +
        "- Classic: Play without levels.\n" +
        "- Adventure: Progress through levels with obstacles!"
    );
  });

  restartButton = createButton("Continue");
  restartButton.position(width / 2 - 40, height / 2 + 50);
  restartButton.size(80, 40);
  styleButton(restartButton, "restart");
  restartButton.mousePressed(() => {
    gameState = "start";
    showButtons();
    restartButton.hide();
  });
  restartButton.hide();

  backToStartButton = createButton("Back to Start");
  backToStartButton.position(width / 2 - 60, height / 2 + 110);
  backToStartButton.size(120, 40);
  styleButton(backToStartButton, "backToStart");
  backToStartButton.mousePressed(() => {
    gameState = "start";
    classicMode = true;
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
  text(`Score ${score}`, width / 2, height / 2);
  restartButton.html("Continue");
  restartButton.show();
}

function drawLevelUpScreen() {
  background(30, 50, 40);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text(`Level ${level} Complete!`, width / 2, height / 3);
  textSize(18);
  text("Press any key to continue", width / 2, height / 2);
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
  restartButton.hide();
  hideButtons();
  backToStartButton.show();
}

function drawPlayScreen() {
  if (level > 1) {
    drawSandTexture();
  } 
  else {
    background(30, 50, 40);
  }
  snake.update();
  snake.show();
  noStroke();
  fill(foodColor);
  ellipse(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize, gridSize);
  if (level > 1) {
    drawObstacles();
  }
  fill(255);
  textSize(16);
  text(`Score: ${score}`, 30, 20);
  text(`Level: ${level}`, 30, 40);
}

function keyPressed() {
  if (gameState === "play") {
    if (keyCode === UP_ARROW && snake.dir.y === 0) {
      snake.setDir(0, -1);
    }
    if (keyCode === DOWN_ARROW && snake.dir.y === 0) {
      snake.setDir(0, 1);
    }
    if (keyCode === LEFT_ARROW && snake.dir.x === 0) {
      snake.setDir(-1, 0);
    }
    if (keyCode === RIGHT_ARROW && snake.dir.x === 0) {
      snake.setDir(1, 0);
    }
  } else if (gameState === "levelUp") {
    startNextLevel();
  }
}

class Snake {
  constructor() {
    this.body = [{ x: floor(cols / 2), y: floor(rows / 2) }];
    this.dir = { x: 0, y: 0 };
  }

  setDir(x, y) {
    this.dir = { x, y };
  }

  update() {
    if (this.dir.x === 0 && this.dir.y === 0) {
      return;
    }

    let head = this.body[this.body.length - 1];
    let newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    // Wrap the snake around the edges
    newHead.x = (newHead.x + cols) % cols;
    newHead.y = (newHead.y + rows) % rows;

    // Check for collisions
    if (
      this.body.some((part) => part.x === newHead.x && part.y === newHead.y ||!classicMode && level > 1 && obstacles.some((obs) => obs.x === newHead.x && obs.y === newHead.y))
    ) {
      gameState = "gameOver";
      return;
    }

    this.body.push(newHead);

    // Check for food
    if (newHead.x === food.x && newHead.y === food.y) {
      score++;
      if (!classicMode && level === maxLevel && score >= 2) {
        gameState = "congratulations";
      } 
      else if (!classicMode && score >= 2) {
        gameState = "levelUp";
      }
      placeFood();
    } 
    else {
      this.body.shift();
    }
  }

  show() {
    fill(0);
    stroke(255);
    for (let segment of this.body) {
      rect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
  }
}

function placeFood() {
  let valid = false;
  while (!valid) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    valid = !snake.body.some(seg => seg.x === x && seg.y === y) &&
            (!classicMode || !obstacles.some(obs => obs.x === x && obs.y === y));
    if (valid) {
      food = { x, y };
      foodColor = color(random(255), random(255), random(255));
    }
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
      snake.body.some(seg => seg.x === x && seg.y === y || food && food.x === x && food.y === y) ||
      obstacles.some(obs => obs.x === x && obs.y === y)
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

function startNextLevel() {
  if (level === maxLevel) {
    gameState = "congratulations";
    return;
  }
  level++;
  resetGame();
  snake.setDir(1, 0); // Automatically start moving right
  if (!classicMode) {
    setupObstacles();
  }
  gameState = "play";
}

function resetGame() {
  gameState = "play"; // Ensure it's set to 'play' before starting
  snake = new Snake();
  score = 0;
  placeFood();
  if (!classicMode) {
    setupObstacles();
  } 
  else {
    obstacles = [];
  }
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

