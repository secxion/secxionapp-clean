async function userLogout(req, res) {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    // Clear the token cookie
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    // Optionally, invalidate the token (e.g., blacklist it if using JWT)
    // Example: Add the token to a blacklist database or cache

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
