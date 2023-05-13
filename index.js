import * as dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';

if ( process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redirect_uri =  'https://afa9-2806-10be-4-fcc6-55c5-4658-896a-4a45.ngrok-free.app/auth_mercado_libre';

app.get('/', (req, res) => {
    res.redirect(`https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=${ process.env.ML_APP_ID}&redirect_url=${redirect_uri }`);
});

app.get('/auth_mercado_libre', async ( req, res ) => {
    let code = req.query.code;

    let body = {
        grant_type: 'authorization_code',
        client_id: process.env.ML_APP_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        code,
        redirect_uri
    };

    let response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers:  {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(200).json({ response: 'success', data });
});


app.get('/categorizar', async (req, res) => {

    let response = await fetch('https://api.mercadolibre.com/sites/MLM/categories', {
        headers: {
            Authorization: `Bearer ${ process.env.ACCESS_TOKEN }`
        }
    });

    const data =  await response.json();

    res.status(200).json({ response: 'success', data });
});


app.get('/detalles_categoria', async (req, res) => {
    let response = await fetch('https://api.mercadolibre.com/categories/MLM437572',{
        headers: {
            Authorization: `Bearer ${ process.env.ACCESS_TOKEN}`
        }
    });

    const data = await response.json();

    res.status(200).json({ response: 'success', data });
});

app.get('/busqueda_predictiva', async (req, res) => {
    const body = req.body;

    let response = await fetch(`https:/api.mercadolibre.com/sites/MLM/search?q=${ body.search_query}`, {
        headers: {
            Authorization: `Bearer ${ process.env.ACCESS_TOKEN }`
        }
    });

    const data = await response.json();

    res.status(200).json({ response: 'success', data });

})


app.post('/publish_product', async (req, res) => {

    // Creamos un objeto con la informacion del producto

    let body = {
        title: 'Item de test- No ofertar',
        category_id: 'MLM417835',
        price: '600',
        currency_id : 'MXN',
        available_quantity: 10,
        buying_mode: 'buy_it_now',
        condition: 'new',
        listing_type_id: 'gold_special',
        pictures: [
            {
                source: ''
            }
        ],
        attributes:[
            {
                id: 'BRAND',
                value_name: 'dahua'
            },
            {
                id: 'EAN',
                value_name: '7898095297749'
            }
        ]
    };

    let response = await fetch('https://api.mercadolibre.com/items', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${ process.env.ACCESS_TOKEN}`
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    res.status(200).json({ response: 'success', data });

});

app.listen(process.env.PORT, () => {
    console.log(`El servidor esta corriendo en el puerto ${ process.env.PORT}`);
})