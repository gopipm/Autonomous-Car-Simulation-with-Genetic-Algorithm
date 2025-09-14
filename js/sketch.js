/**
 * Autonomous Car Simulation with Genetic Algorithm
 *
 * This simulation uses neural networks and a genetic algorithm to evolve
 * cars that can navigate a procedurally generated track while avoiding
 * static and dynamic obstacles.
 */

// Configuration constants
const TOTAL = 100;          // Number of cars in each generation
const MUTATION_RATE = 0.2;  // Probability of mutation for each weight
const LIFESPAN = 30;        // Maximum frames a car can live without progress
const SIGHT = 80;           // Sensor range in pixels
const ELITISM_COUNT = 1;    // Number of top agents to carry over to the next generation

// Track generation presets for varied layouts
const TRACK_PRESETS = [
  { noiseMax: 2, pathWidth: 70 },  // Default: moderately curvy, standard width
  { noiseMax: 3, pathWidth: 60 },  // More curvy, slightly narrower
  { noiseMax: 1.5, pathWidth: 80 },// Less curvy, wider
  { noiseMax: 2.5, pathWidth: 50 } // Moderately curvy, narrow
];

// Global variables
let toggle_value = false;   // Toggle for dynamic/static obstacles
let obstacleNo = 20;        // Number of obstacles

let generationCount = 0;    // Current generation number
let bestP;                  // Best performing particle

let walls = [];             // Track boundary walls
let ray;                    // Sensor ray (unused?)

let cp_points = [];         // Checkpoint points for obstacle movement

let trained_model;          // Loaded trained model

let agents = [];            // Current generation of cars
let savedagents = [];       // Previous generation (for genetic algorithm)

let start, end;             // Start and end points of the track

let speedSlider;            // Slider to control simulation speed

let inside = [];            // Inner track boundary points
let outside = [];           // Outer track boundary points
let checkpoints = [];       // Track checkpoints

const maxFitness = 500;     // Fitness threshold to trigger new generation
let changeMap = false;      // Flag to trigger track regeneration

const simulationAreaWidth = 1000; // Width of the main simulation track area
const viewAreaWidth = 300;        // Width of the 3D-like ray casting view
let trackheight = 800;            // Height of the entire canvas

let currentTrackPresetIndex = 0; // Index for cycling through track presets
let loadedBrain = null; // To store the brain loaded from persistence

/**
 * Save the current simulation state to local storage and IndexedDB.
 * @param {NeuralNetwork} [brainToSave=null] - An optional NeuralNetwork instance to save.
 */
async function saveSimulationState(brainToSave = null) {
  console.log("Saving simulation state...");
  localStorage.setItem('generationCount', generationCount);
  localStorage.setItem('currentTrackPresetIndex', currentTrackPresetIndex);

  // Use the provided brainToSave, or fall back to bestP's brain if available
  const brainToUse = brainToSave || (bestP ? bestP.brain : null);

  if (brainToUse && brainToUse.model) {
    try {
      await brainToUse.model.save('indexeddb://best-car-model', { includeOptimizer: false });
      console.log("Best model saved to IndexedDB.");
    } catch (error) {
      console.error("Failed to save model to IndexedDB:", error);
    }
  } else {
    console.log("No brain available to save.");
  }
}

/**
 * Load the simulation state from local storage and IndexedDB.
 * @returns {Promise<void>}
 */
async function loadSimulationState() {
  console.log("Loading simulation state...");
  const storedGenerationCount = localStorage.getItem('generationCount');
  if (storedGenerationCount) {
    generationCount = parseInt(storedGenerationCount, 10);
    console.log("Loaded generation count:", generationCount);
  }

  const storedTrackPresetIndex = localStorage.getItem('currentTrackPresetIndex');
  if (storedTrackPresetIndex) {
    currentTrackPresetIndex = parseInt(storedTrackPresetIndex, 10);
    console.log("Loaded track preset index:", currentTrackPresetIndex);
  }

  try {
    const model = await tf.loadLayersModel('indexeddb://best-car-model');
    if (model) {
      // Explicitly compile the model with a dummy optimizer to satisfy TF.js internal checks.
      // This is a workaround if TF.js expects an optimizer even for non-training models.
      model.compile({
        optimizer: tf.train.adam(), // Use a dummy optimizer
        loss: 'meanSquaredError'    // Use a dummy loss
      });
      loadedBrain = new NeuralNetwork(model, 13, 26, 2);
      console.log("Loaded best model from IndexedDB.");
    }
  } catch (error) {
    console.log("No saved model found in IndexedDB or failed to load:", error.message);
    loadedBrain = null; // Ensure it's null if loading fails
  }
}

/**
 * Build a procedurally generated track with inner and outer boundaries
 */
function buildTrack() {
  // Reset track data
  checkpoints = [];
  inside = [];
  outside = [];

  // Get current track preset parameters
  const currentPreset = TRACK_PRESETS[currentTrackPresetIndex];
  let noiseMax = currentPreset.noiseMax;
  const pathWidth = currentPreset.pathWidth;

  let min_dist = Infinity;

  // Generate track points using Perlin noise
  const total = 80;
  let startX = random(10);
  let startY = random(10);

  for (let i = 0; i < total; i++) {
    let a = map(i, 0, total, 0, TWO_PI);
    let xoff = map(cos(a), -1, 1, 0, noiseMax) + startX;
    let yoff = map(sin(a), -1, 1, 0, noiseMax) + startY;
    let xr = map(noise(xoff, yoff), 0, 1, 100, simulationAreaWidth * 0.5); // Use simulationAreaWidth
    let yr = map(noise(xoff, yoff), 0, 1, 100, trackheight * 0.5);
    let x1 = simulationAreaWidth / 2 + (xr - pathWidth) * cos(a); // Use simulationAreaWidth
    let y1 = trackheight / 2 + (yr - pathWidth) * sin(a);
    let x2 = simulationAreaWidth / 2 + (xr + pathWidth) * cos(a); // Use simulationAreaWidth
    let y2 = trackheight / 2 + (yr + pathWidth) * sin(a);

    checkpoints.push(new Boundary(x1, y1, x2, y2));
    inside.push(createVector(x1, y1));
    outside.push(createVector(x2, y2));
  }

  // Create walls from consecutive checkpoint points
  walls = [];
  for (let i = 0; i < checkpoints.length; i++) {
    let a1 = inside[i];
    let b1 = inside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a1.x, a1.y, b1.x, b1.y));

    let a2 = outside[i];
    let b2 = outside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a2.x, a2.y, b2.x, b2.y));
  }

  // Create dynamic obstacles
  obstacles = [];
  cp_points = [];
  for (let i = 0; i < obstacleNo; i++) {
    let index = int(random(5, checkpoints.length - 1));
    let p1 = inside[index];
    let p2 = outside[index];
    // let mid = checkpoints[index].midpoint();
    let x = random(p1.x, p2.x);
    let m = (p2.y - p1.y) / (p2.x - p1.x);
    let y = m * (x - p1.x) + p1.y;
    let ob = new Obstacle(x, y);

    let cp_data = {
      "p1": p1,
      "p2": p2
    };

    cp_points.push(cp_data);
    obstacles.push(ob);
  }

  // Set start and end points
  start = checkpoints[0].midpoint();
  end = checkpoints[checkpoints.length - 1].midpoint();

  // Advance to the next track preset for the next generation
  currentTrackPresetIndex = (currentTrackPresetIndex + 1) % TRACK_PRESETS.length;
}

/**
 * Setup function - runs once at the beginning
 */
async function setup() { // Make setup async
  // Create canvas and append it to the simulation-canvas div
  let canvas = createCanvas(simulationAreaWidth + viewAreaWidth, trackheight); // Expanded canvas width
  canvas.parent('simulation-canvas');

  tf.setBackend('cpu');

  // Create speed control slider and append it to its container
  speedSlider = createSlider(1, 10, 1);
  speedSlider.parent('speed-slider-container');
  speedSlider.class('p5js-slider'); // Add a class for styling

  await loadSimulationState(); // Load state after slider is created

  buildTrack(); // This will use the loaded currentTrackPresetIndex

  // Create initial population of agents
  for (let i = 0; i < TOTAL; i++) {
    if (i === 0 && loadedBrain) { // Use loaded brain for the first agent if available
      agents[i] = new Particle(loadedBrain);
      // Dispose the loadedBrain after using it to create the first agent
      // as the Particle constructor makes a copy.
      loadedBrain.dispose();
      loadedBrain = null; // Clear reference
    } else {
      agents[i] = new Particle();
    }
  }
}

/**
 * Toggle button for dynamic/static obstacles
 */
function toggle_btn() {
  toggle_value = !toggle_value;
  const btn = document.getElementById("btn_toggle");
  if (toggle_value) {
    btn.innerHTML = "Static";
  } else {
    btn.innerHTML = "Dynamic";
  }
}

/**
 * Load a trained model from user files
 */
async function load_model() {
  const uploadJSONInput = document.getElementById('upload-json');
  const uploadWeightsInput = document.getElementById('upload-weights');
  if (uploadJSONInput.files.length > 0 && uploadWeightsInput.files.length > 0) {
    trained_model = await tf.loadLayersModel(
      tf.io.browserFiles([uploadJSONInput.files[0], uploadWeightsInput.files[0]])
    );
    console.log("Model loaded successfully:", trained_model);
  } else {
    console.warn("Please select both JSON and weights files to load a model.");
  }
}

/**
 * Save the best performing model
 */
function save_model() {
  if (bestP) { // Only save if bestP is defined
    bestP.save();
  } else {
    console.warn("No best particle to save yet.");
  }
}

/**
 * Change the number of obstacles based on user input
 */
function change_obs_no() {
  const inputValue = int(document.getElementById('obs_no').value);
  if (Number.isNaN(inputValue) || inputValue < 0) {
    obstacleNo = 20;
    document.getElementById('obs_no').value = 20; // Reset input field
    console.log("Invalid input, using default value of 20");
  } else {
    obstacleNo = inputValue;
    console.log("Obstacle count set to: " + obstacleNo);
  }
  // Rebuild track with new obstacle count
  buildTrack();
  nextGeneration(); // Start a new generation with the new track/obstacles
}

/**
 * Toggles the visibility of the settings panel.
 */
function toggleSettingsPanel() {
  const settingsPanel = document.getElementById('settings-panel');
  settingsPanel.classList.toggle('hidden');
}

/**
 * Toggles between light and dark themes.
 */
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}


/**
 * Main draw loop - runs continuously
 */
function draw() {
  const cycles = speedSlider.value();
  background(0);

  // Initialize bestP to null or the first agent if available
  bestP = agents.length > 0 ? agents[0] : null;

  // Run simulation for multiple cycles per frame
  for (let n = 0; n < cycles; n++) {
    // Update all agents
    for (let agent of agents) {
      agent.look(walls, obstacles);
      agent.check(checkpoints);
      agent.bounds();
      agent.update();
      agent.show(); // Now all agents will be displayed

      // Track best performing agent
      if (bestP === null || agent.fitness > bestP.fitness) { // Handle initial null bestP
        bestP = agent;
      }
    }

    // Remove dead or finished agents
    for (let i = agents.length - 1; i >= 0; i--) {
      const agent = agents[i];
      if (agent.dead || agent.finished) {
        savedagents.push(agents.splice(i, 1)[0]);
      }

      // Trigger new generation if fitness threshold is reached
      if (!changeMap && agent.fitness > maxFitness) {
        changeMap = true;
      }
    }

    // Generate new track and population if needed
    if (agents.length !== 0 && changeMap) {
      for (let i = agents.length - 1; i >= 0; i--) {
        savedagents.push(agents.splice(i, 1)[0]);
      }

      buildTrack();
      nextGeneration();
      changeMap = false;
    }

    // Generate new population if all agents are dead
    if (agents.length === 0) {
      buildTrack();
      nextGeneration();
    }
  }

  // Display track elements
  for (let cp of checkpoints) {
    // strokeWeight(2);
    // cp.show();
  }

  for (let wall of walls) {
    wall.show();
  }

  // Display obstacles
  for (let i = 0; i < obstacles.length; i++) {
    if (toggle_value) {
      obstacles[i].show(cp_points[i]);
    } else {
      obstacles[i].show(0);
    }
  }

  // Highlight best agent and render its view ONLY if bestP is defined
  if (bestP) {
    bestP.highlight();

    // Render 3D-like view from best agent's perspective
    let data = bestP.renderView(walls, obstacles);
    let scene = data['scene'];
    let colors = data['colors'];
    const w = viewAreaWidth / scene.length; // Use viewAreaWidth for scaling

    push();
    translate(simulationAreaWidth, 0); // Translate to the right of the simulation area
    for (let i = 0; i < scene.length; i++) {
      noStroke();
      let sq = scene[i] * scene[i];
      let swq = SIGHT * SIGHT; // Use SIGHT for better scaling
      const b = map(sq, 0, swq, 200, 0);
      const h = map(sq, 0, swq, trackheight, 0); // Scale height to trackheight

      if (colors[i] === 1) {
        // Obstacle color (red)
        fill(b, 0, 0);
      }
      if (colors[i] === 0) {
        // Wall color (gray/blue)
        fill(b, b, b + 30, b);
      }

      rectMode(CENTER);
      rect(i * w + w / 2, trackheight / 2, w + 1, h); // Center rect vertically
    }
    pop();

    // Display UI information
    fill(255);
    line(simulationAreaWidth, 0, simulationAreaWidth, trackheight); // Separator line
    textSize(24);
    noStroke();
    text('Generation: ' + generationCount, simulationAreaWidth + 10, 50); // Position relative to simulationAreaWidth
    text('Speed: ' + map(bestP.vel.mag().toFixed(6), 0, 5, 0, 180).toFixed(4) + ' Km/h', simulationAreaWidth + 10, 700);
    text('Distance from obstacle: ' + bestP.closeDistFromOb.toFixed(3) + " m", simulationAreaWidth + 10, 750);
  } else {
    // If no agents are alive, display a message or just clear the view
    fill(255);
    textSize(24);
    noStroke();
    text('Generation: ' + generationCount, simulationAreaWidth + 10, 50);
    text('No active agents. Waiting for next generation...', simulationAreaWidth + 10, 700);
  }
}