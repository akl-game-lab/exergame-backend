var express = require('express');
var router = express.Router();
var Workout = require('../models/workout');
var ExerciseDotCom = require('../models/sources/exercise-dot-com');
var User = require('../models/user');
var getByEmail = require('../misc/tasks');
var builder = require('xmlbuilder');
var ObjectId = require('mongoose').Types.ObjectId;

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.post('/register', function (req, res, next) {
//
// });

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/:id/forceUpdate', function (req, res, next) {
  var userId = decodeURIComponent(req.params.id);

  getByEmail(userId);
  res.send(builder.create('data').ele({started: true}).end({pretty: true}));
})

router.get('/:id/workouts/:from/:to', function (req, res, next) {
  var userId = decodeURIComponent(req.params.id);
  var from = req.params.from; // In seconds for Skyrim
  var to = req.params.to; // In seconds for Skyrim
  var sendData = builder.create('data');

  User.find({
    email: userId
  }, function (err, users) {
    if(users.length === 0){
      sendData.ele({
          errorCode: "404",
          errorMessage: "User not found"
      });
      res.status(404).send(sendData.end({ pretty: true}));
    } else {
      ExerciseDotCom.find({
        userEmail: userId,
        dateRetrieved: {
          $gt: new Date(parseInt(from) * 1000),
          $lt: new Date(parseInt(to) * 1000)
        }
      },
      function (err, workouts) {
        if (err) {
          res.send(err);
          return;
        }

        sendData.ele('workouts');

        for(var i in workouts) {
          // Skyrim attributes, this will be generalised in the future so it can apply to more than one game.
          var health = 0;
          var stamina = 0;
          var magicka = 0;

          for (var j in workouts[i].data.workout_exercises) {
            if (workouts[i].data.workout_exercises.hasOwnProperty(j)) {
              var exerciseData = workouts[i].data.workout_exercises[j];
              if (exerciseData.hasOwnProperty('total_reps') && exerciseData.total_reps > 0) {
                // Exercise has reps, add points to health.
                health += exerciseData.total_points;
              }
              else if (exerciseData.hasOwnProperty('distance') && typeof parseFloat(exerciseData['distance']) === 'number' && parseFloat(exerciseData.distance) > 0) {
                // Exercise has distance, add points to stamina
                stamina += exerciseData.total_points;
              } else {
                // Otherwise, add points to magicka
                magicka += exerciseData.total_points;
              }
            }
          }

          // Build XML document.
          sendData.ele('workout').ele({
            syncDate: Math.floor((new Date(Date.now())).valueOf() / 1000), // seconds
            workoutDate: workouts[i].data.workout_date, //seconds
            health: health,
            stamina: stamina,
            magicka: magicka
          }).up();
          workouts[i].used = true;
          workouts[i].save();
        }
        // Return XML.
        res.send(sendData.end({pretty: true}));
      });
    }
  });
});

module.exports = router;
