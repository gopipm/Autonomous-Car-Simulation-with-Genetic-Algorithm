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

## Library Versions

The project uses the following external libraries:

### p5.js
- **Version**: 2.0.5 (September 2025)
- **Purpose**: Creative coding framework for graphics and interaction
- **CDN**: https://cdn.jsdelivr.net/npm/p5@2.0.5/lib/p5.min.js

### TensorFlow.js
- **Version**: 4.22.0 (October 2025)
- **Purpose**: Machine learning library for neural network implementation
- **CDN**: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js

### p5.collide2d
- **Version**: 0.7.3 (Latest)
- **Purpose**: Collision detection for obstacles and track boundaries
- **CDN**: https://cdn.jsdelivr.net/npm/p5.collide2d

## Recent Fixes

### p5.js v2.0.5 Compatibility
- Fixed compatibility issue with `p5.prototype.registerPreloadMethod` which was removed in p5.js v2.0.5
- Updated `loadbinary.js` to work with the new p5.js version
- Maintained all existing functionality while ensuring compatibility with updated libraries

## Code Improvements

The code has been refactored to improve:
- **Modularity**: Each functionality is separated into its own class or function
- **Readability**: Added comprehensive comments and consistent formatting
- **Documentation**: Detailed JSDoc comments for all functions and classes
- **Maintainability**: Improved code organization and structure

### Refactored Files

1. **nn.js**: Neural network implementation with detailed documentation
2. **ga.js**: Genetic algorithm functions with clear explanations
3. **particle.js**: Particle (car) class with comprehensive sensor and control logic
4. **ray.js**: Ray casting for obstacle detection with improved comments
5. **boundary.js**: Track boundary and obstacle classes with better structure
6. **sketch.js**: Main simulation logic with organized setup and draw functions

## TODO / Improvements

### Performance & Training
- [ ] Implement elitism to preserve top performers across generations
- [ ] Add different track layouts for more robust training
- [ ] Implement curriculum learning with increasing difficulty
- [ ] Add checkpoint system to resume training from specific generations
- [ ] Optimize neural network architecture for faster computation

### Features & Functionality
- [ ] Add multiple car types with different capabilities
- [ ] Implement weather conditions (rain, fog) affecting sensors
- [ ] Add different obstacle behaviors (moving in patterns, varying speeds)
- [ ] Create a dashboard to visualize training statistics
- [ ] Add manual driving mode for collecting training data

### UI/UX Improvements
- [ ] Improve visualization of car sensors and decision-making process
- [ ] Add replay functionality for best performing cars
- [ ] Implement a proper settings panel instead of scattered controls
- [ ] Add graph visualization of fitness improvement over generations
- [ ] Create a start screen with instructions and options

### Code Quality
- [ ] Refactor code into ES6 modules for better organization
- [ ] Add comprehensive comments and documentation
- [ ] Implement unit tests for core functions
- [ ] Optimize raycasting algorithm for better performance
- [ ] Add error handling and validation for user inputs

### Advanced Features
- [ ] Implement reinforcement learning with reward shaping
- [ ] Add convolutional neural network for visual input processing
- [ ] Create a multi-agent environment with competitive cars
- [ ] Add transfer learning capabilities between different tracks
- [ ] Implement online learning where cars continue to learn during simulation

## Libraries Used

- [p5.js](https://p5js.org/) - Creative coding framework
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning library
- [p5.collide2d](https://github.com/bmoren/p5.collide2D) - Collision detection library

## License

This project is open source and available under the MIT License.