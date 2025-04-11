// Import required modules
const awsIot = require('aws-iot-device-sdk-v2');
const { TextDecoder, TextEncoder } = require('util');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure logging
const logger = require('winston');
logger.add(new logger.transports.Console({
    format: logger.format.simple(),
    level: 'info',
}));

// Load environment variables
const endpoint = process.env.ENDPOINT;
const clientId = process.env.CLIENT_ID;
const topic = process.env.TOPIC;
const certPath = path.join(__dirname, process.env.CERT_PATH);
const keyPath = path.join(__dirname, process.env.KEY_PATH);
const rootCaPath = path.join(__dirname, process.env.ROOT_CA_PATH);

// Function to generate random sensor data
function generateSensorData() {
    const timestamp = new Date().toISOString();
    const temperature = (Math.random() * (50.0 - 10.0) + 10.0).toFixed(2);
    const humidity = (Math.random() * (100.0 - 10.0) + 10.0).toFixed(2);
    const fireIntensity = (Math.random() * 100).toFixed(2);
    const gasConcentration = (Math.random() * 500).toFixed(2);
    const windSpeed = (Math.random() * (50.0 - 0.0) + 0.0).toFixed(2);
    const distance = (Math.random() * (400.0 - 0.0) + 0.0).toFixed(2);
    return {
        timestamp,
        temperature,
        humidity,
        fire_intensity: fireIntensity,
        gas_concentration: gasConcentration,
        wind_speed: windSpeed,
        distance
    };
}

// Callback when a message is received
function onMessage(topic, payload) {
    const message = new TextDecoder('utf8').decode(payload);
    console.log(`Received message on topic '${topic}': ${message}`);
}

// Main function to set up MQTT connection and publish data
async function main() {
    const clientBootstrap = new awsIot.io.ClientBootstrap();
    const configBuilder = awsIot.iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(certPath, keyPath);
    configBuilder.with_certificate_authority_from_path(undefined, rootCaPath);
    configBuilder.with_clean_session(false);
    configBuilder.with_client_id(clientId);
    configBuilder.with_endpoint(endpoint);

    const config = configBuilder.build();
    const client = new awsIot.mqtt.MqttClient(clientBootstrap);
    const connection = client.new_connection(config);

    await connection.connect();

    await connection.subscribe(topic, awsIot.mqtt.QoS.AtLeastOnce, onMessage);

    try {
        while (true) {
            const sensorData = generateSensorData();
            const message = JSON.stringify(sensorData);
            await connection.publish(topic, message, awsIot.mqtt.QoS.AtLeastOnce);
            console.log(`Published message: ${message}`);
            await new Promise(resolve => setTimeout(resolve, 100000));  // Publish sensor data every 5 seconds
        }
    } catch (error) {
        console.error('Error publishing message:', error);
    }

    await connection.disconnect();
}

// Run the main function
main().catch(error => {
    console.error('Error in main function:', error);
});
