const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const DiscordStrategy = require('passport-discord').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
// },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             let user = await User.findOne({ googleId: profile.id });

//             if (!user) {
//                 user = new User({
//                     googleId: profile.id,
//                     username: profile.displayName,
//                     avatar: profile.photos ? profile.photos[0].value : null,
//                     joinTime: new Date()
//                 });
//                 await user.save();
//             }

//             return done(null, user);
//         } catch (err) {
//             return done(err);
//         }
//     }
// ));

// passport.use(new DiscordStrategy({
//     clientID: process.env.DISCORD_CLIENT_ID,
//     clientSecret: process.env.DISCORD_CLIENT_SECRET,
//     callbackURL: '/auth/discord/callback',
//     scope: ['identify', 'email']
// },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             let user = await User.findOne({ discordId: profile.id });

//             if (!user) {
//                 user = new User({
//                     discordId: profile.id,
//                     username: profile.username,
//                     avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
//                     joinTime: new Date()
//                 });
//                 await user.save();
//             }

//             return done(null, user);
//         } catch (err) {
//             return done(err);
//         }
//     }
// ));

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});
