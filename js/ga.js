/**
 * Calculate the next generation of cars using genetic algorithm
 * This function evolves the population by selecting the fittest individuals
 * and creating offspring through mutation, including elitism.
 */
async function nextGeneration() { // Make nextGeneration async
  console.log('Generating next generation');
  
  let brainToPersist = null; // Variable to hold the brain of the best agent from the *previous* generation

  // Only calculate fitness if there are saved agents to evaluate
  if (savedagents.length > 0) {
    calculateFitness();
    // Sort savedagents by fitness in descending order
    savedagents.sort((a, b) => b.fitness - a.fitness);
    // Get a copy of the best brain *before* disposing the original agents
    brainToPersist = savedagents[0].brain.copy(); 
  }

  agents = []; // Clear current agents

  // Determine how many elites we can actually carry over
  const actualElites = Math.min(ELITISM_COUNT, savedagents.length);

  // Implement elitism: carry over the top 'actualElites' agents
  for (let i = 0; i < actualElites; i++) {
    agents.push(new Particle(savedagents[i].brain));
  }

  // Create the rest of the new generation
  // If savedagents is empty, pickOne will fail, so create new random particles
  if (savedagents.length > 0) {
    for (let i = actualElites; i < TOTAL; i++) {
      agents.push(pickOne());
    }
  } else {
    // If no saved agents (e.g., first generation where all died), create all new random particles
    for (let i = actualElites; i < TOTAL; i++) { // Start from actualElites to fill up to TOTAL
      agents.push(new Particle());
    }
  }

  // Dispose of all saved agents from the previous generation to free memory
  for (let i = 0; i < savedagents.length; i++) {
    savedagents[i].dispose();
  }
  
  savedagents = []; // Clear the savedagents array

  generationCount++; // Increment generation count here

  // Save the state after a new generation is created, passing the cloned brain
  await saveSimulationState(brainToPersist);

  // Dispose of the cloned brain after it has been saved
  if (brainToPersist) {
    brainToPersist.dispose();
  }
}

/**
 * Select one parent and create a mutated offspring
 * Uses roulette wheel selection based on fitness
 * @returns {Particle} A new Particle instance (offspring)
 */
function pickOne() {
  // Roulette wheel selection
  let index = 0;
  let r = random(1);
  while (r > 0) {
    r = r - savedagents[index].fitness;
    index++;
  }
  index--;
  
  // Create offspring with mutation
  let particle = savedagents[index];
  let child = new Particle(particle.brain);
  child.mutate();
  
  return child;
}

/**
 * Calculate and normalize fitness values for all particles
 * Fitness is based on how far the car progressed and how long it survived
 */
function calculateFitness() {
  // Calculate raw fitness for each particle
  for (let particle of savedagents) {
    particle.calculateFitness();
  }
  
  // Sum all fitness values for normalization
  let sum = 0;
  for (let particle of savedagents) {
    sum += particle.fitness;
  }
  
  // Normalize fitness values to sum to 1.0
  for (let particle of savedagents) {
    particle.fitness = particle.fitness / sum;
  }
}