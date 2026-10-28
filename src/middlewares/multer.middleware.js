import multer from "multer";

// 1. Configure the disk storage engine layout
const storage = multer.diskStorage({
  // Define the exact local folder where incoming files should be saved
  destination: function (req, file, cb) {
    cb(null, "public/tmp");
  },

  // Define how the file should be named on your local disk
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// 2. Export the configured upload instance to use across routes
export const upload = multer({ storage: storage });
