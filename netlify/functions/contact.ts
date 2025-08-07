import type { Handler } from '@netlify/functions';

const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (event.headers['content-type'] !== 'application/json') {
        return { statusCode: 415, body: JSON.stringify({ error: 'Unsupported Content Type' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { fname, lname, email, phone, mensaje } = body;

        const response = await fetch(HUBSPOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
            },
            body: JSON.stringify({
                properties: {
                    firstname: fname,
                    lastname: lname,
                    email,
                    phone,
                    mensaje,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al enviar el contacto a HubSpot:', errorData);
            return { statusCode: 500, body: JSON.stringify({ success: false, error: errorData }) };
        }

        return { statusCode: 200, body: JSON.stringify({ success: true }) };

    } catch (error) {
        console.error('Error interno en la función de contacto:', error);
        return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Internal error' }) };
    }
};