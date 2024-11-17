import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

interface Bid {
  userEmail: string;
  productName: string;
  bidPrice: number;
  quantity: number;
  discountPercent: number;
  totalValue: number;
  regularPrice: number;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

function getEmailTemplate(bid: Bid, message: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Haleon.svg" alt="Haleon" style="height: 40px; margin: 20px 0;">
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        ${message}
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <h3 style="margin: 0 0 10px;">Bid Details:</h3>
          <p style="margin: 5px 0;">Product: ${bid.productName}</p>
          <p style="margin: 5px 0;">Quantity: ${bid.quantity}</p>
          <p style="margin: 5px 0;">Regular Price: $${bid.regularPrice.toFixed(2)}</p>
          <p style="margin: 5px 0;">Bid Price: $${bid.bidPrice.toFixed(2)}</p>
          <p style="margin: 5px 0;">Discount: ${bid.discountPercent.toFixed(1)}%</p>
          <p style="margin: 5px 0;">Total Value: $${bid.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} Haleon. All rights reserved.
      </div>
    </div>
  `;
}

export const onBidStatusChange = functions.firestore
  .document('bids/{bidId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data() as Bid;
    const previousData = change.before.data() as Bid;

    // Only send email if status has changed
    if (newData.status === previousData.status) {
      return null;
    }

    let subject = '';
    let message = '';

    if (newData.status === 'approved') {
      subject = 'Your Haleon Deals Bid Has Been Approved!';
      message = `
        <h2 style="color: #000; margin-bottom: 20px;">Congratulations!</h2>
        <p>Your bid was successful and we thank you for your partnership.</p>
        <p>Your Haleon Account representative will be reaching out shortly to coordinate your order.</p>
      `;
    } else if (newData.status === 'rejected') {
      subject = 'Update on Your Haleon Deals Bid';
      message = `
        <h2 style="color: #000; margin-bottom: 20px;">Bid Status Update</h2>
        <p>We regret to inform you that your bid was not accepted.</p>
        <p>Should you wish to resubmit a different offer, please login to HaleonDeals.ca to revise, or reach out to your Haleon account representative to discuss further.</p>
      `;
    }

    const mailOptions = {
      from: '"Haleon Deals" <updates@haleondeals.com>',
      to: newData.userEmail,
      subject,
      html: getEmailTemplate(newData, message)
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });

export const onBidCancelled = functions.firestore
  .document('bids/{bidId}')
  .onDelete(async (snapshot, context) => {
    const bid = snapshot.data() as Bid;
    
    const mailOptions = {
      from: '"Haleon Deals" <updates@haleondeals.com>',
      to: bid.userEmail,
      subject: 'Your Haleon Deals Bid Has Been Cancelled',
      html: getEmailTemplate(bid, `
        <h2 style="color: #000; margin-bottom: 20px;">Bid Cancelled</h2>
        <p>Your bid has been cancelled as requested.</p>
        <p>You can place a new bid at any time by visiting HaleonDeals.ca.</p>
      `)
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });