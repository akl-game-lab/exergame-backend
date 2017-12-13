$( document ).ready(function() {
	$('.update-workouts-button').on('click', function() {
		var $this = $(this);
		$this.button('loading');
		setTimeout(function() {
			window.location.reload(true);
		}, 7000);
		var id = $this.data('id')
		$.get('/users/' + id + '/forceUpdate');
	});
});
