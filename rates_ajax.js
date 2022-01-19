// JavaScript Document
// created by jdw on 6/19/2018
// This file is to be used only to get/post data from the php rate files
// It's okay to create functions to send the data out as well, but don't replicate any post data functions.
// It needs to use the available variables in the other .js files
// var rateURL = "../assets/rates_ajax.php";										// this is for use on SF3 servers

// the below directory will be used from this point forward mostly for Ignite and the remainder of SF2's life
var rateURL = "https://a.mymortgagestatus.info/interactives/assets/rates_ajax.php";
//-----------------------------------------------------------------
function getPHPRates(rateType){ // collects 60 days worth of interest rates
	// if(e){ e.preventDefault(); }	
	$.ajax({
		type: 'POST',
		url: rateURL,
		async:false,
		dataType:'text', // easier to format in text in the success (since code already existed) than when it's json	  	 
		data: {	'action' : "GETRATES", 'rateType' : rateType },
		success: postPHPRates
	});
	return true;
}
//-----------------------------------------------------------------
function getPHPRatesByDate(rateType,rateDate){ // collects 60 days worth of interest rates dependent of date
	$.ajax({
		type: 'POST',
		url: rateURL,
		async:false,
		dataType:'text', // easier to format in text in the success (since code already existed) than when it's json	  	 
		data: {	'action' : "GETRATESBYDATE", 'rateType' : rateType, 'rateDate' : rateDate },
		success: postPHPRates
	});
	return true;
}
//.................................................................
function postPHPRates(obj){
	phpRateArr = JSON.parse(obj);
	for (i=0; i<phpRateArr.length; i++){
		phpRateArr[i]['Rate'] = parseFloat(roundFloat(phpRateArr[i]['Rate']*100,8,3));
	}
	//phpRateArr = Object.keys(phpRateArr).map(v => new Array(v, phpRateArr[v])); // IE doesn't like this code...
	phpRateArr = Object.keys(phpRateArr).map(function(v){ return new Array(v, phpRateArr[v]); });
}
//-----------------------------------------------------------------
function getPHPLastRate(rateType){ // collects the most recent interest rate
	// if(e){ e.preventDefault(); }	
	$.ajax({
		type: 'POST',
		url: rateURL,
		async:false,
		dataType:'text', // easier to format in text in the success (since code already existed) than when it's json	  	 
		data: {	'action' : "GETLASTRATE", 'rateType' : rateType },
		success: postPHPLastRate
	});
	return true;
}
//.................................................................
function postPHPLastRate(obj){
	var singlephpRateArr = JSON.parse(obj);
	//singlephpRateArr = Object.keys(singlephpRateArr).map(v => new Array(v, singlephpRateArr[v])); // IE doesn't like this code...
	singlephpRateArr = Object.keys(singlephpRateArr).map(function(v){ return new Array(v, singlephpRateArr[v]); });
	console.log(singlephpRateArr);
	for (i=0; i<singlephpRateArr.length; i++){
		phpCurrDate = new Date(singlephpRateArr[i][1]["RateDate"]).getTime(); // this can be grabbed at any part of the date now using js or tools like moment.js
		phpCurrRate = parseFloat(roundFloat(singlephpRateArr[i][1]["Rate"]*100,8,3));
	}
}
//.................................................................
function roundFloat(value, toNearest, fixed){
	// the data retrieved from theFinancials.com doesn't go by percent
	return (Math.round(value * toNearest) / toNearest).toFixed(fixed);
}