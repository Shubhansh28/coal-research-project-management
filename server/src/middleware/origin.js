const allowedOrigin = process.env.CLIENT_ORIGIN
const checkOrigin = (req,res,next) => {
    if (['POST','PATCH','DELETE'].includes(req.method)) {
        const origin = req.get('origin')
        if (!origin || origin!=allowedOrigin){
            return res.status(403).json({success: false, message: 'Invalid origin'})
        }
    }
    next()
}

module.exports = checkOrigin