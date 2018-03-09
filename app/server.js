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

app.listen(config.port);

function updateChangelog() {
    const CHANGELOG_PATH = path.join(__dirname + '/changelog.html');

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
            if (fs.existsSync(CHANGELOG_PATH)) {
                fs.unlinkSync(CHANGELOG_PATH);
            }

            let $ = cheerio.load(body);

            fs.writeFile(CHANGELOG_PATH, $('body').contents(), (error) => {
                if (error) throw error;
            });
        }
    });

    setTimeout(updateChangelog, ms(config.updateInterval));
}