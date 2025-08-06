import bcrypt from 'bcryptjs';
import userModel from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import { verifySliderValue } from '../../utils/sliderVerification.js';

async function userSignInController(req, res) {
    try {
        const { email, password, sliderValue, targetValue, slider } = req.body;

        console.log("🔐 Login attempt:");
        console.log("📧 Email:", email);
        console.log("🎯 Target:", targetValue);
        console.log("📍 Slider:", sliderValue);
        console.log("📩 Slider Signature Object:", slider);

        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ message: "Please provide email and password", error: true, success: false });
        }

        if (
            typeof sliderValue !== "number" ||
            typeof targetValue !== "number" ||
            Math.abs(sliderValue - targetValue) > 3
        ) {
            console.log("❌ Slider value mismatch. sliderValue:", sliderValue, "targetValue:", targetValue);
            return res.status(403).json({
                message: "Verification failed. Please try again.",
                error: true,
                success: false
            });
        }

        if (!slider || !verifySliderValue(slider.value, slider.signature)) {
            console.log("❌ Slider signature verification failed");
            return res.status(403).json({
                message: "Verification failed. Please try again.",
                error: true,
                success: false
            });
        }

        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            console.log("❌ User not found for email:", email);
            return res.status(404).json({ message: "User not found", error: true, success: false });
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            console.log("❌ Incorrect password for:", email);
            return res.status(401).json({ message: "Incorrect password", error: true, success: false });
        }

        if (!user.isVerified) {
            console.log("❌ Email not verified:", email);
            return res.status(403).json({
                message: "Please verify your email before logging in.",
                error: true,
                success: false
            });
        }

        const tokenData = {
            _id: user._id,
            email: user.email,
        };

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 8 });

        const tokenOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        };

        console.log("✅ Login successful for:", email);

        res.cookie("token", token, tokenOptions).status(200).json({
            message: "Login successful",
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            },
            success: true,
            error: false
        });

    } catch (err) {
        console.error("🔥 Sign-in Error:", err);
        res.status(500).json({
            message: err.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

export default userSignInController;
