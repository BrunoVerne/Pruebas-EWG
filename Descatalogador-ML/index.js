const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const baseURL = 'https://www.mercadolibre.com.ar/p/MLA21087858/s?quantity=1&page=1';

const csvWriter = createCsvWriter({
  path: 'datos.csv',  
  header: [
    { id: 'vendedor', title: 'Vendedor' },
    { id: 'precio', title: 'Precio' },
    { id: 'descuento', title: 'Descuento' },
    { id: 'medio_pago', title: 'Medio de Pago' },
  ],
  append: true, 
});

async function getCompetidores(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const competidores = [];

    $('.ui-pdp-buybox.ui-pdp-table__row.ui-pdp-s-table__row').each((i, el) => {
      const vendedor = $(el).find('.ui-pdp-seller__header__info-container__title .ui-pdp-seller__header__title span').text().trim() || 'No disponible';
      const precioTexto = $(el).find('.ui-pdp-price__second-line .andes-money-amount__fraction').first().text().trim();
      const precio = parseInt(precioTexto.replace(/\D/g, ''), 10) || 0;
      const descuento = $(el).find('.andes-money-amount__discount').text().trim() || 'Sin descuento';

      
      let medioPago = 'No especificado';
      const mediosPagoContainer = $(el).find('.ui-pdp-media__body .ui-pdp-family--REGULAR.ui-pdp-media__title').first(); // Solo el primer medio de pago
      if (mediosPagoContainer.length > 0) {
        medioPago = mediosPagoContainer.text().trim();
      }

      
      competidores.push({ vendedor, precio, descuento, medio_pago: medioPago });
    });

    if (competidores.length > 0) {
      
      await csvWriter.writeRecords(competidores);
      console.log('Datos guardados en datos.csv');
    } else {
      console.log('No se encontraron competidores en esta página.');
    }

    
    const nextPageButton = $('.andes-pagination__button--next a');
    if (nextPageButton.length > 0) {
      const nextPageUrl = nextPageButton.attr('href');
      console.log(`Siguiente página encontrada: ${nextPageUrl}`);
      await getCompetidores(nextPageUrl);  
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}


getCompetidores(baseURL);
