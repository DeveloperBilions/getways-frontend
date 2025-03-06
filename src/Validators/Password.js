export const validatePassword = (password, setPasswordErrors) => {
  const errors = [];
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*)"
    );
  }
  setPasswordErrors(errors);
  return errors.length === 0;
};
