import { revokeRefreshToken } from "../../middleware/securityMiddleware.js";

async function userLogout(req, res) {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    // Revoke refresh token if present
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Clear the token cookies
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.json({
      message: "Logged out successfully",
      error: false,
      success: true,
      data: [],
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

export default userLogout;
