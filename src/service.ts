export async function getMarkdown(
    payload: any,
    onResp: (resp: string) => void
) {
    const resp = await fetch("/api/proxy", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!(resp.body instanceof ReadableStream)) {
        const data = await resp.text();
        onResp(data);
        return;
    }

    const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        onResp(value);
    }
}
