const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json({
            mesage:"Access denied. No token provided."

        })
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded= jwt.verify(token,process.env.jwt_secret);

        req.user = decoded;

        next();


}catch (error) {
    res.status(400).json({
        message:"Invalid or expired token"
    });

}
};

module.exports = authMiddleware;