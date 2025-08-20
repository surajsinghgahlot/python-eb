// modelLoader.js
async function loadModel(modelPath) {
  try {
    const model = await import(`${modelPath}`);
    return model;
  } catch (error) {
    throw new Error(`Error loading model ${modelPath}: ${error}`);
  }
}

export default loadModel;

