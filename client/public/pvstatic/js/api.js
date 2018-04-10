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

			$("#article_headline").html(res.body.original_headline);
			$("#article_url").html(res.body.news_site_url);
			$("#article_date_posted").html(res.body.original_date_posted);
			$("#article_authors").html(res.body.original_authors);
			$("#article_story").html(res.body.original_story_content);

			$('#redirect_to_archive').click(function(){
				window.location = ("/"+res.body.news_site_url); 
			 })

		}
	});
});
