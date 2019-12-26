const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());


const {getAllAnnonces, postOneAnnonce} = require('./services/annoncesSerivce');
const {signup, login} = require('./services/usersService');

// annonces routes
app.get('/annonces', getAllAnnonces);
app.post('/annonce', FBAuth, postOneAnnonce);

// users routes
app.post('/signup', signup);
app.post('/login', login);


exports.api = functions.region('europe-west1').https.onRequest(app);


