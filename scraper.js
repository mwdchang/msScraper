var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

/**
* Scrapes Morningstar HTML fragments for daily fund price changes
*/

var base = 'http://quotes.morningstar.com/fund/c-header?t=';
var args = process.argv;
var currency = '';

if (args.length < 3 || args.length > 3) {
  console.log('Usage: node scraper.js <config-file>');
  process.exit(1);
}

var file = path.join(__dirname, args[2]);
var config = null;
var gainLoss = 0.0;
var len = 0; // For tracking last fund

/* Main entry point */
fs.readFile(file, 'utf-8', function(err, data) {
  config = JSON.parse(data);
  currency = config.currency || 'CAD';
  len = config.funds.length;
  config.funds.forEach(scrape)
});


function scrape(item, idx) {
  var url = base + item.symbol + '&cur=' + currency;

  request(url, function (error, statusCode, data) {
    var txt = normalize(data);

    /* Find change and change percentage */
    var change = txt.split('|')[0];
    var changePct = txt.split('|')[1];

    /* If amount is specified, calculate gain/loss and overall gain/loss */
    if (item.amount) {
      var diff = (item.amount * +change);
      gainLoss += diff;
      console.log(item.symbol, item.name, change, changePct, diff.toFixed(2));
    } else {
      console.log(item.symbol, item.name, change, changePct);
    }
    len --;

    /* Print out final tally */
    if (len <= 0) {
      console.log('');
      console.log('Gain/Loss', gainLoss.toFixed(2));
    }
  });
}


function normalize(data) {
  /* Scrape html fragment */
  var $ = cheerio.load(data);
  var dayChange = $('[vkey="DayChange"]');
  var txt = dayChange.text();
  txt = txt.replace(/[\s\n]/g, '');
  return txt;
}
