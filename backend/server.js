const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temp folder for image uploads
const upload = multer({ dest: 'temp/' });

// POST /generate — handles img2img request
app.post('/generate', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const mode = req.body.mode;
    const strength = req.body.strength;
    const imagePath = req.file.path;

    console.log("Received request:");
    console.log("Prompt:", prompt);
    console.log("Mode:", mode);
    console.log("Strength:", strength);

    // Read the uploaded image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Delete temp file after use
    fs.unlinkSync(imagePath);

    // Respond with the base64 image (placeholder)
    res.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`
    });

  } catch (err) {
    console.error("Error handling /generate:", err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Img2Img API running on port ${PORT}`);
});
