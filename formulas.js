/**************************************************************
	All of the formulas listed came from the site below:
	https://gist.github.com/fscottfoti/ef5b1785b22fc79ee8ba
**************************************************************/
function FV(rate, periods, payment, value, type) {
	// Initialize type
    type = (typeof type === 'undefined') ? 0 : type;

    // Evaluate rate (TODO: replace with secure expression evaluator)
    rate = eval(rate);

    // Return future value
    var result;
    if (rate === 0) {
      result = value + payment * periods;
    } else {
      var term = Math.pow(1 + rate, periods);
      if (type === 1) {
        result = value * term + payment * (1 + rate) * (term - 1.0) / rate;
      } else {
        result = value * term + payment * (term - 1) / rate;
      }
    }
	return -result;
}
//.................................................................
function PMT(rate, periods, present, future, type) {
	// Initialize type
    type = (typeof type === 'undefined') ? 0 : type;

    // Evaluate rate and periods (TODO: replace with secure expression evaluator)
    rate = eval(rate);
    periods = eval(periods);

    // Return payment
    var result;
    if (rate === 0) {
      result = (present + future) / periods;
    } else {
      var term = Math.pow(1 + rate, periods);
      if (type === 1) {
        result = (future * rate / (term - 1) + present * rate / (1 - 1 / term)) / (1 + rate);
      } else {
        result = future * rate / (term - 1) + present * rate / (1 - 1 / term);
      }
    }
	return -result;
}
//.................................................................
function RATE(periods, payment, present, future, type, guess){
	// Initialize guess
    guess = (typeof guess === 'undefined') ? 0.01 : guess;

    // Initialize future
    future = (typeof future === 'undefined') ? 0 : future;

    // Initialize type
    type = (typeof type === 'undefined') ? 0 : type;

    // Evaluate periods (TODO: replace with secure expression evaluator)
    periods = eval(periods);

    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;

    // Set maximum number of iterations
    var iterMax = 50;

    // Implement Newton's method
    var y, y0, y1, x0, x1 = 0, f = 0, i = 0;
    var rate = guess;
    if (Math.abs(rate) < epsMax) {
      y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
    } else {
      f = Math.exp(periods * Math.log(1 + rate));
      y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    }
    y0 = present + payment * periods + future;
    y1 = present * f + payment * (1 / rate + type) * (f - 1) + future;
    i = x0 = 0;
    x1 = rate;
    while ((Math.abs(y0 - y1) > epsMax) && (i < iterMax)) {
      rate = (y1 * x0 - y0 * x1) / (y1 - y0);
      x0 = x1;
      x1 = rate;
      if (Math.abs(rate) < epsMax) {
        y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
      } else {
        f = Math.exp(periods * Math.log(1 + rate));
        y = present * f + payment * (1 / rate + type) * (f - 1) + future;
      }
      y0 = y1;
      y1 = y;
      ++i;
    }
	return rate;
}
//.................................................................
function CUMPRINC(rate, periods, value, start, end, type){
	// Compute cumulative principal
    var payment = PMT(rate, periods, value, 0, type);
    var principal = 0;
    if (start === 1) {
      if (type === 0) {
        principal = payment + value * rate;
      } else {
        principal = payment;
      }
      start++;
    }
    for (var i = start; i <= end; i++) {
      if (type > 0) {
        principal += payment - (FV(rate, i - 2, payment, value, 1) - payment) * rate;
      } else {
        principal += payment - FV(rate, i - 1, payment, value, 0) * rate;
      }
    }

    // Return cumulative principal
	return principal;
}
//.................................................................
function CUMIPMT(rate, periods, value, start, end, type){
	// Evaluate rate and periods (TODO: replace with secure expression evaluator)
    rate = eval(rate);
    periods = eval(periods);

    // Compute cumulative interest
    var payment = PMT(rate, periods, value, 0, type);
    var interest = 0;

    if (start === 1) {
      if (type === 0) {
        interest = -value;
        start++;
      }
    }

    for (var i = start; i <= end; i++) {
      if (type === 1) {
        interest += FV(rate, i - 2, payment, value, 1) - payment;
      } else {
        interest += FV(rate, i - 1, payment, value, 0);
      }
    }
    interest *= rate;

    // Return cumulative interest
	return interest;	
}
//.................................................................
// this is an older version of the APR calculation that doesn't work efficiently to get exact values. Use the newer one.
function oldAPR(nper, pmt, pv, fv, type, guess){
	if (guess == null) guess = 0.01;
	if (fv == null) fv = 0;
	if (type == null) type = 0;

	var FINANCIAL_MAX_ITERATIONS = 128;//Bet accuracy with 128
	var FINANCIAL_PRECISION = 0.0000001;//1.0e-8

	var y, y0, y1, x0, x1 = 0, f = 0, i = 0;
	var rate = guess;
	if (Math.abs(rate) < FINANCIAL_PRECISION) {
		y = pv * (1 + nper * rate) + pmt * (1 + rate * type) * nper + fv;
	} else {
		f = Math.exp(nper * Math.log(1 + rate));
		y = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;
	}
	y0 = pv + pmt * nper + fv;
	y1 = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;

	// find root by Newton secant method
	i = x0 = 0.0;
	x1 = rate;
	while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION) && (i < FINANCIAL_MAX_ITERATIONS)) {
		rate = (y1 * x0 - y0 * x1) / (y1 - y0);
		x0 = x1;
		x1 = rate;

		if (Math.abs(rate) < FINANCIAL_PRECISION) {
			y = pv * (1 + nper * rate) + pmt * (1 + rate * type) * nper + fv;
		} else {
			f = Math.exp(nper * Math.log(1 + rate));
			y = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;
		}

		y0 = y1;
		y1 = y;
		++i;
	}
	return rate;
}
//.................................................................
function APR(nper, pmt, pv, fv, type, guess){
	var type2 = (type) ? 1 : 0;
	var wanted_precision = 0.00000001;
	var current_diff = Number.MAX_VALUE;
	var x, next_x, y, z;
	var max_iterations = 100;
	var iterations_done = 0;
	if(guess == 0){
		x = 0.1;
	}
	else{
		x = guess;
	}
	
	while(current_diff > wanted_precision && iterations_done < max_iterations){
		if(x == 0){
			next_x = x - (pv + pmt * nper + fv) / (pv * nper + pmt * (nper * (nper - 1) + 2 * type2 * nper) / 2);
		}
		else{
			y = Math.pow(1 + x, nper - 1);
			z = y * (1 + x);
			next_x = x * (1 - (x * pv * z + pmt * (1 + x * type2) * (z - 1) + x * fv) / (x * x * nper * pv * y - pmt * (z - 1) + x * pmt * (1 + x * type2) * nper * y));
		}

		iterations_done++;
		current_diff = Math.abs(next_x - x);
		x = next_x;
	}
	
	if(guess == 0 && Math.abs(x) < wanted_precision) x = 0;

	if(current_diff >= wanted_precision){
		return Number.NaN;
	}
	else{
		return x;
	}
};