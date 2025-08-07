export async function handler(event) {
    try {
        const data = JSON.parse(event.body);

        if (!data.recaptcha) {
            return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Falta el token recaptcha' }) };
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

        return { statusCode: 200, body: JSON.stringify(responseData) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Internal error' }) };
    }
}