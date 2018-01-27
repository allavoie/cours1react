const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');
const NO_ERROR = null;

const User = mongoose.model('users');

const findUser = (user) => User.findOne(user).then((u) => ([null, u])).catch((e) => ([e, null]));
const findUserById = (id) => User.findById(id).then((u) => ([null, u])).catch((e) => ([e, null]));
const createUser = (user) => (new User(user).save());

passport.serializeUser((user, done) => {
  done(NO_ERROR, user.id);
});

passport.deserializeUser(async (id, done) => {
  const [err, user] = await findUserById(id);
  if (err) done(err, null)
  done(NO_ERROR, user);
});

passport.use(
  new GoogleStrategy({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      newUser = { googleId: profile.id };
      const [findUserError, userFound ] = await findUser(newUser);
      if (!userFound){
        createUser(newUser)
          .then(user => done(NO_ERROR, user))
          .catch(err => done(err, null))
      } else {
        done(NO_ERROR, userFound);
      }
    }
  )
);

