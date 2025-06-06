// async function logout(request, response){
//     try{
//          const cookieOption={
//        http:true,
//        secure:true
//     }
//         return response.cookie('token',token,cookieOption).status(200).json({
//         message:"logout successful",
//         success:true
//     })
//     }
//     catch(error){
//         return response.status(500).json({
//             message: error.message || error,
//             error:true
//         }) 

//     }
// }

// module.exports=logout


async function logout(request, response) {
    try {
        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };

        // This clears the token cookie
        response.clearCookie('token', cookieOption);

        return response.status(200).json({
            message: "Logout successful",
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = logout;
