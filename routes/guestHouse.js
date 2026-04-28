import express from "express";
import { protect } from  "../middleware/auth.js";
import GuestHouseBooking from "../models/GuestHouseBooking.js";
import generatePDF from "../utils/generatePDF.js";
import { sendGuestHouseMail } from "../utils/sendMail.js";

const router = express.Router();

router.post("/book",async(req,res)=>{

 try{

  const data = req.body;

  const booking = await GuestHouseBooking.create(data);

  const pdfPath = await generatePDF(data,booking._id);

  const wardenEmail = "warden@college.edu";

  await sendGuestHouseMail(
   wardenEmail,
   data,
   pdfPath
  );

  res.json({
   message:"Booking submitted successfully"
  });

 }catch(err){

  console.log(err);

  res.status(500).json({
   error:"Booking failed"
  });

 }

});

export default router;