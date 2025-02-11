import { getLLMResponse } from "../util/openai-client";

export const config = {
    runtime: 'edge',
}

/**
 * 
 * @param req 
 * Array of objects with the following properties:
 *   filename: string
 *   code: string
 * @returns 
 */
const handler = async (req: Request) => {
    const codeFiles = await req.json();
    return getLLMResponse([
        `Below are filenames and the corresponding code snippets:`,
        ...codeFiles.map(file => `Filename: ${file.filename}\nCode: ${file.code}`),
        `Output an overall explanation of the changes made in the code snippets.
        Also, provide a summary of the changes made in each of the file(s).`,
    ], 'gpt-4o-mini', true);
};

export default handler;