msScraper
===
A scraper for getting information out of Morningstar using nodeJS. This is just a quick way to grab funds' daily price changes, without browsing across multiple pages or even multiple web sites. In addition it provides optional functionality to calculate daily gain and loss of your portfolio.



Install Dependencies
---
msScraper primarily uses `reqest` and `cheerio` packages for sending request and parsing response.
```
npm install
```

Configuration
---
The scraper consumes a JSON configuration file that specifies the funds you want to search in a JSON array.

```
{
  "currency": "CAD"           /* Currency code */
  "funds":[
     {
       "symbol": "FN00001",   /* Fund symbol in Morningstar */
       "name": "Fund XYZ"     /* The name to be displayed */
     },
     {
       "symbol": "FN00002",
       "name": "Fund ZZZ",
       "amount": 100.75      /* Optional. Amount of shares */
     },
     ...
  ]
}
```
You can add an option field `amount` to indicate the # of shares, which will be used to calculate the aggregated gain/loss of all funds specified in the configuration.

Running msScraper
---
```
node scraper.js <configuration_file>
```
**Example**

`cat example.json`
```
{
  "currency": "USD",
  "funds": [
     { "symbol": "FOUSA06OMI", "name": "Horizon Crd Oil", "amount": 500},
     { "symbol": "F0CAN05LUB", "name": "RBC Conservative"}
  ]
}
```

`node scraper.js example.json`

```
F0CAN05LUB RBC Conservative 0.02 0.14
FOUSA06OMI Horizon Crd Oil -1.45 -12.52 -725.00

Gain/Loss -725.00
```
Shows symbol, name, price change, price change %, and gain/loss if amount is provided
