export async function handler(event) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'samhernandezc24/hl_website';

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

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
    }

    try {
        await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                event_type: 'contentful-update',
            }),
        });

        return { statusCode: 200, headers: corsHeaders, body: 'Workflow disparado exitosamente 🚀' };
    } catch (error) {
        return { statusCode: 500, headers: corsHeaders, body: `Error al disparar workflow: ${error.message}` };        
    }
}