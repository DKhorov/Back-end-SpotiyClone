import jwt from 'jsonwebtoken'

export default ( req,res, next)=>{
    const token = (req.headers.authorization || '').replace(/Bearer\s?/,'');
    console.log(token);
    if (token){
        try{
            const decoded = jwt.verify(token,'secret123');
            req.userId = decoded._id;
            next();

        }catch(err){
            return res.status(403).json({
                message:'Invalid token or Error'
            })

        }

    }else{
        return res.status(403).json({
            message: 'Error in token'
        })
    }
   
}