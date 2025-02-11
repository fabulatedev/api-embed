export const config = {
    runtime: 'edge',
}

export async function handler(req: Request) {
    const {
        endpoint,
        body,
        headers,
        method,
    } = await req.json();

    return fetch(endpoint, {
        method: method || 'POST',
        headers: headers || {},
        body: JSON.stringify(body),
    });
}

export default handler;