const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
const nameRegex = /^[a-zA-Z\s]{1,50}$/;
const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const passwordRegex = /^.{6,}$/;
export function validateCreateUser(user) {
  const errors = {};
  if (!user.username) {
    errors.username = "Username is required";
  } else if (!usernameRegex.test(user.username)) {
    errors.username =
      "Username must be 3-16 characters, alphanumeric, and may include underscores";
  }
  if (!user.name) {
    errors.name = "Name is required";
  } else if (!nameRegex.test(user.name)) {
    errors.name =
      "Name must contain only letters and spaces, up to 50 characters";
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
  // if (!user.password) {
  //   errors.password = "Password is required";
  // } else if (!passwordRegex.test(user.password)) {
  //   errors.password =
  //     "Password must be at least 8 characters and include both letters and numbers";
  // }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
export function validateUpdateUser(user) {
  const errors = {};
  if (!user.username) {
    errors.username = "Username is required";
  } else if (!usernameRegex.test(user.username)) {
    errors.username =
      "Username must be 3-16 characters, alphanumeric, and may include underscores";
  }
  if (!user.name) {
    errors.name = "Name is required";
  } else if (!nameRegex.test(user.name)) {
    errors.name =
      "Name must contain only letters and spaces, up to 50 characters";
  }
  if (!user.email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(user.email)) {
    errors.email = "Invalid email format";
  }
  // if (!user.password) {
  //   errors.password = "Password is required";
  // } else if (!passwordRegex.test(user.password)) {
  //   errors.password =
  //     "Password must be at least 8 characters and include both letters and numbers";
  // }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
