$( document ).ready(function() {
	if($('.recent-workouts').length) {
		$.ajax({
	  	url: "/workouts",
		}).done(function(workouts) {
		  console.log(workouts)
		});
	}
});
