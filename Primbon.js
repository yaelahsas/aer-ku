const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');
const fetch = require('node-fetch')

let body = "#sial 11 05 1999";
console.log(body.trim().split(' '))
var req = body;
var tanggal = req.split(" ")[1];
var kk = req.split(" ")[2];
var bulan = kk.replace("0", "");
var tahun = req.split(" ")[3];
request.post({
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: 'http://www.primbon.com/primbon_hari_naas.php',
    body: "tgl=" + tanggal + "&bln=" + bulan + "&thn=" + tahun + "&submit=+Submit%21+"
}, function(error, response, body) {
    let $ = cheerio.load(body);
    var y = $.html().split('<b>PRIMBON HARI NAAS</b><br><br>')[1];
    var t = y.split('.</i><br><br>')[1];
    var f = y.replace(t, " ");
    var x = f.replace(/<br\s*[\/]?>/gi, "\n\n");
    var h = x.replace(/<[^>]*>?/gm, '');
    var d = h.replace("&amp;", '&')
    console.log("" + d);
})