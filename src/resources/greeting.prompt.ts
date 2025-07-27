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
    parameters: z.object({}),
  })
  getGreetingInstructions() {
    console.log('[greeting.prompt.ts] Entering getGreetingInstructions');
    const result = {
      description: 'Guide for greeting users in their native languages',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Greet users in their native languages!',
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
