declare module 'openai' {
  export class OpenAI {
    constructor(config: {
      apiKey: string;
      dangerouslyAllowBrowser?: boolean;
    });
    
    chat: {
      completions: {
        create(params: {
          model: string;
          messages: Array<{
            role: 'system' | 'user' | 'assistant';
            content: string;
          }>;
          temperature?: number;
        }): Promise<{
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        }>;
      };
    };
  }
  
  export default OpenAI;
}
