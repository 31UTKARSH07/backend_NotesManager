import jwt from "jsonwebtoken";

export const generateToken = async (id) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    return token;
  } catch (error) {
    throw new Error("Error generating token");
  }
};
