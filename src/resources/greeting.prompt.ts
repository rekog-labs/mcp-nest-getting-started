import { Injectable, Scope } from '@nestjs/common';
import { Prompt } from '@rekog/mcp-nest';
import { z } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class GreetingPrompt {
  constructor() {}

  @Prompt({
    name: 'multilingual-greeting-guide',
    description: 'Simple instruction for greeting users in their native languages',
    parameters: z.object({}),
  })
  getGreetingInstructions() {
    return {
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
  }
}