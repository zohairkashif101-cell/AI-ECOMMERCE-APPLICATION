const path = require("path");
const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const User = require("../src/models/User");

const readHidden = (prompt) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    reject(new Error("Run this command in an interactive terminal."));
    return;
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  let value = "";
  const finish = (error) => {
    process.stdin.removeListener("keypress", onKeypress);
    process.stdin.setRawMode(false);
    process.stdout.write("\n");
    if (error) {
      reject(error);
    } else {
      resolve(value);
    }
  };

  const onKeypress = (character, key) => {
    if (key.ctrl && key.name === "c") {
      finish(new Error("Password reset cancelled."));
    } else if (key.name === "return" || key.name === "enter") {
      finish();
    } else if (key.name === "backspace") {
      value = Array.from(value).slice(0, -1).join("");
    } else if (!key.ctrl && !key.meta && character && !/[\u0000-\u001f\u007f]/.test(character)) {
      value += character;
    }
  };

  process.stdin.on("keypress", onKeypress);
});

const recoverOwnerAccount = async () => {
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) {
    throw new Error("OWNER_EMAIL is not configured in the project environment.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured in the project environment.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  let owner = await User.findOne({ email: ownerEmail });

  const name = owner ? owner.name : (await readHidden("Owner name: ")).trim();
  if (!name) {
    throw new Error("Owner name is required.");
  }

  const password = await readHidden("New owner password (minimum 6 characters): ");
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const confirmPassword = await readHidden("Confirm new owner password: ");
  if (password !== confirmPassword) {
    throw new Error("The passwords do not match.");
  }

  if (!owner) {
    owner = new User({ name, email: ownerEmail });
  }

  owner.name = name;
  owner.role = "owner";
  owner.password = await bcrypt.hash(password, 12);
  owner.passwordResetOtpHash = undefined;
  owner.passwordResetOtpExpiresAt = undefined;
  owner.passwordResetOtpAttempts = 0;
  await owner.save();

  console.log(`Password updated for the configured owner account (${ownerEmail}).`);
};

recoverOwnerAccount()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
