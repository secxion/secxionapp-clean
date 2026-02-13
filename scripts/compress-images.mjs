import sharp from "sharp";
import { glob } from "glob";
import fs from "fs";
import path from "path";

const inputDir = "frontend/src/assetsx";
const outputDir = "frontend/src/assetsx/optimized";
const maxWidth = 800; // Max width for images, adjust as needed

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function compressImages() {
  console.log("🌀 Starting image compression...");

  // Find all png, jpg, and jpeg files in the input directory
  const files = await glob(`${inputDir}/*.{png,jpg,jpeg}`);

  if (files.length === 0) {
    console.log("No images found to compress.");
    return;
  }

  let compressedCount = 0;
  const promises = files.map(async (file) => {
    const fileName = path.basename(file, path.extname(file));
    const outputPath = path.join(outputDir, `${fileName}.webp`);

    try {
      await sharp(file)
        .resize({
          width: maxWidth,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      compressedCount++;
      console.log(`✅ Compressed: ${fileName}.webp`);
    } catch (err) {
      console.error(`❌ Failed to compress ${file}:`, err);
    }
  });

  await Promise.all(promises);
  console.log(
    `\n🎉 Finished! Compressed ${compressedCount} of ${files.length} images.`,
  );
}

compressImages();
