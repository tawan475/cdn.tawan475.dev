const {
    Router
} = require('express');
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
        res.json({
            status: 200,
            message: 'Soon!'
        });
    });

    app.get('/:uid.?(.:ext)?/?(/:original)?', (req, res, next) => {
        // if (!req.params.original && req.url.endsWith('/')) return res.redirect(req.url.slice(0, -1));
        let uid = req.params.uid;

        let sql = `SELECT * FROM UID WHERE UID = ?`;
        app.db.runQuery(sql, [uid]).then(result => {
            if (result.length === 0) return next(createError(404));
            result = JSON.parse(JSON.stringify(result));
            let instance = JSON.parse(result[0].JSON);

            if (instance.type === 'shorten') return res.redirect(302, instance.originalUrl);
            if (instance.type === 'file') {
                let filePath = path.join(app.dirname, '../upload/', instance.nameDate + instance.ext);

                fs.stat(filePath, async (err, stat) => {
                    if (err) {
                        if (err.code == "ENOENT") {
                            // await app.db.delete("uid", UID);
                            let err = new Error('Entity Deleted/Permanently removed.');
                            err.status = 410;
                            err.message = 'Entity Deleted/Permanently removed.';
                            return next(err);
                        }
                        return next(createError(500));
                    }
                    if (req.url.endsWith('/') || (req.params.original && req.params.original !== instance.name + instance.ext)) return res.redirect(302, 'https://go.tawan475.dev/' + req.params.uid + '/' + instance.name + instance.ext);

                    let showList = ['.png', '.jpg', '.gif', '.txt', '.mp3', '.mp4'];
                    if (!req.params.original && !req.params.ext)
                        return res.redirect('https://go.tawan475.dev/' + req.params.uid + instance.ext);
                    if (showList.includes(instance.ext.toLowerCase())) return res.sendFile(filePath);
                    return res.download(filePath, instance.name + instance.ext);
                });

                return;
            }
        });
    });

    return router
};
