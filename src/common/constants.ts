export const fileValidationOptions = {
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb(new Error("File should be an image"), false);
    }
  },
};

export const transformArray = ({ value }) =>
  typeof value === "string" ? value.split(",") : value;
