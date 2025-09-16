import jwt from 'jsonwebtoken';

const isAuth = async(req , res , next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Not Authorised"});
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decoded.id;
        console.log(decoded);
        next();
    } catch (error) {
        return res.status(401).json({message:"Not Authorised"});
    }
}
export default isAuth;