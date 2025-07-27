import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '@rekog/mcp-nest';

@Injectable({ scope: Scope.REQUEST })
export class GreetingResource {
  constructor() {
    console.log('[greeting.resource.ts] GreetingResource constructed');
  }

  @Resource({
    name: 'languages-informal-greetings',
    description: 'Languages and their informal greeting phrases',
    mimeType: 'application/json',
    uri: 'mcp://languages/informal-greetings',
  })
  getLanguagesInformalGreetings({ uri }) {
    console.log(
      '[greeting.resource.ts] Entering getLanguagesInformalGreetings with uri:',
      uri,
    );
    const languages = {
      en: 'Hey',
      es: 'Qué tal',
      fr: 'Salut',
      de: 'Hi',
      it: 'Ciao',
      pt: 'Oi',
      ja: 'やあ',
      ko: '안녕',
      zh: '嗨',
    };
    const result = {
      contents: [
        {
          uri: uri,
          mimeType: 'application/json',
          text: JSON.stringify(languages, null, 2),
        },
      ],
    };
    console.log(
      '[greeting.resource.ts] Exiting getLanguagesInformalGreetings with result:',
      result,
    );
    return result;
  }

  @ResourceTemplate({
    name: 'user-language',
    description: "Get a specific user's preferred language",
    mimeType: 'application/json',
    uriTemplate: 'mcp://users/{name}',
  })
  getUserLanguage({ uri, name }) {
    console.log(
      '[greeting.resource.ts] Entering getUserLanguage with uri:',
      uri,
      'name:',
      name,
    );
    const users = {
      alice: 'en',
      carlos: 'es',
      marie: 'fr',
      hans: 'de',
      yuki: 'ja',
      'min-jun': 'ko',
      wei: 'zh',
      sofia: 'it',
      joão: 'pt',
    };
    const language = users[name.toLowerCase()] || 'en';
    const result = {
      contents: [
        {
          uri: uri,
          mimeType: 'application/json',
          text: JSON.stringify({ name, language }, null, 2),
        },
      ],
    };
    console.log(
      '[greeting.resource.ts] Exiting getUserLanguage with result:',
      result,
    );
    return result;
  }
}
