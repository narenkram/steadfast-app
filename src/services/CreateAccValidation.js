import Validations from './Validations.js'

export default class CreateAccountValidation {
    constructor(email, password) {
        this.email = email
        this.password = password
    }


    checkValidations() {
        let errors = [];

        // email validations
        if (!Validations.checkEmail(this.email)) {
            errors['email'] = 'Invalid Email';
        }

        // password validations
        if (!Validations.minLength(this.password, 6)) {
            errors['password'] = 'Password must be at least 6 characters long';
        }

        return errors;
    }

    static getErrorMessageFromCode(errorCode) {
        switch (errorCode) {
            case 'EMAIL_EXISTS':
                return 'Email already exists';
        }
    }
}

