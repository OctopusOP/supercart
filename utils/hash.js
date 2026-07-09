import argon2 from "argon2";

const encryptPassword = async (password) => {
  return await argon2.hash(password);
};

const comparePassword = async (password_hash, password) => {
  const result = await argon2.verify(password_hash, password);
  return result;
};

export { encryptPassword, comparePassword };
