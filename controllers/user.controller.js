import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true
}

const register = async (req, res, next) => {
    //  registration krne ke liye koi information milegi to hum post request marte hein to user se related koi bhi information ho to wo body me aati hai
    const { fullName, email, password} = req.body;

    if( !fullName || !email || !password){
        return next(new AppError("All fields are required", 400)); 
    }

    const userExists = await User.findOne({ email });

    if(userExists) {
        return next(new AppError('Email already exists', 400));
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload'
        }
    });

    if(!user){
        return next(new AppError('User registration failed, please try again.', 404))
    }

    // TODO: File upload

    await user.save();
    // user database me save ho jayega

    user.password = undefined;

    // register kr diya hai to use direct login krwa do firse login page mt dikhao
    //login krne ke liye -:
    //  1) JWT Token generate krna hota 
    // 2) JWT Token cookie me dalna hota hai

    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        user,
    })
};

const login = async (req, res, next) => {
    try{
        const { email, password } = req.body;
    
        if(!email || !password) {
            return next(new AppError('All fields are required', 400));
        } 
    
        const user = await User.findOne({
            email
        }).select('+password'); // password ko explicitely manga hai yhn pr isliye "+" krna pda hai
    
        if(!user || !user.comparePassword(password)){
            return next(new AppError('Email or password does not match.', 400))
        };
    
        const token = await user.generateJWTToken();
        user.password = undefined;
    
        res.cookie('token', token, cookieOptions);
    
        res.status(200).json({
            success: true,
            message: "User loggedIn successfully",
            user,
        })

    } catch(e){
        return next(new AppError(e.message, 500)); 
    }
};

//logout krne ka simple tareeka hota hai uski cookie ko delete kr do
const logout = (req, res, next) => {
    try{
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        });
    
        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        })
    } catch(e){
        return next (new AppError(e.message, 500));
    }
};

const getProfile = async (req, res) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId);
    
        res.status(200).json({
            success: true,
            message: 'User details',
            user,
        })

    } catch(e){
        return next(new AppError('Failed to fetch profile details.', 500))
    }
};

export { register, login, logout, getProfile };
