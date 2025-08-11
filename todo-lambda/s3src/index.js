const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET_NAME;
const EXPIRES = parseInt(process.env.URL_EXPIRATION_SECONDS || "300", 10);

const ok = (data) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(data),
});
const bad = (status, msg) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ error: msg }),
});

exports.handler = async (event) => {
  try {
    const path = event.rawPath || event.path || "";
    const qs = event.queryStringParameters || {};

    // if (path.endsWith("/upload-url")) {
    //   const key = qs.name || `file-${Date.now()}`;
    //   const contentType = qs.contentType || "application/octet-stream";
    //   const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
    //   const uploadURL = await getSignedUrl(s3, cmd, { expiresIn: EXPIRES });
    //   return ok({ uploadURL, key, expiresIn: EXPIRES });
    // }

    // if (path.endsWith("/download-url")) {
    //   const key = qs.name;
    //   if (!key) return bad(400, "Missing 'name' query parameter");
    //   const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    //   const downloadURL = await getSignedUrl(s3, cmd, { expiresIn: EXPIRES });
    //   return ok({ downloadURL, key, expiresIn: EXPIRES });
    // }

    return bad(404, "Route not found. Use /upload-url or /download-url.");
  } catch (e) {
    console.error(e);
    return bad(500, "Internal error");
  }
};
