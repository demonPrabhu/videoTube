import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // as extra step keeping in trycatch will refract later
  try {
    // 1. Extract token from either incoming cookies OR the request Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log(token);

    // 2. If the token is completely missing, block the request instantly
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // 3. Decrypt and verify the signature. If it fails, the error goes straight to asyncHandler!
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 4. Query MongoDB using the id payload inside the token, stripping secrets out
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // 5. If the user doesn't exist in the database, throw an error
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // 6. Attach the verified user details directly onto the request object
    req.user = user;

    // 7. GREEN LIGHT: Pass control forward to the logout controller
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
