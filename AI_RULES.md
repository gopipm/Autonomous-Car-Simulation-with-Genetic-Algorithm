# AI Rules for Autonomous Car Simulation

This document outlines the technical stack and specific library usage rules for developing and modifying the Autonomous Car Simulation application.

## Tech Stack Description

*   **Core Language**: JavaScript is used for all application logic, simulation, and interactions.
*   **Simulation & Graphics**: p5.js is the primary framework for rendering the simulation, drawing all visual elements (cars, track, obstacles, sensors), and managing the canvas.
*   **Machine Learning**: TensorFlow.js is utilized for implementing and managing the neural networks that serve as the "brains" for the autonomous cars.
*   **Genetic Algorithm**: A custom-built genetic algorithm (implemented in `ga.js`) drives the evolutionary training of the car's neural networks.
*   **Collision Detection**: The `p5.collide2d.js` library, an extension for p5.js, handles all 2D collision detection within the simulation.
*   **HTML**: Standard HTML provides the basic structure of the web page and hosts the p5.js canvas, along with simple user interface controls.
*   **File Loading**: Custom JavaScript in `loadbinary.js` extends p5.js to handle loading binary files, specifically for neural network weights.

## Library Usage Rules

*   **Simulation Rendering**: All visual output, including drawing the track, cars, obstacles, and sensor rays, must be performed using p5.js functions within `sketch.js` and related classes.
*   **Car Physics & Behavior**: The `Particle` class in `particle.js` should manage car movement, sensor logic, and interaction with the neural network, leveraging p5.js vector mathematics.
*   **Neural Network Operations**: Use TensorFlow.js exclusively for creating, loading, saving, and making predictions with neural network models (e.g., in `nn.js` and `particle.js`).
*   **Genetic Algorithm Logic**: All functions related to the genetic algorithm, such as fitness calculation, selection, and mutation, must be implemented in `ga.js`.
*   **Collision Detection**: For any collision checks between simulation elements (e.g., car-wall, car-obstacle), utilize the appropriate functions provided by `p5.collide2d.js`.
*   **UI Interactions**: Simple user interface elements (buttons, input fields, sliders) should be implemented using standard HTML and vanilla JavaScript, as seen in `index.html` and `sketch.js`.