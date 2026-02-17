import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../models/user.schema";
import { Model, ObjectId } from "mongoose";
import { SignupDto } from "../dtos/signup.dto";
import * as bcrypt from 'bcrypt';
import { ApiException } from "../classes/ApiException.class";
import { LoginDto } from "../dtos/login.dto";
import * as jwt from 'jsonwebtoken';
import { AccessToken } from "../models/access-token.schema";
import { MailService } from "./mail.service";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";
import { EmailVerification } from "../models/email-verification.schema";
import { ConfirmCodeDto } from "../dtos/confirm-code.dto";
import { randomUUID } from 'crypto';
import { MobileVerification } from "../models/mobile-verification.schema copy";
import { SmsService } from "./sms.service";
import { ConfirmCodeMobileDto } from "../dtos/confirm-code-mob.dto";


@Injectable()
export class AuthService {
    constructor(private mailService: MailService, private smsService: SmsService, @InjectModel(User.name) private userModel: Model<User>, @InjectModel(MobileVerification.name) private mobileVerificationModel: Model<MobileVerification>, @InjectModel(EmailVerification.name) private emailVerificationModel: Model<EmailVerification>, @InjectModel(AccessToken.name) private accessTokenModel: Model<AccessToken>) { }

    async signup(signupData: SignupDto) {
        let { password, code, fullName, mobileNumber, business } = signupData;

        const verificationRecord = await this.mobileVerificationModel.findOne({
            mobileNumber,
            code,
            expiresAt: { $gt: new Date() },
        });

        if (!verificationRecord) {
            return new ApiException("Mobile not verified or password creation time expired", 400);
        }

        const MobileInUse = await this.userModel.exists({ mobileNumber });
        if (MobileInUse) {
            return new ApiException("Mobile already in use", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1️⃣ create user without qrCode
        const user = await this.userModel.create({
            mobileNumber: parseInt(mobileNumber),
            password: hashedPassword,
            fullName,
            business
        });

        // 2️⃣ use Mongo _id as QR
        user.qrCode = user._id.toString();
        await user.save();

        const accessToken = await this.generateToken(user._id.toString());

        await this.storeAccessToken(user._id, accessToken);

        return { user, token: accessToken };
    }

    async generateToken(userId: string) {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET);
        return token;
    }

    async confirmCodeEmailMobileNumber(data: ConfirmCodeMobileDto) {
        const mobileNumber = data.mobileNumber;
        const code = data.code;

        const record = await this.mobileVerificationModel.findOne({
            mobileNumber,
            code,
            expiresAt: { $gt: new Date() },
        });

        if (!record) {
            return new ApiException("Invalid or expired code", 400);
        }

        const passwordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.emailVerificationModel.updateOne(
            { _id: record._id },
            { $set: { passwordExpire } }
        );

        return ApiResponse.success('Mobile verified successfully');
    }

    async confirmCodeEmail(data: ConfirmCodeDto) {
        const email = data.email.toLowerCase();
        const code = data.code;

        const record = await this.emailVerificationModel.findOne({
            email,
            code,
            expiresAt: { $gt: new Date() },
        });

        if (!record) {
            return new ApiException("Invalid or expired code", 400);
        }

        const passwordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.emailVerificationModel.updateOne(
            { _id: record._id },
            { $set: { passwordExpire } }
        );

        return ApiResponse.success('Email verified successfully');
    }

    async sendVerificationCodeEmail(email: string) {
        email = email.toLowerCase();
        const emailInUse = await this.userModel.exists({ email });
        if (emailInUse) {
            return new ApiException("Email already in use", 400);
        }
        const existing = await this.emailVerificationModel.findOne({
            email,
            expiresAt: { $gt: new Date() }, // not expired
        });
        if (existing) {
            const now = new Date();
            const expiresInMs = existing.expiresAt.getTime() - now.getTime();
            const expiresInSec = Math.floor(expiresInMs / 1000);

            return ApiResponse.success({ message: `Verification code already sent. You can send new one in ${expiresInSec} seconds.`, alreadySent: true });
        }
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Set expiration time (e.g. 2 minutes from now)
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        await this.mailService.sendMail(
            email,
            `Your Verification Code`,
            `To continue registration, please use this code on the website: ${code}`
        );

        await this.emailVerificationModel.create({ email, code, expiresAt });

        return ApiResponse.success('Verification code sent to email');
    }

    async sendVerificationCodeMessage(mobileNumber: string) {
        const mobileInUse = await this.userModel.exists({ mobileNumber });
        if (mobileInUse) {
            return new ApiException("Mobile is already in use", 400);
        }
        const existing = await this.mobileVerificationModel.findOne({
            mobileNumber,
            expiresAt: { $gt: new Date() },
        });
        if (existing) {
            const now = new Date();
            const expiresInMs = existing.expiresAt.getTime() - now.getTime();
            const expiresInSec = Math.floor(expiresInMs / 1000);

            return ApiResponse.success({ message: `Verification code already sent. You can send new one in ${expiresInSec} seconds.`, alreadySent: true });
        }
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Set expiration time (e.g. 2 minutes from now)
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        await this.smsService.send(
            mobileNumber,
            `რეგისტრაციისთვის გამოიყენეთ კოდი: ${code}`
        );

        await this.mobileVerificationModel.create({ mobileNumber, code, expiresAt });

        return ApiResponse.success('Verification code sent to mobile');
    }

    async login(loginData: LoginDto) {
        let { mobile, password } = loginData;
        let user = await this.userModel.findOne({ mobileNumber:mobile });

        if (!user) {
            return new ApiException("Invalid mobile or password", 400);
        }

        if(user.record.state == 0){
            return new ApiException("User is blocked", 400);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new ApiException("Invalid mobile or password", 401);
        }
        const accessToken = this.generateToken(user._id.toString());
        try {
            await this.storeAccessToken(user._id, await accessToken);
        } catch (err) {
            console.error('Failed to store access token:', err);
            throw new ApiException('Internal server error while creating token', 500);
        }
        return { user, token: await accessToken };
    }

    async storeAccessToken(user: ObjectId, token: string) {
        const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

        await this.accessTokenModel.updateOne(
            { user }, // match by userId only
            { $set: { token, expiryDate } },
            { upsert: true } // create if doesn't exist
        );
    }

    async checkAccessToken(token: string) {

        const tokenDoc = await this.accessTokenModel.findOne({ token }).populate('userId');

        if (!tokenDoc) {
            return false; // token not found
        }

        const now = new Date();
        if (tokenDoc.expiryDate > now) {
            return { token: tokenDoc }; // token is still valid
        }

        return false; // token expired
    }

    async logout(userId: ObjectId) {
        await this.accessTokenModel.deleteOne({ userId });
        return { message: "User logged out successfully" };
    }

    async changePassword(userId: ObjectId, oldPassword: string, newPassword: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            return new ApiException("User not found", 404);
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return new ApiException("Old password is incorrect", 400);
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        return { message: "Password changed successfully" };
    }

async forgotPassword(mobileNumber: string) {
        const user = await this.userModel.findOne({ mobileNumber });
        
        // Security Tip: In production, you might return 200 even if the user isn't found
        // to prevent "account enumeration" attacks.
        if (!user) {
            return new ApiException("mobile number not found", 404);
        }

        // Fix: Await the promise so we get the string token, not a Promise object
        const accessToken = await this.generateToken(user._id.toString());

        await this.accessTokenModel.create({
            token: accessToken,
            user: user._id,
            expiryDate: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
        });

        // Note: Your backend code uses user.email, ensure your SMS service 
        // handles email if that's intended, or change to user.mobileNumber
        this.smsService.send(
            user.mobileNumber, 
            `Click this link to reset password https://gametime1.ge/%23/newpass/${accessToken}`
        );

        return {
            message: "If this number is registered, a password reset link will be sent to it."
        };
    }

    async resetPassword(token: string, newPassword: string) {
        const accessToken = await this.accessTokenModel.findOneAndDelete({ token, expiryDate: { $gt: new Date() } });
        if (!accessToken) {
            return new ApiException("Invalid or expired reset token", 400);
        }
        const user = await this.userModel.findById(accessToken.user);
        if (!user) {
            return new ApiException("User not found", 404);
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        await this.accessTokenModel.deleteOne({ _id: accessToken._id });
        return { message: "Password reset successfully" };
    }
}