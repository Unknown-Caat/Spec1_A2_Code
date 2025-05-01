// ===================================================== 
// BACKGROUND LAYER: Pendulum grid animation (fading)
// BACK LAYER: Fish image
// FRONT LAYER: Water Drop Effect
// =====================================================

let maxVelocity = 5;   // Maximum angular velocity of the pendulums
let g = 1;             // Gravity constant for pendulum physics
let dt = 0.1;          // Time step for physics simulation
let pendulums = [];    // 2D array for storing all pendulum objects
let cols, rows;        // Number of columns and rows for the pendulum grid
let size = 8;          // Size of each pendulum cell
let palette;           // Array of colors used for pendulum visuals

let waterDrops = [];   // Array storing active water drop effects
let cellSize = 60;     // Size of each grid cell for water drop placement
let gridCols, gridRows; // Number of cells for water drop grid

let fishImg;           // Image used for the fish background
let fadeOffset = 0;    // Time offset for sine-based alpha fade
let fadeSpeed = 4;     // Speed of fading animation for pendulums

function preload() {
  fishImg = loadImage("fish.png"); // Preload fish image before sketch starts
}

function setup() {
  createCanvas(1920, 1080, SVG); // Set up canvas in HD resolution with SVG renderer
  frameRate(30);                 // Set desired frame rate

  let button = select("#myButton"); // Select the button with id="myButton"
  button.mousePressed(() => save("combined_waterdrop_background.svg")); // Save SVG on click

  // --- Pendulum background setup ---
  palette = [                    // Define color palette (elements's palette) for pendulum colors
    color(74, 129, 190),
    color(57, 104, 66),
    color(70, 126, 141),
    color(180, 135, 145),
    color(250, 244, 206)
  ];

  cols = width / size;          // Calculate number of columns in pendulum grid
  rows = height / size;         // Calculate number of rows in pendulum grid

  // Create each pendulum in the grid
  for (let i = 0; i < cols; i++) {
    pendulums[i] = [];
    for (let j = 0; j < rows; j++) {
      let cx = size / 2 + i * size; // Center x of the cell
      let cy = size / 2 + j * size; // Center y of the cell
      let angle1 = map(i, 0, cols, -PI, PI); // Initialize angle1 based on column
      let angle2 = map(j, 0, rows, -PI, PI); // Initialize angle2 based on row
      pendulums[i][j] = new Pendulum(cx, cy, angle1, angle2, size, size);
    }
  }

  // --- Water Drop Setup ---
  gridCols = floor(width / cellSize);  // Columns of water drop grid
  gridRows = floor(height / cellSize); // Rows of water drop grid
}

function draw() {
  // ========== BACK IMAGE LAYER ==========
  background(255);                 // Clear canvas with white background
  image(fishImg, 0, 0, width, height); // Draw fish image on entire canvas

  // ========== BACKGROUND PENDULUM LAYER (FADING) ==========
  fadeOffset += fadeSpeed;           // Increment time offset for fading
  let fadeFactor = (sin(radians(fadeOffset)) + 1) / 2; // Convert sine to 0~1
  let fadeAlpha = map(fadeFactor, 0, 1, 50, 255);       // Map to alpha range

  push();                         // Save drawing state
  tint(255, fadeAlpha);           // Set transparency for all drawing below

  // Update and draw all pendulums with fade alpha
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      pendulums[i][j].update();                        // Update pendulum physics
      pendulums[i][j].displayColor(fadeAlpha);         // Draw fading rect
    }
  }

  pop();                         // Restore drawing state (remove tint)

  // ========== WATER DROP LAYER ==========
  noFill();                      // No fill for ellipses
  stroke(255);                   // White stroke for ripple outlines

  // Draw all water drop effects
  for (let drop of waterDrops) {
    drawCircularEffect(drop);
  }

  // Remove finished drops from the array
  waterDrops = waterDrops.filter(drop => !drop.isFinished());

  // Ensure at least 3 drops exist on screen
  if (waterDrops.length < 3) {
    spawnWaterDrops(3 - waterDrops.length);
  }
}

// =====================================================
// WATER DROP EFFECT LAYER (on top of Background)
// =====================================================

class Drop {
  constructor(x, y, layers) {
    this.x = x;                // Drop center x
    this.y = y;                // Drop center y
    this.layers = layers;      // How many ripple layers
    this.startTime = millis(); // Time of creation
    this.duration = 3000;      // Lasts 3 seconds
  }

  // Returns true if drop has expired
  isFinished() {
    return millis() - this.startTime > this.duration;
  }
}

function drawCircularEffect(drop) {
  let elapsed = millis() - drop.startTime;                  // How much time passed
  let progress = constrain(elapsed / drop.duration, 0, 1);  // 0 to 1 range
  let eased = easeOutCubic(progress);                       // Eased animation for smoothness

  for (let i = 0; i < drop.layers; i++) {
    let layerProgress = eased * (1 - i * 0.15);             // Slightly delay outer layers
    let radius = layerProgress * (300 + i * 60);            // Radius grows over time
    let alpha = map(layerProgress, 0.5, 1, 255, 0);         // Fade out when growing
    stroke(255, alpha);                                     // White stroke with fading alpha
    ellipse(drop.x, drop.y, radius * 2);                    // Draw ripple
  }
}

// Spawn new drops randomly on the grid
function spawnWaterDrops(count) {
  for (let i = 0; i < count; i++) {
    let col = int(random(3, gridCols - 3));       // Avoid edges
    let row = int(random(3, gridRows - 3));
    let centerX = col * cellSize + cellSize / 2;  // Center of cell
    let centerY = row * cellSize + cellSize / 2;

    let layers = random([3, 4]); // Choose 3 or 4 ripple layers

    // Prevent overlapping too closely with existing drops
    let tooClose = waterDrops.some(d => dist(centerX, centerY, d.x, d.y) < 150);
    if (!tooClose) {
      waterDrops.push(new Drop(centerX, centerY, layers));
    }
  }
}

// Cubic easing function for smooth animations
function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}
