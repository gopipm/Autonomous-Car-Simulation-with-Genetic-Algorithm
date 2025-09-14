/**
 * NeuralNetwork class for the autonomous car simulation
 * Uses TensorFlow.js to create and manage a neural network
 * that controls the car's steering and speed decisions
 */
export class NeuralNetwork {
  /**
   * Constructor for the NeuralNetwork class
   * @param {tf.Sequential|number} input_nodes_or_model - Either a pre-trained tf.Sequential model or the number of input nodes
   * @param {number} hidden_nodes - If input_nodes_or_model is a model, this is the input_nodes count. Otherwise, it's the hidden_nodes count.
   * @param {number} output_nodes - If input_nodes_or_model is a model, this is the hidden_nodes count. Otherwise, it's the output_nodes count.
   * @param {number} [actual_output_nodes] - If input_nodes_or_model is a model, this is the actual output_nodes count.
   */
  constructor(
    input_nodes_or_model,
    hidden_nodes,
    output_nodes,
    actual_output_nodes,
  ) {
    // Determine network dimensions
    if (input_nodes_or_model instanceof tf.Sequential) {
      this.input_nodes = hidden_nodes;
      this.hidden_nodes = output_nodes;
      this.output_nodes = actual_output_nodes;
    } else {
      this.input_nodes = input_nodes_or_model;
      this.hidden_nodes = hidden_nodes;
      this.output_nodes = output_nodes;
    }

    // Always create a new model for this instance
    this.model = this.createModel();

    // If a tf.Sequential model was provided, copy its weights
    if (input_nodes_or_model instanceof tf.Sequential) {
      tf.tidy(() => {
        const sourceModel = input_nodes_or_model;
        const sourceWeights = sourceModel.getWeights();
        const newWeights = sourceWeights.map((w) => w.clone()); // Clone each weight tensor
        this.model.setWeights(newWeights);
        newWeights.forEach((w) => w.dispose()); // Explicitly dispose cloned weights after setting
      });
    }
  }

  /**
   * Save the neural network model to disk
   * @returns {Promise<void>} A promise that resolves when the model is saved
   */
  async save() {
    await this.model.save("downloads://my-model", { includeOptimizer: false });
    console.log("Model saved successfully");
  }

  /**
   * Create a copy of the neural network
   * @returns {NeuralNetwork} A new NeuralNetwork instance with the same weights
   */
  copy() {
    // Check if the model is disposed before attempting to copy
    if (this.model.isDisposedInternal) {
      console.error("Cannot copy neural network: model is already disposed");
      // Return a new random neural network as fallback
      return new NeuralNetwork(
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes,
      );
    }

    return tf.tidy(() => {
      try {
        // Create a new NeuralNetwork instance. Its constructor will create its own empty model.
        const newNN = new NeuralNetwork(
          this.input_nodes,
          this.hidden_nodes,
          this.output_nodes,
        );

        // Get weights from *this* NeuralNetwork's model.
        const weights = this.model.getWeights();

        // Check if weights are valid
        if (!weights || weights.length === 0) {
          console.warn(
            "No weights found in source model, returning new random network",
          );
          return newNN;
        }

        // Clone the weights. These are new tensors.
        const weightCopies = weights.map((w) => {
          if (w.isDisposedInternal) {
            throw new Error("Source weight tensor is disposed");
          }
          return w.clone();
        });

        // Set the cloned weights to the *new* NeuralNetwork's internal model.
        // newNN.model now takes ownership of these weightCopies.
        newNN.model.setWeights(weightCopies);

        // The original 'weights' (references) and the 'weightCopies' (cloned tensors)
        // are now either owned by newNN.model or are temporary and will be disposed by tf.tidy.
        // No explicit dispose of weightCopies here, as newNN.model owns them.

        return newNN;
      } catch (error) {
        console.error("Error copying neural network:", error);
        // Return a new random neural network as fallback
        return new NeuralNetwork(
          this.input_nodes,
          this.hidden_nodes,
          this.output_nodes,
        );
      }
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
      activation: "sigmoid",
    });
    model.add(hidden);

    // Output layer with sigmoid activation
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: "sigmoid",
    });
    model.add(output);

    return model;
  }
}
