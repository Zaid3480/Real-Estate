// utils/responseHelper.js
export const sendResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        statusCode,
        message,
        data,
    });
};


export default sendResponse;
