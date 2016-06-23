// Note: this file is to be run by casperjs, not node.

var casper = require('casper').create();

var fs = require('fs');
var fname = new Date().getTime() + '.txt';
var x = require('casper').selectXPath;
var save = fs.pathJoin(fs.workingDirectory, 'execisejson', fname);
var log = require('../logger');


casper.userAgent('Mozilla/4.0 (comptible; MSIE 6.0; Windows NT 5.1)');

casper.start('https://www.exercise.com/users/sign_in');

casper.then(function(){

	this.sendKeys('#user_email', casper.cli.get('uname'));
	this.sendKeys('#user_password', casper.cli.get('pword'));

});

casper.thenClick(x('//*[@id="new_user"]/div[4]/input'), function() {

});

casper.wait(20000, function(){

});



var apiURL = 'https://www.exercise.com/api/v2/workouts?all_fields=true';

casper.thenOpen(apiURL, function(){
	casper.wait(5000, function(){

	//base64encode makes an http request
	var contents = atob(this.base64encode(apiURL));

	log.verbose(contents);

	});
});

casper.run();
