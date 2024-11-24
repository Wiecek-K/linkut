import { IsUrl } from 'class-validator';
import { IsSafeUrl } from 'src/decorators/safe-url.decorator';

export class CreateLinkDto {
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: false,
    require_valid_protocol: true,
    allow_query_components: true,
    allow_fragments: true,
  })
  @IsSafeUrl({
    message: 'Podany URL jest nieprawidłowy lub niebezpieczny',
  })
  originalUrl: string;
}
