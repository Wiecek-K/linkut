import { IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: false,
    require_valid_protocol: true,
    allow_query_components: true,
    allow_fragments: true,
  })
  originalUrl: string;
}
