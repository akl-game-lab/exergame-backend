var ExerciseDotCom = require('../../models/sources/exercise-dot-com');
var log = require('../../misc/logger');
var request = require('request');
var cheerio = require('cheerio');

module.exports = {
  verifyExerciseDotCom: function (username, password, callback) {
    // Set up the Cookie jar
    var j = request.jar();
    request = request.defaults({jar: j});

    request.get("https://www.exercise.com/users/sign_in", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        log.info("https://www.exercise.com/users/sign_in, successfully loaded, retrieving authenticity token.");

        // Parse the returned HTML to find the authenticity token and return that value.
        $ = cheerio.load(body);

        // Send Post request to the page.
        request.post({url:'https://www.exercise.com/users/sign_in', form: {
            "utf8": "✓",
            "authenticity_token": $("input[name='authenticity_token']").attr('value'),
            "user[email]": username,
            "user[password]": password,
            "user[remember_me]" : 0,
            "commit": "Log In"
        }}, function(error, response, body){
          if (!error && response.statusCode == 200 || 302) {
            log.debug(body);
            $ = cheerio.load(body);
            if ($("a").attr('href') == "https://www.exercise.com/dashboard") {
              log.info("User: " + username + ", successfully authenticated on exercise.com");
              callback("");
            } else {
              log.info("Unable to authenticate user: " + username);
              callback("You need to sign in or sign up before continuing.");
            }
          } else {
            log.info("Unable to authenticate user: " + username);
            callback("You need to sign in or sign up before continuing.");
          }
        });
      } else {
        log.error("Error connecting to exercise.com");
      }
    });
	},

	retrieveExerciseData: function (email, username, password, callback) {
    // Set up the Cookie jar
    var j = request.jar();
    request = request.defaults({jar: j});
		request.get("https://www.exercise.com/users/sign_in", function (error, response, body) {

    if (!error && response.statusCode == 200) { //else Failure connecting to exercise.com



      log.info("https://www.exercise.com/users/sign_in, successfully loaded, retrieving authenticity token.");

      // Parse the returned HTML to find the authenticity token and return that value.
      $ = cheerio.load(body);

      // Send Post request to the page.
      request.post({url:'https://www.exercise.com/users/sign_in', form: {
        "utf8": "✓",
        "authenticity_token": $("input[name='authenticity_token']").attr('value'),
        "user[email]": username,
        "user[password]": password,
        "user[remember_me]" : 0,
        "commit": "Log In"



      }}, function(error, response, body){


        if (!error && response.statusCode == 200 || 302) {// Else failure in first level
          log.debug(body);
          $ = cheerio.load(body);
          if ($("a").attr('href') == "https://www.exercise.com/dashboard") { //Else failure in second level
            log.info("User: " + username + ", successfully authenticated on exercise.com");

            // Retrieve user workouts.
            request.get({url: "https://www.exercise.com/api/v2/workouts?all_fields=true", header: response.headers },  function (error, response, body) {
              log.debug(response.statusCode);
              if (!error && response.statusCode == 200 || 304) {
                // Parse the JSON into the object.
                log.debug(body);
                var retrievedData = JSON.parse(body);
                if (retrievedData.hasOwnProperty('error')) {
                  log.error(retrievedData.error);
                } else {
                  log.info('Data successfully retrieved');
                  log.info("-------------------------------EXERCISE DOT COM DATA BELOW-----------------------------")
                  log.info(body);
                  log.info("++++++++++++++++++++++++++++++++END ONE DATA PACKET++++++++++++++++++++++++++++++++++++++++++++++")

                  // Store the information.
                  saveData(email, retrievedData, callback);
                }
              } else if (response.statusCode == 401) {
                log.error("Unable to get workouts. Error 401, Unauthorized Access.");
              }
            });
          } else {
            log.error("Unable to authenticate user: " + username);
            log.error("Failure in first level, not at /dashboard");
            callback("You need to sign in or sign up before continuing.");
          }
        } else {
          log.error("Unable to authenticate user: " + username);
          log.error("Failure in First level, error or status code other than 202, 302")
          callback("You need to sign in or sign up before continuing.");
        }
      });//End local function
    } else {
      log.error("Error connecting to exercise.com");
    }
    });
	}
};

function saveData(email, data) {
	for (var i = 0; i < data.length; i++) {
		saveWorkout(email, data[i]);
	}
}

function saveWorkout(email, data) {
	ExerciseDotCom.count({ userEmail: email, workoutId: data.id }, function (err, count) {
		if (err) {
			log.error(err);
		} else if (count === 0) {
			// If workout is new, save to DB.
			var newData = new ExerciseDotCom({
				workoutId: data.id,
				data: data,
				dateRetrieved: Date.now(),
				gamesUsed: [],
				userEmail: email
			});

			newData.save(function (err) {
				if (err) {
					log.error(err);
				} else {
					log.info("New workout saved for user: " +  email);
				}
			});
		}
	});
}
