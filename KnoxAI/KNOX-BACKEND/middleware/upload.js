import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

export const getImage = (req, res, next) => {
  const image = req.file;

  if (!image) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  req.file = image; // store file info into body
  next();
};



export const upload = multer({ storage });

