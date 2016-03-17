// Note: this file is to be run by casperjs, not node.

var casper = require('casper').create();

var fs = require('fs');
var fname = new Date().getTime() + '.txt';
var x = require('casper').selectXPath;
var save = fs.pathJoin(fs.workingDirectory, 'execisejson2', fname);

casper.userAgent('Mozilla/4.0 (comptible; MSIE 6.0; Windows NT 5.1)');

casper.start('https://www.fitocracy.com');

casper.wait(5000, function(){
	casper.thenClick(x('/html/body/div[2]/div/div/div[2]/a'), function() {
		casper.wait(3000, function(){
			//casper.capture('EnterFitocracys.png');
			casper.then(function(){
				this.sendKeys(x('//*[@id="login-modal-form"]/div[2]/div[1]/input'), casper.cli.get('uname'));
				this.sendKeys(x('//*[@id="login-modal-form"]/div[2]/div[2]/input'), casper.cli.get('pword'));

				casper.thenClick(x('//*[@id="login-modal-form"]/button'), function() {
				});

				casper.wait(3000, function(){

					urlVal = casper.evaluate(function(){
						return __utils__.getElementByXPath('//*[@id="remove-recent-view"]/a')["href"];
					});

					var apiURL = 'https://www.fitocracy.com/api/v2/user/' + urlVal.substr(38,7) + '/workouts/2015-11-13/';

					casper.thenOpen(apiURL, function(){
						casper.wait(3000, function(){
								contents = atob(this.base64encode(apiURL));

								//fs.write(save, contents, 'w');

								console.log("[" + contents + "]");
						});
					});
				});

			});
		});
	});
});

casper.run();
