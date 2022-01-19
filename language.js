// JavaScript Document
// Strictly for the language selection
var langButton, langSelector = "";	// used for userConfig in SF3
var langType = "";
var selectedLang = "";
var toggledLangType = "";
var initLang = true;
// var langText = { "en":{}, "sp":{} }	// this contains all of the elements/text which should be sitting on the interactives/calcs
//-----------------------------------------------------------------
function getLang(data){	// this should be called first in $(document).ready...
	try{
		langButton = data.userConfig.langButton;
		langSelector = data.userConfig.langSelector;
	}catch(err){ console.log(err.message); }
	if(langButton || langSelector){
		langButton ? $("#lang-controls").show() : $("#lang-controls").hide();
		langSelector ? langType = langSelector : langType = "en";
	}else{
		langType = GetURLParameter("lang");
		// if(langType == "no-lang" || !langType){	// this was the previous set up for if no language was set
		if(langType == "no-lang"){
			$("#lang-controls").hide();
			langType = "en";
		}else{
			if(!langType){ langType = "en"; }	// sets langType here now if language is not set
			$("#lang-controls").show();
		}
	}
	setLanguage(langType);
	selectedLang = !langType ? langText['en'] : langText[langType];
	!langType ? toggledLangType = "en" : toggledLangType = langType;
	postLang(selectedLang);
}
//-----------------------------------------------------------------
function postLang(obj){
	$.each(obj, function(index, value){
		var isPreDef = index.substr(0,index.indexOf(' '));	// before whitespace
		var afterDef = index.substr(index.indexOf(' ')+1);	// after whitespace
		if(isPreDef == "ttip"){								// this applies only to tooltips
			$(afterDef).attr("title",value);
			dynamicTips(afterDef,value);	// this function exists with the elements/text file
		}else if(isPreDef == "post"){						// this applies only to dynamic data with post values
			try{											// failsafe for any missing elements for qdata
				qdataLang(afterDef,value);
			}catch(err){ console.log(err.message); }
		}else{
			$(index).html(value);
		}
	});
}
//-----------------------------------------------------------------
function qdataLang(afterDef,postVal){
	var preVal = "";
	var midVal = qdata[afterDef]["value"];
	qdata[afterDef]["post"] = postVal;
	if(qdata[afterDef]['type'] == "money"){ preVal = "$"; }
	$("#" + afterDef + " span").html(preVal + midVal + postVal);	// this is for the details tab
	if(currentField == afterDef){ $("#sliderDisplay .display").html(preVal + qdata[currentField]["value"] + postVal); }	// for the slider
}
//-----------------------------------------------------------------
function toggleLanguage(e){
	if(e){ e.preventDefault(); }
	toggledLangType == "en" ? setLanguage("sp") : setLanguage("en");
}
//-----------------------------------------------------------------
function setLanguage(lang){
	lang == "sp" ? $("body,#lang-controls").removeClass("en").addClass("sp") : $("body,#lang-controls").removeClass("sp").addClass("en");
	toggledLangType = lang;
	if(!initLang){	// after initial language is selected
		selectedLang = langText[lang];
		postLang(selectedLang);
	}else{
		initLang = false;
	}
}