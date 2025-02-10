export async function getExplanationMarkdown(
    codeFiles: { filename: string; code: string }[],
    onResp: (resp: string) => void
) {
    onResp("*Loading...*");
    onResp("```");
    onResp("Loading explanation...");
    onResp("```");
    return;
    const resp = await fetch("/api/explain", {
        method: "POST",
        body: JSON.stringify(codeFiles),
    });

    const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        onResp(value);
    }
}
