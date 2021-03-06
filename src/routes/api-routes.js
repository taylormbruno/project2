
const passport = require('../config/passport.js');
const db = require('../models');

let userID = 1;

module.exports = function(app) {
    // runs but never ends.
    // eslint-disable-next-line no-undef
    app.post('/api/login', passport.authenticate('local'), function(req, res) {
        // sets users ID to above variable to be used during session
        let user = req.user;
        userID = user.dataValues.id;
        console.log(userID);
        res.send({
            retStatus: 'Success',
            redirectTo: '/home/'+ userID,
            msg: 'Directing to users home page.'
        });
        return userID;
        // res.redirect('/home/' + userID);
    });

    // adds new user successfully
    app.post('/api/signup', function(req, res) {
        db.User.create({
            username: req.body.username,
            password: req.body.password
        });
        // res.redirect('/');
        res.send({
            retStatus: 'Success',
            redirectTo: '/',
            msg: 'Directing to login page.'
        });
    });

    app.get('/logout', function(req, res) {
        // resets userID to 1 when logging out
        console.log(res);
        console.log('-----------');
        console.log(req);
        userID = 1;
        req.logout();
        res.redirect('/');
    });

    // used to test if user is logged in or not
    function isAuthenticated(req,res,next){
        if(req.user)
            return next();
        else
            return res.status(401).json({
                error: 'User not authenticated'
            });
    }
    app.get('/checkauth', isAuthenticated, function(req, res){
        res.status(200).json({
            status: 'Login successful!'
        });
    });

    app.post('/api/addNewBook', function(req, res) {
        console.log('------------------------');
        console.log('~*~*~*~*~*~*~*~*~*~* ' + userID);
        console.log('------------------------');
        userID = JSON.parse(req.body.usID);
        db.Books.create({
            book_title: req.body.title,
            book_id: req.body.isbn,
            book_shelf: req.body.shelf,
            UserId: userID
        });
        res.redirect('/home/' + userID);
    });

    app.get('/api/unread', function(req, res) {
        db.Books.findAll({
            subQuery: false,
            attributes: ['id', 'book_title', 'book_id', 'book_shelf'],
            where: {
                book_shelf: 'Unread',
                UserId: userID
            }
        }).then(function(dbBooks) {
            res.json(dbBooks);
        });
    });

    app.get('/api/current', function(req, res) {
        db.Books.findAll({
            subQuery: false,
            attributes: ['id', 'book_title', 'book_id', 'book_shelf'],
            where: {
                book_shelf: 'Current',
                UserId: userID
            }
        }).then(function(dbBooks) {
            res.json(dbBooks);
        });
    });

    app.get('/api/read', function(req, res) {
        db.Books.findAll({
            subQuery: false,
            attributes: ['id', 'book_title', 'book_id', 'book_shelf'],
            where: {
                book_shelf: 'Read',
                UserId: userID
            }
        }).then(function(dbBooks) {
            res.json(dbBooks);
        });
    });

    // works as expected
    app.put('/api/updateShelf', function(req, res) {
    // shelf type will be retrieved through req.body
        db.Books.update(
            req.body, {
                where: {
                    id: req.body.id
                }
            }
        ).then(function(dbShelf) {
            res.json(dbShelf);
        });
    });

    // works as expected
    app.delete('/api/remove/:id', function(req, res) {
        db.Books.destroy({
            where: {
                id: parseInt(req.params.id)
            }
        }).then(function(dbDelete){
            res.json(dbDelete);
        });
    });  
};