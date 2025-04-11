import mysql from 'mysql2/promise';

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

        //prepare query for read data from MariaDB        
        const selectQuery = `SELECT * FROM ${DB_TABLE_NAME}`;
        const [rows] = await connection.execute(selectQuery);

        //return query result as JSON respons        
        return {
            statusCode: 200,
            body: JSON.stringify(rows)
        };
    } catch (error) {
        console.error(`Error reading data: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify(`Error reading data: ${error.message}`)
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
