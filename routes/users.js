var express = require('express');
var router = express.Router();
var Workout = require('../models/workout');
var User = require('../models/user')
var xml = require('xml');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.post('/register', function (req, res, next) {
//
// });

router.get('/:id/workouts', function (req, res, next) {
  var userId = req.params.id;
  var from = req.query.from;
  var to = req.query.to;
  Workout.find({
    'userId': userId,
    'workoutDate': {
      $gte: new Date(from),
      $lt: new Date(to)
    }
  }, function (workouts) {
    res.send(xml(results))
  });
});

module.exports = router;
