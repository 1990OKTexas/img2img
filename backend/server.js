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
require('dotenv').config();
const fetch = require('node-fetch');
const FormData = require('form-data');

// ... existing setup

app.post('/generate', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const mode = req.body.mode;
    const strength = parseFloat(req.body.strength) / 100;
    const imagePath = req.file.path;

    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    fs.unlinkSync(imagePath); // remove temp file

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "db21e45bfa314f20aa7f83a7035c4c77b2f04b3d1ef4aa46b84c3d30d72f29b7",
        input: {
          prompt: prompt,
          image: `data:image/png;base64,${base64Image}`,
          strength: strength,
          num_inference_steps: 30,
          guidance_scale: 7.5
        }
      })
    });

    const prediction = await response.json();

    if (prediction?.urls?.get) {
      // Poll the result
      let result = null;
      while (!result || result.status === "starting" || result.status === "processing") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const pollRes = await fetch(prediction.urls.get, {
          headers: {
            "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`
          }
        });
        result = await pollRes.json();
      }

      if (result.status === "succeeded") {
        return res.json({
          success: true,
          image: result.output[0]
        });
      } else {
        return res.status(500).json({ success: false, error: "Generation failed." });
      }
    } else {
      return res.status(500).json({ success: false, error: "Replicate error." });
    }

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

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
