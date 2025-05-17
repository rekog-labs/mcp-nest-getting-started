import { Injectable } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';

@Injectable()
export class CountingTool {
  constructor() {}

  @Tool({
    name: 'count-characters',
    description: 'Counts occurrences of a specific character in text',
    parameters: z.object({
      text: z.string().describe('The text to analyze'),
      character: z.string().describe('The character to count'),
    }),
  })
  async countCharacters({ text, character }, context: Context) {
    let count = 0;

    // Simple counting logic that's 100% accurate
    for (let i = 0; i < text.length; i++) {
      if (text[i] === character) {
        count++;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `There are ${count} occurrences of '${character}' in the text.`,
        },
      ],
    };
  }
}
