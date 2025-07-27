import { Injectable, Scope } from '@nestjs/common';
import { Prompt } from '@rekog/mcp-nest';
import { z } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class GreetingPrompt {
  constructor() {
    console.log('[greeting.prompt.ts] GreetingPrompt constructed');
  }

  @Prompt({
    name: 'multilingual-greeting-guide',
    description:
      'Simple instruction for greeting users in their native languages',
    parameters: z.object({
      name: z.string().describe('The name of the person to greet'),
      language: z.string().describe('The language to use for the greeting'),
    }),
  })
  getGreetingInstructions({ name, language }) {
    console.log('[greeting.prompt.ts] Entering getGreetingInstructions');
    const result = {
      description: 'Greet users in their native languages!',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Greet ${name} in their preferred language: ${language}`,
          },
        },
      ],
    };
    console.log(
      '[greeting.prompt.ts] Exiting getGreetingInstructions with result:',
      result,
    );
    return result;
  }
}
