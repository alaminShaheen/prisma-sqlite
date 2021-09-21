import dotenv from "dotenv";

dotenv.config();

const config = {
  mongo: {
    options: {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      socketTimeoutMS: 30000,
      keepAlive: true,
      maxPoolSize: 50,
      autoIndex: false,
      retryWrites: false,
    },
    url: process.env.CONNECTION_URL,
  },
  server: {
    hostname: process.env.SERVER_HOSTNAME || "localhost",
    port: process.env.PORT || 5000,
  },
  token: {
    expireTime: process.env.SERVER_TOKEN_EXPIRE_TIME || 10,
    accessTokenSecret: process.env.SECRET_ACCESS_TOKEN || "secret",
    refreshTokenSecret: process.env.SECRET_REFRESH_TOKEN || "refresh",
  },
};

export default config;
