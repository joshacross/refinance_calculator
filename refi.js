// JavaScript Document
qdata = new Array();
qdata['refi-loan'] = {value:235000,type:"money",decimals:0,interface:"calculator",label:'Home Loan',display:''};
qdata['refi-newloan'] = {value:000000,type:"money",decimals:0,interface:"calculator",label:'New Home Loan',display:''};
qdata['refi-paid'] = {value:8,type:"number",decimals:1,post:" Years",interface:"slider",min:0.1,max:30,inc:0.1,label:'Years Paid',display:''};
qdata['refi-rate'] = {value:5,type:"percent",decimals:3,post:"%",interface:"slider",min:1,max:18,inc:.125,label:'Rate',display:''};
qdata['refi-rate2'] = {value:5,type:"percent",decimals:3,post:"%",interface:"slider",min:1,max:18,inc:.125,label:'New Rate',display:''};
qdata['refi-term'] = {value:30,type:"number",decimals:0,post:" Years",interface:"termpicker",min:5,max:30,inc:5,label:'Term',display:''};
qdata['refi-term2'] = {value:30,type:"number",decimals:0,post:" Years",interface:"termpicker",min:5,max:30,inc:5,label:'New Term',display:''};

var currentField = "";
var origResult = "";
var pniValue = "";
var MIchanged = false;
var yearsPaidChanged = true;	// used to control current loan balance override

var phpCurrDate; // declared here to grab php data from ../assets/rates_ajax.js
var phpCurrRate = 0; // declared here to grab php data from ../assets/rates_ajax.js

$(document).ready(function() {
	readSF3Data();
	$('.change-data').blur(updateBox);
	$('.change-data').keypress(function(e){ if(e.which == 13){ updateBox(e); } });
	$('.change-data').click(removeNonNumbers);
	$(".refi-editable").click(showInput);
	$("#btn-setslider").click(setSlider);
	$(".rate-slider-btn").click(incRateSlider);
	$(".paid-slider-btn").click(incPaidSlider);
	$(".rate2-slider-btn").click(incRate2Slider);
	$(".slider-btn").click(incSlider);
	$("#term-selector li a").click(enterTerm);
	$("#editBalance").click(editCurrBal);
	$("#expand-btn").click(showBottomInt);
	$("#lang-switch").click(function(){ toggleLanguage(); updateLang(); });
	$("#lang-controls .lang.english").click(function(){ setLanguage("en"); updateLang(); });
    $("#lang-controls .lang.spanish").click(function(){ setLanguage("sp"); updateLang(); });
});
//################################################################
function initAfterSF3API(d){
	useSF3API(d);
	getLang(d);
	try{ // this is to provide current interest rate(s) from daily interest rate
		getPHPLastRate(null);	// this exists in ../assets/rates_ajax.js
		if(phpCurrRate != 0){
			qdata['refi-rate'].value = phpCurrRate + 2;
			qdata['refi-rate2'].value = phpCurrRate;
		}
	}catch(err){ console.log(err.message); }

	for(i in qdata){
		updateDisplay(i,false);
	}
	getRefi();
	createRateSlider();
	createPaidSlider();
	createRate2Slider();
	if(!usedTheme){ getTheme(false); }
}
//################################################################
function showInput(e){
	if(e){ e.preventDefault(); }
	var id = $(this).attr("id");
	var lastChar = id.slice(-1);
	// remove the 1 at the end to use same existing id
	if(lastChar == "1"){ id = id.slice(0, -1); }
	currentField = id;

	var interface = qdata[id].interface;
	if(interface === "calculator"){ return; }	// this is now an input box
	$(".payment-modal").fadeIn();
	if(interface === "calculator"){ showCalculator(id,e); }
	else if(interface === "slider"){ showSlider(e); }
	else if(interface === "termpicker"){ showTermSelector(e); }
}
//.................................................................
function positionInterface(iface,e){
	var link = $(e.target);
	//var pos = link.position();
	var pos = link.offset();
	var pagey = pos.top;
	var offset = link.offset();
	var pagex = offset.left;
	iface.css("top","800px");
	//iface.css("top", pagey);
	console.log("pagex: " + pagex);
	if((pagey + iface.innerHeight()) > $("#refi-value").innerHeight()){
		pagey = $("#refi-value").innerHeight() - iface.innerHeight() - 10;
	}
	if((pagex + iface.innerWidth()) > $("#refi-value").innerWidth()){
		pagex = $("#refi-value").innerWidth() - iface.innerWidth() - 10;
	}
	iface.css("left",pagex);
	iface.animate({"top":pagey,"left":pagex},500);
}
//.................................................................
function updateBox(e){
	e.preventDefault();
	var id = e.currentTarget.id;
	currentField = id.replace(/[0-9]/g, '');	// strips out any numbers for multiple id fields (allows multiple links to the same value);
	var f = qdata[currentField];
	var post = f['post'];
	var newVal = $("#" + id).val();
	if(!newVal){ newVal = f['value'].toString(); }
	newVal = newVal.replace(/[^0-9.]/g, "");	// remove excess characters except for numbers and period
	if(f['min'] > +newVal){
		newVal = f['min'];	// can't be lower than the minimum value
	}else if(f['max'] < +newVal){
		newVal = f['max'];	// can't be higher than the maximum value
	}
	newVal = (+newVal).toFixed(f['decimals']);
	if(f['type'] == "money"){ newVal = formatMoney(newVal,0)}
	if(newVal == "1" || newVal == 1){ post = post.slice(0,-1); }
	// if(currentField == "refi-pmi"){ MIchanged = true; }
	if(currentField == "refi-newloan"){ yearsPaidChanged = false; }	// enables current loan balance override
	$("#" + currentField).val(newVal + post);
	newVal = newVal.replace(/[$,()\s]/g, "");
	f['value'] = +newVal;
	updateDisplay(currentField,true);
}
//.................................................................
function removeNonNumbers(e){
	e.preventDefault();
	var textVal = $(this).val();
	textVal = textVal.replace(/[^0-9.]/g, "");
	$(this).val(textVal);
	// $(this).attr("size", 13)
}
//.................................................................
function createRateSlider(){
	// create slider with defaulted values
	var f = qdata['refi-rate'];
	var val = f['value'];
	var sliderRate = document.getElementById("rateSlider");
	noUiSlider.create(sliderRate, {
		start:val,
		behaviour:'tap',
		range: {min: f.min, max: f.max},
		connect:"lower",
		step:f.inc,
		// tooltips:true,
		tooltips: wNumb({decimals: f.decimals, suffix: f.post}),
		format: wNumb({decimals: f.decimals})
	});
	// call function to update slider on mouse release
	sliderRate.noUiSlider.on('slide', setRateSliderDisplay);
	sliderRate.noUiSlider.on('change', setSliderEnd);
}
//.................................................................
function createPaidSlider(){
	// create slider with defaulted values
	var f = qdata['refi-paid'];
	var val = f['value'];
	var sliderPaid = document.getElementById("paidSlider");
	noUiSlider.create(sliderPaid, {
		start:val,
		behaviour:'tap',
		range: {min: f.min, max: f.max},
		connect:"lower",
		step:f.inc,
		// tooltips:true,
		tooltips: wNumb({decimals: f.decimals, suffix: f.post}),
		format: wNumb({decimals: f.decimals})
	});
	// call function to update slider on mouse release
	sliderPaid.noUiSlider.on('slide', setPaidSliderDisplay);
	sliderPaid.noUiSlider.on('change', setSliderEnd);
}
//.................................................................
function createRate2Slider(){
	// create slider with defaulted values
	var f = qdata['refi-rate2'];
	var val = f['value'];
	var sliderRate = document.getElementById("rate2Slider");
	noUiSlider.create(sliderRate, {
		start:val,
		behaviour:'tap',
		range: {min: f.min, max: f.max},
		connect:"lower",
		step:f.inc,
		// tooltips:true,
		tooltips: wNumb({decimals: f.decimals, suffix: f.post}),
		format: wNumb({decimals: f.decimals})
	});
	// call function to update slider on mouse release
	sliderRate.noUiSlider.on('slide', setRate2SliderDisplay);
	sliderRate.noUiSlider.on('change', setSliderEnd);
}
//.................................................................
function showSlider(e){
	var f = qdata[currentField];
	console.log('showslider');
	var val = f['value'];
	var slider = document.getElementById("payment-slider");
	console.log("test: " + f.label);
	noUiSlider.create(slider, {
		start: val,
		behaviour:'tap',
		connect:"lower",
		step: f.inc,
		format: wNumb({decimals: f.decimals}),
		range: { min: f.min, max: f.max	}
	});

	slider.noUiSlider.on('slide', updateSlider);

	var iface = $("#slider-block");
	iface.show();
	initSlider();
	positionInterface(iface,e);
}
//.................................................................
function initSlider(){
	var val = qdata[currentField]['value'];
	$("#slider").val(val);
	setSliderDisplay(val);
}
//.................................................................
function hideSlider() {
	var slider = document.getElementById('payment-slider');
	slider.noUiSlider.destroy(); //destroy slider
	$("#slider-block").hide();
	paymentEndModal(); }
//.................................................................
function setRateSliderDisplay(values){ setMultiSliderDisplay(values,"refi-rate","rateSlider"); }
function setPaidSliderDisplay(values){ setMultiSliderDisplay(values,"refi-paid","paidSlider"); }
function setRate2SliderDisplay(values){ setMultiSliderDisplay(values,"refi-rate2","rate2Slider"); }
//.................................................................
function setMultiSliderDisplay(values,oName,idSect){
	// process for updating rate display for slider value
	var f = qdata[oName];
	var val = Number(values);
	var display = formatNumber(val,f.decimals);
	if(f['post']){ display += f['post']; }
	$("#" + idSect + " .noUi-handle").attr("data-content", display);// add value to handle
	if(oName == "refi-paid"){ yearsPaidChanged = true; $(".hidden-input").slideUp(); }	// disables current loan balance override
	// begin updating the value of data
	var slider = document.getElementById(idSect);
	qdata[oName]['value'] = val;
	updateDisplay(oName,true);

	return f;
}
//.................................................................
function incRateSlider(e){ if(e){ e.preventDefault(); } var id = $(this).attr("id"); incMultiSlider(id,"refi-rate","rateSlider"); }
function incPaidSlider(e){ if(e){ e.preventDefault(); } var id = $(this).attr("id"); incMultiSlider(id,"refi-paid","paidSlider"); }
function incRate2Slider(e){ if(e){ e.preventDefault(); } var id = $(this).attr("id"); incMultiSlider(id,"refi-rate2","rate2Slider"); }
//.................................................................
function incMultiSlider(id,oName,idSect){
	// changes slider rate value using plus and minus buttons
	var f = qdata[oName];
	var dir = 1;
	if(id.slice(0,4) == "left"){ dir = -1; }

	var newval = +f.value + +(dir * f.inc);// add or subtract values
	if(newval > f.max){ newval = f.max;}
	else if(newval < f.min){ newval = f.min; }

	var slider = document.getElementById(idSect);
	slider.noUiSlider.set(newval);
	setSliderEnd(newval,oName,idSect);
}
//.................................................................
function setSliderEnd(values,n,i){
	if(n === 0){ return; }
	var f = setMultiSliderDisplay(values,n,i);
}
//.................................................................
function incSlider(e){
	// changes slider value based on current field using plus and minus buttons
	if(e){ e.preventDefault(); }
	var f = qdata[currentField];
	var id = $(this).attr("id");
	var dir = 1;
	if(id == "leftCircle"){ dir = -1; }
	//console.log(f.value);

	var newval = +f.value + +(dir * f.inc);// add or subtract values
	if(newval > f.max){ newval = f.max;}
	else if(newval < f.min){ newval = f.min; }

	var slider = document.getElementById('payment-slider');
	slider.noUiSlider.set(newval);
	updateSlider(newval);
}
//.................................................................
function updateSlider(values,handle,unencoded,tap,positions){
	var val = Number(values);
	qdata[currentField]['value'] = val;
	setSliderDisplay(val);
}
//.................................................................
function setSliderDisplay(val){
	var f = qdata[currentField];
	var display = formatNumber(val,f.decimals);
	if(f['type'] == "money"){ display = formatMoney(display); }
	if(f['post']){ display += f['post']; }
	if(f['percentof']){ display += addPercentage(currentField); }
	if(f['label'] == "Term" && val == 1){ display = display.slice(0, -1); }
	$("#slider-block .display" ).html(display);
	$(".slider-label").html(f.label);
}
//.................................................................
function setSlider(e){
	e.preventDefault();
	//console.log(currentField);
	var slider = document.getElementById('payment-slider');
	var val = slider.noUiSlider.get();
	qdata[currentField]['value'] = val;
	updateDisplay(currentField,true);
	hideSlider();
}
//.................................................................
function addPercentage(field){
	var f = qdata[field];
	var p = qdata[f['percentof']];
	if(!p['value']){ return ""; }
	var dp = formatMoney(p['value'] * (f['value']/100));
	var d = " <span>(" + dp + ")</span>";
	return d;
}
//.................................................................
function paymentEndModal(){
	$(".payment-modal").fadeOut();
}
//.................................................................
function updateDisplay(id,isUpdate){
	var f = qdata[id];
	var dec = f['decimals'];
	var value = Number(f['value']);
	if(!value){ value = 0; }
	value = value.toFixed(dec);
	if(f.type == "money"){ value = formatMoney(value); }
	if(f.post){ value = String(value) + f['post']; }
	$("#" + id).text(value);
	$("." + id).text(value);
	$("#" + id).val(value);
	qdata[id]['display'] = value;
	if(isUpdate){ getRefi(); }
}
//################################################################# MATH #######################
function calcAPR(aprRate,term,maxLoan){
	var closingCosts = maxLoan * 0.03;
	var usedRate = aprRate/100;
	var piPmt = PMT(usedRate/12, term * 12, maxLoan,0,0) * -1;
	var perdiemAmt = maxLoan * (usedRate / 365) * 15; // 15 will be number of days on per diem interest
	aprAmt = APR(term*12, piPmt, -(maxLoan-(closingCosts+(0)+perdiemAmt)), 0, "", usedRate)*12;
	aprAmt = aprAmt*100;
	return Number(aprAmt.toFixed(3));
}
//.................................................................
function getRefi(){
	// this is for figuring up pieces of a home payment
	var loanAmt = qdata['refi-loan']['value'];
	var annualRate = qdata['refi-rate']['value'] / 100;
	var monthlyRate = annualRate / 12;
	var years = qdata['refi-term']['value'];
	var months = years * 12;
	pniValue = PMT(monthlyRate,months,loanAmt,0,0) * -1;
	var aprVal = calcAPR(qdata['refi-rate']['value'],years,loanAmt);
	var yearsPaid = qdata['refi-paid']['value'];
	
	var currBal = CUMPRINC(monthlyRate,months,loanAmt,1,yearsPaid*12,1) + loanAmt;
	$("#paidVal").text(formatMoney(currBal,0));
	if(!yearsPaidChanged){ currBal = qdata['refi-newloan']['value']; }
	
	var newAnnualRate = qdata['refi-rate2']['value'] / 100;
	var newMonthlyRate = newAnnualRate / 12;
	var newTerm = qdata['refi-term2']['value'];
	var newPniValue = PMT(newMonthlyRate,newTerm*12,currBal,0,1) * -1;
	var newAprVal = calcAPR(qdata['refi-rate2']['value'],newTerm,currBal);
	var diffPni = newPniValue - pniValue;

	$("#pni-total").text(formatMoney(pniValue,2));
	aprVal > 0 ? $("#aprVal").text(aprVal.toFixed(3) + "%") : $("#aprVal").text("N/A");
	newAprVal > 0 ? $("#apr2Val").text(newAprVal.toFixed(3) + "%") : $("#apr2Val").text("N/A");
	$("#result-diff").text(formatMoney(Math.abs(diffPni),2));
	$("#result-total").text(formatMoney(newPniValue,2));
	if(diffPni < 0){	// this will set a noticeable difference in price for refis
		$("#result-diff").addClass("savings");
		$("#RL11").css("display","none");
		$("#RL10").css("display","inline");
	}else{
		$("#result-diff").removeClass("savings");
		$("#RL10").css("display","none");
		$("#RL11").css("display","inline");
	}
	for(i in qdata){ updateDisplay(i,false); }
}
//-----------------------------------------------------------
function editCurrBal(e){
	if(e){ e.preventDefault(); }
	if($(".hidden-input").css("display") === "block"){
		$(".hidden-input").slideUp();
	}else{
		$(".hidden-input").slideDown();
	}
}
//-----------------------------------------------------------
function showBottomInt(e){
	if(e){ e.preventDefault(); }
	if($("#interactive-bottom").css("display") === "block"){
		$("#interactive-bottom").slideUp();
		$("#expand-btn").html("<i class=\"fa fa-angle-down\"></i>");
	}else{
		$("#interactive-bottom").slideDown();
		$("#expand-btn").html("<i class=\"fa fa-angle-up\"></i>");
	}
}
//################################################################# CALCULATOR #################
function calcButton(e){
	e.preventDefault();
	var btn = $(this).parent();
	var val = btn.attr('id').substr(5);
	if(!isNaN(val)){ updateCalcString(val); }
	else if(val == "back"){ backSpaceCalc(); }
	else if(val == "clear"){ setCalcDisplay(""); }
	else if(val == "enter"){ enterCalc(); }
	else if(val == "point"){ updateCalcString("."); }
}
//.................................................................
function backSpaceCalc(){
	var newString = calcString.slice(0,-1);
	setCalcDisplay(newString);
}
//.................................................................
function setCalcDisplay(s){
	$("#screen").html(s);
	calcString = String(s);
}
//.................................................................
function updateCalcString(s){
	if(calcString.length == maxLength){ return; }
	calcString += s;
	setCalcDisplay(calcString);
}
//.................................................................
function enterCalc(){
	hideCalculator();
	paymentEndModal();
	calcActive = false;
	var value = Number(calcString);
	if(!value){ value = 0; }
	//don't allow $0 sales price
	if((currentField === "refi-loan") && (!value)){
		value = qdata[currentField].value;
	}
	qdata[currentField].value = value;
	updateDisplay(currentField,true);
}
//-----------------------------------------------------------
function showCalculator(id,e){
	calcActive = true;
	setCalcDisplay(qdata[id].value);
	var iface = $("#calculator");
	iface.show();
	positionInterface(iface,e);
}
//-----------------------------------------------------------
function hideCalculator(){
	$("#calculator").hide();
}
//.................................................................
function showTermSelector(e){
	var iface = $("#term-selector");
	iface.show();
	positionInterface(iface,e);
}
//.................................................................
function hideTermSelector() {
	$("#term-selector").hide();
	paymentEndModal();
}
//.................................................................
function enterTerm(e){
	e.preventDefault();
	var btn = $(this).parent();
	var val = btn.attr('id').substr(5);
	qdata[currentField]['value'] = Number(val);
	updateDisplay(currentField,true);
	hideTermSelector();
}
//................... SF3 API Variable Override ...................
function useSF3API(data){
	try{
		useColorOverride(data);
		useTextOverride(data);
		getTheme(data);
		if(themeName == "theme0"){ $("#rateSlider").addClass("theme0"); }
		sf3Loan = data.variables;
		// console.log(sf3Loan);
		if(sf3Loan.loanTerm){ qdata['refi-term'].value = Number(sf3Loan.loanTerm) / 12; }
		// if(sf3Loan.loanPropertyValue){ qdata['refi-homeprice'].value = Number(sf3Loan.loanPropertyValue); }
		if(sf3Loan){
			$(".data-tip").css({"display": "inline"});
			$("#dataTip").attr("title","When it's available, we have populated your existing loan data. However, any of the values can be changed to reflect the most recent or alternate figures.");
		}
	}catch(err){
		console.log(err.message);
	}
}
//-----------------------------------------------------------
function useColorOverride(d){
	var style = document.createElement('style');
	var color = "";
	if(d.userConfig.color){
		// this uses the color from config panel
		color = d.userConfig.color;
	}else if(d.color){
		// this uses company color
		color = d.color;
	}
	if(color){
		color = setColor(color);
		style.innerHTML = '#lang-switch,.noUi-connect,.vert-bar span{ background-color:' + color + '; }' +
						  // '.refi-editable:hover{ background-color:' + color + '66; }' +
						  '.theme0{ background-color:' + color + '8C; }';
		document.head.appendChild(style);
	}
}
//-----------------------------------------------------------
function setColor(currColor){
	var	comColor = tinycolor(currColor);
	var newColor = "";
	//console.log(comColor);
	if(comColor.isValid()){
		var chosenColor = comColor.getOriginalInput();
		// console.log("color: " + chosenColor);
		var brightness = comColor.getBrightness();
		// console.log("brightness: " + brightness);
		var lightColor = tinycolor(chosenColor).lighten().toString(); // 10
		var lightColor2 = tinycolor(chosenColor).lighten(20).toString();
		var darkColor = tinycolor(chosenColor).darken().toString(); // 10
		var darkColor2 = tinycolor(chosenColor).darken(20).toString();
		if(brightness > 230){
			newColor = darkColor2;
		}else if(brightness < 25){
			newColor = lightColor2;
		}else{
			newColor = chosenColor;
		}
	}
	return newColor;
}
//-----------------------------------------------------------
function useTextOverride(d){
	var header = d.userConfig.header;
	var subHeader = d.userConfig.subHeader;
	// this replaces the current header
	if(header){ langText[d.userConfig.langSelector]['#header h2'] = header; }
	// this replaces the current sub-header
	if(subHeader){ langText[d.userConfig.langSelector]['#header p'] = subHeader; }
}
