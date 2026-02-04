
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Checks if AWS credentials are configured in the environment.
 * We use safe access to process.env to avoid reference errors in some environments.
 */
export const isAwsConfigured = () => {
  const env = (window as any).process?.env || {};
  return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
};

// Singleton instances initialized lazily
let ddbClient: DynamoDBClient | null = null;
let ddbDocClient: DynamoDBDocumentClient | null = null;

/**
 * Lazy-loads the DynamoDB client only when needed.
 * This prevents the SDK from attempting to read the file system (fs) for config on module load.
 */
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
      // In a browser environment, we want to avoid Node-specific handlers
      // The browser version of the SDK usually handles this, but explicit credentials
      // are the best way to bypass the 'SharedConfig' provider that triggers 'fs' calls.
    });

    ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
    return ddbDocClient;
  } catch (err) {
    console.error("[AWS SDK INIT ERROR]:", err);
    return null;
  }
};

/**
 * Generic function to save a record to a DynamoDB table
 */
export const saveToAws = async (tableName: string, item: any) => {
  const client = getDdbClient();
  if (!client) return;

  try {
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );
    console.log(`[AWS SYNC] ${tableName} saved successfully.`);
  } catch (error) {
    console.error(`[AWS SYNC ERROR] ${tableName}:`, error);
  }
};

/**
 * Batch migrates a collection of data from Firebase to AWS
 */
export const migrateCollection = async (tableName: string, items: any[]) => {
  const client = getDdbClient();
  if (!client || items.length === 0) return { success: false, count: 0 };

  try {
    const chunks = [];
    for (let i = 0; i < items.length; i += 25) {
      chunks.push(items.slice(i, i + 25));
    }

    for (const chunk of chunks) {
      const writeRequests = chunk.map(item => ({
        PutRequest: { Item: item }
      }));

      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: writeRequests
          }
        })
      );
    }

    return { success: true, count: items.length };
  } catch (error) {
    console.error(`[AWS MIGRATION ERROR] ${tableName}:`, error);
    return { success: false, count: 0, error };
  }
};

/**
 * Fetch data from AWS
 */
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
