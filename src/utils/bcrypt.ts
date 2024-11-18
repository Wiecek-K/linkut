import * as bcrypt from 'bcrypt';

export const encodePassword = (rawPassword: string) => {
  const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
  const SALT = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(rawPassword, SALT);
};
