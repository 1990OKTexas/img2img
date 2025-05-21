const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware
app.use(cors());
app.use(express.json());

// Temp upload folder
const upload = multer({ dest: 'temp/' });

// Route to handle img2img
app.post('/generate', upload.single('image'), async (req, res) => {
  const mode = req.body.mode; // "sfw" or "nsfw"
  const strength = req.body.strength; // slider value
  const imagePath = req.file.path;

  // Fake generation for now — return the uploaded image
  // Replace with your model or API later
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Clean up temp file
  fs.unlinkSync(imagePath);

  res.json({
    success: true,
    image: `data:image/png;base64,${base64Image}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
