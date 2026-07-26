const Message = require("../models/Message");


const contactController = async(req,res)=>{

try{

        const {name, email, subject, message} = req.body;


        // Validation

        if(!name || !email || !subject || !message){

            return res.status(400).json({

                success:false,
                message:"Please fill in all fields."

            });

        }
        
      // Save the message

        const newMessage = await Message.create({

            name,
            email,
            subject,
            message

        });


        // Success response

        res.status(201).json({

            success:true,
            message:"Message sent successfully.",
            newMessage

        });


    }catch(error){

        res.status(500).json({

            success:false,
            message:"Internal server error."

        });

    }


};


module.exports = contactController;