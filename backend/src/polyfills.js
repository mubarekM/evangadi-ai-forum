// The PDF library (pdfjs-dist) expects a few browser classes when it is loaded.
// They are not needed for text extraction, so empty stand-ins are enough.
// This lets the server start on serverless hosting such as Vercel.
globalThis.DOMMatrix ??= class DOMMatrix {};
globalThis.ImageData ??= class ImageData {};
globalThis.Path2D ??= class Path2D {};
