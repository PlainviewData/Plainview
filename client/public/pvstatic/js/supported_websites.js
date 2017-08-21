var formGroup = document.getElementsByClassName('form-group');
var goBtn = document.getElementById('go');
var urlMsg = document.getElementById('urlMsg');
var urlInput = document.getElementById('urlInput');
var list;
var cooldown = false;

var siteSearch = angular.module("siteSearch", []);

siteSearch.filter('searchFor', function(){
	return function(arr, searchString){
		if(!searchString){
			return arr;
		}
		var result = [];
		searchString = searchString.toLowerCase();
		angular.forEach(arr, function(item){
			if(item.display_name.toLowerCase().indexOf(searchString) !== -1){
				result.push(item);
			}
		});
		return result;
	};
});

siteSearch.controller('siteSearchController', function siteSearchController($scope){
  $.get( "/supported_websites", function(websiteList) {
    $scope.$apply(function(){
      $scope.items = websiteList;
      list = websiteList;
    });
  });
})

function isUrl(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

urlInput.addEventListener("input", function () {
    if (cooldown) {
    var inputValue = urlInput.value;
    if (inputValue || inputValue.length > 0){
      formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #EACD6E"; 
      urlMsg.innerHTML = "Checking url...";
      goBtn.disabled = true;
    }
  } else {
    cooldown = true;
    setTimeout(function() { setCooldownTimer(); }, 1000);
    checkInputUrl();
  }
}, false);

var checkInputUrl = function(){
  var inputValue = urlInput.value;
  if (!inputValue || inputValue.length == 0) {
    formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #FFFFFF"; 
    urlMsg.innerHTML = "";
    goBtn.disabled = true;
  } else {
    var isInputUrl = isUrl(inputValue);
    if (!isInputUrl) {
      formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #EF8689"; 
      urlMsg.innerHTML = "Invalid URL.";
      goBtn.disabled = true;
    } else {
      var startOfDomain;
      var endOfDomain;
      var inputDomain;
      if (inputValue.indexOf("www") !== -1) {
        startOfDomain = inputValue.indexOf(".") + 1;
      } else {
        startOfDomain = inputValue.indexOf("/") + 2;
      }
      endOfDomain = inputValue.indexOf(".", startOfDomain);
      inputDomain = inputValue.substring(startOfDomain, endOfDomain);
      for (var i = 0; i < list.length; i++) {
        if (inputDomain == list[i]["domain"]) {
          formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #BDEDC9"; 
          urlMsg.innerHTML = "Page is ready to archive!";
          goBtn.disabled = false;
          break;
        } else {
          formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #EF8689"; 
          urlMsg.innerHTML = "Website is not supported";
          goBtn.disabled = true;
        }
      };
    }
  }
}

var setCooldownTimer = function(){
  cooldown = false;
  checkInputUrl();
};