import jwt from "jsonwebtoken";
import UserError from "../errors/userError.js";

class TokenService {
    constructor() {
        this.secretKey = process.env.JWT_SECRET || "secret123";
        this.secretKeyRefresh = process.env.JWT_SECRET_REFRESH || "secret321";
        this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
        this.expiresInRefresh = process.env.JWT_EXPIRES_IN_REFRESH || "30d";
    }

    generateAccessToken(payload) {
        return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, this.secretKeyRefresh, { expiresIn: this.expiresInRefresh });
    }

    verifyToken(token, secret = this.secretKey) {
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            throw new UserError("Invalid token");
        }
    }

    async refreshAccessToken(refreshToken) {
        try {
            const payload = this.verifyToken(refreshToken, this.secretKeyRefresh);
            return this.generateAccessToken(payload);

        } catch (error) {
            throw new UserError("Invalid refresh token");
        }
    }
}


export default new TokenService();