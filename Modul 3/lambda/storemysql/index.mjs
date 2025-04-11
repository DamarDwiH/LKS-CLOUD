import mysql from 'mysql2/promise';
import { Buffer } from 'buffer';

// Get variable connection from environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_TABLE_NAME } = process.env;

export const handler = async (event) => {
    let connection;
    try {
        //create connection to MariaDB   
        connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });

        //create table if it doesn't already exist        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${DB_TABLE_NAME} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                timestamp VARCHAR(255) NOT NULL,
                temperature FLOAT NOT NULL,
                humidity FLOAT NOT NULL,
                fire_intensity FLOAT NOT NULL,
                gas_concentration FLOAT NOT NULL,
                wind_speed FLOAT NOT NULL,
                distance FLOAT NOT NULL
            )
        `;
        await connection.execute(createTableQuery);

        // Iterate through each record in the Kinesis Data Stream
        for (const record of event.Records) {
            // Decode data from base64
            const payload = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
            // Convert payload into JSON format
            const data = JSON.parse(payload);

            // Prepare a query to save the data to MariaDB
            const insertQuery = `
                INSERT INTO ${DB_TABLE_NAME} (timestamp, temperature, humidity, fire_intensity, gas_concentration, wind_speed, distance)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                data.timestamp,
                data.temperature,
                data.humidity,
                data.fire_intensity,
                data.gas_concentration,
                data.wind_speed,
                data.distance
            ];

            // Store data to MariaDB
            await connection.execute(insertQuery, values);
            console.log(`Successfully inserted data: ${data.timestamp}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify('Data successfully processed and stored in MariaDB')
        };
    } catch (error) {
        console.error(`Error inserting data: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify(`Error processing data: ${error.message}`)
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
