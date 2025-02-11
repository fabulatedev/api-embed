import { getLLMResponse } from "../util/openai-client";

export const config = {
    runtime: 'edge',
}

const header = `<p align="center"><img width="64" height="64" src="https://mirrors.meiert.org/coderesponsibly.org/media/logo.png" /></p><br/>\n`;
const footer = `\n\n*code explanations by <a style="color: green;" href="https://denigma.app" target="_blank">codengima</a>.*`;

/**
 * 
 * @param req 
 * filename: string
 * code: string
 * snippet: string
 * @returns 
 */
const handler = async (req: Request) => {
    const file = await req.json();
    if (!file.snippet) {
        return getLLMResponse([
            `Below is the filename and the corresponding code for that file:`,
            `Filename: ${file.filename}\nCode: ${file.code}`,
            `Output an overall explanation of the code in the file.`,
        ], 'gpt-4o-mini', true, header, footer);
    }

    return getLLMResponse([
        `Below is the filename and the corresponding code for that file, also a highlighted snippet:`,
        `Filename: ${file.filename}\nCode: ${file.code}\nSnippet: ${file.snippet}`,
        `Output an overall explanation of the code highlighted in the snippet.`,
    ], 'gpt-4o-mini', true, header, footer);
};

export default handler;