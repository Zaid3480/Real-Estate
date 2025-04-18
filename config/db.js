// const mongoose = require('mongoose');
import mongoose from 'mongoose';

function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT, {
     // To handle the new MongoDB driver connection management
    })
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(err => {
        console.error('Error connecting to DB:', err);
    });

    // Optional: Additional handling to check if the connection is successful
    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection is open');
    });

    mongoose.connection.on('error', (err) => {
        console.log('Mongoose default connection has occurred ' + err + ' error');
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose default connection is disconnected');
    });
}

export default connectToDb;
