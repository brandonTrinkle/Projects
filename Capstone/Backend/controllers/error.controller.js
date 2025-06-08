//Function for error handling using status code and message
export const errorHandler = (statusCode, message) => {

    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    return error;
}