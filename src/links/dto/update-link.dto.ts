import { CreateLinkDto } from './create-link.dto';

type Partial<T> = {
  [P in keyof T]?: T[P];
};

export class UpdateLinkDto implements Partial<CreateLinkDto> {}
