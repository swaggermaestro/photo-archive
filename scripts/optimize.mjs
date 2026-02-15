import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import exifReader from 'exif-reader';

const CWD = process.cwd();
const RAW_DIR = path.join(CWD, 'raw_photos');
const OUT_DIR = path.join(CWD, 'public/photos');
const DATA_FILE = path.join(CWD, 'src/data/posts.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const CATEGORIES = ['adventures', 'portraits'];

async function processImages() {
  const posts = [];

  for (const category of CATEGORIES) {
    const categoryPath = path.join(RAW_DIR, category);
    if (!fs.existsSync(categoryPath)) continue;

    const folders = fs.readdirSync(categoryPath).filter(f => 
      fs.statSync(path.join(categoryPath, f)).isDirectory()
    );

    for (const folder of folders) {
      const folderPath = path.join(categoryPath, folder);
      const files = fs.readdirSync(folderPath).filter(f => 
        /\.(jpg|jpeg|png|webp)$/i.test(f)
      );
      
      if (files.length === 0) continue;

      files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      const postId = folder; 
      const processedImages = [];
      let postTimestamp = fs.statSync(path.join(folderPath, files[0])).birthtime.toISOString();

      console.log(`Processing: ${postId} [Converting to sRGB]`);

      for (const [index, file] of files.entries()) {
        const inputPath = path.join(folderPath, file);
        const outputBase = `${postId}_${index}`;
        const thumbPath = path.join(OUT_DIR, `${outputBase}_thumb.jpg`);
        const fullPath = path.join(OUT_DIR, `${outputBase}_full.jpg`);
        
        // Initialize Sharp and force sRGB conversion
        // pipeline.keepMetadata() ensures EXIF stays, but colorspace is standardized
        const pipeline = sharp(inputPath)
          .rotate()
          .keepMetadata() // Preserves EXIF while allowing pixel data transformation
          .toColorspace('srgb'); // Standardizes AdobeRGB/ProPhoto to sRGB

        if (index === 0) {
          try {
            const metadata = await pipeline.metadata();
            if (metadata.exif) {
              const parsed = exifReader(metadata.exif);
              if (parsed.Photo?.DateTimeOriginal) postTimestamp = parsed.Photo.DateTimeOriginal.toISOString();
            }
          } catch (err) { /* ignore */ }
        }

        // 1. Generate Thumbnail
        if (index === 0 && !fs.existsSync(thumbPath)) {
          await pipeline
            .clone()
            .resize(600, 600, { fit: 'contain' })
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(thumbPath);
        }

        // 2. Generate Detail
        if (!fs.existsSync(fullPath)) {
          await pipeline
            .clone()
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 95, mozjpeg: true })
            .toFile(fullPath);
        }

        processedImages.push({
          thumb: `/photos/${outputBase}_thumb.jpg`,
          full: `/photos/${outputBase}_full.jpg`
        });
      }

      posts.push({
        id: postId,
        type: files.length > 1 ? 'carousel' : 'single',
        category: category,
        images: processedImages,
        caption: `${postId}`,
        likes: 0,
        timestamp: postTimestamp 
      });
    }
  }

  posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  console.log(`\nDone! All images processed and standardized to sRGB.`);
}

processImages().catch(console.error);