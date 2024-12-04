import { sendEmailWithResend } from "../sendEmailWithResend.js";

export async function sendDeliverySuccessToCustomer(order, orderCustomer) {
  try {
    const receipient = orderCustomer?.email;
    const orderNo = order?._id;
    // const date = new Date();
    // const today =
    //   date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    // const totalPrice = cartItems?.reduce((sum, item) => {
    //   return sum + item.price * item.quantity;
    // }, 0);

    // let additionalCharges = 0;

    // if (customerAddress) {
    //   additionalCharges = Math.round(shippingFee + Math.round(tax));
    // } else {
    //   additionalCharges = Math.round(tax);
    // }
    // console.log(
    //   additionalCharges,
    //   totalPrice,
    //   shippingFee,
    //   tax,
    //   "additionalCharges"
    // );
    // orderDate = new Date(orderDate).toLocaleString();

    const message = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="telephone=no" name="format-detection">
        <title>Order Confirmation</title>
        <style type="text/css">
          /* Your styles here */
        </style>
      </head>
      <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
        <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6">
          <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
            <tr>
              <td valign="top" style="padding:0;Margin:0">
                <table class="es-header" cellspacing="0" cellpadding="0" align="center" role="none" style="width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                  <tr>
                    <td align="center" style="padding:0;Margin:0">
                      <table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="background-color:#FFFFFF;width:600px">
                        <tr>
                          <td align="left" style="padding:20px">
                            <table cellspacing="0" cellpadding="0" width="100%" role="none">
                              <tr>
                                <td align="center" style="width:560px">
                                  <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                                    <tr>
                                      <td align="left" style="font-size:0px">
                                        <img class="adapt-img" src="https://i.ibb.co/QFvyd39/Che-B-NEW-Logo.png" alt="CheB Logo" style="display:block;border:0;outline:none;text-decoration:none;width:186px;">
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="width:100%">
                  <tr>
                    <td align="center" style="padding:0;Margin:0">
                      <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="background-color:#FFFFFF;width:600px">
                        <tr>
                          <td align="left" style="padding: 0 20px">
                            <table width="100%" cellspacing="0" cellpadding="0" role="none">
                              <tr>
                                <td align="center" style="width:560px">
                                  <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                                    <tr>
                                      <td align="left">
                                        <p style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">
                                          Your order #: ${orderNo} has been delivered successfully .
                                        </p>

                                        <p style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">
                                          Thank you for shopping with Cheb, We look forward to serving you again! 
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="font-size:12px;line-height:24px;margin:8px 0 0 0;text-align:center;color:rgb(102,102,102)">
              <p style="font-size:12px;line-height:24px;margin:25px 0 0 0;text-align:center;color:rgb(102,102,102)">Copyright © 2023 CheB Inc. <br /> All rights reserved</p>
        
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>`;

    await sendEmailWithResend(receipient, "Order Delivered", message);
  } catch (error) {
    console.log(error, "send payment mail error");
  }
}
