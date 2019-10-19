const usersCollection = require("../db")
  .db()
  .collection("users");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const md5 = require("md5");

let User = function(data, getAvatar) {
  this.data = data;
  this.errors = [];
  if (getAvatar == undefined) getAvatar = false;
  if (getAvatar) this.getAvatar();
};

User.prototype.cleanUp = function() {
  if (typeof this.data.username != "string") this.data.username = "";
  if (typeof this.data.email != "string") this.data.email = "";
  if (typeof this.data.password != "string") this.data.password = "";

  // get rid of bogus props
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  };
};

User.prototype.validate = function() {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == "") {
      this.errors.push("You must provide a username.");
    }
    if (
      this.data.username != "" &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push(
        "You must provide a valid username ie: letters and numbers."
      );
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("You must provide a valid email.");
    }
    if (this.data.password == "") {
      this.errors.push("You must provide a password.");
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Username must be at least 3 characters.");
    }
    if (this.data.username.length > 30) {
      this.errors.push("Username can not exceed 30 characters.");
    }
    if (this.data.password.length > 0 && this.data.password.length < 12) {
      this.errors.push("Password must be at least 12 characters.");
    }
    if (this.data.password.length > 50) {
      this.errors.push("Password can not exceed 50 characters.");
    }
    // user already taken
    if (
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let usernameExists = await usersCollection.findOne({
        username: this.data.username
      });
      if (usernameExists) this.errors.push("That Username is already taken!");
    }
    // email already taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email
      });
      if (emailExists) this.errors.push("That Email is already taken!");
    }
    resolve();
  });
};

User.prototype.login = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    usersCollection
      .findOne({ username: this.data.username })
      .then(attemptUser => {
        if (
          attemptUser &&
          bcrypt.compareSync(this.data.password, attemptUser.password)
        ) {
          this.data = attemptUser;
          this.getAvatar();
          resolve("Login Successfull");
        } else {
          reject("Invalid username or password");
        }
      })
      .catch(() => {
        reject("Please try again later");
      });
  });
};

User.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    // validate user
    this.cleanUp();
    await this.validate();

    // if no errors save user to db
    if (!this.errors.length) {
      // hash password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
      this.getAvatar();
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.getAvatar = function() {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

User.findByUsername = function(username) {
  return new Promise(function(resolve, reject) {
    if (typeof username != "string") {
      reject();
      return;
    }
    usersCollection
      .findOne({ username: username })
      .then(function(userDoc) {
        if (userDoc) {
          userDoc = new User(userDoc, true);
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username,
            avatar: userDoc.avatar
          };
          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(function() {
        reject();
      });
  });
};

User.doesEmailExist = function(email) {
  return new Promise(async (resolve, reject) => {
    if (typeof email != "string") {
      resolve(false);
      return;
    }
    let user = await usersCollection.findOne({ email: email });
    if (user) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

module.exports = User;
