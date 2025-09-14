import { Boundary, Obstacle } from "./boundary.js";
import { Particle, pldistance } from "./particle.js";
import { NeuralNetwork } from "./nn.js";
import { nextGeneration } from "./ga.js"; // Import nextGeneration
import { TrainingDashboard } from "./dashboard.js"; // Import TrainingDashboard
import { contentLoader } from "./contentLoader.js"; // Import content loader
import {
  TOTAL,
  // MUTATION_RATE, // No longer needed here, used in Particle
  LIFESPAN,
  SIGHT,
  // ELITISM_COUNT, // No longer needed here, used in ga.js
  TRACK_PRESETS,
  maxFitness,
  simulationAreaWidth,
  viewAreaWidth,
  trackheight,
} from "./config.js";

/**
 * Autonomous Car Simulation with Genetic Algorithm
 *
 * This simulation uses neural networks and a genetic algorithm to evolve
 * cars that can navigate a procedurally generated track while avoiding
 * static and dynamic obstacles.
 */

// Global variables (module-scoped, managed by sketch.js)
let toggle_value = false; // Toggle for dynamic/static obstacles
let obstacleNo = 20; // Number of obstacles

let generationCount = 0; // Current generation number
let bestP; // Best performing particle
let allTimeBestLaps = 0; // New: All-time best laps completed

let walls = []; // Track boundary walls
let obstacles = []; // Dynamic obstacles
let cp_points = []; // Checkpoint points for obstacle movement

let trained_model; // Loaded trained model

let agents = []; // Current generation of cars
let savedagents = []; // Previous generation (for genetic algorithm)

let start, end; // Start and end points of the track

let speedSlider; // Slider to control simulation speed

let inside = []; // Inner track boundary points
let outside = []; // Outer track boundary points
let checkpoints = []; // Track checkpoints

let changeMap = false; // Flag to trigger track regeneration

let currentTrackPresetIndex = 0; // Index for cycling through track presets
let loadedModel = null; // To store the raw tf.Sequential model loaded from persistence

// Dashboard instance for training analytics
let dashboard = null;

/**
 * Save the current simulation state to local storage and IndexedDB.
 * @param {NeuralNetwork} [brainToSave=null] - An optional NeuralNetwork instance to save.
 * @param {number} [genCount=generationCount] - The generation count to save.
 */
async function saveSimulationState(
  brainToSave = null,
  genCount = generationCount,
) {
  console.log("Saving simulation state...");
  localStorage.setItem("generationCount", genCount);
  localStorage.setItem("currentTrackPresetIndex", currentTrackPresetIndex);
  localStorage.setItem("allTimeBestLaps", allTimeBestLaps); // New: Save allTimeBestLaps

  // Use the provided brainToSave, or fall back to bestP's brain if available
  const brainToUse = brainToSave || (bestP ? bestP.brain : null);

  if (brainToUse && brainToUse.model) {
    try {
      await brainToUse.model.save("indexeddb://best-car-model", {
        includeOptimizer: false,
      });
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
  const storedGenerationCount = localStorage.getItem("generationCount");
  if (storedGenerationCount) {
    generationCount = parseInt(storedGenerationCount, 10);
    console.log("Loaded generation count:", generationCount);
  }

  const storedTrackPresetIndex = localStorage.getItem(
    "currentTrackPresetIndex",
  );
  if (storedTrackPresetIndex) {
    currentTrackPresetIndex = parseInt(storedTrackPresetIndex, 10);
    console.log("Loaded track preset index:", currentTrackPresetIndex);
  }

  const storedAllTimeBestLaps = localStorage.getItem("allTimeBestLaps"); // New: Load allTimeBestLaps
  if (storedAllTimeBestLaps) {
    allTimeBestLaps = parseInt(storedAllTimeBestLaps, 10);
    console.log("Loaded all-time best laps:", allTimeBestLaps);
  }

  try {
    const model = await tf.loadLayersModel("indexeddb://best-car-model");
    if (model) {
      // Explicitly compile the model with a dummy optimizer to satisfy TF.js internal checks.
      // This is a workaround if TF.js expects an optimizer even for non-training models.
      model.compile({
        optimizer: tf.train.adam(), // Use a dummy optimizer
        loss: "meanSquaredError", // Use a dummy loss
      });
      loadedModel = model; // Store the raw tf.Sequential model
      console.log("Loaded best model from IndexedDB.");
    }
  } catch (error) {
    console.log(
      "No saved model found in IndexedDB or failed to load:",
      error.message,
    );
    if (loadedModel) {
      // Ensure any partially loaded model is disposed if error occurs
      loadedModel.dispose();
    }
    loadedModel = null; // Ensure it's null if loading fails
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
  obstacles = []; // Re-initialize obstacles array
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
      p1: p1,
      p2: p2,
    };

    cp_points.push(cp_data);
    obstacles.push(ob);
  }

  // Set start and end points
  start = checkpoints[0].midpoint();
  end = checkpoints[checkpoints.length - 1].midpoint();

  // Advance to the next track preset for the next generation
  currentTrackPresetIndex =
    (currentTrackPresetIndex + 1) % TRACK_PRESETS.length;
}

/**
 * Wrapper function to call nextGeneration from ga.js and update sketch.js state.
 */
async function callNextGeneration() {
  try {
    const result = await nextGeneration(
      agents,
      savedagents,
      generationCount,
      start, // Pass start position for new particles
      saveSimulationState, // Pass the save state callback
    );
    agents = result.newAgents;
    savedagents = result.newSavedAgents;
    generationCount = result.newGenerationCount;
  } catch (error) {
    console.error("Error in nextGeneration:", error);
    // Create new random agents as fallback
    agents = [];
    for (let i = 0; i < TOTAL; i++) {
      agents.push(new Particle(null, start));
    }
    savedagents = [];
    generationCount++;
  }
}

/**
 * Setup function - runs once at the beginning
 */
window.setup = async function () {
  // Create canvas and append it to the simulation-canvas div
  let canvas = createCanvas(simulationAreaWidth + viewAreaWidth, trackheight); // Expanded canvas width
  canvas.parent("simulation-canvas");

  tf.setBackend("cpu");

  // Create speed control slider and append it to its container
  speedSlider = createSlider(1, 10, 1);
  speedSlider.parent("speed-slider-container");
  speedSlider.class("p5js-slider"); // Add a class for styling

  // Initialize training dashboard
  dashboard = new TrainingDashboard();
  window.dashboardInstance = dashboard; // Make it globally accessible for HTML onclick handlers

  // Add memory monitoring for debugging
  if (typeof tf !== "undefined") {
    console.log("Initial TensorFlow.js memory:", tf.memory());
  }

  await loadSimulationState(); // Load state after slider is created

  buildTrack(); // This will use the loaded currentTrackPresetIndex

  // Create initial population of agents
  for (let i = 0; i < TOTAL; i++) {
    if (i === 0 && loadedModel) {
      // Use loaded model for the first agent if available
      agents[i] = new Particle(loadedModel, start); // Pass the raw tf.Sequential model
    } else {
      agents[i] = new Particle(null, start); // Pass null for a new random brain
    }
  }
  // Dispose the loadedModel after all agents have been created from it
  // as the Particle constructor makes a copy.
  if (loadedModel) {
    loadedModel.dispose();
    loadedModel = null; // Clear reference
  }
};

/**
 * Toggle button for dynamic/static obstacles
 */
window.toggle_btn = function () {
  toggle_value = !toggle_value;
  const btn = document.getElementById("btn_toggle");
  if (toggle_value) {
    btn.innerHTML = "Static";
  } else {
    btn.innerHTML = "Dynamic";
  }
};

/**
 * Load a trained model from user files
 */
window.load_model = async function () {
  const uploadJSONInput = document.getElementById("upload-json");
  const uploadWeightsInput = document.getElementById("upload-weights");
  if (uploadJSONInput.files.length > 0 && uploadWeightsInput.files.length > 0) {
    trained_model = await tf.loadLayersModel(
      tf.io.browserFiles([
        uploadJSONInput.files[0],
        uploadWeightsInput.files[0],
      ]),
    );
    console.log("Model loaded successfully:", trained_model);
  } else {
    console.warn("Please select both JSON and weights files to load a model.");
  }
};

/**
 * Save the best performing model
 */
window.save_model = function () {
  if (bestP) {
    // Only save if bestP is defined
    bestP.save();
  } else {
    console.warn("No best particle to save yet.");
  }
};

/**
 * Change the number of obstacles based on user input
 */
window.change_obs_no = function () {
  const inputValue = int(document.getElementById("obs_no").value);
  if (Number.isNaN(inputValue) || inputValue < 0) {
    obstacleNo = 20;
    document.getElementById("obs_no").value = 20; // Reset input field
    console.log("Invalid input, using default value of 20");
  } else {
    obstacleNo = inputValue;
    console.log("Obstacle count set to: " + obstacleNo);
  }
  // Rebuild track with new obstacle count
  buildTrack();
  callNextGeneration(); // Start a new generation with the new track/obstacles
};

/**
 * Toggles the visibility of the settings panel.
 */
window.toggleSettingsPanel = function () {
  const settingsPanel = document.getElementById("settings-panel");
  const aboutPanel = document.getElementById("about-panel");
  settingsPanel.classList.toggle("hidden");
  // Ensure about panel is hidden when settings panel is shown
  if (!settingsPanel.classList.contains("hidden")) {
    aboutPanel.classList.add("hidden");
  }
};

/**
 * Toggles the visibility of the about panel and loads content if needed.
 */
window.toggleAboutPanel = async function () {
  const aboutPanel = document.getElementById("about-panel");
  const settingsPanel = document.getElementById("settings-panel");
  const aboutContent = document.getElementById("about-content");

  aboutPanel.classList.toggle("hidden");

  // Ensure settings panel is hidden when about panel is shown
  if (!aboutPanel.classList.contains("hidden")) {
    settingsPanel.classList.add("hidden");

    // Load about content if not already loaded
    if (!aboutContent.classList.contains("content-loaded")) {
      try {
        await contentLoader.loadIntoElement("ABOUT.md", "#about-content", {
          isMarkdown: true,
          useCache: true,
          loadingText: "Loading about content...",
          errorText: getFallbackAboutContent(),
        });
      } catch (error) {
        console.error("Failed to load about content:", error);
        // Provide fallback content if ABOUT.md cannot be loaded
        aboutContent.innerHTML = getFallbackAboutContent();
        aboutContent.classList.add("content-error");
      }
    }
  }
};

/**
 * Toggles between light and dark themes.
 */
window.toggleTheme = function () {
  document.body.classList.toggle("dark-theme");
};

/**
 * Refresh the about content by reloading it from ABOUT.md
 */
window.refreshAboutContent = async function () {
  const aboutContent = document.getElementById("about-content");

  if (aboutContent) {
    try {
      // Clear the content-loaded class to force reload
      aboutContent.classList.remove("content-loaded");

      await contentLoader.loadIntoElement("ABOUT.md", "#about-content", {
        isMarkdown: true,
        useCache: false, // Force fresh load
        loadingText: "Refreshing content...",
        errorText:
          "Failed to refresh about content. Please check that ABOUT.md exists.",
      });

      console.log("About content refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh about content:", error);
    }
  }
};

/**
 * Provides fallback content when ABOUT.md cannot be loaded
 * @returns {string} HTML content for about panel
 */
function getFallbackAboutContent() {
  return `
    <div class="fallback-content">
      <h2>About This Simulation</h2>
      <p>This project simulates autonomous cars learning to navigate a track using neural networks and a genetic algorithm.</p>

      <h3>Key Features:</h3>
      <ul>
        <li>Neural network "brains" control car movement and decision-making</li>
        <li>Genetic algorithm evolves better-performing cars over generations</li>
        <li>Real-time visualization of car sensors and 3D-like perspective view</li>
        <li>Comprehensive training analytics dashboard with performance charts</li>
        <li>Procedurally generated racetracks with dynamic obstacles</li>
      </ul>

      <h3>Controls:</h3>
      <ul>
        <li><strong>Settings Panel:</strong> Configure obstacles, simulation speed, and model management</li>
        <li><strong>Analytics Dashboard:</strong> View detailed training progress and performance metrics</li>
        <li><strong>Theme Toggle:</strong> Switch between light and dark interface themes</li>
      </ul>

      <p><em>Note: Full documentation should be loaded from ABOUT.md. If you're seeing this message,
      there may be a network issue or the file is missing.</em></p>

      <p>For complete documentation and development information, please check the project repository.</p>
    </div>
  `;
}

/**
 * Updates the simulation information displayed in the HTML info bar.
 */
function updateSimulationInfo() {
  document.getElementById("generation-info").innerText =
    "Generation: " + generationCount;
  if (bestP) {
    document.getElementById("speed-info").innerText =
      "Speed: " +
      map(bestP.vel.mag().toFixed(6), 0, 5, 0, 180).toFixed(4) +
      " Km/h";
    document.getElementById("distance-info").innerText =
      "Distance from obstacle: " + bestP.closeDistFromOb.toFixed(3) + " m";
    document.getElementById("current-laps-info").innerText =
      "Current Best Laps: " + bestP.lapsCompleted; // New: Current best laps
  } else {
    document.getElementById("speed-info").innerText = "Speed: 0.00 Km/h";
    document.getElementById("distance-info").innerText =
      "Distance from obstacle: 0.000 m";
    document.getElementById("current-laps-info").innerText =
      "Current Best Laps: 0"; // New: Current best laps
  }
  document.getElementById("all-time-laps-info").innerText =
    "All-Time Best Laps: " + allTimeBestLaps; // New: All-time best laps
}

/**
 * Updates the training dashboard with current generation statistics
 */
function updateDashboard() {
  if (!dashboard || agents.length === 0) return;

  // Calculate statistics for current generation
  let totalFitness = 0;
  let totalSpeed = 0;
  let aliveCount = 0;
  let maxFitnessCurrent = 0;
  let maxLapsCurrent = 0;

  for (let agent of agents) {
    if (!agent.dead && !agent.finished) {
      aliveCount++;
    }
    totalFitness += agent.fitness;
    totalSpeed += map(agent.vel.mag(), 0, 5, 0, 180);

    if (agent.fitness > maxFitnessCurrent) {
      maxFitnessCurrent = agent.fitness;
    }
    if (agent.lapsCompleted > maxLapsCurrent) {
      maxLapsCurrent = agent.lapsCompleted;
    }
  }

  const avgFitness = totalFitness / agents.length;
  const avgSpeed = totalSpeed / agents.length;

  // Update dashboard with current data
  dashboard.updateStats({
    generation: generationCount,
    bestFitness: maxFitnessCurrent,
    avgFitness: avgFitness,
    bestLaps: maxLapsCurrent,
    aliveCount: aliveCount,
    avgSpeed: avgSpeed,
    agents: agents,
  });
}

/**
 * Main draw loop - runs continuously
 */
window.draw = function () {
  const cycles = speedSlider.value();
  background(0);

  // Run simulation for multiple cycles per frame
  for (let n = 0; n < cycles; n++) {
    // Update all agents with error handling
    for (let i = agents.length - 1; i >= 0; i--) {
      try {
        const agent = agents[i];
        agent.look(walls, obstacles);
        agent.check(checkpoints);
        agent.bounds();
        agent.update();
        agent.show();
      } catch (error) {
        console.error("Error updating agent:", error);
        // Remove problematic agent
        const problematicAgent = agents.splice(i, 1)[0];
        if (problematicAgent) {
          problematicAgent.dispose();
        }
      }
    }

    // Remove dead or finished agents
    for (let i = agents.length - 1; i >= 0; i--) {
      const agent = agents[i];
      if (agent.dead || agent.finished) {
        try {
          savedagents.push(agents.splice(i, 1)[0]);
        } catch (error) {
          console.error("Error moving agent to savedagents:", error);
          // Remove the agent without saving if there's an error
          agents.splice(i, 1);
        }
      }

      // Trigger new generation if fitness threshold is reached
      if (!changeMap && agent.fitness > maxFitness) {
        changeMap = true;
      }
    }

    // Generate new track and population if needed
    if (agents.length !== 0 && changeMap) {
      try {
        for (let i = agents.length - 1; i >= 0; i--) {
          savedagents.push(agents.splice(i, 1)[0]);
        }

        buildTrack();
        callNextGeneration(); // Call the wrapper
        changeMap = false;
      } catch (error) {
        console.error("Error during generation change:", error);
        changeMap = false;
      }
    }

    // Generate new population if all agents are dead
    if (agents.length === 0) {
      try {
        buildTrack();
        callNextGeneration(); // Call the wrapper
      } catch (error) {
        console.error("Error generating new population:", error);
        // Create fallback population
        for (let i = 0; i < TOTAL; i++) {
          agents.push(new Particle(null, start));
        }
      }
    }
  }

  // Determine the best *active* agent for display *after* all simulation logic for the frame.
  bestP = null;
  let maxFitnessCurrent = -1;
  for (let agent of agents) {
    try {
      if (agent.fitness > maxFitnessCurrent) {
        maxFitnessCurrent = agent.fitness;
        bestP = agent;
      }
    } catch (error) {
      console.warn("Error accessing agent fitness:", error);
    }
  }

  // New: Update allTimeBestLaps if the current best particle has completed more laps
  if (bestP && bestP.lapsCompleted > allTimeBestLaps) {
    allTimeBestLaps = bestP.lapsCompleted;
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
    try {
      bestP.highlight();

      // Render 3D-like view from best agent's perspective
      let data = bestP.renderView(walls, obstacles);
      let scene = data["scene"];
      let colors = data["colors"];
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
    } catch (error) {
      console.warn("Error rendering best agent view:", error);
    }
  }

  // Update HTML info bar
  updateSimulationInfo();

  // Update dashboard with analytics (throttled to avoid performance impact)
  if (frameCount % 30 === 0) {
    // Update dashboard every 30 frames (~0.5 seconds)
    updateDashboard();

    // Memory monitoring for debugging
    if (typeof tf !== "undefined" && frameCount % 300 === 0) {
      const memInfo = tf.memory();
      console.log(
        `TensorFlow.js Memory - Tensors: ${memInfo.numTensors}, Bytes: ${memInfo.numBytes}`,
      );
      if (memInfo.numTensors > 1000) {
        console.warn("High tensor count detected, potential memory leak");
      }
    }
  }
};
