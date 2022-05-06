const { Router } = require('express');
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
    const router = Router();
    app.get('/', (req, res) => {
        res.redirect(301, 'https://' + req.domain  + '/');
    });

    app.get('/public', (req, res) => {
        res.json({ status: 200, message: 'Soon!' });
    })

    return router
};