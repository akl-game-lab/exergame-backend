var casper = require('casper').create();
var fs = require('fs');
var x = require('casper').selectXPath;
var save = fs.pathJoin(fs.workingDirectory, 'execisejson', fname);

casper.userAgent('Mozilla/4.0 (comptible; MSIE 6.0; Windows NT 5.1)');

casper.start('https://www.exercise.com/users/sign_in');

casper.then(function(){

	console.log('verify-username: '+ casper.cli.get('uname'));
	console.log('verify-password: '+ casper.cli.get('pword'));
	this.sendKeys('#user_email', casper.cli.get('uname'));
	this.sendKeys('#user_password', casper.cli.get('pword'));

});

casper.thenClick(x('//*[@id="new_user"]/div[4]/input'), function() {

});

casper.wait(20000, function(){

});

casper.run();
