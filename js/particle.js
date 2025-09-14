/**
 * Calculate the perpendicular distance from a point to a line
 * @param {p5.Vector} p1 - First point of the line
 * @param {p5.Vector} p2 - Second point of the line
 * @param {number} x - X coordinate of the point
 * @param {number} y - Y coordinate of the point
 * @returns {number} The perpendicular distance
 */
function pldistance(p1, p2, x, y) {
  const num = abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x);
  const den = p5.Vector.dist(p1, p2);
  return num / den;
}

/**
 * Particle class representing a car in the simulation
 * Each particle has a neural network brain that controls its movement
 */
class Particle {
  /**
   * Constructor for the Particle class
   * @param {NeuralNetwork} brain - Optional pre-trained neural network
   */
  constructor(brain) {
    // Fitness and state tracking
    this.fitness = 0;
    this.dead = false;
    this.finished = false;
    
    // Physics properties
    this.pos = createVector(start.x, start.y);
    this.vel = createVector();
    this.acc = createVector();
    this.maxspeed = 5;
    this.maxforce = 0.2;
    this.sight = SIGHT;
    
    // Sensors (rays for obstacle detection)
    this.view = [];
    this.rays = [];
    
    // Progress tracking
    this.index = 0;
    this.counter = 0;
    this.closeDistFromOb = Infinity;

    // Initialize sensors
    for (let a = -65; a < 65; a += 1) {
      this.view.push(new Ray(this.pos.copy(), radians(a)));
    }
    for (let a = -65; a < 65; a += 10) {
      this.rays.push(new Ray(this.pos.copy(), radians(a)));
    }
    
    // Initialize brain (neural network)
    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(this.rays.length, this.rays.length * 2, 2);
    }
  }

  /**
   * Dispose of the particle's neural network to free memory
   */
  dispose() {
    this.brain.dispose();
  }

  /**
   * Save the particle's neural network model
   */
  save() {
    this.brain.save();
  }

  /**
   * Mutate the particle's neural network
   */
  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }

  /**
   * Apply a force to the particle
   * @param {p5.Vector} force - The force vector to apply
   */
  applyForce(force) {
    this.acc.add(force);
  }

  /**
   * Update the particle's position and state
   */
  update() {
    if (!this.dead && !this.finished) {
      // Update physics
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.acc.set(0, 0);
      
      // Update lifespan counter
      this.counter++;
      if (this.counter > LIFESPAN) {
        this.dead = true;
      }

      // Update sensor positions and rotate to match heading
      for (let i = 0; i < this.view.length; i++) {
        this.view[i].pos = this.pos.copy();
        this.view[i].rotate(this.vel.heading());
      }

      for (let i = 0; i < this.rays.length; i++) {
        this.rays[i].pos = this.pos.copy();
        this.rays[i].rotate(this.vel.heading());
      }
    }
  }

  /**
   * Check if the particle has reached the next checkpoint
   * @param {Boundary[]} checkpoints - Array of checkpoint boundaries
   */
  check(checkpoints) {
    if (!this.finished) {
      this.goal = checkpoints[this.index];
      const d = pldistance(this.goal.a, this.goal.b, this.pos.x, this.pos.y);
      if (d < 5) {
        this.index = (this.index + 1) % checkpoints.length;
        this.fitness++;
        this.counter = 0;
      }
    }
  }

  /**
   * Calculate the fitness of the particle
   * Fitness increases exponentially with the number of checkpoints reached
   */
  calculateFitness() {
    this.fitness = pow(2, this.fitness);
  }

  /**
   * Use sensors to look for obstacles and make decisions
   * @param {Boundary[]} walls - Array of boundary walls
   * @param {Obstacle[]} obstacles - Array of dynamic obstacles
   */
  look(walls, obstacles) {
    const inputs = [];
    this.closeDistFromOb = Infinity;
    
    // Process sensor data
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = this.sight;
      
      // Check for obstacles
      let ob_point = ray.checkobstacle(obstacles);
      if (ob_point) {
        let distance = p5.Vector.dist(this.pos, ob_point.pos);
        if (distance < record) {
          closest = ob_point.pos;
          record = distance;
          this.closeDistFromOb = record;
        }
      }

      // Check for walls
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record && d < this.sight) {
            record = d;
            closest = pt;
          }
        }
      }

      // Die if too close to obstacle
      if (record < 10) {
        this.dead = true;
      }

      // Normalize sensor input
      inputs[i] = map(record, 0, SIGHT, 1, 0);

      // Visualize sensor rays
      if (closest) {
        stroke(255, 100, 100);  // Red color for sensor rays
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
    
    // Use neural network to decide steering
    const output = this.brain.predict(inputs);
    let angle = map(output[0], 0, 1, -PI, PI);
    let speed = map(output[1], 0, 1, 0, this.maxspeed);
    angle += this.vel.heading();
    const steering = p5.Vector.fromAngle(angle);
    steering.setMag(speed);
    steering.sub(this.vel);
    steering.limit(this.maxforce);
    this.applyForce(steering);
  }

  /**
   * Check if the particle is out of bounds
   */
  bounds() {
    if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
      this.dead = true;
    }
  }

  /**
   * Display the particle on the canvas
   */
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    fill(255, 100);
    rectMode(CENTER);
    rect(0, 0, 20, 10);
    pop();
  }

  /**
   * Render the particle's view perspective
   * @param {Boundary[]} walls - Array of boundary walls
   * @param {Obstacle[]} obstacles - Array of dynamic obstacles
   * @returns {Object} Object containing scene distances and colors
   */
  renderView(walls, obstacles) {
    let scene = [];
    let colors = [];
    
    for (let i = 0; i < this.view.length; i++) {
      const ray = this.view[i];
      let closest = null;
      let c = 0;  // 0 for walls, 1 for obstacles
      let record = Infinity;
      
      // Check for obstacles
      let ob_point = ray.renderobstacle(obstacles);
      if (ob_point) {
        let distance = p5.Vector.dist(this.pos, ob_point.pos);
        if (distance < record) {
          closest = ob_point.pos;
          record = distance;
          c = 1;
        }
      }
      
      // Check for walls
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
            c = 0;
          }
        }
      }
      
      scene[i] = record;
      colors[i] = c;
    }
    
    return {
      scene: scene,
      colors: colors
    };
  }

  /**
   * Highlight the best particle and show its goal
   */
  highlight() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    stroke(0, 255, 0);
    fill(0, 255, 0, 100);
    rectMode(CENTER);
    rect(0, 0, 20, 10);
    pop();
    
    if (this.goal) {
      this.goal.show();
    }
  }
}