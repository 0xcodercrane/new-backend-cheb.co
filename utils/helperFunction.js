import  jwt from 'jsonwebtoken';


const { sign, verify } = jwt

// Generate Token
export function generateToken(id) {
    return sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}


export const generateOtp = () => {
    let otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  };