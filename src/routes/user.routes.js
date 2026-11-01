import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route: http://localhost:3000/api/v1/users/register
router.route("/register").post(
  // We add Multer as a gatekeeper middleware right before running controller logic
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
