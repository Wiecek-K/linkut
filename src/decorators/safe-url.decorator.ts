import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export function IsSafeUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    // Rejestracja dekoratora walidacyjnego
    registerDecorator({
      name: 'isSafeUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Walidacja URL za pomocą wyrażenia regularnego
          const urlPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;
          
          // Sprawdzenie czy URL nie zawiera niebezpiecznych protokołów
          const hasUnsafeProtocol = /^(javascript|data|vbscript|file):/i.test(value);
          
          return urlPattern.test(value) && !hasUnsafeProtocol;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} musi być prawidłowym i bezpiecznym URL (tylko http/https)`;
        },
      },
    });

    // Dodanie transformacji dla sanityzacji
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;

      // Podstawowa sanityzacja
      let sanitized = value.trim()
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/file:/gi, '')
        .replace(/<|>/g, '');

      // Dodatkowa sanityzacja przez sanitize-html
      sanitized = sanitizeHtml(sanitized, {
        allowedTags: [],
        allowedAttributes: {},
        allowedSchemes: ['http', 'https']
      });

      return sanitized;
    })(object, propertyName);
  };
}