import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UrlService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getFullUrl(path: string): string {
    const protocol = this.request.protocol;
    const host = this.request.get('host');
    return `${protocol}://${host}${path}`;
  }
}
