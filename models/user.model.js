// Schema, model
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
import crypto from 'crypto';
const userSchema = new Schema(
  {
    fullName: {
      type: "String",
      // validation -: 3 level
      // i) client level -: frontend (validation) - react
      // ii) controllers level -: user ne shi information de rkhi hein yaa nhi
      // iii) database level -: jb database me data ja rha ho to whi pr define kr de ki data shi hai ki nhi hai (in schema the third level we are declaring)
      required: [true, "Name is required"],
      minLength: [3, "Name must be at least 3 characters."],
      maxLength: [50, "Name should be less than 50 characters."],
      lowercase: true,
      trim: true,
    },
    email: {
      type: "String",
      required: [true, "email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill in a valid email address",
      ],
    },
    password: {
      type: "String",
      required: [true, "Your Password is required"],
      minLength: [8, "Password must be 8 character."],
      select: false,
      // select isliye hota hai ki agr mein user se related koi query kr rha hoo to by default password mujhe mt dena, mujhe end user ko dikhana hi nhi hai
    },
    avatar: {
      public_id: {
        type: "String",
      },
      secure_url: {
        type: "String",
      },
    },
    role: {
      type: "String",
      enum: ["USER", "ADMIN"],
      // issme 2 type ke roles hein user aur admin
      default: "USER",
      // by default koi role define nhi hoga to wo user consider kiya jayega
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
    // kb create hua, kb kya hua automatically sb create hoga
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
  generateJWTToken: async function () {
    return await jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },
  comparePassword: async function (plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, this.password);
  },

  generatePasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; //15 min from now

    return resetToken;
  }
};

const User = model("User", userSchema);

export default User;
