const {db, firebaseConfig} = require('../configuration/config');


const {
    validateSignupData,
    validateLoginData
} = require('../util/validators');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);


// Sign users up
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const {valid, errors} = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);

    const noImg = 'Agent Carter.jpg';

    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(400).json({handle: 'this handle is already taken'});
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);

            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${
                    firebaseConfig.storageBucket
                    }/o/${noImg}?alt=media`,
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })

        .then(() => {
            return firebase
                .auth().currentUser.sendEmailVerification();
        })

        .then(() => {
            return res.status(201).json({token});
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({email: 'Email is already is use'});
            } else {
                return res
                    .status(500)
                    .json({general: 'Something went wrong, please try again'});
            }
        });
};


// Log user in
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const {valid, errors} = validateLoginData(user);

    if (!valid) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            if (!firebase.auth().currentUser.emailVerified) {
                return res
                    .status(403)
                    .json({general: 'Email is not yet verified'});
            } else {
                return res.json({token});
            }
        })
        .catch((err) => {
            console.error(err);
            // auth/wrong-password
            // auth/user-not-user
            return res
                .status(403)
                .json({general: 'Wrong credentials, please try again'});
        });
};


