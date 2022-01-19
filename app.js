// Javascript Document
// main domains are interchangeable except anything local
var SF3DataURL = "https://a.surefirecontent.com/interactives/assets/sf3_data.php"; //UPDATE
// var SF3DataURL = "http://sf3local/interactives/assets/sf3_data.php";
var stateURL = "https://a.mymortgagestatus.info/interactives/assets/statedata.php";

var themeName = "";
var usedTheme = false;
//...............................................................................
function GetURLParameter(sParam){
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++)
	{
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam)
		{
			return decodeURIComponent(sParameterName[1]);	// decoded as an extra precaution if php fails
		}
	}
}
//...............................................................................
function getFileExtension(url) {
	var url = url.slice((Math.max(0, url.lastIndexOf(".")) || Infinity) + 0);	// remove everything before the "."
	index = url.indexOf("?");
    if (index !== -1) {
        url = url.substring(0, index); // Remove query
    }
	index = url.lastIndexOf(".");
	return index !== -1
        ? url.substring(index + 1) // Only keep file extension
        : ""; // No extension found
    // "use strict";
    // if (url === null) {
        // return "";
    // }
    // var index = url.lastIndexOf("/");
    // if (index !== -1) {
        // url = url.substring(index + 1); // Keep path without its segments
    // }
    // index = url.indexOf("?");
    // if (index !== -1) {
        // url = url.substring(0, index); // Remove query
    // }
    // index = url.indexOf("#");
    // if (index !== -1) {
        // url = url.substring(0, index); // Remove fragment
    // }
    // index = url.lastIndexOf(".");
    // return index !== -1
        // ? url.substring(index + 1) // Only keep file extension
        // : ""; // No extension found
}
//...............................................................................
function formatNumber(val,dec){
	if(!dec){ dec = 0; }
	val = Number(val).toFixed(dec);
	while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	}
	return val;
}
//...............................................................................
function formatMoney(val,dec){
	if(!dec){ dec = 0; }
	val = Number(val).toFixed(dec);
	while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	}
	return "$" + val;
}
//...............................................................................
function moneyDec(val){
	var whichDec = 0;	// defines which decimal value to return so certain values don't get too large
	val >= 10000 || val <= -10000 ? whichDec = 0 : whichDec = 2;	
	return whichDec;
}
//.................................................................
function roundUp(num,place){	// rounds up number based on place, i.e. 1000s place
    return Math.ceil(num/place) * place;
}
//...............................................................................
function readSF3Data(){
	// get SF3 Data from API
	var d = GetURLParameter("d");
	console.log("Reading SF3 Data");
	var jqxhr = $.getJSON(SF3DataURL,{"d":d},function(data){
		initAfterSF3API(data);
	}).fail(function(){
		console.log("Error on SF3 API");
		initAfterSF3API(false);
	});
}
//...............................................................................
function readSF3DataLandingPage(){
	// get SF3 Data from API when interactive iframe is contained within the landing page
	// id doesn't matter since the query string for the interactives will all be the same
	var iframeLink = document.getElementById("iFrameResizer0").src;
	var d = iframeLink.substr(iframeLink.indexOf('?d=')+3);
	if(!d){	// ensures encoded API collection
		d = iframeLink.substr(iframeLink.indexOf('&d=')+3);
	}
	console.log("Reading SF3 Data from Landing Page");
	var jqxhr = $.getJSON(SF3DataURL,{"d":d},function(data){
		initLPAfterSF3API(data);
	}).fail(function(){
		console.log("Error on SF3 API");
		initLPAfterSF3API(false);
	});
}
//...............................................................................
function getTheme(d){
	// checks if sf3 data exists to use existing, selected theme
	if(d){ themeName = d.userConfig.theme; }
	// if sf3 theme wasn't selected check for url theme
	if(!themeName){ themeName = GetURLParameter("theme"); }
	if(themeName){ $('head').append('<link rel="stylesheet" type="text/css" href="css/' + themeName + '.css">'); usedTheme = true; }
}
//...............................................................................
function getStateDB(){
	// collects all the data associated with the states in Content Team DB
	$.ajax({
		type: 'POST',
		url: stateURL,
		// async: false,
		dataType: 'json',
		data: {	'action' : "GETSTATES" },
		success: function(data){ stateDBArr = data; },
		failure: function(errMsg){ console.log(errMsg); },
		complete: function(data){
			// console.log(stateDBArr);
			addStateDB();	// this function needs to be called somewhere in the interactives to use the state data
		}
	});
}
