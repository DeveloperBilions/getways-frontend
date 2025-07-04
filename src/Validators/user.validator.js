const usernameRegex = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9._]{3,10}$/;
const nameRegex = /^[a-zA-Z\s]{1,25}$/;
const phoneNumberRegex = /^\d{10}$/;
const emailRegex = /^(?!.*\.\.)([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+|{};:/?.>',<[\]\\`~])[A-Za-z\d!@#$%^&*()\-_=+|{};:/?.>',<[\]\\`~]{6,}$/;
export function validateCreateUser(user) {

    const errors = {};

    if (!user.username) {
        errors.username = "Username is required";
    } else if (!usernameRegex.test(user.username)) {
        errors.username = "Username must be 3-10 characters long and contain only letters, numbers, _, and ., with at least one letter or number.";
    }

    if (!user.name) {
        errors.name = "Name is required";
    } else if (!nameRegex.test(user.name)) {
        errors.name = "Name must contain only letters and spaces, up to 25 characters";
    }

    if (!user.phoneNumber) {
        errors.phoneNumber = "Phone number is required";
    } else if (!phoneNumberRegex.test(user.phoneNumber)) {
        errors.phoneNumber = "Invalid phone number format";
    }

    if (!user.email) {
        errors.email = "Email is required";
    } else if (!emailRegex.test(user.email)) {
        errors.email = "Invalid email format";
    }

    if (!user.password) {
        errors.password = "Password is required";
    } else if (!passwordRegex.test(user.password)) {
        errors.password = "Password must be at least 6 characters long and include at least one uppercase letter, one special letter, and one number.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

export function validateUpdateUser(user) {
    const errors = {};

    if (!user.username) {
        errors.username = "Username is required";
    } else if (!usernameRegex.test(user.username)) {
        errors.username = "Username must be 3-16 characters, alphanumeric, and may include underscores";
    }

    if (!user.name) {
        errors.name = "Name is required";
    } else if (!nameRegex.test(user.name)) {
        errors.name = "Name must contain only letters and spaces, up to 50 characters";
    }

    if (!user.email) {
        errors.email = "Email is required";
    } else if (!emailRegex.test(user.email)) {
        errors.email = "Invalid email format";
    }

    if (!passwordRegex.test(user.password) && user.password) {
        errors.password = "Password must be at least 6 characters long and include at least one uppercase letter, one special letter, and one number.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}