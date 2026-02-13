const checkVerified = (req, res, next) => {
  const user = req.user;

  if (!user || !user.isVerified) {
    return res
      .status(403)
      .json({ message: "Please verify your email before logging in." });
  }

  next();
};

export default checkVerified;
