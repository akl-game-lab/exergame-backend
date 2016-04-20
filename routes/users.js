var express = require('express');
var router = express.Router();
var Workout = require('../models/workout');
var ExerciseDotCom = require('../models/sources/exercise-dot-com');
var User = require('../models/user')
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

router.get('/:id/workouts', function (req, res, next) {
  var userId = req.params.id;
  var from = req.query.from;
  var to = req.query.to;
  var sendData = builder.create('data')
    .ele('workouts');
  ExerciseDotCom.find({
    //'id': new ObjectId(userId),
    // 'used': {
    //   $ne: true
    // }
  }, function (err, workouts) {
    if (err) {
      res.send(err);
      return;
    }

    // Each unsent workout.
    for(var i in workouts) {
      var health = 0;
      var stamina = 0;
      var magicka = 0;

      for (var j in workouts[i].data.workout_exercises) {
        if (workouts[i].data.workout_exercises.hasOwnProperty(j)) {
          var exerciseData = workouts[i].data.workout_exercises[j];
          if (exerciseData.hasOwnProperty('total_reps') && exerciseData.total_reps > 0) {
            // Health
            health += exerciseData.total_points;
          }
          else if (exerciseData.hasOwnProperty('distance') && typeof parseFloat(exerciseData['distance']) === 'number' && parseFloat(exerciseData.distance) > 0) {
            // Stamina
            stamina += exerciseData.total_points;
          } else {
            // Magicka
            magicka += exerciseData.total_points;
          }
        }
      }
      // console.log(workouts[i]);
      sendData.ele('workout').ele({
        syncDate: (new Date(Date.now())).toISOString(),
        workoutDate: (new Date(workouts[i].data.workout_date)).toISOString(),
        health: health,
        stamina: stamina,
        magicka: magicka
      }).up();
      workouts[i].used = true;
      workouts[i].save();
    }
    var str = sendData.end({pretty: true});
    console.log(str);
    res.send(str);
  });
});

module.exports = router;
