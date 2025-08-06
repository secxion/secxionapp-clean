import crypto from "crypto";

const SLIDER_SECRET = process.env.SLIDER_SECRET || "your_slider_secret_key";

export const generateSliderVerification = () => {
  const target = Math.floor(Math.random() * 61) + 20;
  const hmac = crypto.createHmac("sha256", SLIDER_SECRET).update(String(target)).digest("hex");
  return { target, signature: hmac };
};

export const verifySliderValue = (value, signature) => {
  const expectedHmac = crypto.createHmac("sha256", SLIDER_SECRET).update(String(value)).digest("hex");
  return expectedHmac === signature;
};
