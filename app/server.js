const request = require('request');
const path = require('path');
const config = require('../config');
const fs = require('fs');
const express = require('express');
const cheerio = require('cheerio');
const ms = require('ms');
const hbs = require('hbs');
const hbsutils = require('hbs-utils')(hbs);
const app = express();

updateChangelog();

app.use(express.static(__dirname + '/static'));
app.set('view engine', 'hbs');
app.set('views', __dirname);

hbsutils.registerWatchedPartials(__dirname);

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(8080);

function updateChangelog() {
    request.get({
        baseUrl: 'https://api.github.com',
        url: `/repos/${config.orgName}/${config.repoName}/contents/${config.changelogPath}`,
        headers: {
            'User-Agent': config.agentName,
            'Accept': 'application/vnd.github.v3.raw'
        }
    }, (err, resp, body) => {
        if (err) throw err;

        if (body) {
            const $ = cheerio.load(body);
            fs.writeFileSync(path.join(__dirname + '/changelog.html'), $('body').html());
        }
    });

    setTimeout(updateChangelog, ms(config.updateInterval));
}