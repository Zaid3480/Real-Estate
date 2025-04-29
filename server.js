
    import express from 'express';    
    import connectToDb from './config/db.js';
    import dotenv from 'dotenv';
    import bodyParser from 'body-parser';

    import cors from 'cors';
    import userRoutes from './routes/user.routes.js';
    import propertyRoutes from './routes/userPropertyRequirement.routes.js';
    import subscriptionRoutes from './routes/userSubcription.routes.js'; // Adjust path if needed
    import areaRoutes from './routes/area.routes.js'; // Adjust path if needed
    import property from './routes/property.routes.js'; // Adjust path if needed
    import shareProperty from './routes/shareproperties.routes.js'; // Adjust path if needed
    import ticketsupport from './routes/ticketsupport.routes.js'; // Adjust path if needed
    
    dotenv.config(); // Load environment variables

    const app = express();

    // OR: Explicitly allow all origins with options
    app.use(cors({
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
        allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
    }));

    // Middleware
    app.use(bodyParser.json());

    // Database Connection
    connectToDb();

    // Routes
    app.get('/', (req, res) => {
        res.send('API is running!');
    });
    app.use('/api/users', userRoutes); // or whatever your base path is

    app.use('/api/property', propertyRoutes); // or whatever your base path is

    app.use('/api/subscription',subscriptionRoutes); // or whatever your base path is


    app.use('/api/area', areaRoutes); // or whatever your base path is



    app.use('/api/property', property); // or whatever your base path is

    app.use('/api/shareproperty', shareProperty); // or whatever your base path is

    app.use('/api/ticket', ticketsupport); // or whatever your base path is
    
    //for uploading image
    app.use('/uploads', express.static('uploads')); // Serve static files from the uploads directory

    

    
    
    app.listen(2025,() =>{
        console.log('Server is running on port 2025');
    });
