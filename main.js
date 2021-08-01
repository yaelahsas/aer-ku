const { create, decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs-extra')
const moment = require('moment')
const fbdown = require('fb-video-downloader');
const cheerio = require('cheerio');
const request = require('request');
const fetch = require('node-fetch');
const tiktok = require('./lib/tiktok');
const puppeteer = require("puppeteer");


// inisialisasi server option
const serverOption = {
    headless: false,
    qrRefreshS: 20,
    qrTimeout: 0,
    authTimeout: 0,
    autoRefresh: true,
    devtools: false,
    cacheEnabled: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
}

//inisialisai tempat chrome
const opsys = process.platform;
if (opsys == "win32" || opsys == "win64") {
    serverOption['executablePath'] = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
} else if (opsys == "linux") {
    serverOption['browserRevision'] = '737027';
} else if (opsys == "darwin") {
    serverOption['executablePath'] = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

//inisialisasi fungsi untuk start server wa
const startServer = async(from) => {
    create('Imperial', serverOption)
        .then(client => {
            console.log('[SERVER] Server Started!')

            // Force it to keep the current session
            client.onStateChanged(state => {
                console.log('[State Changed]', state)
                if (state === 'CONFLICT') client.forceRefocus()
            })

            client.onMessage((message) => {
                msgHandler(client, message)
            })
        })
}

async function msgHandler(client, message) {
    try {
        //  console.log(message)
        const { type, body, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message
        const { id, pushname } = sender
        const { name } = chat
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const commands = ['#sticker', '#stiker', '#halo', '#fb', '#pasangan', '#cekresi', '#nama', '#tiktok', '#kick', '#ig', '#help', '#sial', '#tw']
        const cmds = commands.map(x => x + '\\b').join('|')
        const cmd = type === 'chat' ? body.match(new RegExp(cmds, 'gi')) : type === 'image' && caption ? caption.match(new RegExp(cmds, 'gi')) : ''

        if (cmd) {
            if (!isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname))
            if (isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname), 'in', color(name))
            const args = body.trim().split(' ')
            switch (cmd[0]) {
                case '#sticker':
                case '#stiker':
                    if (isMedia) {
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (quotedMsg && quotedMsg.type == 'image') {
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (args.length == 2) {
                        var isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
                        const url = args[1]
                        if (url.match(isUrl)) {
                            await client.sendStickerfromUrl(from, url, { method: 'get' })
                                .catch(err => console.log('Caught exception: ', err))
                        } else {
                            client.sendText(from, 'Url yang kamu kirim tidak valid')
                        }
                    } else {
                        client.sendText(from, 'Tidak ada gambar! Untuk membuat sticker kirim gambar dengan caption #stiker')
                    }
                    break
                case '#halo':
                    client.sendText(from, 'Hai')
                    break
                case '#fb':
                    if (args.length == 2) {
                        const vidURL = args[1]
                        fbdown.getInfo(vidURL)
                            .then((info) => {

                                if (info.download.hd !== undefined) {
                                    client.sendFileFromUrl(from, info.download.hd, "video.mp4", "HD Video successfully downloaded")
                                } else if (info.download.hd == undefined) {
                                    client.sendFileFromUrl(from, info.download.sd, "video.mp4", "SD Video successfully downloaded")
                                } else {
                                    client.reply(from, "Can't access given Video URL.", message)
                                }
                            })
                    } else {
                        client.reply(from, "#fb [url video]", message)
                    }
                    break
                case '#pasangan':

                    if (args.length == 4) {

                        const namamu = args[1]
                        const pasangan = args[3]
                        request.get({
                            headers: { 'content-type': 'application/x-www-form-urlencoded' },
                            url: 'http://www.primbon.com/kecocokan_nama_pasangan.php?nama1=' + namamu + '&nama2=' + pasangan + '&proses=+Submit%21+',

                        }, function(error, response, body) {
                            let $ = cheerio.load(body);
                            var y = $.html().split('<b>KECOCOKAN JODOH BERDASARKAN NAMA PASANGAN</b><br><br>')[1];
                            var t = y.split('.<br><br>')[1];
                            var f = y.replace(t, " ");
                            var x = f.replace(/<br\s*[\/]?>/gi, "\n");
                            var h = x.replace(/<[^>]*>?/gm, '');
                            var d = h.replace("&amp;", '&')

                            client.sendText(from, `${d}`)
                        });

                    } else {
                        client.sendText(from, "Contoh #pasangan anda & dia")
                    }
                    break
                case '#cekresi':
                    if (args.length == 3) {
                        var nomor = args[1];
                        var kurir = args[2];
                        if (nomor.length === 0) {
                            client.sendText(from, "nomor resi belum diisi");
                        }
                        if (kurir.length === 0) {
                            client.sendText(from, "kurir belum diisi");
                        } else {
                            const cekResi = (courier, waybill) => new Promise(async(resolve, reject) => {
                                const opts = {
                                    method: 'POST',
                                    headers: {
                                        key: 'e079daba710176abe3c4e8edf375cb8e',
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    body: new URLSearchParams([
                                        ['waybill', waybill],
                                        ['courier', courier]
                                    ])
                                }

                                fetch('https://pro.rajaongkir.com/api/waybill', opts)
                                    .then(res => res.json())
                                    .then(result => {
                                        if (result.rajaongkir.status.code == 400) {
                                            let error = result.rajaongkir.status.description.split("Invalid waybill.")

                                            client.sendText(from, `${error[1]}`)
                                        } else {
                                            let ar = [];
                                            let sem = "";
                                            console.log(``)
                                            result.rajaongkir.result.manifest.map(data => {
                                                let send = `\nDeskripsi : ${data.manifest_description}\nTanggal : ${data.manifest_date}\nWaktu : ${data.manifest_time}\nKota  : ${data.city_name}\n------------------------------------------`
                                                ar.push(send);
                                                sem = ar.join(``)
                                            })
                                            client.sendText(from, `Kurir: ${result.rajaongkir.result.summary.courier_name}\nStatus  : ${result.rajaongkir.result.summary.status}
                                            ${sem}`);
                                        }

                                        resolve(result.rajaongkir)
                                    })
                                    .catch(err => reject(err))

                            })
                            cekResi(kurir, nomor);

                        }
                    } else {
                        client.sendText(from, "#cekresi noresi kurir");
                    }
                    break
                case '#nama':
                    if (args.length > 1) {
                        var nama = body.trim().split("#nama ")[1];
                        var req = nama.replace(/ /g, "+");
                        request.get({
                            headers: { 'content-type': 'application/x-www-form-urlencoded' },
                            url: 'http://www.primbon.com/arti_nama.php?nama1=' + req + '&proses=+Submit%21+',
                        }, function(error, response, body) {
                            let $ = cheerio.load(body);
                            var y = $.html().split('arti:')[1];
                            var t = y.split('method="get">')[1];
                            var f = y.replace(t, " ");
                            var x = f.replace(/<br\s*[\/]?>/gi, "\n");
                            var h = x.replace(/<[^>]*>?/gm, '');
                            client.sendText(from, `!Arti Nama ${nama}\n${h}`);

                        })
                    } else {
                        client.sendText(from, "#nama nama anda");
                    }
                    break
                case '#tiktok':
                    if (args.length == 2) {
                        const url = args[1]
                        if (url.match(isUrl) && url.includes('tiktok.com')) {
                            client.sendText(from, "Tunggu ....")
                            const videoMeta = await tiktok(url)

                            const filename = videoMeta.authorMeta.name + '.mp4'
                            await client.sendFile(from, videoMeta.videobase64, filename, videoMeta.NoWaterMark ? '' : 'Maaf, video tanpa watermark tidak tersedia')
                                .then(await client.sendText(from, `Berhasil..\n\nUsername: ${videoMeta.authorMeta.name} Tunggu masih di Proses.. `))
                                .catch(err => console.log('Caught exception: ', err))
                        } else {
                            client.sendText(from, 'Maaf, Url yang kamu kirim tidak valid')
                        }
                    }
                    break
                case '#kick':
                    if (args.length == 2) {
                        if (isGroupMsg) {
                            const kicc = message.mentionedJidList[0];
                            console.log("yang di tag = " + kicc)
                            client.removeParticipant(from, kicc)
                                .catch(err => client.sendText(from, "Al-Fatihah untuk yang ter-Kick"))

                        }

                    } else {
                        client.sendText(from, 'Maaf, Bot Bukan Admin')
                    }
                    break
                case '#ig':
                    if (args.length == 2) {
                        const link = args[1].split('?');
                        const fix = link[0] + "?__a=1";
                        var isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
                        if (fix.match(isUrl)) {
                            const opts = {
                                method: 'GET',
                            }

                            fetch(fix, opts)
                                .then(res => res.json())
                                .then(result => {
                                    if (result.graphql.shortcode_media.__typename == "GraphImage") {
                                        console.log(result.graphql.shortcode_media.display_url)
                                        client.sendText(from, "Terdeteksi Gambar ...")
                                        client.sendFileFromUrl(from, result.graphql.shortcode_media.display_url, "images.jpg", "Berhasil Download")
                                    } else if (result.graphql.shortcode_media.__typename == "GraphVideo") {
                                        client.sendText(from, "Terdeteksi Video ...")
                                        client.sendFileFromUrl(from, result.graphql.shortcode_media.video_url, "video.mp4", "Berhasil Download")
                                    } else if (result.graphql.shortcode_media.__typename == "GraphSidecar") {
                                        var length = result.graphql.shortcode_media.edge_sidecar_to_children.edges;
                                        client.sendText(from, `Terdeteksi ada ${length.length}`);

                                        length.forEach(nodes => {
                                            if (nodes.node.__typename == "GraphImage") {
                                                // console.log(nodes.node.display_url)
                                                client.sendFileFromUrl(from, nodes.node.display_url, "images.jpg", "Berhasil Download")


                                            } else {
                                                //  console.log(nodes.node.video_url)
                                                client.sendFileFromUrl(from, nodes.node.video_url, "video.mp4", "Berhasil Download")

                                            }
                                        })

                                    } else {
                                        client.sendText(from, "Username Private ")

                                    }
                                    // console.log(result.graphql)
                                })
                        } else {
                            client.sendText(from, "Url Salah")
                        }

                    } else {
                        client.reply(from, "#ig [url]", message)
                    }
                    break
                case '#help':
                    client.sendText(from, `
                    🍻 -> Menu Bot 🍻\n
                    \n🧷  *'#stiker'* Membuat Stiker
                    \n🧷  *'#fb '* Download video Fb 
                    \n🧷  *'#nama <nama>'* Arti Nama 
                    \n🧷  *'#pasangan <anda> <dia> '* Kecocokan Hubungan Kalian
                    \n🧷  *'#ig <url> '* Mendownload Foto / Video IG
                    \n🧷  *'#cekresi <noresi> <kurir> '* Cek resi 
                    `)
                    break
                case '#sial':
                    if (args.length == 4) {
                        var tanggal = args[1];
                        var kk = args[2];
                        var bulan = kk.replace("0", "");
                        var tahun = args[3];
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
                            client.sendText(from, `${d}`)
                        })
                    } else {
                        client.sendText(from, "#sial tgl bln thn")
                    }
                    break
                case '#tw':
                    if (args.length == 2) {
                        var link = args[1].split('/status/')[1].split('?s=')[0];
                        console.log(link)

                        fetch(`https://api.twitter.com/1.1/statuses/show/${link}.json?include_entities=true`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAKkcGgEAAAAAtvJLVqAFmsugC1%2Bb%2FhOtI3ryufk%3DAAobexqKStUkEuy6mRnFzKFava6uTmFUCqbGoDQwCmXLTuPx1X'
                                }
                            }).then(resp => resp.json())
                            .then(result => {
                                let arr = result.extended_entities.media[0].video_info.variants;


                                let sort = arr.sort((a, b) => (a.bitrate > b.bitrate) ? 1 : -1)
                                console.log(sort)

                                client.sendText(from, "Video ditemukan ...")

                                if (sort.content_type == "video/mp4") {
                                    let sort = arr.sort((a, b) => (a.bitrate > b.bitrate) ? 1 : -1)
                                    var mp4 = sort[arr.length - 1].url
                                    console.log(mp4)
                                    client.sendText(from, "Video ditemukan ...")
                                    client.sendFileFromUrl(from, mp4, "video.mp4", "Video Sukses Download")
                                }


                            }).catch(function(err) {
                                client.sendText(from, "Video tidak di temukan")
                                console.log('error = ' + err)
                            })
                    } else {
                        client.sendText(from, "#tw <url>")
                    }
                    break

            }
        } else {
            if (!isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
            if (isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(name))
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}

//menangkap error
process.on('Something went wrong', function(err) {
    console.log('Caught exception: ', err);
});

function color(text, color) {
    switch (color) {
        case 'red':
            return '\x1b[31m' + text + '\x1b[0m'
        case 'yellow':
            return '\x1b[33m' + text + '\x1b[0m'
        default:
            return '\x1b[32m' + text + '\x1b[0m' // default is green
    }
}

//memulai server
startServer()