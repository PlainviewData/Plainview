var formGroup = document.getElementsByClassName('form-group');
var goBtn = document.getElementById('go');
var invalidUrl = document.getElementById('invalid-url');
var validUrl = document.getElementById('valid-url');
var notSupported = document.getElementById('not-supported');
var checking = document.getElementById('checking');
var urlInput = document.getElementById('urlInput');
var list;
var cooldown = false;

// Define a new module for our app
var siteSearch = angular.module("siteSearch", []);

$.get( "/supported_websites", function(websiteList) {
  // get list of supported domains
  list = websiteList;
});

// Create the instant search filter
siteSearch.filter('searchFor', function(){
	// All filters must return a function. The first parameter
	// is the data that is to be filtered, and the second is an
	// argument that may be passed with a colon (searchFor:searchString)
	return function(arr, searchString){
		if(!searchString){
			return arr;
		}
		var result = [];
		searchString = searchString.toLowerCase();
		// Using the forEach helper method to loop through the array
		angular.forEach(arr, function(item){
			if(item.display_name.toLowerCase().indexOf(searchString) !== -1){
				result.push(item);
			}
		});
		return result;
	};
});

// The controller
siteSearch.controller('siteSearchController', function siteSearchController($scope){
	// The data model. These items would normally be requested via AJAX,
	// but are hardcoded here for simplicity. See the next example for
	// tips on using AJAX.
  $.get( "/supported_websites", function(websiteList) {
    // get list of supported domains
    $scope.$apply(function(){
      $scope.items = websiteList;
    });
  });
})

// check if a string has url patten (new version)
function isUrl(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

urlInput.addEventListener("input", function () {
    if (cooldown) {
    var inputValue = urlInput.value;
    if (inputValue || inputValue.length > 0){
      formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #EACD6E"; // yellow glow
      invalidUrl.style.display = "none";
      validUrl.style.display = "none";
      notSupported.style.display = "none";
      checking.style.display = "block";
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
  // check if input is empty
  if (!inputValue || inputValue.length == 0) {
    formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #FFFFFF"; // no glow
    invalidUrl.style.display = "none";
    validUrl.style.display = "none";
    notSupported.style.display = "none";
    checking.style.display = "none";
    goBtn.disabled = false;
  } else {
    // check if the input value is a url
    var isInputUrl = isUrl(inputValue);
    if (!isInputUrl) {
      formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #EF8689"; // red glow
      invalidUrl.style.display = "block";
      validUrl.style.display = "none";
      notSupported.style.display = "none";
      checking.style.display = "none";
      goBtn.disabled = true;
    } else {
      // check if its domain is supported
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
      //console.log(inputDomain);

      // look up in the domain list
      for (var i = 0; i < list.length; i++) {
        if (inputDomain == list[i]) {
          formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #BDEDC9"; // green glow
          validUrl.style.display = "block";
          invalidUrl.style.display = "none";
          notSupported.style.display = "none";
          checking.style.display = "none";
          goBtn.disabled = false;
          break;
        } else {
          formGroup[0].style.webkitBoxShadow = "0px 0px 20px 2px #EF8689"; // red glow
          invalidUrl.style.display = "none";
          validUrl.style.display = "none";
          notSupported.style.display = "block";
          checking.style.display = "none";
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