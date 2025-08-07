export async function handler(event) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const NETLIFY_BUILD_HOOK = process.env.NETLIFY_BUILD_HOOK;
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

    if (event.headers['user-agent']?.includes('Netlify')) {
        return { statusCode: 200, headers: corsHeaders, body: 'Ignorado (procesado directamente por Netlify)' }; 
    }

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

        setTimeout(async () => {
            try {
                await fetch(NETLIFY_BUILD_HOOK, {
                    method: 'POST',
                });
                console.log('Netlify build triggered successfully');
            } catch (netlifyError) {
                console.error('Error triggered Netlify build:', netlifyError);
            }
        }, 5000);

        return { statusCode: 200, headers: corsHeaders, body: 'Procesado: Github Actions y Netlify Build disparados 🚀' };
    } catch (error) {
        return { statusCode: 500, headers: corsHeaders, body: `Error al disparar workflow: ${error.message}` };        
    }
}