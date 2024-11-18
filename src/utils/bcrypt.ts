import * as bcrypt from 'bcrypt';

export const encodePassword = (rawPassword: string) => {
  const SALT = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(rawPassword, SALT);
};

