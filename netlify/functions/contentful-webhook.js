export async function handler(event) {
    const body = JSON.parse(event.body || '{}');
    const eventId = body.sys?.id;
    if (!eventId) return { statusCode: 400, body: 'Payload inválido' };

    if (globalThis.processedEvents?.has(eventId)) {
        return { statusCode: 200, body: `Evento ${eventId} ya procesado.` };
    }
    globalThis.processedEvents = globalThis.processedEvents || new Set();
    globalThis.processedEvents.add(eventId);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const NETLIFY_BUILD_HOOK = process.env.TRIGGER_NETLIFY === 'true' ? process.env.NETLIFY_BUILD_HOOK : null;
    const REPO = 'samhernandezc24/hl_website';

    const allowedOrigins = ['https://heavy-lift.com.mx', 'https://heavy-lift.netlify.app'];
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
            body: JSON.stringify({ event_type: 'contentful-update' }),
        });

        if (NETLIFY_BUILD_HOOK) {
            setTimeout(async () => {
                try {
                    await fetch(NETLIFY_BUILD_HOOK, { method: 'POST' });
                    console.log('Netlify build ejecutado para evento:', eventId);
                } catch (error) {
                    console.error('Error en Netlify build:', error);
                }
            }, 5000);
        }

        return { statusCode: 200, headers: corsHeaders, body: `Procesado: Evento ${eventId} enviado a GitHub${NETLIFY_BUILD_HOOK ? ' y Netlify' : ''}`  };
    } catch (error) {
        return { statusCode: 500, headers: corsHeaders, body: `Error al procesar evento ${eventId}: ${error.message}` };
    }
}