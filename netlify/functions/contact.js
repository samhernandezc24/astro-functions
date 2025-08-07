const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';
export const handler = async (event) => {
    const allowedOrigins = [
        'https://heavy-lift.com.mx',
        'https://heavy-lift.netlify.app'
    ];
    const origin = event.headers.origin || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : '';
    const corsHeaders = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: 'OK' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }
    if (event.headers['content-type'] !== 'application/json') {
        return { statusCode: 415, headers: corsHeaders, body: JSON.stringify({ error: 'Unsupported Content Type' }) };
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
            return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ success: false, error: errorData }) };
        }
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
    }
    catch (error) {
        console.error('Error interno en la función de contacto:', error);
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Internal error' }) };
    }
};
