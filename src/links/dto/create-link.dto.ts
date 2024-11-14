import { IsUrl, IsUUID } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  shortUrl: string;

  @IsUrl()
  originalUrl: string;

  @IsUUID()
  userId: string;
}
