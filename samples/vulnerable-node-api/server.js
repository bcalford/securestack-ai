const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const JWT_SECRET = "supersecret123";
app.use(cors({ origin: "*", credentials: true }));
app.post('/login', (req, res) => { console.log('password', req.body.password); res.json({token: jwt.sign({sub:'1'}, JWT_SECRET)}); });
app.get('/admin/users', (req, res) => db.query("SELECT * FROM users WHERE id = " + req.query.id));
