import { CreateUserDto } from './create-user.dto';

type Partial<T> = {
  [P in keyof T]?: T;
};

export class UpdateUserDto implements Partial<CreateUserDto> {}
