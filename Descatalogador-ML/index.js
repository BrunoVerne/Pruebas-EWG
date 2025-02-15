const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const baseURL = 'https://www.mercadolibre.com.ar/roku-express-3960-estandar-hd-con-control-remoto-negro-512-mb/p/MLA21087858/s';
const csvWriter = createCsvWriter({
  path: 'competidores.csv',
  header: [
    { id: 'vendedor', title: 'Vendedor' },
    { id: 'precio', title: 'Precio' },
    { id: 'descuento', title: 'Descuento' },
    { id: 'envio', title: 'Envío' },
    { id: 'medio_pago', title: 'Medio de Pago' },
  ],
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
      
      const envioTexto = $(el).find('.ui-pdp-media.ui-pdp-shipping .ui-pdp-media__title').text().trim();
      const envio = envioTexto || 'No especificado';

      // Ajuste en el filtro de medio de pago
      const medioPagoTexto = $(el).find('.ui-pdp-media__body p').filter(function() {
        const text = $(this).text().trim();
        return text.includes('cuotas') || text.includes('Mismo precio');
      }).text().trim() || 'No especificado';

      competidores.push({ 
        vendedor, 
        precio, 
        descuento, 
        envio, 
        medio_pago: medioPagoTexto
      });
    });

    console.table(competidores);

    // Guardar los datos obtenidos
    await csvWriter.writeRecords(competidores);
    console.log('Datos guardados en competidores.csv');

    // Buscar enlace de la siguiente página
    const nextPage = $('.andes-pagination__button--next a').attr('href');

    if (nextPage) {
      // Solo agregar la parte del path, sin repetir el dominio
      console.log(`Siguiente página encontrada: ${nextPage}`);
      await getCompetidores(nextPage);
    } else {
      console.log('No hay más páginas.');
    }
  } catch (error) {
    console.error('Error al obtener los datos:', error.message);
  }
}

(async () => {
  await getCompetidores(baseURL);
})();
