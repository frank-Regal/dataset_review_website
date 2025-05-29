// inject environment variables
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const app = express();
app.use(express.json());


const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    // Heroku mandates SSL connections to pg databases as a security best practice
    ssl: process.env.IN_HEROKU === 'true' ? { rejectUnauthorized: false } : false
};

// NOTE: add any tests tables here
const tableNameMap = {
    "development": "dev_",
    "production": "prod_",
    "test1": "test1_"
}

// get table names depending on the NODE_ENV variable in the .env file
// this will either be "development" or "production"
const getTableNames = () => {
    const env = process.env.NODE_ENV || 'development';
    const prefix = tableNameMap[env];
    return {
        annotations: `${prefix}annotations`,
        subtasks: `${prefix}subtasks`,
        frame_ranges: `${prefix}frame_ranges`
    };
};

const createTables = async (client, tableNames) => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${tableNames.annotations} (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                video_filename VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(255) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS ${tableNames.subtasks} (
                id SERIAL PRIMARY KEY,
                start_step INT NOT NULL,
                end_step INT NOT NULL,
                subtask TEXT NOT NULL,
                time_spent INT NOT NULL,
                annotation_id INT REFERENCES ${tableNames.annotations}(id)
            );
            CREATE TABLE IF NOT EXISTS ${tableNames.frame_ranges} (
                id SERIAL PRIMARY KEY,
                start_frame INT NOT NULL,
                end_frame INT NOT NULL,
                annotation_id INT REFERENCES ${tableNames.annotations}(id)
            );
        `);
        console.log('Tables created successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
};

const dropTables = async (client, tableNames) => {
    try {
        await client.query(`
            DROP TABLE IF EXISTS ${tableNames.frame_ranges};
            DROP TABLE IF EXISTS ${tableNames.subtasks};
            DROP TABLE IF EXISTS ${tableNames.annotations};
        `);
        console.log('Tables dropped successfully');
    } catch (err) {
        console.error('Error dropping tables:', err);
        throw err;
    }
};

const initializeDatabase = async (shouldDropTables) => {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Connected to the database');
        const tableNames = getTableNames();
        if (shouldDropTables) {
            await dropTables(client, tableNames);
        }
        await createTables(client, tableNames);
        return { client, tableNames };
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
};

let cachedVideos = null;

const loadVideos = () => {
    if (cachedVideos) {
        return cachedVideos;
    }

    const videosFile = path.join(__dirname, 'public', 'videos.json');
    if (!fs.existsSync(videosFile)) {
        throw new Error('Videos list not found.');
    }

    const videos = JSON.parse(fs.readFileSync(videosFile, 'utf8')).videos;
    cachedVideos = videos;
    return videos;
};

// Routes
const setupRoutes = (app, client, tableNames) => {
    app.get('/overview', (_, res) => {
        res.sendFile(path.join(__dirname, 'public', 'overview.html'));
    });

    app.get('/annotate.html', (_, res) => {
        res.sendFile(path.join(__dirname, 'public', 'annotate.html'));
    });

    app.get('/videos', (_, res) => {
        try {
            const videos = loadVideos();
            res.json({ videos });
        } catch (err) {
            console.error('Error fetching videos:', err);
            res.status(500).json({ error: 'Server error', details: err.message });
        }
    });

    app.get('/video-status', async (_, res) => {
        try {
            const videos = loadVideos();

            // Query db for annotation counts
            const annotationCountsQuery = `
                SELECT a.video_filename, a.status
                FROM ${tableNames.annotations} a
            `

            const subtaskCounts = await client.query(annotationCountsQuery);

            // Create a map of video filenames to their subtask counts
            const subtaskCountMap = new Map(
                subtaskCounts.rows.map(row => [row.video_filename, row.status])
            );

            const videoProgress = videos.map(video => {
                const video_status = subtaskCountMap.get(video) || 'todo';
                return {
                    video,
                    status: video_status
                };
            });

            res.json(videoProgress);
        } catch (err) {
            console.error('Error fetching video progress:', err);
            res.status(500).json({ error: 'Server error', details: err.message });
        }
    });

    app.get('/video-progress', async (_, res) => {
        try {
            const videos = loadVideos();

            // Query db for annotation counts
            const annotationCountsQuery = `
                SELECT a.video_filename, COUNT(a.id) as count
                FROM ${tableNames.annotations} a
                GROUP BY a.video_filename
            `

            const subtaskCounts = await client.query(annotationCountsQuery);

            // Create a map of video filenames to their subtask counts
            const subtaskCountMap = new Map(
                subtaskCounts.rows.map(row => [row.video_filename, parseInt(row.count)])
            );

            const videoProgress = videos.map(video => {
                const count = subtaskCountMap.get(video) || 0;
                return {
                    video,
                    // only show up to a count of up to 3 annotations
                    annotationCount: Math.min(count, process.env.MAX_ANNOTATIONS_PER_VIDEO),
                    maxAnnotations: process.env.MAX_ANNOTATIONS_PER_VIDEO
                };
            });

            res.json(videoProgress);
        } catch (err) {
            console.error('Error fetching video progress:', err);
            res.status(500).json({ error: 'Server error', details: err.message });
        }
    });

    app.post('/save', async (req, res) => {
        const { username, video, status, frameRanges } = req.body;
        
        // Add validation
        if (!status) {
            console.error('Status is missing or null');
            return res.status(400).json({ error: 'Status is required' });
        }

        try {
            await client.query('BEGIN');

            // First check if entry exists
            const checkQuery = `
                SELECT id FROM ${tableNames.annotations} 
                WHERE video_filename = $1
            `;
            const existingEntry = await client.query(checkQuery, [video]);

            let annotationId;
            if (existingEntry.rows.length > 0) {
                // Update existing entry
                const updateQuery = `
                    UPDATE ${tableNames.annotations} 
                    SET username = $1, status = $2, created_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                    RETURNING id
                `;
                const { rows } = await client.query(updateQuery, [username, status, existingEntry.rows[0].id]);
                annotationId = rows[0].id;

                // Delete existing frame ranges for this annotation
                await client.query(
                    `DELETE FROM ${tableNames.frame_ranges} WHERE annotation_id = $1`,
                    [annotationId]
                );

                console.log('Updated existing entry:', {
                    id: existingEntry.rows[0].id,
                    username: username,
                    video: video,
                    status: status,
                });
            } else {
                // Insert new entry
                const { rows } = await client.query(
                    `INSERT INTO ${tableNames.annotations} (username, video_filename, created_at, status)
                         VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING id`,
                    [username, video, status]
                );
                annotationId = rows[0].id;
                console.log('Created new entry:', {
                    id: annotationId,
                    username: username,
                    video: video,
                    status: status,
                });
            }

            // Insert frame ranges if they exist
            if (frameRanges && frameRanges.length > 0) {
                const frameRangesValues = frameRanges.map(range => 
                    `(${range.start}, ${range.end}, ${annotationId})`
                ).join(',');
                
                await client.query(`
                    INSERT INTO ${tableNames.frame_ranges} (start_frame, end_frame, annotation_id)
                    VALUES ${frameRangesValues}
                `);
                
                console.log('Saved frame ranges:', frameRanges);
            }

            await client.query('COMMIT');
            res.json({ 
                message: existingEntry.rows.length > 0 ? 'Annotation updated successfully!' : 'Annotation saved successfully!',
                annotationId: annotationId
            });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Detailed error saving annotation:', {
                error: err,
                message: err.message,
                stack: err.stack,
                body: req.body
            });
            res.status(500).json({ error: `Database error: ${err.message}` });
        }
    });

    // Add this new endpoint to fetch frame ranges for a specific video
    app.get('/frame-ranges/:video', async (req, res) => {
        try {
            const { video } = req.params;
            
            const query = `
                SELECT fr.start_frame, fr.end_frame
                FROM ${tableNames.frame_ranges} fr
                JOIN ${tableNames.annotations} a ON fr.annotation_id = a.id
                WHERE a.video_filename = $1
                ORDER BY fr.start_frame ASC
            `;
            
            const result = await client.query(query, [video]);
            
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching frame ranges:', err);
            res.status(500).json({ error: 'Server error', details: err.message });
        }
    });
};


const startServer = async () => {
    try {
        const shouldDropTables = process.argv.includes("--drop-tables");
        const { client, tableNames } = await initializeDatabase(shouldDropTables);

        // Serve static files from public directory
        app.use(express.static('public'));
        setupRoutes(app, client, tableNames);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Using tables: ${tableNames.annotations}, ${tableNames.subtasks}, ${tableNames.frame_ranges}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
