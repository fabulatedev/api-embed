
function getMessagesFromPrompt(prompt: string[]) {
    return prompt.map(message => ({
        role: "user",
        content: message,
    }));
}

const llmConfig = {
    model: 'gpt-4o-mini',
    temperature: 0,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
}

export const getLLMResponse = async (prompt: string[], model = llmConfig.model, stream = false, header = '', footer = '') => {
    const fetchReq = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Api-Key": `${process.env.AZURE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            messages: getMessagesFromPrompt(prompt),
            ...llmConfig,
            stream,
        }),
    }
    const res = await fetch(`https://fabulate-east-us-2.openai.azure.com/openai/deployments/${model}/chat/completions?api-version=2024-08-01-preview`, fetchReq);
    if (!res.ok) {
        throw new Error(`Failed to fetch response from OpenAI: ${res.statusText}`);
    }

    if (stream) {
        return sendStreamResponse(res, header, footer);
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    return new Response(`${header}\n${content}\n${footer}`);
}

// Transform the response from OpenAI into a plain text stream response
// by parsing the json blobs and extract the delta content
function sendStreamResponse(res: Response, header = '', footer = '') {
    const reader = res.body.getReader();
    const textDecoder = new TextDecoder("utf-8");
    const textEncoder = new TextEncoder();

    // 2) Transform the OpenAI SSE (Server-Sent Events) stream into a text stream
    const stream = new ReadableStream({
        async start(controller) {
            // Add a header to the stream
            if (header) {
                const headerChunk = textEncoder.encode(header);
                controller.enqueue(headerChunk);
            }
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Add a footer to the stream
                        if (footer) {
                            const footerChunk = textEncoder.encode(footer);
                            controller.enqueue(footerChunk);
                        }
                        controller.close();
                        break;
                    }
                    // Decode the chunk
                    const chunk = textDecoder.decode(value, { stream: true });

                    // The data is sent as lines starting with "data:"
                    const lines = chunk.split("\n").map((line) => line.trim());

                    for (let line of lines) {
                        if (!line.startsWith("data: ") || line === "data: [DONE]") {
                            continue;
                        }
                        const jsonStr = line.replace(/^data:\s*/, "");
                        try {
                            const parsed = JSON.parse(jsonStr);
                            const textDelta = parsed.choices?.[0]?.delta?.content;
                            if (textDelta) {
                                // ENCODE the string into a Uint8Array before enqueuing
                                const queueChunk = textEncoder.encode(textDelta);
                                controller.enqueue(queueChunk);
                            }
                        } catch (err) {
                            // Ignore or log JSON parse errors
                            console.error("Could not parse stream message:", err);
                        }
                    }
                }
            } catch (err) {
                controller.error(err);
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}
