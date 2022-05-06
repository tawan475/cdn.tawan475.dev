const { Router } = require('express');
const Axios = require('axios');
const https = require('https');
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');

const axios = Axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV === "production"
    }),
    headers: {
        'Authorization': process.env.API_TOKEN
    }
});

module.exports = (app) => {
    const router = Router();
    app.get('/', (req, res) => {
        res.redirect(301, 'https://' + req.domain + '/');
    });

    app.get('/public', (req, res) => {
        res.json({ status: 200, message: 'Soon!' });
    });

    app.get('/:id.:ext?(/:original)?', (req, res, next) => {
        if (req.url.endsWith('/')) return res.redirect(req.url.slice(0, -1));
        let id = req.params.id;

        axios.get(`${app.api}/file/${id}`)
            .then(response => {
                // success request!
            })
            .catch(error => {
                next(createError(500));
            });
    });

    return router
};
