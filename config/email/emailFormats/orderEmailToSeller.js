import { sendEmailWithResend } from "../sendEmailWithResend.js";

export async function orderEmailToSeller(
  recepient,
  cartItems,
  customerInfo,
  customerAddress,
  pickupDate,
  pickupTime,
  selectedOption,
  storeInfo,
  subtotal
) {
  const date = new Date();
  const today =
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

  // const message = `<p>Click <a href="${link}">Here</a></p>`
  const message = `

    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
                                          You have received the following order on CheB!
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
    
                <table class="es-footer" cellspacing="0" cellpadding="0" align="center" role="none" style="width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                  <tr>
                    <td align="center" style="padding:0;Margin:0">
                      <table class="es-footer-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="background-color:#FFFFFF;width:600px">
                        <tr>
                          <td align="left" style="padding:20px">
                            <table cellspacing="0" cellpadding="0" width="100%" role="none">
                              <tr>
                                <td align="left" style="width:560px">
                                  <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                                    <tr>
                                      <td>
                                        <p style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:20px">
                                            Order details:
                                          </p>
                                        <p>Store: ${storeInfo?.name}</p>
                                      </td>
                                    </tr>
                                  </table>
                                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 30px 0px; background-color: #142850; color: #fff; text-align: left;">
                                        <tr>
                                            <th style="padding: 20px;">Product</th>
                                            <th style="padding: 20px;">Gender</th>
                                            <th style="padding: 20px;">Size</th>
                                            <th style="padding: 20px;">Quantity</th>
                                            <th style="padding: 20px;">Unit Price</th>
                                            <th style="padding: 20px;">Total Price</th>
                                        </tr>

                                        ${cartItems
                                          .map(
                                            (c) => `
                                        <tr style="background-color: #f4f7ff; color: #1e1e1e;">
                                            <td style="padding: 20px;">${c.name}</td>
                                            <td style="padding: 20px;">${c.gender}</td>
                                            <td style="padding: 20px;">${c.sizeName}</td>
                                            <td style="padding: 20px;">${c.quantity}</td>
                                            <td style="padding: 20px;">${c.price}</td>
                                            <td style="padding: 20px;">${c.total}</td>
                                        </tr>
                                        `
                                          )
                                          .join("")}
                                        <tr>
                                            <td colspan="5" style="padding: 20px;">Total</td>
                                            <td style="padding: 20px;">${subtotal}</td>
                                  
                                    </table>
                                  <p style="font-size: 20px; font-weight: bold;">Delivery Information:</p>
                                  <p>Customer Name: ${customerInfo.name}</p>
                                  ${
                                    customerAddress
                                      ? `
                                      <p>
                                        Delivery Address:
                                        ${
                                          customerAddress?.street
                                            ? customerAddress?.street
                                            : ""
                                        }
                                        ,
                                        ${
                                          customerAddress?.city
                                            ? customerAddress?.city
                                            : ""
                                        }
                                        , 
                                        ${
                                          customerAddress?.state
                                            ? customerAddress?.state
                                            : ""
                                        }
                                        , ${customerAddress?.zipCode}
                                      </p>
                                    `
                                      : "<p>In-store pickup</p>"
                                  }

                                  <p>Contact Number: ${
                                    customerInfo?.mobile
                                      ? customerInfo?.mobile
                                      : ""
                                  }</p>
                                  <p>Pickup Type: ${selectedOption}</p>
                                  <p>Pickup Date: 
                                  ${selectedOption === "express" ? today : ""}
                                  ${selectedOption === "standard" ? today : ""}
                                  ${pickupDate} 
                                  </p>
                                  <p>Pickup Time:
                                  ${
                                    selectedOption === "express"
                                      ? "5-15 mins"
                                      : ""
                                  }
                                  ${
                                    selectedOption === "standard"
                                      ? "45-60 min"
                                      : ""
                                  }
                                  ${pickupTime}
                                  </p>
                                  <p style="margin-top: 10px;">
                                    Please ensure that you view further details and update the order's status on the CheB sellers' platform:
                                  </p>
                                  <a href="https://seller.cheb.antopolis.xyz" target="_blank">
                                    <button style="padding: 10px; background-color: #142850; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                                      Go to CheB
                                    </button>
                                  </a>
                                  <p style="margin-top: 20px;">©2024 - CheB LLC - Hamden, CT 06518</p>
                                  <p style="margin-top: 10px;">Tel: 646-847-9420</p>
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
        </div>
      </body>
    </html>
  `;

  await sendEmailWithResend(recepient, "Order Confirmation", message);
}
