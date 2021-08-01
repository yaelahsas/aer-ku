const fetch = require('node-fetch');

const opts = {
    method: 'GET',
}

const url = "#ig https://www.instagram.com/p/CDYratCASWX/?ighsid=ig_web_copy_link";
let fix = url.split(' ');
const link = fix[1].split('?');
console.log(link[0] + "?__a=1")
    // fetch('https://www.instagram.com/p/CDYratCASWX/?__a=1', opts)
    //     .then(res => res.json())
    //     .then(result => {
    //         if (result.graphql.shortcode_media.__typename == "GraphImage") {

//             console.log(result.graphql.shortcode_media.display_url)
//         } else {
//             console.log(result.graphql.shortcode_media.edge_sidecar_to_children.edges.length)

//         }
//         // console.log(result.graphql)
//     })

async function getUserAsync(link) {
    await fetch(link, { method: 'GET' })
        .then(res => res.json())
        .then(result => {
            if (result.graphql.shortcode_media.__typename == "GraphImage") {

                console.log(result.graphql.shortcode_media.display_url)
            } else {
                console.log(result.graphql.shortcode_media.edge_sidecar_to_children.edges.length)

            }
            // console.log(result.graphql)
        })
}
getUserAsync('https://www.instagram.com/p/CDYratCASWX/?__a=1')

fetch('https://www.instagram.com/p/CDYratCASWX/?utm_source=ig_web_copy_link&__a=1', { method: 'GET' })
    .then(res => res.json())
    .then(result => {
        if (result.graphql.shortcode_media.__typename == "GraphImage") {
            console.log(result.graphql.shortcode_media.display_url)
                //client.sendText(from, "Terdeteksi Gambar ...")
                //client.sendFileFromUrl(from, result.graphql.shortcode_media.display_url, "images.jpg", "Berhasil Download")
        } else if (result.graphql.shortcode_media.__typename == "GraphVideo") {
            //client.sendText(from, "Terdeteksi Video ...")
            //client.sendFileFromUrl(from, result.graphql.shortcode_media.video_url, "video.mp4", "Berhasil Download")
        } else if (result.graphql.shortcode_media.__typename == "GraphSidecar") {
            var length = result.graphql.shortcode_media.edge_sidecar_to_children.edges;

            var isi = result.graphql.shortcode_media.edge_sidecar_to_children.edges.node;
            //  client.sendText(from, `Terdeteksi ada ${length}`);
            length.forEach(nodes => {

                if (nodes.node.__typename == "GraphImage") {
                    console.log(nodes.node.display_url)
                } else {
                    console.log(nodes.node.video_url)
                }
            })


            console.log(result.graphql.shortcode_media.edge_sidecar_to_children.edges.length)

        } else {

        }
        // console.log(result.graphql)
    })