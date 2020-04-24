
const router = require('express').Router();
const fs = require('fs');
const readline = require('readline');

const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
// const oAuth2Client = new google.auth.OAuth2(
//     '688792911424-mh6qb8b8271s4qn3etc0jrhg513vok0q.apps.googleusercontent.com',
//     'PXtGm6pJsKsTaiAheWBZQFI6',
//     "http://localhost:9000/calendar/"
// );
//iits
const oAuth2Client = new google.auth.OAuth2(
    '92099928427-9ba3q5ascsg3m7460cjtm3c6921dtl3i.apps.googleusercontent.com',
    '_pvUV23UT4D9Y4cOmbn5a_VK',
    "http://localhost:9000/calendar/"
);


// function authorize(credentials, callback) {
//     const { client_secret, client_id, redirect_uris } = credentials.web;
//     const oAuth2Client = new google.auth.OAuth2(
//         client_id, client_secret, redirect_uris[0]);
//     return getAccessToken(oAuth2Client, callback);


// }

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    return authUrl


}


/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */


function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });

    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        console.log(events)
        return events;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
            console.log('No upcoming events found.');
        }
    });

}


router.get('/', (req, res, next) => {
    // console.log(req.query);
    url = getAccessToken(oAuth2Client);
    res.render('index', { url: url });

});


router.get('/calendar/', async (req, res, next) => {
    // console.log(req.query);
    try {


        var code = req.query.code + '&scope=' + req.query.scope
        oAuth2Client.getToken(code, async (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // callback(oAuth2Client);
            // events = listEvents(oAuth2Client)
            // console.log(events)
            console.log(oAuth2Client)
            const calendar = google.calendar({ version: 'v3', oAuth2Client });
            calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                console.log(events)
                if (events.length) {
                    console.log('Upcoming 10 events:');
                    events.map((event, i) => {
                        const start = event.start.dateTime || event.start.date;
                        console.log(`${start} - ${event.summary}`);
                    });
                } else {
                    console.log('No upcoming events found.');
                }
            });

        });

        res.render('result')
    } catch (error) {
        next(error);
    }

});




module.exports = router;