/**
 * NeuralNetwork class for the autonomous car simulation
 * Uses TensorFlow.js to create and manage a neural network
 * that controls the car's steering and speed decisions
 */
class NeuralNetwork {
  /**
   * Constructor for the NeuralNetwork class
   * @param {tf.Sequential|number} a - Either a pre-trained model or the number of input nodes
   * @param {number} b - Either the number of hidden nodes or the input_nodes value for a pre-trained model
   * @param {number} c - Either the number of output nodes or the hidden_nodes value for a pre-trained model
   * @param {number} d - The output_nodes value for a pre-trained model (optional)
   */
  constructor(a, b, c, d) {
    if (a instanceof tf.Sequential) {
      // Loading a pre-trained model
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
    } else {
      // Creating a new model
      this.input_nodes = a;
      this.hidden_nodes = b;
      this.output_nodes = c;
      this.model = this.createModel();
    }
  }

  /**
   * Save the neural network model to disk
   * @returns {Promise<void>} A promise that resolves when the model is saved
   */
  async save() {
    await this.model.save('downloads://my-model', { includeOptimizer: false });
    console.log("Model saved successfully");
  }

  /**
   * Create a copy of the neural network
   * @returns {NeuralNetwork} A new NeuralNetwork instance with the same weights
   */
  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
        modelCopy,
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes
      );
    });
  }

  /**
   * Mutate the neural network weights
   * @param {number} rate - The mutation rate (probability of mutation for each weight)
   */
  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (random(1) < rate) {
            let w = values[j];
            values[j] = w + randomGaussian();
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  /**
   * Dispose of the neural network to free memory
   */
  dispose() {
    this.model.dispose();
  }

  /**
   * Make a prediction based on input data
   * @param {number[]} inputs - Array of input values
   * @returns {Float32Array} The prediction outputs
   */
  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      return outputs;
    });
  }

  /**
   * Create the TensorFlow model architecture
   * @returns {tf.Sequential} The created model
   */
  createModel() {
    const model = tf.sequential();
    
    // Hidden layer with sigmoid activation
    const hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: 'sigmoid'
    });
    model.add(hidden);
    
    // Output layer with sigmoid activation
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'sigmoid'
    });
    model.add(output);
    
    return model;
  }
}