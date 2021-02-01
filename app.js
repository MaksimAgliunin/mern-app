const express = require('express');
const config = require('config');
const mongoose = require('mongoose');

const app = express();

app.use(express.json({extended:true}));

app.use('/api/auth', require('./routes/auth.routes')); //specifying routes

const PORT = config.get('port') || 5001; // constant from config/default.json

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
    } catch (e) {
        console.log(`Server error: ${e.message}`)
        process.exit(1);  // exit from server if error appears
    }
}

start();

