const request = require('request-promise');
const cheerio = require('cheerio');

const URL = 'https://www.mercadolibre.com.ar/roku-express-3960-estandar-hd-con-control-remoto-negro-512-mb/p/MLA21087858/s';
const competidores = []; // La idea es guardar todo aca, y listarlo despues en orden por HTML
(async () => {

    const response = await request(URL);

    let $ = cheerio.load(response);

    let competidor = $('div[class="ui-pdp-seller__header__title"] > ').text();
    let precios = $('div[class="ui-pdp-price__second-line"] > [data-testid="price-part"]').text();
    let cuotas = $('div[class="ui-pdp-media__body"] > p[class="ui-pdp-family--REGULAR ui-pdp-media__title"] ').text();
    let envio = $('div[class="ui-pdp-media__body"] > [class="ui-pdp-color--BLACK ui-pdp-family--REGULAR ui-pdp-media__title"]').text();
    


    console.log(competidor);
    console.log(envio);
    console.log(cuotas);           
    console.log(precios);         
  
})()