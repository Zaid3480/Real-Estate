import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import sendResponse from '../utils/ResponseHelper.js'; // Adjust path if needed
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js'; // Adjust path if needed
import jwt from 'jsonwebtoken';
import CustomerPropertyRequirement from '../models/customerPropertyRequirement.model.js';
import Property from '../models/property.model.js';
import ExcelJS from 'exceljs'

export const userRegistration = async (req, res) => {
    try {
        const { fullName, mobileNo, email, address, password,role } = req.body;

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
            role,
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
            return sendResponse(res, 404, 'Credentials are Incorrect');
        }

        // 3. Verify Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendResponse(res, 401, 'Invalid password');
        }

        if (user.isActive === false) {
          return sendResponse(res, 403, 'Your account has been deactivated. Please contact support.');
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
        return sendResponse(res, 200, 'Logged in successfully.', {
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

export const getAllUsers = async (req, res) => {
  try {
    // 1. Parse + sanitize inputs
    const pageNum = Math.max(parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(parseInt(req.query.limit, 10) || 10, 100); // Max 100 per page
    const rawSearch = (req.query.search || '').trim();

    // 2. Build base query
    const query = { role: 'user' };

    // 3. Add search filter if provided
    if (rawSearch.length) {
      const re = new RegExp(rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { fullName: re },
        { mobileNo: re }
      ];
    }

    // 4. Execute paginated find + count in parallel
    const [users, total] = await Promise.all([
      User.find(query)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .select('-password -otp -otpExpire')
          .lean(),
      User.countDocuments(query)
    ]);

    // 5. Get all requirements in a single query
    const userIds = users.map(user => user._id);
    const allRequirements = await CustomerPropertyRequirement.find(
      { userDetails: { $in: userIds } },
      'propertyPurpose propertyType priceRange userDetails'
    ).lean();

    // 6. Create requirements lookup map
    const requirementsMap = allRequirements.reduce((map, req) => {
      const userId = req.userDetails.toString();
      if (!map[userId]) map[userId] = [];
      map[userId].push(req);
      return map;
    }, {});

    // 7. Combine users with their requirements
    const usersWithRequirements = users.map(user => ({
      ...user,
      propertyRequirements: requirementsMap[user._id.toString()] || []
    }));

    // 8. Send response
    return sendResponse(res, 200, 'Users retrieved successfully.', {
      data: usersWithRequirements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (err) {
    console.error('Error getting users:', err);
    return sendResponse(res, 500, 'Server error', { error: err.message });
  }
};
  
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password -otp -otpExpire');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const activeOrDeactivateUser = async (req, res) => {
    try {
      const userId = req.params.id;
      const { isActive } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return sendResponse(res, 404, 'User not found');
      }
  
      user.isActive = isActive;
      await user.save();
  
      return sendResponse(res, 200, `User ${isActive ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      console.error('Error updating user status:', error.message);
      return sendResponse(res, 500, 'Server error', error.message);
    }
  };
  

  export const editUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { fullName, email, address } = req.body;

        if (!userId) {
            return sendResponse(res, 400, 'User ID is required');
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, 'User not found');
        }

        // Update only if fields are provided
        if (fullName !== undefined) user.fullName = fullName;
        if (email !== undefined) user.email = email;
        if (address !== undefined) user.address = address;

        const updatedUser = await user.save();

        const { password, otp, otpExpire, ...safeUser } = updatedUser.toObject();

        return sendResponse(res, 200, 'User updated successfully', { user: safeUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return sendResponse(res, 500, 'Server error', error.message);
    }
};


export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return sendResponse(res, 404, 'User not found');
        }

        await User.deleteOne({ _id: userId });

        return sendResponse(res, 200, 'User Deleted Successfully');
    } catch (error) {
        console.error('Error deleting user:', error.message);
        return sendResponse(res, 500, 'Server error', error.message);
    }
};

export const totalCountOfUsersandBrokers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({ role: 'user' });
        const brokerCount = await User.countDocuments({ role: 'broker' });

        const propertyCount = await Property.countDocuments({ status: 'Active' });

        return sendResponse(res, 200, 'Counts retrieved successfully', {
            userCount,
            brokerCount,
            propertyCount,
        });
    } catch (error) {
        console.error('Error counting users and brokers:', error.message);
        return sendResponse(res, 500, 'Server error', error.message);
    }
};

export const getAllBrokers = async (req, res) => {
  try {
      const { page = 1, limit = 10, search } = req.query;

      const query = {
          role: "broker"
      };

      // Search by fullName or mobileNo (case-insensitive)
      if (search) {
          query.$or = [
              { fullName: { $regex: search, $options: "i" } },
              { mobileNo: { $regex: search, $options: "i" } }
          ];
      }

      const skip = (page - 1) * limit;

      // First get the brokers with pagination
      const brokers = await User.find(query)
          .skip(Number(skip))
          .limit(Number(limit))
          .lean(); // Using lean() for plain JavaScript objects

      // Get the count of properties for each broker
      const brokersWithPropertyCount = await Promise.all(
          brokers.map(async (broker) => {
              const propertyCount = await Property.countDocuments({ 
                  postedBy: broker._id 
                  // or whatever field links properties to brokers, 
                  // could be 'listedBy', 'ownerId', etc.
              });
              return {
                  ...broker,
                  propertiesCount: propertyCount
              };
          })
      );

      const total = await User.countDocuments(query);

      res.status(200).json({
          data: brokersWithPropertyCount,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total
      });
  } catch (error) {
      console.error("Get all brokers error:", error);
      res.status(500).json({ error: error.message });
  }
};

export const exportExcelOfUsers = async (req, res) => {
  try {
      const users = await User.find({ role: 'user' });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

        worksheet.columns = [
            { header: 'Full Name', key: 'fullName', width: 30 },
            { header: 'Mobile No', key: 'mobileNo', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Address', key: 'address', width: 50 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Updated At', key: 'updatedAt', width: 20 },
            ];

      users.forEach((user) => {
          worksheet.addRow({
              fullName: user.fullName,
              mobileNo: user.mobileNo,
              email: user.email,
              address: user.address,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
          });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
      return workbook.xlsx.write(res).then(() => {
          res.end();
      });
  } catch (error) {
      console.error('Error exporting Excel:', error.message);
      return sendResponse(res, 500, 'Server error', error.message);
  }
};


export const exportExcelOfBrokers = async (req, res) => {
  try {
      const brokers = await User.find({ role: 'broker' });
          
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Brokers');
    
        worksheet.columns = [
            { header: 'Full Name', key: 'fullName', width: 30 },
            { header: 'Mobile No', key: 'mobileNo', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Address', key: 'address', width: 50 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Updated At', key: 'updatedAt', width: 20 },
        ];
    
        brokers.forEach((broker) => {
            worksheet.addRow({
                fullName: broker.fullName,
                mobileNo: broker.mobileNo,
                email: broker.email,
                address: broker.address,
                createdAt: broker.createdAt,
                updatedAt: broker.updatedAt,
            });
        });
    
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=brokers.xlsx');
        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        console.error('Error exporting Excel:', error.message);
        return sendResponse(res, 500, 'Server error', error.message);
    }
    }


  

