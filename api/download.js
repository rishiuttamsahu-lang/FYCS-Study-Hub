import { Readable } from 'node:stream';

export default async function handler(req, res) {
  const { id, name } = req.query;
  try {
    if (!id) return res.status(400).send("Missing file id");

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      return res.status(500).send("Server Configuration Error: GOOGLE_DRIVE_API_KEY is missing on Vercel dashboard!");
    }

    // Attempt to download the file directly via Google Drive API (alt=media)
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${apiKey}`;

    const driveRes = await fetch(driveUrl);

    // If Google API returns an error (e.g. altMediaNotSupported for Google Workspace Docs/Sheets/Slides)
    // redirect directly to Google Drive's public download web interface
    if (!driveRes.ok) {
      const fallbackUrl = `https://docs.google.com/uc?export=download&id=${id}`;
      return res.redirect(fallbackUrl);
    }

    if (!driveRes.body) {
      return res.status(500).send("Error: Google Drive returned an empty response body.");
    }

    const contentType = driveRes.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    // Map MIME-type to file extension automatically
    const mimeToExt = {
      "application/pdf": ".pdf",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "application/zip": ".zip",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
      "application/x-javascript": ".js",
      "text/jsx": ".jsx",
      "text/plain": ".txt",
      "text/html": ".html",
      "text/css": ".css"
    };

    let finalName = name ? decodeURIComponent(name) : id;
    if (!finalName.includes('.')) {
      finalName += (mimeToExt[contentType] || "");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${finalName.replace(/"/g, '')}"`);

    Readable.fromWeb(driveRes.body).pipe(res);
  } catch (error) {
    console.error("Serverless proxy crash:", error);
    // Safe fallback recovery: Redirect directly to Google Drive's web downloader
    res.redirect(`https://docs.google.com/uc?export=download&id=${id}`);
  }
}
