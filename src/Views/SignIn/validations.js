export const inputValidations = {
    username: {
        required: "Username is required",
        pattern: {
            value: /^[A-Za-z]\w+$/,
            message: "Should start with alphabet and contain only numbers, alphabets or underscore."
        },
        minLength: {
            value: 8,
            message: "Should be between 8 and 20 characters in length",
        },
        maxLength: {
            value: 20,
            message: "Should be between 8 and 20 characters in length",
        },
    },
    name: {
        required: "Name is required",
        pattern: {
            value: /^[a-zA-Z ,.'-]+$/i,
            message: "Should be a valid name."
        },
    },
    lastName: {
        pattern: {
            value: /^$|[A-Za-z]\w+/,
            message: "Should start with alphabet and contain only numbers, alphabets or underscore."
        },
        maxLength: {
            value: 20,
            message: "Should be less than 20 characters in length",
        }
    },
    email: {
        required: "Email is required",
        pattern: {
            value: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            message: "Should be a valid email"
        },
    },
    password: {
        required: "Password is required",
        pattern: {
            value: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-_()=+<>,{}|;:'"]).{8,}$/,
            message: "Passwords must be at least eight characters long and contain lower and uppercase letters, numbers and symbols."
        },
        minLength: {
            value: 8,
            message: "Should be at least 8 character in length",
        },
    },
};