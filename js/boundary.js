/**
 * Boundary class representing track boundaries
 * Each boundary is a line segment between two points
 */
export class Boundary {
  /**
   * Constructor for the Boundary class
   * @param {number} x1 - X coordinate of the first point
   * @param {number} y1 - Y coordinate of the first point
   * @param {number} x2 - X coordinate of the second point
   * @param {number} y2 - Y coordinate of the second point
   */
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  /**
   * Calculate the midpoint of the boundary
   * @returns {p5.Vector} The midpoint vector
   */
  midpoint() {
    return createVector(
      (this.a.x + this.b.x) * 0.5,
      (this.a.y + this.b.y) * 0.5
    );
  }

  /**
   * Display the boundary on the canvas
   */
  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

/**
 * Obstacle class representing dynamic obstacles in the simulation
 * Obstacles move along the track and pose challenges for the cars
 */
export class Obstacle {
  /**
   * Constructor for the Obstacle class
   * @param {number} x - X coordinate of the obstacle
   * @param {number} y - Y coordinate of the obstacle
   */
  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  /**
   * Calculate distance from this obstacle to a point
   * @param {p5.Vector} pt - The point to calculate distance to
   * @returns {number} The distance
   */
  dist_from_obs(pt) {
    return sqrt(sq(this.pos.x - pt.x) + sq(this.pos.y - pt.y));
  }

  /**
   * Display the obstacle on the canvas
   * @param {Object|number} cp_points - Checkpoint points for dynamic movement or 0 for static
   */
  show(cp_points) {
    noStroke();
    fill(255, 0, 0);
    
    // Dynamic movement logic
    if (typeof cp_points === 'object') {
      let x = this.pos.x;
      x = x + random(-2, 2);
      let m = (cp_points.p2.y - cp_points.p1.y) / (cp_points.p2.x - cp_points.p1.x);
      let y = m * (x - cp_points.p1.x) + cp_points.p1.y;
      
      // Randomly update position
      if (random(1) < 0.2) {
        let min_x = (cp_points.p2.x > cp_points.p1.x) ? cp_points.p1.x : cp_points.p2.x;
        let max_x = (cp_points.p2.x < cp_points.p1.x) ? cp_points.p1.x : cp_points.p2.x;
        let min_y = (cp_points.p2.y > cp_points.p1.y) ? cp_points.p1.y : cp_points.p2.y;
        let max_y = (cp_points.p2.y < cp_points.p1.y) ? cp_points.p1.y : cp_points.p2.y;
        
        if (x > min_x && x < max_x) {
          this.pos.x = x;
        }
        if (y > min_y && y < max_y) {
          this.pos.y = y;
        }
      }
    }
    
    // Draw the obstacle
    ellipse(this.pos.x, this.pos.y, 10, 10);
  }
}