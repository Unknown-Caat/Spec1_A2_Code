// =====================================================
// PENDULUM CLASS - Used in background fading animation
// =====================================================

class Pendulum {
  constructor(cx, cy, angle1, angle2, w, h) {
    this.cx = cx;           // Center x position of the pendulum
    this.cy = cy;           // Center y position of the pendulum
    this.angle1 = angle1;   // First angle for sine-based motion
    this.angle2 = angle2;   // Second angle for variation
    this.velocity = 0;      // Angular velocity (starts at rest)
    this.acceleration = 0;  // Angular acceleration
    this.w = w;             // Width of each rectangle
    this.h = h;             // Height of each rectangle
  }

  update() {
    // Basic pendulum-like motion using sine wave physics
    this.acceleration = -g * sin(this.angle1); // Apply gravity force
    this.velocity += this.acceleration * dt;   // Update velocity over time
    this.velocity = constrain(this.velocity, -maxVelocity, maxVelocity); // Limit speed
    this.angle1 += this.velocity * dt;         // Update angle over time
  }

  displayColor(alphaVal) {
    noStroke(); // No outline for the rectangles

    // Create a value based on combined angles to select a color from the palette
    let t = map(sin(this.angle1 + this.angle2), -1, 1, 0, palette.length - 1); 
    let index1 = floor(t);                           // Lower index in palette
    let index2 = (index1 + 1) % palette.length;      // Next index (wraps around)
    let amt = t - index1;                            // Interpolation amount between colors

    let c = lerpColor(palette[index1], palette[index2], amt); // Blend two colors smoothly

    c.setAlpha(alphaVal); // Set alpha based on fade layer

    fill(c);              // Apply color with alpha
    rectMode(CENTER);     // Draw from center of cell
    rect(this.cx, this.cy, this.w, this.h); // Draw rectangle representing pendulum state
  }
}
