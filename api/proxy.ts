export const config = {
    runtime: 'edge',
}

export async function handler(req: Request) {
    const {
        url,
        body,
        headers,
        method,
    } = await req.json();

    return fetch(url, {
        method: method || 'POST',
        headers: headers || {},
        body: JSON.stringify(body),
    });
}

export default handler;