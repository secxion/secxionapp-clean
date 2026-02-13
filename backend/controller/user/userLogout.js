async function userLogout(req, res) {
  try {
    // Clear the token cookie
    res.clearCookie("token", { path: "/", httpOnly: true, sameSite: "lax" });

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
