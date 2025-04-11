import AWS from 'aws-sdk';
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { stringify } from 'csv-stringify/sync';
import { parse as csvParse } from 'csv-parse/sync';
import { Buffer } from 'buffer';

const s3 = new S3Client();
const bucketName = process.env.BUCKET_NAME;
const jsonFileName = process.env.JSON_FILE_NAME;
const csvFileName = process.env.CSV_FILE_NAME;

// Prepend folder path to JSON file name
const jsonFilePath = `iot-data/json/${jsonFileName}`;
const csvFilePath = `iot-data/csv/${csvFileName}`;

export const handler = async (event) => {
    let existingJsonData = [];
    let existingCsvData = [];

    // Read existing JSON data from S3
    try {
        const jsonFile = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: jsonFilePath }));
        const jsonFileData = await streamToString(jsonFile.Body);
        existingJsonData = JSON.parse(jsonFileData);
    } catch (error) {
        if (error.name !== 'NoSuchKey') {
            throw error;
        }
    }

    // Read existing CSV data from S3
    try {
        const csvFile = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: csvFilePath }));
        const csvFileData = await streamToString(csvFile.Body);
        existingCsvData = csvParse(csvFileData, { columns: true });
    } catch (error) {
        if (error.name !== 'NoSuchKey') {
            throw error;
        }
    }

    const csvHeader = ['field1', 'field2', 'field3'];

    for (const record of event.records) {
        const payload = Buffer.from(record.data, 'base64').toString('utf-8').trim();

        // Log the payload
        console.log('Payload:', payload);

        try {
            // Clean up the payload
            const cleanedPayload = payload.replace(/,\s*$/, '');

            const data = JSON.parse(cleanedPayload);

            // Add to JSON records list
            existingJsonData.push(data);

            // Create CSV record
            const csvRecord = {
                field1: data.field1 || '',
                field2: data.field2 || '',
                field3: data.field3 || ''
            };
            existingCsvData.push(csvRecord);
        } catch (error) {
            console.error('Error parsing JSON payload at position:', error.message, '\nPayload:', payload);
            throw error;
        }
    }

    // Save JSON file to S3
    const jsonData = JSON.stringify(existingJsonData, null, 4);
    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: jsonFilePath,
        Body: jsonData,
        ContentType: 'application/json'
    }));

    // Save CSV file to S3
    const csvData = stringify(existingCsvData, { header: true, columns: csvHeader });
    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: csvFilePath,
        Body: csvData,
        ContentType: 'text/csv'
    }));

    return {
        records: event.records.map(record => ({
            recordId: record.recordId,
            result: 'Ok'
        }))
    };
};

// Helper function to convert stream to string
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', reject);
    });
};
