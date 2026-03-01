const express = require('express');
const app = express();

// CRITICAL: Bind to port IMMEDIATELY
const PORT = process.env.PORT || 10000;

// Start listening RIGHT AWAY (before any other code)
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Server started on port', PORT);
});

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Server is working! Port: ' + PORT);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// AI endpoint
app.post('/api/generate', async (req, res) => {
    res.json({ 
        success: true, 
        message: 'Test response - AI integration pending',
        received: req.body 
    });
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Fatal error:', err);
});
