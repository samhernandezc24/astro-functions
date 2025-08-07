export async function handler(event) {
    const allowedOrigins = [
        'https://heavy-lift.com.mx',
        'https://heavy-lift.netlify.app'
    ];

    const origin = event.headers.origin;
    const corsOrigin = allowedOrigins.includes(origin) ? origin : '';

    const corsHeaders = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };  

    // OPTIONS (preflight request)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    try {
        const data = JSON.parse(event.body);

        if (!data.recaptcha) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Falta el token recaptcha' }) };
        }

        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';

        const requestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const requestBody = new URLSearchParams({
            secret: secret,
            response: data.recaptcha,
        });

        const response = await fetch(recaptchaURL, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody.toString(),
        });

        const responseData = await response.json();

        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(responseData) };
    } catch (error) {
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Internal error' }) };
    }
}