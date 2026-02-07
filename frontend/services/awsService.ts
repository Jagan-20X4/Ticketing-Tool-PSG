
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const isAwsConfigured = () => {
  const env = (window as any).process?.env || {};
  return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
};

let ddbClient: DynamoDBClient | null = null;
let ddbDocClient: DynamoDBDocumentClient | null = null;

const getDdbClient = () => {
  if (ddbDocClient) return ddbDocClient;
  if (!isAwsConfigured()) return null;
  const env = (window as any).process?.env || {};
  const region = env.AWS_REGION || "us-east-1";
  try {
    ddbClient = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
    return ddbDocClient;
  } catch (err) {
    console.error("[AWS SDK INIT ERROR]:", err);
    return null;
  }
};

export const saveToAws = async (tableName: string, item: any) => {
  const client = getDdbClient();
  if (!client) return;
  try {
    await client.send(new PutCommand({ TableName: tableName, Item: item }));
    console.log(`[AWS SYNC] ${tableName} saved successfully.`);
  } catch (error) {
    console.error(`[AWS SYNC ERROR] ${tableName}:`, error);
  }
};

export const migrateCollection = async (tableName: string, items: any[]) => {
  const client = getDdbClient();
  if (!client || items.length === 0) return { success: false, count: 0 };
  try {
    const chunks = [];
    for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25));
    for (const chunk of chunks) {
      await client.send(new BatchWriteCommand({
        RequestItems: { [tableName]: chunk.map(item => ({ PutRequest: { Item: item } })) }
      }));
    }
    return { success: true, count: items.length };
  } catch (error) {
    console.error(`[AWS MIGRATION ERROR] ${tableName}:`, error);
    return { success: false, count: 0, error };
  }
};

export const fetchFromAws = async (tableName: string) => {
  const client = getDdbClient();
  if (!client) return [];
  try {
    const response = await client.send(new ScanCommand({ TableName: tableName }));
    return response.Items || [];
  } catch (error) {
    console.error(`[AWS FETCH ERROR] ${tableName}:`, error);
    return [];
  }
};
