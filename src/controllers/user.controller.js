import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessandRefreshToken = async (user) => {
  try {
    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    // Save the token data permanently to your database cluster
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const options = {
  httpOnly: true, // Shields tokens from frontend browser scripting access (Stops XSS)
  secure: true, // Restricts token transfers purely over encrypted HTTPS channels
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  //    required-> fullName, userName, email, password, avatar
  //    optional -> coverImage, watchHistory, refreshToken, createdAt, updatedAt

  // 1. Extract credentials from incoming request text body
  const { fullName, username, email, password } = req.body;

  // 2. Data Validation: Ensure no required field is empty or just whitespace
  if (
    [fullName, username, email, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(400, "All registration fields are required");
  }

  // 3. Uniqueness Check: Query DB to check if username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "A user with this username or email already exists"
    );
  }

  //console.log(req.files);

  // 4. File Path Capture: Extract local paths saved on disk by Multer middleware
  // req.files is populated by upload.fields() in your router
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Profile avatar image is required");
  }

  // 5. Cloud Upload: Stream local assets over to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(
      500,
      "Failed to upload avatar to cloud storage infrastructure"
    );
  }

  // 6. DB Creation: Create a new database entry
  // Note: The password field is automatically hashed right here due to our User Schema pre-save hook!
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // Leave blank if user skipped uploading a banner
    email,
    password,
    username: username.toLowerCase(), // Force lowercase for clean indexing consistency
  });

  // 7. Security Filtering: Fetch the newly created profile while removing secret fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Internal server error occurred during user record generation"
    );
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // take details from user -> username, email, password
  // validate details for not empty
  // check user exists
  // validate password
  // generate access and refresh Token
  // save refresh token for user in mongo db
  // send response with token in cookie

  // 1. Take details from user -> request body
  const { username, email, password } = req.body;

  // 2. Validate details: Ensure password is provided AND either username OR email is present
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required to login");
  }
  if (!password || password.trim() === "") {
    throw new ApiError(400, "Password field is required");
  }

  // 3. Check user exists
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exists");
  }

  // 4. Validate password using your schema custom instance method
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is not correct");
  }

  // 5. Generate access and refresh tokens safely
  const { accessToken, refreshToken } =
    await generateAccessandRefreshToken(user);

  // Convert the user instance to a plain object and strip sensitive keys in RAM
  // Convert the live Mongoose tracker instance into a plain memory object structure
  const loggedInUser = user.toObject();

  // Directly wipe out sensitive private keys out of the response memory stack instantly
  // Directly erase the keys inside our RAM instantly!
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  // 6. Return response with token payloads injected securely into client cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // verifyJWT -> req.cookies, token from cookies, find and verify user in db using refresh token
  // find user in db and clear refresh token for user in db
  // send response -> delete cookies

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, ""));
});

export { registerUser, loginUser, logoutUser };
