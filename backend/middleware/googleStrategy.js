import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await userModel.findOne({ googleId: profile.id });

            if (existingUser) return done(null, existingUser);

            const user = new userModel({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                profilePic: profile.photos[0].value,
                isVerified: true
            });

            await user.save();
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));
