const User = require('../models/User');
const {errorModal, validateEmail, validateName} = require('../middleware/verificationsAndValidations');
const filter = async (req, res, next)=>{
    // _user_email --> the user who is trying to update the fields (details from the token)
    const _user_email = req.user.email;

    // destructuring the fields as change of email, name and registration_no can only be done by admin
    const {new_email, name, new_registration_no} = req.body;
    try {
        const _user = await User.findOne({email:_user_email});
        // if the token is tempered and the user is not found
        if(!_user) return res.status(404).json(errorModal("Not found", "User is not found", "Email is not registered"));

        // if the user is admin check the basic check like valid name, email , registration number
        if(_user.isAdmin){
            if(name && !validateName(name)) return res.status(401).json(errorModal("Invalid Input", "name", "Invalid Name"));
            else if(new_email && !validateEmail(new_email)) return res.status(401).json(errorModal("Invalid Input", "email", "Invalid email"));
            else if(new_registration_no && (isNaN(new_registration_no) !== false)) return res.status(401).json(errorModal("Invalid Input", "registration_no", "Must be numeric"));
            else next();
        }
        // else block the denied fields and return response
        else if(new_email !== undefined || name !== undefined || new_registration_no !== undefined) {
            let deniedFields = [];
            if(new_email) deniedFields.push('Email');
            if(name) deniedFields.push('Name');
            if(new_registration_no) deniedFields.push('Registration Number');
            return res.status(400).json(errorModal("Access Denied", 'Some fields require admin access', `${deniedFields}`));
        }
        // if everything is clear pass to next function
        else 
            next();

    } catch (error) {
        console.log(error);
        return res.status(500).json(errorModal("Server", "Sever error", "Try again"));
    }
} 
module.exports = {filter};