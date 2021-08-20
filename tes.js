const {
    orderan_tidak_dapat_driver,
    orderan_selesai,
    orderan_dapat_driver
} = require('./lib/aerapi')



// orderan_selesai("https://aerumah.com/api/bot-total_orderan_selesai").then((result) => {
//     console.log(result)
// })
orderan_dapat_driver("https://aerumah.com/api/bot-lihat_orderan_dapat_driver_offline").then((result) => {
    console.log(result)
})