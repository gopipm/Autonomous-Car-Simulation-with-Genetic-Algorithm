# Autonomous Car Simulation with Genetic Algorithm

This project simulates autonomous cars learning to navigate a track using neural networks and a genetic algorithm. The cars learn to avoid walls and dynamic obstacles through evolutionary training.

## Overview

The simulation features:
- Cars with neural network "brains" that control their movement
- A procedurally generated racetrack with inner and outer boundaries
- Dynamic obstacles that move along the track
- Genetic algorithm for evolving better-performing cars over generations
- Real-time visualization of car sensors (LiDAR-like rays)
- 3D-like visualization of the car's perspective
- **New:** A dedicated "About" panel providing detailed information about the simulation, its features, and controls.
- **New:** A clear information bar above the simulation canvas displaying real-time generation, speed, and distance from obstacles.
- **New:** Comprehensive training analytics dashboard with real-time charts and performance metrics.

## Files Structure

- `index.html` - Main HTML file
- `js/` - Directory containing all JavaScript files
  - `nn.js` - Neural network implementation using TensorFlow.js
  - `ga.js` - Genetic algorithm functions
  - `particle.js` - Car/Agent class with neural network brain
  - `ray.js` - Raycasting for sensors
  - `boundary.js` - Track boundary and obstacle classes
  - `sketch.js` - Main p5.js sketch with setup and draw functions
  - `loadbinary.js` - Binary file loading utilities
  - `p5.collide2d.js` - Collision detection library
- `css/` - Directory containing stylesheet files
  - `style.css` - Main stylesheet for the application
- `ml-data/` - Pre-trained models
- `model.json` - Base model structure
- `git-commands.sh` - Git helper script

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for loading external libraries)

## Instructions to Run

1. Open `index.html` in a web browser
2. The simulation will start automatically
3. Watch as cars evolve over generations to better navigate the track

### Controls

- **Dynamic/Static Toggle**: Switch obstacle movement on/off
- **Obstacle Count**: Set number of obstacles (enter number and click "Done")
- **Speed Slider**: Control simulation speed
- **Save Best**: Save the best performing car's neural network
- **Load Model**: Load a pre-trained model
- **Settings**: Toggle visibility of the simulation settings panel.
- **About**: Toggle visibility of the about information panel.
- **Analytics**: Open the comprehensive training dashboard with real-time charts and performance metrics.
- **Toggle Theme**: Switch between light and dark UI themes.

## Version Control

This project uses Git for version control. To set up version control (already done):
```bash
git init
git add .
git commit -m "Initial commit: Autonomous car simulation with genetic algorithm and neural networks"
```

For future development:
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# View commit history
git log
```

### Git Helper Script

A helper script `git-commands.sh` is included to make common Git operations easier:
- Run `./git-commands.sh` and follow the prompts
- Options include checking status, committing changes, viewing logs, and switching branches

### Branching Strategy

- `main` branch: Stable, working versions of the code
- `development` branch: Active development branch for new features

When working on new features:
1. Switch to the development branch: `git checkout development`
2. Make your changes
3. Commit your changes
4. When ready to release, merge to main: `git checkout main && git merge development`

## Technical Details

### Neural Network Architecture
- Input layer: 13 neurons (sensor readings)
- Hidden layer: 26 neurons with sigmoid activation
- Output layer: 2 neurons with sigmoid activation (steering angle and speed)

### Genetic Algorithm Parameters
- Population size: 100 cars
- Mutation rate: 20%
- Lifespan: 30 frames
- Sensor range: 80 pixels

### Sensors
Cars have 13 sensors (rays) spread across a 130-degree field of view to detect:
- Distance to track boundaries
- Distance to dynamic obstacles

## Code Improvements

The code has been refactored to improve:
- **Modularity**: Each functionality is separated into its own class or function
- **Readability**: Added comprehensive comments and consistent formatting
- **Documentation**: Detailed JSDoc comments for all functions and classes
- **Maintainability**: Improved code organization and structure

## Training Analytics Dashboard

The simulation now includes a comprehensive analytics dashboard that provides:

### Real-time Charts
- **Fitness Evolution**: Tracks best and average fitness scores across generations
- **Lap Completion**: Monitors progress in track completion over time
- **Population Survival**: Shows percentage of agents surviving each generation
- **Speed Performance**: Displays average speed metrics throughout training

### Performance Metrics
- **Current Generation**: Live generation counter
- **Best Fitness**: Highest fitness score achieved
- **Best Laps**: Maximum laps completed by any agent
- **Average Survival**: Population survival percentage
- **Training Time**: Total time spent in training

### Advanced Analytics
- **Improvement Rate**: Measures fitness improvement over recent generations
- **Convergence Score**: Indicates how close the population is to optimal performance
- **Diversity Index**: Measures genetic diversity within the population
- **Success Rate**: Percentage of agents completing at least one lap

### Data Export
- Export training data as JSON for analysis
- Reset statistics and start fresh training sessions
- Historical data tracking with configurable retention

### Refactored Files

1. **nn.js**: Neural network implementation with detailed documentation
2. **ga.js**: Genetic algorithm functions with clear explanations
3. **particle.js**: Particle (car) class with comprehensive sensor and control logic
4. **ray.js**: Ray casting for obstacle detection with improved comments
5. **boundary.js**: Track boundary and obstacle classes with better structure
6. **sketch.js**: Main simulation logic with organized setup and draw functions

7. **dashboard.js**: New comprehensive training analytics system with Chart.js integration

## Development Roadmap

For detailed development tasks, feature requests, and implementation priorities, see [TODO.md](TODO.md).

The roadmap includes:
- Performance optimizations and memory management
- Enhanced track generation and curriculum learning
- Advanced neural network features and training methods
- Comprehensive testing and validation framework
- UI/UX improvements and accessibility features

## Libraries Used

- [p5.js](https://p5js.org/) - Creative coding framework
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning library
- [p5.collide2d](https://github.com/bmoren/p5.collide2D) - Collision detection library

## License

This project is open source and available under the MIT License.