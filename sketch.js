// Matter.js Aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

let engine, world; // Matter.js engine and world
let ground;        // Ground body
let raindrops = []; // Array to hold raindrop bodies
let characterBody; // Matter.js body for the character

// Walking Code Variables
let walkImages = [];
let idleImage;

let numWalkFrames = 8;
let currentFrame = 0;
let frameDelay = 5;
let frameCountDelay = 0;

let xPos = 50; // Character initial position
let speed = 1.5; // Movement speed
let isWalking = false;
let facingRight = true;

// Rain control
let rainRate = 5; // Default rain per second (controlled via input)
let rainTimer = 0; // Timer for rain generation

let warningMessage = ""; // Warning message for excessive input

function preload() {
  for (let i = 0; i < numWalkFrames; i++) {
    walkImages[i] = loadImage(`stick_figure_assets/walks/${i + 1}.png`);
  }
  idleImage = loadImage(`stick_figure_assets/idle/1.png`);
}

function setup() {
  createCanvas(300, 100);

  // Initialize Matter.js engine and world
  engine = Engine.create();
  world = engine.world;

  // Create the ground
  ground = Bodies.rectangle(width / 2, height - 2.5, width, 5, { isStatic: true });
  World.add(world, ground);

  // Create the character's Matter.js body
  characterBody = Bodies.rectangle(xPos, height - 40, 15, 20, { isStatic: false });
  World.add(world, characterBody);

  // Add an input field for controlling rain rate
  let rainInput = createInput("5");
  rainInput.position(10, height + 10);
  rainInput.size(50);
  rainInput.input(() => {
    let inputRate = int(rainInput.value());
    if (inputRate > 50) {
      warningMessage = "Warning: Rain rate too high!";
      rainRate = 50; // Constrain to 50
    } else {
      warningMessage = "";
      rainRate = constrain(inputRate, 1, 50);
    }
  });

  let label = createSpan("Raindrops per second");
  label.position(70, height + 10);
  let label1_2 = createSpan("notes :");
  label1_2.position(70, height + 40);
  let label2 = createSpan("1. raindrops are capped to 50");
  label2.position(70, height + 60);
  let label3 = createSpan("2. try to set it above 30 :D");
  label3.position(70, height + 80);
}

function draw() {
  background(220);

  // Display warning message
  if (warningMessage) {
    fill(255, 0, 0);
    textSize(12);
    text(warningMessage, 10, height - 10);
  }

  // Draw lightning only if rain rate > 30
  if (rainRate > 30) {
    drawLightning();
  }

  // Update Matter.js engine
  Engine.update(engine);

  // Draw the ground
  fill(255);
  stroke(0);
  strokeWeight(2);
  rectMode(CENTER);
  rect(ground.position.x, ground.position.y, width, 5);

  // Update animation frame
  frameCountDelay++;
  if (frameCountDelay % frameDelay === 0) {
    currentFrame = (currentFrame + 1) % numWalkFrames;
  }

  // Check keyboard input
  isWalking = false;
  if (keyIsDown(LEFT_ARROW)) {
    xPos -= speed;
    isWalking = true;
    facingRight = false;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    xPos += speed;
    isWalking = true;
    facingRight = true;
  }

  xPos = constrain(xPos, 10, width - 10);

  // Update character position in Matter.js world
  Body.setPosition(characterBody, { x: xPos, y: characterBody.position.y });

  // Draw the character
  push();
  if (!facingRight) {
    scale(-1, 1);
    playAnimation(-characterBody.position.x, height - 20);
  } else {
    playAnimation(characterBody.position.x, height - 20);
  }
  pop();

  // Add new raindrops based on rain rate
  rainTimer++;
  if (rainTimer >= 60 / rainRate) { // Rain generation based on input
    let raindrop = Bodies.circle(random(width), 0, 1.0, { friction: 0.1, restitution: 0.01 });
    World.add(world, raindrop);
    raindrops.push(raindrop);
    rainTimer = 0;
  }

  // Update and display raindrops
  noStroke();
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let drop = raindrops[i];

    // Bounce back at boundaries
    if (drop.position.x < 0 || drop.position.x > width) {
      Body.setVelocity(drop, { x: -drop.velocity.x, y: drop.velocity.y });
    }

    // Draw the raindrop
    fill(0, 0, 255);
    ellipse(drop.position.x, drop.position.y, 1.2, 1.2);

    // Remove drops that fall off the screen
    if (drop.position.y > height + 10) {
      World.remove(world, drop);
      raindrops.splice(i, 1);
    }
  }
}

// Function to draw lightning bolt
function drawLightning() {
  if (random(1) < 0.01) { // 1% chance to trigger lightning per frame
    let x = random(width); // Random x position
    let y = random(height / 4); // Random y position 

    strokeWeight(5);
    stroke(255, 255, 0); // Bright yellow color

    // Draw "Z" shape
    line(x, y, x + 5, y + 5); // Top segment
    line(x + 10, y + 20, x - 5, y + 5); // Middle segment
    
  }
}

// Function to play walking or idle animation
function playAnimation(x, y) {
  imageMode(CENTER);
  if (isWalking) {
    image(walkImages[currentFrame], x, y, 70, 70);
  } else {
    image(idleImage, x, y, 70, 70);
  }
}
