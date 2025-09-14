# About This Simulation

This project simulates autonomous cars learning to navigate a track using neural networks and a genetic algorithm. The cars evolve to avoid walls and dynamic obstacles through evolutionary training, aiming to complete the track efficiently.

## Simulation Features

### Core Technology
- **Neural Network Brains**: Each car is controlled by a neural network that processes sensor data and makes steering and speed decisions
- **Genetic Algorithm Evolution**: Cars evolve over generations using natural selection, mutation, and crossover
- **Real-time Physics**: Accurate collision detection and physics simulation using p5.js
- **TensorFlow.js Integration**: Modern machine learning capabilities running entirely in the browser

### Track and Environment
- **Procedurally Generated Racetrack**: Unique tracks with inner and outer boundaries created using Perlin noise
- **Dynamic Obstacles**: Moving obstacles that create additional navigation challenges
- **Multiple Track Presets**: Various track configurations with different difficulty levels
- **Checkpoint System**: Progress tracking and lap counting for performance measurement

### Visualization Features
- **Real-time Sensor Visualization**: LiDAR-like rays showing what each car "sees"
- **3D-like Perspective View**: Ray-casting visualization from the best car's point of view
- **Training Analytics Dashboard**: Comprehensive charts and metrics tracking training progress
- **Performance Highlighting**: Best-performing cars are visually distinguished during simulation

## Settings and Controls

### Obstacle Configuration
- **Obstacle Movement Toggle**: Switch between dynamic (moving) and static obstacles
- **Obstacle Count**: Adjust the number of obstacles on the track (configurable via input field)
- **Obstacle Behavior**: Obstacles move along track segments creating realistic navigation challenges

### Simulation Controls
- **Simulation Speed**: Slider control to adjust how fast the simulation runs (1-10x speed)
- **Pause/Resume**: Control simulation flow for detailed observation
- **Real-time Statistics**: Live display of generation, speed, distance, and lap information

### Model Management
- **Save Best Model**: Export the neural network of the best-performing car to your local machine
- **Load Pre-trained Model**: Upload previously saved models (JSON + weights files) to continue training
- **Model Persistence**: Automatic saving of best models to browser storage for session continuity

### Interface Options
- **Training Analytics**: Comprehensive dashboard with fitness evolution, lap completion, survival rates, and speed metrics
- **Theme Toggle**: Switch between light and dark UI themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile viewing
- **Settings Panel**: Organized controls for easy access to all configuration options

## Technical Architecture

### Neural Network Structure
- **Input Layer**: 13 neurons processing sensor ray distances
- **Hidden Layer**: 26 neurons with sigmoid activation for decision processing
- **Output Layer**: 2 neurons controlling steering angle and speed
- **Activation Function**: Sigmoid activation for smooth, bounded outputs

### Genetic Algorithm Parameters
- **Population Size**: 100 cars per generation
- **Mutation Rate**: 20% probability for weight mutations
- **Elitism**: Best performers automatically advance to next generation
- **Selection Method**: Fitness-proportionate selection with tournament selection backup
- **Lifespan**: 30 frames maximum without progress to prevent stagnation

### Sensor System
- **Sensor Count**: 13 rays spread across 130-degree field of view
- **Detection Range**: 80 pixels maximum distance
- **Detection Targets**: Track boundaries and dynamic obstacles
- **Ray Casting**: Efficient collision detection using line-segment intersection

### Performance Optimization
- **Object Pooling**: Efficient memory management for particles and objects
- **Throttled Updates**: Dashboard updates every 30 frames to maintain performance
- **Spatial Optimization**: Efficient collision detection and rendering
- **Memory Management**: Proper disposal of TensorFlow.js tensors and models

## Training Analytics Dashboard

### Real-time Charts
- **Fitness Evolution**: Tracks best and average fitness scores across generations
- **Lap Completion**: Monitors maximum laps completed over time
- **Population Survival**: Shows percentage of cars surviving each generation
- **Speed Performance**: Displays average speed metrics throughout training

### Performance Metrics
- **Current Generation**: Live generation counter
- **Best Fitness**: Highest fitness score achieved in current session
- **Best Laps**: Maximum laps completed by any car
- **Average Survival**: Population survival percentage
- **Training Time**: Total time spent in current training session

### Advanced Analytics
- **Improvement Rate**: Measures fitness improvement over recent generations
- **Convergence Score**: Indicates how close the population is to optimal performance
- **Diversity Index**: Measures genetic diversity within the population
- **Success Rate**: Percentage of cars completing at least one lap

### Data Management
- **Export Functionality**: Download training data as JSON for external analysis
- **Reset Capability**: Clear statistics and start fresh training sessions
- **Historical Tracking**: Maintains last 100 generations of data
- **Session Persistence**: Automatic saving and loading of training progress

## Educational Value

### Machine Learning Concepts
- **Genetic Algorithms**: Observe evolution in action with natural selection principles
- **Neural Networks**: See how artificial brains learn to make decisions
- **Fitness Functions**: Understand how performance metrics drive evolution
- **Population Dynamics**: Watch how diversity and convergence affect learning

### Programming Concepts
- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Real-time Simulation**: Physics simulation and rendering loops
- **Data Visualization**: Chart.js integration for professional analytics
- **Browser APIs**: LocalStorage, IndexedDB, and File API usage

### Research Applications
- **Parameter Tuning**: Experiment with mutation rates, population sizes, and network architectures
- **Performance Analysis**: Export data for statistical analysis and research papers
- **Algorithm Comparison**: Compare different selection methods and fitness functions
- **Benchmark Testing**: Establish performance baselines for autonomous navigation

## Development Roadmap

For detailed development plans, feature requests, and implementation priorities, see [TODO.md](TODO.md).

### Current Focus Areas
- **Performance Optimizations**: Object pooling, algorithm improvements, and memory management
- **Enhanced Track Generation**: More complex and varied track layouts
- **Advanced AI Features**: LSTM networks, reinforcement learning, and multi-agent systems
- **Testing Framework**: Comprehensive unit and integration testing

### Recent Achievements
- ✅ Comprehensive training analytics dashboard
- ✅ Real-time performance visualization
- ✅ Data export and session persistence
- ✅ Responsive UI with theme support
- ✅ Modular ES6 architecture

## Technical Requirements

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript Features**: ES6 modules, async/await, Fetch API
- **Canvas API**: Required for p5.js rendering
- **WebGL**: Optional but recommended for TensorFlow.js acceleration

### Dependencies
- **p5.js 1.9.0**: Creative coding framework for simulation and rendering
- **TensorFlow.js 4.17.0**: Machine learning library for neural networks
- **Chart.js 4.4.0**: Professional chart library for analytics dashboard
- **p5.collide2d**: Collision detection library for physics simulation

### Performance Considerations
- **Memory Usage**: Automatic cleanup of TensorFlow.js tensors
- **Frame Rate**: Optimized to maintain 60fps during simulation
- **Scalability**: Handles populations up to 1000 cars (configurable)
- **Mobile Support**: Responsive design with touch-friendly controls

## Contributing

This project welcomes contributions! See [TODO.md](TODO.md) for priority tasks and implementation guidelines.

### Development Setup
1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process required - uses native ES6 modules
4. All dependencies loaded via CDN

### Code Standards
- ES6+ modules and modern JavaScript features
- Comprehensive JSDoc documentation
- Consistent naming conventions
- Error handling for all user interactions
- Performance considerations for all features

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built with modern web technologies to demonstrate machine learning concepts in an accessible, interactive format. Perfect for education, research, and experimentation with genetic algorithms and neural networks.

---

*For technical documentation and API details, see the inline JSDoc comments in the source code.*