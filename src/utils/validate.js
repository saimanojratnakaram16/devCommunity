const validator = require("validator");

const validateSignUp = (req) => {
  let errors = {};

  let { firstName, lastName, emailId, password, gender, age } = req.body;

  if (!firstName || firstName.length < 2 || firstName.length > 50) {
    errors.firstName = "First name must be between 2 and 50 characters.";
  }

  if (lastName && (lastName.length < 2 || lastName.length > 50)) {
    errors.lastName = "Last name must be between 2 and 50 characters.";
  }

  if (!emailId || !validator.isEmail(emailId)) {
    errors.emailId = "Invalid email format.";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  } else if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    errors.password =
      "Password must include at least one letter, one number, and one special character.";
  }

  if (age !== undefined && (age < 18 || age > 120)) {
    errors.age = "Age must be a valid number between 18 and 120.";
  }

  if (gender && !["male", "female", "other"].includes(gender.toLowerCase())) {
    errors.gender = "Gender must be 'male', 'female', or 'other'.";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "gender",
    "age",
    "skills",
    "photoUrl",
  ];

  console.log(req);

  const isEditAllowed = Object.keys(req).every((field)=>
    allowedEditFields.includes(field)
  )

  return isEditAllowed;
};

module.exports = { validateSignUp, validateEditProfileData };
