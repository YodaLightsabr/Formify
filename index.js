const fetch = require('node-fetch');
const csv = require('@fast-csv/parse');
function stringToHex (str) {
  const buf = Buffer.from(str, 'utf8');
  return buf.toString('hex');
}
function uuid (item) {
  return `${(new Date(item.Timestamp)).getTime().toString(16)}.${stringToHex((Object.keys(item)[0] > 5 ? Object.keys(item)[0].substring(0, 6) : Object.keys(item)[0].repeat(6).substring(0, 6)).substring(0, 11))}`;
}
class ResponseCollector extends require('events').EventEmitter {
  constructor (spreadsheet, interval) {
    super();
    (async () => {
      let uuids = await spreadsheet.uuids();
      setInterval(async () => {
        const load = await spreadsheet.load();
        const currentUuids = Spreadsheet.uuids(load);
        if (currentUuids.length > uuids.length) {
          uuids = currentUuids;
          this.emit('response', load[load.length - 1]);
        }
      }, interval || 10000);
    })();
  }
}
class Spreadsheet {
  constructor (url) {
    this.url = url;
    this.cache = {};
  }
  load () {
    return new Promise(async (resolve, reject) => {
      const rawData = await (await fetch(this.url)).text();
      const parse = new Promise((res, rej) => {
      const output = [];
      csv.parseString(rawData, { headers: true })
        .on('error', error => rej(error))
        .on('data', row => output.push(row))
        .on('end', rowCount => res(output));
      });
      const data = await parse;
      const parsedData = data.map(item => {
        item['_uuid'] = uuid(item);
        item['_timestamp'] = new Date(item.Timestamp);
        delete item.Timestamp;
        return item;
      });
      this.cache = parsedData;
      resolve(parsedData);
    });
  }
  async uuids () {
    return (await this.load()).map(item => item._uuid);
  }
  static uuids (input) {
    return input.map(item => item._uuid);
  }
  uuid (uuid) {
    return new Promise(async (resolve, reject) => {
      const data = await this.load();
      const selection = data.filter(item => item._uuid == uuid);
      if (selection.length == 1) return resolve(selection[0]);
      if (selection.length > 1) return reject(new Error('More than one of UUID'));
      if (selection.length == 0) return resolve(null);
      if (selection.lnegth < 0) return reject(new Error('Internal error'));
    });
  }
  responseCollector (interval) {
    return new ResponseCollector(this, interval || 10000);
  }
}
module.exports = {
  Spreadsheet: Spreadsheet,
  ResponseCollector: ResponseCollector,
  load: (url) => new Spreadsheet(url).load()
};
