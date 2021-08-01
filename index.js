const wa = require('@open-wa/wa-automate');
const moment = require('moment')
const request = require('request');
const fetch = require('node-fetch');
const MQTT = require("async-mqtt");


wa.create().then(client => start(client));

function start(client) {
    run()

    async function run() {
        const nootif = await MQTT.connectAsync("tcp://test.mosquitto.org:1883")

        console.log("Starting");
        try {
            await nootif.subscribe("aerlapak");
            nootif.on('message', (topic, message) => {
                    console.log(topic, message.toString())
                    client.sendText('6281222354752-1617851635@g.us', message.toString())
                })
                // This line doesn't run until the server responds to the publish

            // This line doesn't run until the client has disconnected without error
            console.log("Done");
        } catch (e) {
            // Do something about it!
            console.log(e.stack);
            process.exit();
        }
    }
    client.onMessage(async message => {
        console.log(message)

        const { type, body, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message
        const { id, pushname } = sender
        const { name } = chat
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const commands = ['#topup', '#sticker', '#stiker', '#halo', '#help', '#Ldriver', '#Llapak', '#ceksaldo', '#Fdriver']
        const cmds = commands.map(x => x + '\\b').join('|')
        const cmd = type === 'chat' ? body.match(new RegExp(cmds, 'gi')) : type === 'image' && caption ? caption.match(new RegExp(cmds, 'gi')) : ''
        if (cmd) {
            if (!isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname))
            if (isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname), 'in', color(name))
            const args = body.trim().split(' ')
            switch (cmd[0]) {
                case '#halo':
                    client.sendText(from, 'Hai')
                    break
                case '#sticker':
                case '#stiker':
                    if (isMedia) {
                        const mediaData = await wa.decryptMedia(message)
                        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (quotedMsg && quotedMsg.type == 'image') {
                        const mediaData = await wa.decryptMedia(quotedMsg)
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
                case '#topup':

                    if (args.length == 3) {
                        const nomor = args[1]
                        const saldo = args[2]
                        var link = "https://aerumah.com/api/driver-tambah_saldo/" + nomor
                        const opts = {
                            method: 'POST',
                            body: new URLSearchParams([
                                ['saldo', saldo]

                            ])
                        }
                        fetch(link, opts)
                            .then(res => res.json())
                            .then(result => {
                                client.sendText(from, `Result ${result.message} \n
                                \n Nama = ${result.nama}
                                \n No Telp = ${nomor}
                                \n Topup = ${saldo}
                                \n Total Saldo = ${result.saldo}`)
                            })


                    }
                    break
                case '#help':
                    client.sendText(from, `
                    🤖 -> Menu Bot AER🤖\n
                    \n🤖  *'#stiker'* Membuat Stiker
                    \n🤖  *'#topup <nomor> <saldo> '* Topup saldo driver aer 
                    \n🤖  *'#ig <url> '* Mendownload Foto / Video IG
                    \n🤖  *'#Ldriver '* Melihat Semua Driver AER
                    \n🤖  *'#Llapak '* Melihat Semua Lapak AER
                    \n🤖  *'#ceksaldo <nomor> '* Melihat Saldo driver aer
                    \n🤖  *'#Fdriver'* Formulir manual driver
                    `)
                    break
                case '#Ldriver':
                    var link = "https://aerumah.com/api/jumlah_driver"
                    const opts = {
                        method: 'GET',
                    }
                    fetch(link, opts)
                        .then(res => res.json())
                        .then(result => {
                            let ar = [];
                            let sem = "";
                            var totalnya = 0
                            var semua = result.semua_driver

                            semua.forEach(function(semua) {
                                var nama = semua.nama_kecamatan
                                var jumlah = semua.jumlah_driver
                                totalnya += jumlah
                                let data = `Nama Kecamatan = ${nama} \nJumlah Driver = ${jumlah}\n\n`
                                ar.push(data)
                                sem = ar.join(``)
                            });

                            client.sendText(from, `LIHAT DRIVER AER\n  Total Semua Driver = ${totalnya}\n ${sem}`)
                        })
                    break
                case '#Llapak':
                    var link = "https://aerumah.com/api/jumlah_lapak"
                    const opt = {
                        method: 'GET',
                    }
                    fetch(link, opt)
                        .then(res => res.json())
                        .then(result => {
                            let ar = [];
                            let sem = "";
                            var totalnya = 0
                            var semua = result.semua_lapak

                            semua.forEach(function(semua) {
                                var nama = semua.nama_kecamatan
                                var jumlah = semua.jumlah_lapak
                                totalnya += jumlah
                                let data = `Nama Kecamatan = ${nama} \nJumlah Lapak = ${jumlah}\n\n`
                                ar.push(data)
                                sem = ar.join(``)
                            });

                            client.sendText(from, `LIHAT LAPAK AER\nTotal Semua Lapak = ${totalnya}\n\n${sem}`)
                        })
                    break
                case '#ceksaldo':
                    if (args.length == 2) {
                        const nomor = args[1]
                        var link = "https://aerumah.com/api/cek_saldo_driver/" + nomor
                        const opt = {
                            method: 'GET'

                        }
                        fetch(link, opt)
                            .then(res => res.json())
                            .then(result => {
                                client.sendText(from, `Result Saldo \n
                                    \n Nama = ${result.driver.nama}
                                    \n No Telp = ${result.driver.no_telp}
                                    \n Saldo = ${result.driver.saldo}
                                   `)
                            })


                    }
                    break
                case '#Fdriver':
                    client.sendText(from, ` === Form Pendaftaran Driver ===
                        \nEmail: 
                        \nNama: 
                        \nNomer telfon: 
                        \nAlamat: 
                        \nJenis kelamin: 
                        \n
                        \nArea orderan
                        \nKecamatan 1: 
                        \nKecamatan 2: 
                        \n
                        \nPlat nomer: 
                        \nWarna kendaraan: 
                        \n
                        \nFoto profil: 
                        \nFoto KTP:
                        \nFoto SIM:
                        \nFoto STNK:
                        \nFoto kendaraan: 
                        \n
                        \nPengalaman driver:`)



            }
        } else {
            if (!isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
            if (isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(name))
        }
        // if (message.body === 'Hi') {
        //   await client.sendText(message.from, '👋 Hello!');
        // }
    });
}

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