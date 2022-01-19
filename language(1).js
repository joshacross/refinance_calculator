// JavaScript Document
var langText = {
	"en":{
		"#header h2": "Refinance",
		"#header p": "How much could you save with a lower rate?",
		"#term-buttons span": "YEARS",
		"#RL1": "Original Loan Amount",
		"#RL2": "Current Term",
		"#RL3": "Current Mo. P&I Payment",
		"#RL4": "Current Interest Rate",
		".apr-infotip span:first-of-type": "APR:",
		"#RL5": "Current Balance",
		"#RL6": "Years Paid",
		"#RL7": "Current Balance",
		"#RL8": "New Interest Rate",
		"#RL9": "New Term",
		"#RL10": "Payment Savings",
		"#RL11": "Difference in Payments",
		"#RL12": "New Mo. P&I Payment",
		"ttip .pni-infotip": "This is your current total monthly principal and interest payment based on the selected loan amount, term, and interest rate. Payments for taxes, insurance, MI/PMI, and other applicable fees are not included.",
		"ttip .rate-infotip": "Select a sample interest rate. The default rates shown are neither an advertisement, an estimate, nor an offer to lend. Please consult with us for a quote specific to your scenario.",
		"ttip .apr-infotip": "APR or Annual Percentage Rate is the total cost of the loan expressed as an interest rate. It is NOT the interest rate that you pay. Costs are factored at 3% of the loan amount.",
		"ttip .paid-infotip": "Select the number of years paid on your current loan. This will calculate the current remaining balance.",
		"ttip .paidval-infotip": "This is the remaining balance as calculated from your original balance and number of years paid. If you know the balance to be different, you can change the number of years paid or click the icon to enter a different value.",
		"ttip .diff-infotip": "This is the difference between your original and the newly calculated monthly principal and interest payment.",
		"ttip .result-infotip": "This would be your new principal and interest payment if you considered refinancing. Payments for taxes, insurance, MI/PMI, and other applicable fees are not included.",
		"post refi-paid": " Years",
		"post refi-term": " Years",
		"post refi-term2": " Years",
	},
	"sp":{
		"#header h2": "Refinanciamiento",
		"#header p": "¿Cuánto podría ahorrar con una tarifa más baja?",
		"#term-buttons span": "AÑOS",
		"#RL1": "Monto original del préstamo",
		"#RL2": "Plazo actual",
		"#RL3": "Pago mensual actual de C&I",
		"#RL4": "Tasa de interés actual",
		".apr-infotip span:first-of-type": "APR:",
		"#RL5": "Saldo actual",
		"#RL6": "Años pagados",
		"#RL7": "Saldo actual",
		"#RL8": "Nueva tasa de interés",
		"#RL9": "Nuevo plazo",
		"#RL10": "Ahorros de pagos",
		"#RL11": "Diferencia en pagos",
		"#RL12": "Nuevo pago men. actual de C&I",
		"ttip .pni-infotip": "Este es su pago mensual total actual de capital y los intereses basado en la cantidad, el plazo y la tasa de interés del préstamo seleccionados. Los pagos de impuestos, seguro, seguro de hipoteca / seguro de hipoteca privado y otras tarifas aplicables no están incluidos.",
		"ttip .rate-infotip": "Seleccione una tasa de interés de muestra. Las tarifas predeterminadas que se muestran no son un anuncio, una estimación ni una oferta de préstamo. Consulte con nosotros para obtener un presupuesto específico para su situación.",
		"ttip .apr-infotip": "La tasa de porcentaje anual (APR por sus siglas en inglés) es el costo total del préstamo expresado como tasa de interés. NO es la tasa de interés que paga. Los costos se factorizan al 3% del monto del préstamo.",
		"ttip .paid-infotip": "Seleccione el número de años que ha pagado en su préstamo actual. Esto calculará el saldo restante actual.",
		"ttip .paidval-infotip": "Este es el saldo restante calculado a partir de su saldo original y el número de años pagados. Si sabe que el saldo es diferente, puede cambiar la cantidad de años pagados o hacer clic en el icono para ingresar un valor diferente.",
		"ttip .diff-infotip": "Ésta es la diferencia entre su pago de capital e intereses mensual original y el recién calculado.",
		"ttip .result-infotip": "Este sería su nuevo pago de capital e intereses si considera refinanciar. No se incluyen los pagos de impuestos, seguros, seguro de hipoteca / seguro de hipoteca privado y otras tarifas aplicables.",
		"post refi-paid": " Años",
		"post refi-term": " Años",
		"post refi-term2": " Años",
	}
}
//-----------------------------------------------------------------
function dynamicTips(i,v){	// this only gets used when info tips are dynamically generated, i.e. pop-ups
	// switch(i){
		// case ".pni-infotip": $(i).attr("title",v); break;
		// case ".rate-infotip": $(i).attr("title",v); break;
		// case ".apr-infotip": $(i).attr("title",v); break;
		// case ".paid-infotip": $(i).attr("title",v); break;
		// case ".paidval-infotip": $(i).attr("title",v); break;
		// case ".diff-infotip": $(i).attr("title",v); break;
		// case ".result-infotip": $(i).attr("title",v); break;
	// }
}
//.................................................................
function updateLang(){	// this is used to update various parts of the language that are unique
	// updates the post field of the below item(s)
	document.getElementById("paidSlider").noUiSlider.updateOptions({
		tooltips: wNumb({decimals: qdata['refi-paid'].decimals, suffix: qdata['refi-paid'].post})
	});
	// updates full list of all fields
	for(i in qdata){ updateDisplay(i,false); }
}