const curl = require('axios');

curl.get('https://api.kawalcorona.com/indonesia/provinsi/')
    .then(function(response) {
        response.data.map(corona => {
            let prov = corona.attributes.Provinsi;
            console.log(prov);
        });

    })
    .catch(function(error) {
        console.log(error);
    });