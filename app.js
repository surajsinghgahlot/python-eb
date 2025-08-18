const express = require('express');
const AWS = require('aws-sdk');
const app = express();

// Middleware
app.use(express.json());

// Load environment variables
const SECRET_ARN = process.env.SECRET_ARN;
const REGION_NAME = process.env.AWS_REGION;
const PORT = process.env.PORT || 8081;

// Configure AWS
AWS.config.update({ region: REGION_NAME });
const secretsManager = new AWS.SecretsManager();

async function getSecretValue(secretArn, key) {
  try {
    const response = await secretsManager.getSecretValue({ SecretId: secretArn }).promise();
    let secretDict;
    
    if (response.SecretString) {
      secretDict = JSON.parse(response.SecretString);
    } else {
      secretDict = JSON.parse(response.SecretBinary.toString('utf-8'));
    }
    
    return secretDict[key];
  } catch (error) {
    return { error: error.message };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('healthy wealthy');
});

// Pipeline test endpoint
app.get('/pipeline-test', (req, res) => {
  res.json({
    message: 'CI/CD Pipeline is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    status: 'deployed'
  });
});

// Main endpoint to fetch secrets
app.get('/', async (req, res) => {
  const key = req.query.key;
  
  if (!key) {
    return res.status(400).json({ error: "Missing 'key' query parameter" });
  }

  try {
    const value = await getSecretValue(SECRET_ARN, key);
    if (value) {
      res.json({ [key]: value });
    } else {
      res.status(404).json({ error: `Key '${key}' not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

