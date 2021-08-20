const {
    orderan_tidak_dapat_driver,
    orderan_selesai,
    orderan_dapat_driver
} = require('./lib/aerapi')
    // const os = require('os');


// console.log(os.cpus());
// console.log(os.totalmem());
// console.log(os.freemem())
var os = require('os-utils');

os.cpuUsage(function(v) {
    console.log('CPU Usage (%): ' + v);
});