import pg from 'pg';
import * as Redis from 'redis';
import * as Minio from 'minio';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

const { Client } = pg;

// .env dosyasını yükle (mevcutsa)
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config();
  } else {
    console.log('.env file not found, using default values');
  }
} catch (error) {
  console.error('Error loading .env file:', error);
}

async function checkPostgres() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL || 'postgresql://dev:dev123@localhost:5432/kentnabiz',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT 1 as connection_test');
    console.log('✅ PostgreSQL connection successful!', result.rows[0]);
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

async function checkRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = Redis.createClient({ url });

  try {
    await client.connect();
    const result = await client.ping();
    console.log('✅ Redis connection successful!', result);
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
}

async function checkMinio() {
  const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });

  const bucketName = process.env.MINIO_BUCKET || 'kentnabiz';

  try {
    // Check if bucket exists, create if not
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket '${bucketName}' created successfully`);
    }
    console.log('✅ MinIO connection successful!');
    return true;
  } catch (error) {
    console.error('❌ MinIO connection failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('Checking Docker services...');

  const postgresOk = await checkPostgres();
  const redisOk = await checkRedis();
  const minioOk = await checkMinio();

  if (postgresOk && redisOk && minioOk) {
    console.log('✅ All services are running correctly!');
    process.exit(0);
  } else {
    console.error('❌ Some services failed the connection test');
    process.exit(1);
  }
}

// ES Module uyumlu main çağrısı
main().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
});
