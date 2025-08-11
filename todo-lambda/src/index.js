// src/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;
const json = (statusCode, data) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(data),
});

exports.handler = async (event) => {
  try {
    const method = event.requestContext.http.method;
    const id = event.pathParameters?.id || null;

    if (method === "GET" && !id) {
      const res = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
      return json(200, res.Items ?? []);
    }

    if (method === "GET" && id) {
      const res = await ddb.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { id } })
      );
      if (!res.Item) return json(404, { message: "Not found" });
      return json(200, res.Item);
    }

    if (method === "POST") {
      let payload = {};
      try {
        payload = event.body ? JSON.parse(event.body) : {};
      } catch {
        return json(400, { message: "Invalid JSON body" });
      }
      if (!payload.title || typeof payload.title !== "string") {
        return json(400, { message: "title (string) is required" });
      }

      const item = {
        id: randomUUID(),
        title: payload.title.trim(),
        done: !!payload.done,
        createdAt: new Date().toISOString(),
      };
      await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return json(201, item);
    }

    if (method === "DELETE" && id) {
      // DELETE /todos/{id} : supprimer
      await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
      return json(204, {});
    }

    return json(405, { message: "Method Not Allowed" });
  } catch (err) {
    console.error(err);
    return json(500, { message: "Internal Server Error" });
  }
};
