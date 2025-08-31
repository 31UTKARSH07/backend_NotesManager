const { errors } = require('@upstash/redis');
const Joi = require('joi')

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .trim()
            .messages({
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 50 characters',
                'any.required': 'Name is required'
            }),
        email: Joi.string()
            .email()
            .required()
            .lowercase()
            .trim()
            .messages({
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(8)
            .max(128)
            .required()
            .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])'))
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.max': 'Password cannot exceed 128 characters',
                'string.pattern.base': 'Password must contain at least one letter and one number',
                'any.required': 'Password is required'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Password confirmation does not match password',
                'any.required': 'Password confirmation is required'
            })
    })
    return schema.validate(data, { abortEarly: false })
    /**Setting abortEarly: false tells Joi to check all validation rules
     *  and return all errors at once. This is useful
     *  for displaying all validation errors to the user simultaneously. */
};
const LoginValidation = (data) => {
    //console.log(data)
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .lowercase()
            .trim()
            .messages({
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'Password is required'
            }),
        rememberMe: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'Remember me must be true or false'
            })
    });
    return schema.validate(data)
}
const forgotPasswordValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .lowercase()
            .trim()
            .messages({
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            })
    })
    return schema.validate(data);
};
const resetPasswordValidation = (data) => {
    const schema = Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'any.required': 'Reset token is required'
            }),
        password: Joi.string()
            .min(8)
            .max(128)
            .required()
            .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])'))
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.max': 'Password cannot exceed 128 characters',
                'string.pattern.base': 'Password must contain at least one letter and one number',
                'any.required': 'Password is required'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Password confirmation does not match password',
                'any.required': 'Password confirmation is required'
            })
    })
    return schema.validate(data, { abortEarly: false });
}
const formatValidationErrors = (errors) => {
    return errors.details.map(error => ({
        field: error.path[0],
        message: error.message
    }));
};

module.exports = {
    registerValidation,
    LoginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    formatValidationErrors
}