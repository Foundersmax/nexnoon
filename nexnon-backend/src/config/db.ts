import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
    console.log(
      `   Database: ${ENV.MONGODB_URI.split("/").pop()?.split("?")[0]}`,
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.error("\n💡 Troubleshooting:");
    console.error(
      "   1. Is MongoDB running? (local) or cluster active? (Atlas)",
    );
    console.error("   2. Check MONGODB_URI in .env file");
    console.error("   3. Verify network access (Atlas IP whitelist)");
    console.error("   4. Check username/password in connection string");
    process.exit(1);
  }
};
