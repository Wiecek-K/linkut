import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export function IsSafeUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSafeUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Instant rejection of URLs containing the most dangerous characters
          if (/[<>"'`]/.test(value)) {
            return false;
          }

          try {
            // Decoding URL before checking content
            const decodedUrl = decodeURIComponent(value);

            // Checking if the decoded URL contains dangerous characters
            if (/[<>"'`]/.test(decodedUrl)) {
              return false;
            }

            const url = new URL(value);

            // Basic protocol check
            if (!['http:', 'https:'].includes(url.protocol)) {
              return false;
            }

            // Block Punycode
            if (url.hostname.includes('xn--')) {
              return false;
            }

            // Blocking credentials in URL
            if (url.username || url.password || url.href.includes('@')) {
              return false;
            }

            // Hostname Validation
            const hostnamePattern =
              /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
            if (!hostnamePattern.test(url.hostname)) {
              return false;
            }

            // We connect the path and parameters to be checked together
            const fullPath = `${url.pathname}${url.search}${url.hash}`;

            // Decoding full path before checking
            const decodedPath = decodeURIComponent(fullPath);

            // List of dangerous patterns
            const dangerousPatterns = [
              /<.*>/i, //  HTML Tags
              /[<>"'`]/, // Dangerous characters
              /javascript:/i, // JavaScript protocol
              /data:/i, // Data URI
              /vbscript:/i, // VBScript
              /file:/i, // File protocol
              /alert\s*\(/i, // Alert
              /on\w+\s*=/i, // Event handlers (onclick, onload, etc.)
              /%0[ad]/i, // CRLF injection
              /\.\.\/|\.\.\\|%2e%2e/, // Directory traversal
            ];

            // Checking if any pattern is present in the decoded path
            if (
              dangerousPatterns.some((pattern) => pattern.test(decodedPath))
            ) {
              return false;
            }

            // Additional check for encoded characters
            const encodedChars = /%(?![0-9a-fA-F]{2})/i;
            if (encodedChars.test(fullPath)) {
              return false;
            }

            return true;
          } catch (e) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} zawiera niedozwolone znaki lub jest nieprawidłowym URL`;
        },
      },
    });

    // Transformation (sanitization)
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;

      try {
        // Pre-sanitization of the most dangerous characters
        let sanitized = value
          .trim()
          .replace(/[<>"'`]/g, '') // Removing dangerous characters
          .replace(/&#?[a-zA-Z0-9]+;/g, ''); // Deleting HTML entities

        // Attempt to parse URL
        const url = new URL(sanitized);

        // Sanitization of individual parts of the URL
        const cleanPath = url.pathname
          .replace(/[<>"'`]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/data:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/file:/gi, '');

        const cleanSearch = url.search
          .replace(/[<>"'`]/g, '')
          .replace(/on\w+=/gi, 'invalid=');

        const cleanHash = url.hash
          .replace(/[<>"'`]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/data:/gi, '');

        // URL reassembly
        sanitized = `${url.protocol}//${url.host}${cleanPath}${cleanSearch}${cleanHash}`;

        // Final sanitization via sanitize-html
        sanitized = sanitizeHtml(sanitized, {
          allowedTags: [],
          allowedAttributes: {},
          allowedSchemes: ['http', 'https'],
        });

        // Verify if the result is a valid URL
        new URL(sanitized);
        return sanitized;
      } catch (e) {
        // If something went wrong, we return an empty string or throw an error
        return '';
      }
    })(object, propertyName);
  };
}
