const router = require('express').Router();

const { google } = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const oAuth2Client = new google.auth.OAuth2(
    '92099928427-9ba3q5ascsg3m7460cjtm3c6921dtl3i.apps.googleusercontent.com',
    '_pvUV23UT4D9Y4cOmbn5a_VK',
    "http://localhost:9000/calendar/"
);


function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    return authUrl
}


function listEvents(auth, callback) {
    const calendar = google.calendar({ version: 'v3', auth });

    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, async (err, res) => {
        if (err)
            return console.log('The API returned an error: ' + err);
        const events = await res.data.items;


        callback(events)

    });

}


router.get('/', (req, res, next) => {
    url = getAccessToken(oAuth2Client, listEvents)
    res.render('index', { url: url });

});


router.get('/calendar/', async (req, res, next) => {

    try {
        var code = req.query.code + '&scope=' + req.query.scope

        oAuth2Client.getToken(code, async (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            listEvents(oAuth2Client, function (events) {
                var allenv = []
                if (events.length) {
                    console.log('Upcoming 10 events:');

                    for (var i of events) {

                        start1 = i.start.dateTime.split("T")[0] + ' at ' + i.start.dateTime.split("T")[1].substring(0, 5)
                        end1 = i.end.dateTime.split("T")[0] + ' at ' + i.end.dateTime.split("T")[1].substring(0, 5)
                        x = {
                            summary: i.summary,
                            description: i.description,
                            organiser: i.organizer,
                            attendees: i.attendees[0].email,
                            start: start1,
                            end: end1
                        }
                        allenv.push(x)
                    }
                    console.log(allenv)

                }
                res.render('result', { allenv: allenv })
            })


        });

    } catch (error) {
        next(error);
    }

});

router.get('/add', (req, res, next) => {
    // console.log(req.query);
    res.render('addevent');
});

router.post('/addnew', (req, res, next) => {

    var event = {
        'summary': req.body.summary,
        'location': req.body.location,
        'description': req.body.description,
        'start': {
            'dateTime': new Date(req.body.startdate + ' ' + req.body.starttime).toISOString(),
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'dateTime': new Date(req.body.enddate + ' ' + req.body.endtime).toISOString(),
            'timeZone': 'Asia/Kolkata',
        },

        'attendees': [
            { 'email': req.body.email },
        ],
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
    };
    const calendar = google.calendar({ version: 'v3', oAuth2Client });


    calendar.events.insert({
        auth: oAuth2Client,
        calendarId: 'primary',
        resource: event,
    }, function (err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log('Event created:');
    });
    res.render('final')
});





module.exports = router;