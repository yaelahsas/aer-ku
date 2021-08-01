const fetch = require('node-fetch')
const request = require('request')

let a = '#tw https://twitter.com/sangatbagus/status/1290180600343736321?s=09';
let b = a.trim().split(' ')
let c = b[1].split('/status/')
let fix = c[1].split('?s=')[0]
console.log(fix)

fetch(`https://api.twitter.com/1.1/statuses/show/${fix}.json?include_entities=true`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAKkcGgEAAAAAtvJLVqAFmsugC1%2Bb%2FhOtI3ryufk%3DAAobexqKStUkEuy6mRnFzKFava6uTmFUCqbGoDQwCmXLTuPx1X'
        }
    }).then(resp => resp.json())
    .then(result => {
        let arr = result.extended_entities.media[0].video_info.variants;
        let panjang = arr.length;

        let sort = arr.sort((a, b) => (a.bitrate > b.bitrate) ? 1 : -1)
        console.log(sort[panjang - 1])

    }).catch(function(err) {
        console.log('error = ' + err)
    })