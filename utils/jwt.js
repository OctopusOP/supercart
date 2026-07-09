import jwt from "jsonwebtoken";

export const generateJWT = (id) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const verifyJWT = (payload) => {
  try {
    const user = jwt.verify(payload, process.env.JWT_SECRET);
    if (user) {
      return user;
    }
  } catch (error) {
    console.log("invalid token");
    return false;
  }
};
