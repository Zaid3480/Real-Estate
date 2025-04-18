import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import sendResponse from '../utils/ResponseHelper.js'; // Adjust path if needed
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js'; // Adjust path if needed
import jwt from 'jsonwebtoken';


export const userRegistration = async (req, res) => {
    try {
        const { fullName, mobileNo, email, address, password } = req.body;

        // 1. Validate Required Fields
        if (!fullName || !mobileNo || !email || !address || !password) {
            return sendResponse(res, 400, 'All fields are required');
        }

        // 2. Validate Password Length
        if (password.length < 8) {
            return sendResponse(res, 400, 'Password must be at least 8 characters long');
        }

        // 3. Check for Duplicates
        const [existingEmail, existingMobile] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ mobileNo }),
        ]);

        if (existingEmail) {
            return sendResponse(res, 409, 'Email already exists');
        }

        if (existingMobile) {
            return sendResponse(res, 409, 'Mobile number already exists');
        }

        // 4. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Generate OTP and Expiry
        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // 6. Create and Save User
        const newUser = new User({
            fullName,
            mobileNo,
            email,
            address,
            password: hashedPassword,
            otp,
            otpExpire,
        });

        await newUser.save();

        // 7. Send Email with OTP
        const subject = 'Your PROMPCONNECT OTP for Registration';
        const html = `
            <p>Hello ${fullName},</p>
            <p>Welcome to <strong>PROMPCONNECT</strong>!</p>
            <p>Your OTP for registration is: <strong style="font-size: 18px;">${otp}</strong></p>
            <p>This OTP will expire in 5 minutes. Please do not share it with anyone.</p>
            <br/>
            <p>Best regards,<br/>Team PROMPCONNECT</p>
        `;
        await sendEmail(email, subject, html);

        // 8. Prepare safe response
        const { password: _, otp: __, otpExpire: ___, ...safeUser } = newUser.toObject();

        // 9. Send Success Response
        return sendResponse(res, 201, 'User registered successfully. OTP sent to email.', {
            user: safeUser,
        });

    } catch (error) {
        console.error('Registration Error:', error.message);
        return sendResponse(res, 500, 'Internal server error', error.message);
    }
};


export const userLogin = async (req, res) => {
    try {
        const { mobileNo, password } = req.body;

        // 1. Validate Required Fields
        if (!mobileNo || !password) {
            return sendResponse(res, 400, 'All fields are required');
        }

        // 2. Find User by Mobile Number 
        const user = await User.findOne({ mobileNo });
        if (!user) {
            return sendResponse(res, 404, 'User not found');
        }

        // 3. Verify Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendResponse(res, 401, 'Invalid password');
        }

        // 4. Check if User is Verified
        if (!user.isVerified) {
            return sendResponse(res, 403, 'Please verify your account before logging in');
        }

        // 5. Generate JWT Token
        const token = jwt.sign(
            { id: user._id }, // payload
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // or '1h'/'30m' etc.
        );

        // 6. Prepare Safe User Response
        const { password: _, otp: __, otpExpire: ___, ...safeUser } = user.toObject();

        // 7. Send Success Response with Token
        return sendResponse(res, 200, 'User logged in successfully.', {
            token,
            user: safeUser,
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        return sendResponse(res, 500, 'Internal server error', error.message);
    }
};


export const otpVerification = async (req, res) => {
    try {
        const { mobileNo, otp } = req.body;

        // 1. Validate Required Fields
        if (!mobileNo || !otp) {
            return sendResponse(res, 400, 'All fields are required');
        }

        // 2. Find User by Mobile Number
        const user = await User.findOne({ mobileNo });
        if (!user) {
            return sendResponse(res, 404, 'User not found');
        }

        // 3. Check OTP and Expiry
        const isDevBypass = process.env.NODE_ENV === 'development' && otp === '0000';
        const isOtpValid = (user.otp === otp && user.otpExpire > new Date()) || isDevBypass;

        if (!isOtpValid) {
            return sendResponse(res, 400, 'Invalid or expired OTP');
        }

        // 4. Update User Status
        user.isVerified = true;
        user.otp = undefined; // Clear OTP after successful verification
        user.otpExpire = undefined; // Clear OTP expiry
        await user.save();

        // 5. Prepare Safe Response
        const { password: _, otp: __, otpExpire: ___, ...safeUser } = user.toObject();

        // 6. Send Success Response
        return sendResponse(res, 200, 'OTP verified successfully.', {
            user: safeUser,
        });
    } catch (error) {
        console.error('OTP Verification Error:', error.message);
        return sendResponse(res, 500, 'Internal server error', error.message);
    }
};

export const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return sendResponse(res, 404, 'User not found');
        }

        const { password: _, otp: __, otpExpire: ___, ...safeUser } = user.toObject();
        return sendResponse(res, 200, 'User profile retrieved successfully.', {
            user: safeUser,
        });
    }
    catch (error) {
        console.error('Profile Retrieval Error:', error.message);
        return sendResponse(res, 500, 'Internal server error', error.message);
    }
};






