# Formify
Get Google Forms results in Node.js

## Setup
1. Make a Google Form
2. Send responses to a Google Sheet
3. File > Share > Publish to the web
4. Copy `.csv` URL

## Fetch responses
This is the simplest way to load responses.
```js
const { Spreadsheet } = require('google-formify');
const spreadsheet = new Spreadsheet('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5_Tq3nv**********************************************************************/pub?gid=1409162307&single=true&output=csv');
spreadsheet.load().then(console.log);
```

## Collect responses
You can collect responses by checking every 10 seconds and logging new ones to the console.
```js
const { Spreadsheet } = require('google-formify');
const spreadsheet = new Spreadsheet('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5_Tq3nv**********************************************************************/pub?gid=1409162307&single=true&output=csv');
spreadsheet.responseCollector(10000).on('response', console.log);
```

## Get UUIDs
UUIDs are unique identifiers added to each response that will always be the same for each response and always be unique from other responses.
```js
const { Spreadsheet } = require('google-formify');
const spreadsheet = new Spreadsheet('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5_Tq3nv**********************************************************************/pub?gid=1409162307&single=true&output=csv');
spreadsheet.uuids().then(console.log);
```
