import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import exifReader from 'exif-reader';

const CWD = process.cwd();
const RAW_DIR = path.join(CWD, 'raw_photos');
const OUT_DIR = path.join(CWD, 'public/photos');
const DATA_FILE = path.join(CWD, 'src/data/posts.json');

// Ensure directories exist
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

async function processImages() {
  const folders = fs.readdirSync(RAW_DIR).filter(f => 
    fs.statSync(path.join(RAW_DIR, f)).isDirectory()
  );

  const posts = [];
  console.log(`Found ${folders.length} post folders to process...`);

  for (const folder of folders) {
    const folderPath = path.join(RAW_DIR, folder);
    const files = fs.readdirSync(folderPath).filter(f => 
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );
    
    if (files.length === 0) continue;

    // --- CRITICAL CHANGE: NATURAL SORTING ---
    // This ensures 1.jpg comes before 2.jpg, and 2.jpg comes before 10.jpg
    files.sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    const postId = folder; 
    const processedImages = [];
    
    // Default to file creation time as fallback
    let postTimestamp = fs.statSync(path.join(folderPath, files[0])).birthtime.toISOString();
    let dateSource = "File System (Fallback)";

    console.log(`Processing: ${postId}`);

    for (const [index, file] of files.entries()) {
      const inputPath = path.join(folderPath, file);
      // We explicitly use the index in the filename to keep them ordered in the output
      const outputBase = `${postId}_${index}`;
      const thumbPath = path.join(OUT_DIR, `${outputBase}_thumb.jpg`);
      const fullPath = path.join(OUT_DIR, `${outputBase}_full.jpg`);
      
      const image = sharp(inputPath);

      // --- EXIF EXTRACTION (First image / Cover image only) ---
      if (index === 0) {
        try {
          const metadata = await image.metadata();
          if (metadata.exif) {
            const parsed = exifReader(metadata.exif);
            
            // Priority 1: DateTimeOriginal (When photo was taken)
            if (parsed.Photo && parsed.Photo.DateTimeOriginal) {
              postTimestamp = parsed.Photo.DateTimeOriginal.toISOString();
              dateSource = "EXIF (Original)";
            } 
            // Priority 2: DateTime (When photo was digitised/modified)
            else if (parsed.Image && parsed.Image.DateTime) {
              postTimestamp = parsed.Image.DateTime.toISOString();
              dateSource = "EXIF (Modified)";
            }
          }
        } catch (err) {
          // Ignore errors, keep fallback
        }
        console.log(`   > Cover Image: ${file}`);
        console.log(`   > Date: ${postTimestamp} [${dateSource}]`);
      }

      // 1. Generate Thumbnail (Only for the cover image)
      if (index === 0) {
        if (!fs.existsSync(thumbPath)) {
          await image
            .rotate()
            .resize(600, 600, { fit: 'cover' })
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(thumbPath);
        }
      }

      // 2. Generate Detail View
      if (!fs.existsSync(fullPath)) {
        await image
          .rotate()
          .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, mozjpeg: true })
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
      images: processedImages,
      caption: `Post from ${postId}`,
      likes: 0,
      timestamp: postTimestamp 
    });
  }

  // Sort posts by TIMESTAMP (Newest first)
  posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  console.log(`\nDone! Database updated.`);
}

processImages().catch(console.error);