import { Particle } from "./particle.js";
import { TOTAL, ELITISM_COUNT } from "./config.js"; // MUTATION_RATE is now used in Particle

/**
 * Calculate the next generation of cars using genetic algorithm
 * This function evolves the population by selecting the fittest individuals
 * and creating offspring through mutation, including elitism.
 * @param {Particle[]} currentAgents - The current array of agents.
 * @param {Particle[]} currentSavedAgents - The array of agents from the previous generation.
 * @param {number} currentGenerationCount - The current generation number.
 * @param {p5.Vector} startPos - The starting position for new particles.
 * @param {Function} saveStateCallback - A callback function to save the simulation state.
 * @returns {Object} An object containing the new agents, cleared saved agents, and incremented generation count.
 */
export async function nextGeneration(
  currentAgents,
  currentSavedAgents,
  currentGenerationCount,
  startPos,
  saveStateCallback,
) {
  console.log("Generating next generation");

  let brainToPersist = null;
  let eliteBrains = [];

  // Only calculate fitness if there are saved agents to evaluate
  if (currentSavedAgents.length > 0) {
    calculateFitness(currentSavedAgents);
    // Sort savedagents by fitness in descending order
    currentSavedAgents.sort((a, b) => b.fitness - a.fitness);
    // Get a copy of the best brain *before* disposing the original agents
    brainToPersist = currentSavedAgents[0].brain.copy();

    // Create copies of elite brains before disposing agents
    const actualElites = Math.min(ELITISM_COUNT, currentSavedAgents.length);
    for (let i = 0; i < actualElites; i++) {
      eliteBrains.push(currentSavedAgents[i].brain.copy());
    }
  }

  let newAgents = []; // This will be the new generation
  const actualElites = Math.min(ELITISM_COUNT, currentSavedAgents.length);

  // Implement elitism: use the copied elite brains
  for (let i = 0; i < actualElites && i < eliteBrains.length; i++) {
    newAgents.push(new Particle(eliteBrains[i], startPos));
  }

  // Create the rest of the new generation
  if (currentSavedAgents.length > 0) {
    for (let i = actualElites; i < TOTAL; i++) {
      newAgents.push(pickOne(currentSavedAgents, startPos));
    }
  } else {
    // If no saved agents (e.g., first generation where all died), create all new random particles
    for (let i = actualElites; i < TOTAL; i++) {
      newAgents.push(new Particle(null, startPos));
    }
  }

  // Dispose of all saved agents from the previous generation to free memory
  for (let i = 0; i < currentSavedAgents.length; i++) {
    currentSavedAgents[i].dispose();
  }

  // Dispose of elite brain copies after creating new particles
  for (let i = 0; i < eliteBrains.length; i++) {
    eliteBrains[i].dispose();
  }

  let newSavedAgents = []; // Clear the savedagents array for the next cycle

  let newGenerationCount = currentGenerationCount + 1; // Increment generation count here

  // Save the state after a new generation is created, passing the cloned brain and new generation count
  await saveStateCallback(brainToPersist, newGenerationCount);

  // Dispose of the cloned brain after it has been saved
  if (brainToPersist) {
    brainToPersist.dispose();
  }

  return {
    newAgents: newAgents,
    newSavedAgents: newSavedAgents,
    newGenerationCount: newGenerationCount,
  };
}

/**
 * Select one parent and create a mutated offspring
 * Uses roulette wheel selection based on fitness
 * @param {Particle[]} savedAgents - The array of agents from the previous generation.
 * @param {p5.Vector} startPos - The starting position for the new particle.
 * @returns {Particle} A new Particle instance (offspring)
 */
export function pickOne(savedAgents, startPos) {
  // Roulette wheel selection
  let index = 0;
  let r = random(1);
  while (r > 0) {
    r = r - savedAgents[index].fitness;
    index++;
  }
  index--;

  // Create offspring with mutation
  let particle = savedAgents[index];
  // Create a copy of the brain before creating the child to avoid disposal issues
  let brainCopy = particle.brain.copy();
  let child = new Particle(brainCopy, startPos);
  child.mutate();

  // Dispose of the temporary brain copy since the child has its own copy
  brainCopy.dispose();

  return child;
}

/**
 * Calculate and normalize fitness values for all particles
 * Fitness is based on how far the car progressed and how long it survived
 * @param {Particle[]} savedAgents - The array of agents from the previous generation.
 */
export function calculateFitness(savedAgents) {
  // Calculate raw fitness for each particle
  for (let particle of savedAgents) {
    particle.calculateFitness();
  }

  // Sum all fitness values for normalization
  let sum = 0;
  for (let particle of savedAgents) {
    sum += particle.fitness;
  }

  // Normalize fitness values to sum to 1.0
  for (let particle of savedAgents) {
    particle.fitness = particle.fitness / sum;
  }
}
