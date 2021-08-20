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

            if (result.Hasil.length > 0) {
                text = `Transaksi hari ini ${result.Hasil}`
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

                    let text = `Nama ${nama} order ke lapak ${usaha} Status ${status}\n`
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