export function validatePositiveNumber(value) {
    if (!/^\d+(\.\d+)?$/.test(value)) {
        return { isValid: false, error: "Value must contain only Positive numbers" };
    }
    value = Number(value);
    if (value <= 0) {
        return { isValid: false, error: "Number must be greater than 0" };
    }

    return { isValid: true };
}
