import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const normalizeIdentity = (identityOrUsername, roleArg) => {
  if (
    identityOrUsername &&
    typeof identityOrUsername === "object" &&
    roleArg === undefined
  ) {
    return {
      username: identityOrUsername.username || identityOrUsername.name || "",
      role: identityOrUsername.role,
    };
  }

  return {
    username: identityOrUsername,
    role: roleArg,
  };
};

export const generateAccessToken = (username, role) => {
  const userPayload = normalizeIdentity(username, role);
  return jwt.sign(
    {
      user: userPayload,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.jwt_access_expired,
    },
  );
};
export const generateRefreshToken = (username, role) => {
  const userPayload = normalizeIdentity(username, role);
  return jwt.sign(
    {
      user: userPayload,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.jwt_refresh_expired,
    },
  );
};
