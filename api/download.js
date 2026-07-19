export default async function handler(req, res) {
  const { id, name } = req.query;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!id) {
    return res.status(400).json({ error: "Missing file ID" });
  }
  if (!apiKey) {
    return res.status(500).json({ error: "Google Drive API Key is not configured on the server" });
  }

  const driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${apiKey}`;

  try {
    const response = await fetch(driveUrl);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Google Drive API error: ${errText}` });
    }

    // Set headers for download attachment
    const safeName = name ? decodeURIComponent(name) : "download";
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeName)}"`);
    
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Stream the body chunks directly to the response
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    
    res.end();
  } catch (error) {
    console.error("Download proxy error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error during download proxying" });
    }
  }
}
