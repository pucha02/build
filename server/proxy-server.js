const express = require('express');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan'); // Подключаем morgan для логирования запросов

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Логирование всех входящих запросов

// Конфигурация для KeyCRM
const KEYCRM_API_URL = 'https://openapi.keycrm.app';
const KEYCRM_TOKEN = 'Y2Q1MTIxNzU4ZTIxZjFjZmIzYTdkZDg0YWM1NGU2NjBhMGQ1OGI2NQ';

// Конфигурация для WooCommerce
const WOOCOMMERCE_URL = 'https://wowmom.store/wp-json/wc/v3';
const WC_CONSUMER_KEY = 'ck_03ccd1be08f60d6cb5514c161070a396ac1a6735';
const WC_CONSUMER_SECRET = 'cs_dbb6bcc84b642b9a6070d61799984ae4be4b26fe';

// Прокси для KeyCRM API
app.use('/api', async (req, res) => {
  const targetUrl = `${KEYCRM_API_URL}${req.url}`;
  console.debug(`KeyCRM: ${req.method} ${targetUrl}`);
  try {
    const response = await axios({
      url: targetUrl,
      method: req.method,
      headers: {
        Authorization: `Bearer ${KEYCRM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: req.body,
    });
    console.debug(`KeyCRM Response:`, response.data);
    res.json(response.data);
  } catch (error) {
    console.error(`KeyCRM Error (${targetUrl}):`, error.message);
    if (error.response) {
      console.error("KeyCRM Error Details:", JSON.stringify(error.response.data, null, 2));
      res.status(error.response.status).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

// Прокси для WooCommerce API
app.use('/wp', async (req, res) => {
  const targetUrl = `${WOOCOMMERCE_URL}${req.url}`;
  console.debug(`WooCommerce: ${req.method} ${targetUrl}`);
  try {
    const response = await axios({
      url: targetUrl,
      method: req.method,
      params: req.query,
      data: req.body,
      auth: {
        username: WC_CONSUMER_KEY,
        password: WC_CONSUMER_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.debug(`WooCommerce Response:`, response.data);
    res.json(response.data);
  } catch (error) {
    console.error(`WooCommerce Error (${targetUrl}):`, error.message);
    if (error.response) {
      console.error("WooCommerce Error Details:", JSON.stringify(error.response.data, null, 2));
      res.status(error.response.status).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

app.listen(5000, () =>
  console.log('Прокси-сервер запущен на http://91.235.128.80')
);
