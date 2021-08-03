const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');
const fetch = require('node-fetch')
var FormData = require('form-data');

// let body = "#sial 11 05 1999";
// console.log(body.trim().split(' '))
// var req = body;
// var tanggal = req.split(" ")[1];
// var kk = req.split(" ")[2];
// var bulan = kk.replace("0", "");
// var tahun = req.split(" ")[3];
// request.post({
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     url: 'http://www.primbon.com/primbon_hari_naas.php',
//     body: "tgl=" + tanggal + "&bln=" + bulan + "&thn=" + tahun + "&submit=+Submit%21+"
// }, function(error, response, body) {
//     let $ = cheerio.load(body);
//     var y = $.html().split('<b>PRIMBON HARI NAAS</b><br><br>')[1];
//     var t = y.split('.</i><br><br>')[1];
//     var f = y.replace(t, " ");
//     var x = f.replace(/<br\s*[\/]?>/gi, "\n\n");
//     var h = x.replace(/<[^>]*>?/gm, '');
//     var d = h.replace("&amp;", '&')
//     console.log("" + d);
// })

var options = {
    'method': 'POST',
    'url': 'http://bkd.banyuwangikab.go.id/cpns2021/cpns/seleksi_administrasi',
    'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'ci_session=a%3A5%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%2221839e0ccc3c183faafe03290aaf7476%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A13%3A%22114.79.18.167%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A21%3A%22PostmanRuntime%2F7.26.8%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1627954486%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3B%7D39677b9d68ab56cb7d45ade43985f690f65ede65'
    },
    form: {
        'no_registrasi': '3510091105990002'
    }
};
request(options, function(error, response) {
    if (error) throw new Error(error);
    let $ = cheerio.load(response.body);
    let v = $.html($('span')).split('<span style="font-weight: bold; ">')[1];
    // var y = $.html().split('<div class="modal-body">')[1];
    var x = v.replace(/<span\s*[\/]?>/gi, "\n\n");
    var z = x.split('</span><span style="font-weight: bold;">')
    var nama = x.split('</span>')
        // var z = x.split('  <span style="font-weight: bold;">')[1];
        // var f = y.replace(x, " ");
        // var q = f.replace(z, " ")
    var fixnama = nama[2].replace('<span style="font-weight: bold;">', " ")
    var instutisi = nama[4].replace('<span style="font-weight: bold;">', " ")
    var pilihan = nama[6].replace('<span style="font-weight: bold;">', " ")
    var status = nama[8].replace('<span style="font-weight: bold; text-decoration:underline; color: green">', " ").replace('                    ', "").replace('\n', "")
    var pesan = nama[9].replace('<span style="font-weight: bold;">', " ")
    var fix = pesan.replace('<span style="font-style: italic; font-size: 8pt; display:block;">', " ")
    var fix2 = fix.replace(' <a href="https://https://sscasn.bkn.go.id//">sscasn.bkn.go.id</a>', " ")
    console.log(nama)
    console.log(`Nama = ${fixnama}\nTempat = ${instutisi}\nPilihan = ${pilihan}\nStatus = ${status}\nNOTE : ${fix2}*`)
});