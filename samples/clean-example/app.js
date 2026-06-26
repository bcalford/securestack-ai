const express = require('express');
const app = express();
const allowedOrigins = ['https://app.example.com'];
app.get('/health', (_req, res) => res.json({status:'ok'}));
