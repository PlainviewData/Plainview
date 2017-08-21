var goBtn = document.getElementById('go');
var urlMsg = document.getElementById('urlMsg');
var urlInput = document.getElementById('urlInput');

$("#urlInputForm").submit(function(event) {
	event.preventDefault();
	$.post( "/articles", {url:urlInput.value}, function(res) {
		if (res.statusCode > 400){
			formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #EF8689"; 
			urlMsg.innerHTML = res.body;
			goBtn.disabled = true;
		} else {
			// document.open();
			// document.write(res);
			// document.close();

			window.location = ("/articles/"+res.body._id); 

		}
	});
});