const fetch = require('node-fetch')

orderan_tidak_dapat_driver = async(url) => {
    let opt = {
        method: 'GET',
    }
    let jos
    await fetch(url, opt)
        .then(res => res.json())
        .then(result => {
            // console.log(result)

            let hasil = result.Hasil
            let wadah = []
            let textnya = ''
            if (hasil.length > 0) {
                hasil.forEach(data => {
                    let nama = data.nama
                    let usaha = data.nama_usaha
                    let text = `Nama ${nama} order ke lapak ${usaha} tidak mendapat driver\n`
                    wadah.push(text)
                    textnya = wadah.join(``)
                });
                jos = textnya
            } else {
                jos = "Belum ada transaksi"
            }


        })
    return jos
}
orderan_selesai = async(url) => {
    let opt = {
        method: 'GET',
    }
    let text = ""
    await fetch(url, opt)
        .then(res => res.json())
        .then(result => {
            console.log(result.Hasil)
            if (result.Hasil > 0) {
                text = `Transaksi hari selesai hari ini ${result.Hasil} Kali`
            } else {
                text = "Belum ada Orderan"
            }

        })
    return text
}
orderan_dapat_driver = async(url) => {
    let opt = {
        method: 'GET',
    }
    let text = ""
    await fetch(url, opt)
        .then(res => res.json())
        .then(result => {

            let hasil = result.Hasil
            let wadah = []
            let textnya = ''
                // console.log(hasil)
            if (hasil.length > 0) {
                hasil.forEach(data => {
                    let nama = data.nama
                    let usaha = data.nama_usaha
                    let status = data.status_order
                    let sts_order = ""
                    switch (status) {
                        case 1:
                            sts_order = "Mencari Driver"
                            break
                        case 2:
                            sts_order = "Mencari Driver"
                            break
                        case 3:
                            sts_order = "Driver Menuju Lapak"
                            break
                        case 4:
                            sts_order = "Sedang diantar driver"
                            break
                        case 5:
                            sts_order = "Selesai"
                            break
                    }
                    let text = `Nama ${nama} order ke lapak ${usaha} Status ${sts_order}\n`
                    wadah.push(text)
                    textnya = wadah.join(``)
                });
                text = textnya
            } else {
                text = "Belum Ada Transaksi"
            }

        })
    return text
}


module.exports = { orderan_tidak_dapat_driver, orderan_selesai, orderan_dapat_driver }