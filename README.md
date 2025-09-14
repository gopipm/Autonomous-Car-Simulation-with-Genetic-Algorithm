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

## How It Works

1. **Neural Network Control**: Each car has a neural network that takes sensor inputs and outputs steering decisions
2. **Sensor System**: Cars use raycasting to detect distances to walls and obstacles
3. **Genetic Algorithm**: 
   - Cars that survive longer and make progress get higher fitness scores
   - Best performers are selected for breeding the next generation
   - Mutation introduces variation to prevent local optima
4. **Training Process**: Over successive generations, cars become better at navigating the track

## Files Structure

- `index.html` - Main HTML file
- `sketch.js` - Main p5.js sketch with setup and draw functions
- `particle.js` - Car/Agent class with neural network brain
- `nn.js` - Neural network implementation using TensorFlow.js
- `ga.js` - Genetic algorithm functions
- `ray.js` - Raycasting for sensors
- `boundary.js` - Track boundary and obstacle classes
- `ml-data/` - Pre-trained models
- `model.json` - Base model structure

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