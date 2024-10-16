import showToastr from "../SERVICES/toaster-service";

const EMAIL_REGEX = new RegExp(/\S+@\S+\.\S+/);
const NAMES_REGEX = new RegExp(/^[^\d\s]+(?:\s[^\d\s]+)+$/);
const PASSWORD_REGEX = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/);
const MIN_AGE = 18;
const MAX_AGE = 100;

const validateFullName = (inputValue) => {
    let validationResponse = true;

    if (!inputValue) {
        validationResponse = false;
        showToastr("error", "Full name is required");
    } else if (inputValue.length < 2) {
        validationResponse = false;
        showToastr("error", "Full name must be at least 2 characters long");
    } else if (!NAMES_REGEX.test(inputValue)) {
        validationResponse = false;
        showToastr("error", "Full name must not contain numbers or spaces");
    }

    return validationResponse;
};

const validateEmail = (inputValue) => {
    let validationResponse = true;

    if (!inputValue) {
        validationResponse = false;
        showToastr("error", "Email is required");
    } else if (!EMAIL_REGEX.test(inputValue)) {
        validationResponse = false;
       showToastr("error", "Email is in the wrong format");
    }
    return validationResponse;
    
};

const validateBirthDate = (inputValue) => {
    let validationResponse = true;

    if (!inputValue) {
        validationResponse = false;
        showToastr("error", "BirthDate is required");
    } else {
        const birthDate = new Date(inputValue);
        const today = new Date();

        // Calculate age
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        // Adjust age if the birthday hasn't occurred yet this year
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < MIN_AGE) {
            validationResponse = false;
            showToastr("error", `Must be older than ${MIN_AGE} years old!`);
        } else if (age > MAX_AGE) {
            validationResponse = false;
            showToastr("error", `Must be younger than ${MAX_AGE} years old!`);
        }
    }

    return validationResponse;
};

const validatePassword = (inputValue) => {
    let validationResponse = true;
    if (!inputValue) {
        validationResponse = false;
        showToastr("error", "Password is required");
    } else if (!PASSWORD_REGEX.test(inputValue)) {
        validationResponse = false;
        showToastr("error", "Password is in the wrong format!");
    }
    return validationResponse;
};

const validateConfirmPassword = (inputValue, passwordValue) => {
    let validationResponse = true;
    if (!inputValue) {
        validationResponse = false;
        showToastr("error", "Confirm Password is required");
    } else if (passwordValue !== inputValue) {
        validationResponse = false;
        showToastr("error", "Passwords do not match!");
    }
    return validationResponse;
};

export const validationRules = {
    fullName: validateFullName,
    email: validateEmail,
    birthDate:validateBirthDate,
    password: validatePassword,
    confirmPassword:validateConfirmPassword
};
