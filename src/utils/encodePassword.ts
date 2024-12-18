import * as argon2 from 'argon2';

export const encodePassword = async (rawPassword: string) => {
  const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
  return await argon2.hash(rawPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: SALT_ROUNDS,
    parallelism: 1,
  });
};
