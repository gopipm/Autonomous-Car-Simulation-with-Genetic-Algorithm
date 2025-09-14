// Configuration constants for the Autonomous Car Simulation

export const TOTAL = 100;          // Number of cars in each generation
export const MUTATION_RATE = 0.2;  // Probability of mutation for each weight
export const LIFESPAN = 30;        // Maximum frames a car can live without progress
export const SIGHT = 80;           // Sensor range in pixels
export const ELITISM_COUNT = 1;    // Number of top agents to carry over to the next generation
export const maxFitness = 500;     // Fitness threshold to trigger new generation

// Track generation presets for varied layouts
export const TRACK_PRESETS = [
  { noiseMax: 2, pathWidth: 70 },  // Default: moderately curvy, standard width
  { noiseMax: 3, pathWidth: 60 },  // More curvy, slightly narrower
  { noiseMax: 1.5, pathWidth: 80 },// Less curvy, wider
  { noiseMax: 2.5, pathWidth: 50 } // Moderately curvy, narrow
];

export const simulationAreaWidth = 1000; // Width of the main simulation track area
export const viewAreaWidth = 350;        // Width of the 3D-like ray casting view
export const trackheight = 800;            // Height of the entire canvas