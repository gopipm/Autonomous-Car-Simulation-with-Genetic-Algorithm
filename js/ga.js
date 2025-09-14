/**
 * Calculate the next generation of cars using genetic algorithm
 * This function evolves the population by selecting the fittest individuals
 * and creating offspring through mutation
 */
function nextGeneration() {
  console.log('Generating next generation');
  calculateFitness();
  
  // Create new generation
  for (let i = 0; i < TOTAL; i++) {
    agents[i] = pickOne();
  }
  
  // Dispose of old generation to free memory
  for (let i = 0; i < savedagents.length; i++) {
    savedagents[i].dispose();
  }
  
  savedagents = [];
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