const {db} = require('../configuration/config');


const mapping = (doc) => {
    return {
        annonceId: doc.id,
        description: doc.data().description,
        user: doc.data().user,
        categorie: doc.data().categorie,
        prix: doc.data().prix,
        titre: doc.data().titre,
        createdAt: doc.data().createdAt
    }
};

exports.getAllAnnonces = (req, res) => {
    db.collection('annonces')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let annonces = [];
            data.forEach((doc) => {
                annonces.push(mapping(doc));
            });
            return res.json(annonces);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({error: err.code});
        });
};


exports.postOneAnnonce = (req, res) => {
    if (req.body.description.trim() === '') {
        return res.status(400).json({body: 'Description must not be empty'});
    }

    const newAnnonce = {
        titre: req.body.titre,
        prix: req.body.prix,
        categorie: req.body.categorie,
        description: req.body.description,
        user: req.user.handle,
        createdAt: new Date().toISOString(),
    };

    db.collection('annonces')
        .add(newAnnonce)
        .then((doc) => {
            const resAnnonce = newAnnonce;
            resAnnonce.screamId = doc.id;
            res.json(resAnnonce);
        })
        .catch((err) => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });
};
