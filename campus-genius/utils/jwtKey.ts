// Access the JWT secret from the environment variable

const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXT_PUBLIC_JWT_SECRET || "your-fallback-secret-key"
  );
  
  export default JWT_SECRET;