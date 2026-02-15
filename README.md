# Static Photo Archive

A personal, read-only photo journal designed to replace Instagram. Zero algorithms, zero social validation, zero monthly costs.

**Stack:** Next.js (Static Export), Tailwind CSS, Node.js (Sharp)

## The Architecture

* **Source of Truth:** Local file system (`/raw_photos`).
* **Database:** A generated `src/data/posts.json` file.
* **Asset Pipeline:** High-res JPEGs are processed locally into web-optimized thumbnails and detail views.
* **Hosting:** GitHub Pages.

---

## 📸 Workflow: Adding a New Post

### 1. Create the Folder
Navigate to `raw_photos` and create a new folder. The folder name acts as the **Post ID**.
* *Recommended Format:* `YYYY-MM-DD-Location` (e.g., `2026-02-15-Dubai-Hike`)

### 2. Add & Rename Images
Drop your high-res JPEGs into that folder.
**Crucial:** Rename them to control the order (Natural Sorting is enabled).
* `1.jpg` = **Cover Image** (Shown on grid).
* `2.jpg`, `3.jpg`... = Carousel order.

### 3. Build the Database
Run the optimization script. This reads EXIF data, generates thumbnails/detail views, and updates `posts.json`.

```bash
node scripts/optimize.mjs