// Matter.js Aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

let engine, world; // Matter.js engine and world
let ground;        // Ground body
let raindrops = []; // Array to hold raindrop bodies

// Walking Code Variables
let walkImages = [];

let numWalkFrames = 8;
let idleImage;

let currentFrame = 0;
let frameDelay = 5;
let frameCountDelay = 0;

let xPos = 50; // Character initial position
let speed = 1.5; // Movement speed
let isWalking = false;
let facingRight = true;

function preload() {
  // Load walking animation frames
  for (let i = 0; i < numWalkFrames; i++) {
    walkImages[i] = loadImage(`stick_figure_assets/walks/${i + 1}.png`);
  }
  // Load idle animation frames

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
}

function draw() {
  background(220);

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

  // Draw the character with the correct facing direction
  push();
  if (!facingRight) {
    scale(-1, 1);
    playAnimation(-xPos, height - 20);
  } else {
    playAnimation(xPos, height - 20);
  }
  pop();

  // Add new raindrops
  if (frameCount % 5 === 0) {
    let raindrop = Bodies.circle(random(width), 0, 0.5, { friction: 0.1, restitution: 0.1 });
    World.add(world, raindrop);
    raindrops.push(raindrop);
  }

  // Update and display raindrops
  noStroke();
  fill(0,0,255);
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let drop = raindrops[i];

    // Bounce back at boundaries
    if (drop.position.x < 0 || drop.position.x > width) {
      Body.setVelocity(drop, { x: -drop.velocity.x, y: drop.velocity.y });
    }

    // Draw the raindrop
    ellipse(drop.position.x, drop.position.y, 1.2, 1.2);

    // Remove drops that fall off the screen
    if (drop.position.y > height + 10) {
      World.remove(world, drop);
      raindrops.splice(i, 1);
    }
  }

  // Update Matter.js engine
  Engine.update(engine);
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
