/**
 * Ray class for sensor rays used in obstacle detection
 * Rays are cast from the particle's position in a specific direction
 */
class Ray {
  /**
   * Constructor for the Ray class
   * @param {p5.Vector} pos - The starting position of the ray
   * @param {number} angle - The angle of the ray in radians
   */
  constructor(pos, angle) {
    this.pos = pos;
    this.angle = angle;
    this.dir = p5.Vector.fromAngle(angle);
  }

  /**
   * Point the ray at a specific target
   * @param {number} x - Target x coordinate
   * @param {number} y - Target y coordinate
   */
  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  /**
   * Rotate the ray by an offset angle
   * @param {number} offset - Angle offset in radians
   */
  rotate(offset) {
    this.dir = p5.Vector.fromAngle(this.angle + offset);
  }

  /**
   * Display the ray on the canvas
   */
  show() {
    stroke(0, 255, 0, 100);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * SIGHT, this.dir.y * SIGHT);
    pop();
  }

  /**
   * Check for collisions with obstacles
   * @param {Obstacle[]} obstacles - Array of obstacles to check
   * @returns {Obstacle|null} The closest obstacle or null if none found
   */
  checkobstacle(obstacles) {
    let p1 = this.pos.copy();
    let p2 = p5.Vector.add(this.pos.copy(), p5.Vector.mult(this.dir.copy(), SIGHT));
    let ob = null;
    let dis = Infinity;
    
    for (let obstacle of obstacles) {
      // Check if obstacle point is on the line segment formed by the ray
      // collidePointLine(pointX, pointY, lineStartX, lineStartY, lineEndX, lineEndY, tolerance)
      if (collidePointLine(obstacle.pos.x, obstacle.pos.y, p1.x, p1.y, p2.x, p2.y, 1)) {
        // Find the closest obstacle
        let distance = p5.Vector.dist(this.pos, obstacle.pos);
        if (distance < dis) {
          dis = distance;
          ob = obstacle;
        }
      }
    }
    
    return ob;
  }

  /**
   * Render obstacle detection for visualization
   * @param {Obstacle[]} obstacles - Array of obstacles to check
   * @returns {Obstacle|null} The closest obstacle or null if none found
   */
  renderobstacle(obstacles) {
    let p1 = this.pos.copy();
    let p2 = p5.Vector.add(this.pos.copy(), p5.Vector.mult(this.dir.copy(), 1000));
    let ob = null;
    let dis = Infinity;
    
    for (let obstacle of obstacles) {
      // Check if obstacle point is on the line segment formed by the ray
      // collidePointLine(pointX, pointY, lineStartX, lineStartY, lineEndX, lineEndY, tolerance)
      if (collidePointLine(obstacle.pos.x, obstacle.pos.y, p1.x, p1.y, p2.x, p2.y, 0.07)) {
        // Find the closest obstacle
        let distance = p5.Vector.dist(this.pos, obstacle.pos);
        if (distance < dis) {
          dis = distance;
          ob = obstacle;
        }
      }
    }
    
    return ob;
  }

  /**
   * Cast the ray and check for intersection with a wall
   * Uses line-line intersection algorithm
   * @param {Boundary} wall - The wall to check for intersection
   * @returns {p5.Vector|undefined} The intersection point or undefined if no intersection
   */
  cast(wall) {
    // Wall endpoints
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    // Ray endpoints
    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x * SIGHT;  // Use SIGHT distance for ray length
    const y4 = this.pos.y + this.dir.y * SIGHT;

    // Calculate denominator for line intersection
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) {
      return;
    }

    // Calculate intersection point
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    
    // Check if intersection is within both line segments
    if (t > 0 && t < 1 && u > 0 && u < 1) {  // Added u < 1 condition for ray length
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}
