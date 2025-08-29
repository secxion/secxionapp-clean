async function userLogout(req, res) {
    try {
        res.clearCookie("token", { path: "/", httpOnly: true, sameSite: "lax" });
        // Optionally, blacklist JWT or destroy session here

        res.json({
            message: "Logged out successfully",
            error: false,
            success: true,
            data: []
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
