// set-env.js
const fs = require('fs');
const path = require('path');

// Define the path to your production environment file
const targetPath = path.resolve(__dirname, 'src/environments/environment.prod.ts');

// Get the base API URL from the process environment variables.
// If not found (e.g., during local testing without setting it),
// use a default value for local development.
// !!! IMPORTANT: Adjust this 'http://localhost:8080' to your local backend base URL !!!
const appApiBaseUrl = process.env.APP_API_BASE_URL || 'http://localhost:8080';
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
const googleMapsMapId = process.env.GOOGLE_MAPS_MAP_ID || '';

console.log(
  `Generating environment.prod.ts with APP_API_BASE_URL: ${appApiBaseUrl} and GOOGLE_MAPS_API_KEY: ${
    googleMapsApiKey ? '[set]' : '[not set]'
  } and GOOGLE_MAPS_MAP_ID: ${googleMapsMapId ? '[set]' : '[not set]'}`
);

// Construct the content for the environment.prod.ts file
// We embed the value directly into the template string
const environmentConfig = {
  production: true,
  baseApiUrl: appApiBaseUrl,
  version: '1.1.0',
  googleMapsApiKey,
  googleMapsMapId
};

const envConfigFile = `export const environment = ${JSON.stringify(environmentConfig, null, 2)};\n`;

// Write the content to the file
fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.error('Error writing environment file:', err);
    process.exit(1); // Exit with an error code if something goes wrong
  }
  console.log(`Successfully updated ${targetPath}`);
});
