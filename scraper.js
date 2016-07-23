var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

/**
* Scrapes Morningstar HTML fragments for daily fund price changes
*/

var base = 'http://quote.morningstar.com/fund/chart.aspx?t=';
// var base = 'http://quotes.morningstar.com/fund/c-header?t=';
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

  len = config.portfolio.map(function(p) { return p.funds.length; }).reduce(function(a, b) { return a+b;});

  config.portfolio.forEach(function(p) {
    p.funds.forEach(function(f) {
      scrape(f, p.name);
    });
  });

});

var result = [];


function scrape(item, port) {
  var url = base + item.symbol + '&cur=' + currency;

  request(url, function (error, statusCode, data) {
    var txt = normalize(data);

    /* Find change and change percentage */
/*
    var change = txt.split('|')[0];
    var changePct = txt.split('|')[1];
*/
    var today = txt.split(',')[0].split(':')[1];
    var yesterday = txt.split(',')[1].split(':')[1];

    today = today.replace(/"/g, '');
    yesterday = yesterday.replace(/"/g, '');


    var change = (today - yesterday).toFixed(2);
    var changePct = (100*change / yesterday).toFixed(2);



    /* If amount is specified, calculate gain/loss and overall gain/loss */
    if (item.amount) {
      var diff = (item.amount * +change);
      gainLoss += diff;
      console.log(port, item.symbol, item.name, change, changePct, diff.toFixed(2));
    } else {
      console.log(port, item.symbol, item.name, change, changePct);
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
  var l = data.split('\n')[11];
  var x = l.lastIndexOf('LastPrice');
  var y = l.lastIndexOf('PercentChg');

  return  l.substr(x, (y-x)-1);

  /* Scrape html fragment */
/*
  var $ = cheerio.load(data);
console.log('!!', data);
  var dayChange = $('[vkey="DayChange"]');
  var txt = dayChange.text();
console.log('!!', txt);
  txt = txt.replace(/[\s\n]/g, '');
  return txt;
*/
}
