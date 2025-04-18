export const generateOTP = () => {
    // Generate a 4-digit random number
    const otp = Math.floor(1000 + Math.random() * 9000); // Ensures a 4-digit number
    return otp.toString(); // Return as a string if needed
};



export default generateOTP