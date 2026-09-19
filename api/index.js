import app from "../src/app.js";
import connectDB from "../src/config/database.js";

let isConnected = false;

const handler = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export default handler;
