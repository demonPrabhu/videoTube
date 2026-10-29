import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

export { registerUser };
