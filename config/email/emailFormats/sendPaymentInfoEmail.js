import { sendEmailWithResend } from "../sendEmailWithResend.js";

export async function sendPaymentInfoEmail(
  recepient,
  customerInfo,
  cartItems,
  {
    // processingFee,
    shippingFee,
    // authenticationFee,
    tax,
    // discount,
    orderId,
    paymentMethod,
    orderDate,
    customerAddress,
    pickupDate,
    pickupTime,
    selectedOption,
    storeInfo,
    total,
  }
) {
  try {
    const date = new Date();
    const today =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    const totalPrice = cartItems?.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    let additionalCharges = 0;

    if (customerAddress) {
      additionalCharges = Math.round(shippingFee + Math.round(tax));
    } else {
      additionalCharges = Math.round(tax);
    }
    console.log(
      additionalCharges,
      totalPrice,
      shippingFee,
      tax,
      "additionalCharges"
    );
    orderDate = new Date(orderDate).toLocaleString();

    const message = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" lang="en">
  
    <head>
      <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    </head>
    </div>
  
    <body style="font-family:&quot;Helvetica Neue&quot;,Helvetica,Arial,sans-serif;background-color:#ffffff">
      <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;margin:0 auto;padding:20px 0 48px;width:660px">
        <tbody>
          <tr style="width:100%">
            <td>
              <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                <tbody>
                  <tr>
                    <td>
                      <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                        <tbody style="width:100%">
                          <tr style="width:100%">
                            <td data-id="__react-email-column"><img class="adapt-img" src="https://i.ibb.co/QFvyd39/Che-B-NEW-Logo.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="186"></td>
                            <td align="right" data-id="__react-email-column" style="display:table-cell">
                              <button style="padding: 1rem 3rem; background-color: #473D90; color: #fff; border-radius: 5px; border: none;" >Invoice</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table align="center" width="100%" border="0" cellPadding="10" cellSpacing="" role="presentation">
                <tbody>
                  <tr>
                      <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                            <tr >
                             <td align="right" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px ;padding-top: 2rem;">Order ID #: ${orderId}</p>
                               <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Date of Purchase: ${orderDate}</p>
                          </td>
                  </tr>
                </tbody>
              </table>
              <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;color:rgb(51,51,51);background-color:rgb(250,250,250);border-radius:3px;font-size:12px">
                <tbody>
                  <tr>
                    <td>
                      <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="height:46px">
                        <tbody style="width:100%">
                          <tr style="width:100%">
                            <td align="left" colSpan="2" data-id="__react-email-column">
                              <table  width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                                <tbody>
                                  <tr>
                                    <td>
                                      <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                                        <tbody style="width:100%">
                                          ${
                                            !selectedOption
                                              ? `<tr style="width:100%">
                                            <td align="left" data-id="__react-email-column" style="border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                                              <p style="font-size:16px;line-height:1.4;margin:0;padding:.2rem 0;color:rgb(102,102,102); font-weight: 700; max-width: 300px; padding-top: 1.5rem;">Delivery Address</p>
                                                <p style="font-size:13px;line-height:1.4;margin:0;padding:.2rem 0;color:rgb(102,102,102); font-weight: 400; max-width: 300px; padding-top: 0.5rem;">
                                                  <span style="font-size:14px;line-height:1.4;margin:0;color:rgb(102,102,102); font-weight: 500; ">
                                                    City:
                                                  </span>
                                                  
                                                  ${
                                                    customerAddress?.city
                                                      ? customerAddress?.city
                                                      : ""
                                                  }
                                                </p>
                                                <p style="font-size:13px;line-height:1.4;margin:0;padding:.2rem 0;color:rgb(102,102,102); font-weight: 400; max-width: 300px; padding-top: 0.5rem;">
                                                  <span style="font-size:14px;line-height:1.4;margin:0;color:rgb(102,102,102); font-weight: 500;">
                                                    Street:
                                                  </span>
                                                  
                                                  ${
                                                    customerAddress?.street
                                                      ? customerAddress?.street
                                                      : ""
                                                  }
                                                </p>
                                              <p style="font-size:13px;line-height:1.4;margin:0;padding:.2rem 0;color:rgb(102,102,102); font-weight: 400; max-width: 300px; padding-top: 0.5rem;"><span style="font-size:14px;line-height:1.4;margin:0;color:rgb(102,102,102); font-weight: 500;">State:</span>   ${
                                                customerAddress?.state
                                                  ? customerAddress?.state
                                                  : ""
                                              }</p>
                                            </td>
                                          </tr>`
                                              : ""
                                          }
                                          ${
                                            selectedOption
                                              ? `<tr style="width:100%">
                                            <td align="left" data-id="__react-email-column" style="border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                                              <p style="font-size:16px;line-height:1.4;margin:0;padding:.2rem 0;color:rgb(102,102,102); font-weight: 700; max-width: 300px; padding-top: 1.5rem;">Pickup Address</p>
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
                                  <p>Store Name: ${storeInfo?.name}</p>
                                  <p>Store Address: ${
                                    storeInfo?.city +
                                    ", " +
                                    storeInfo?.state +
                                    ", " +
                                    storeInfo?.street
                                  } </p>
                                            </td>
                                          `
                                              : ""
                                          }
                                        </tbody>
                                      </table>
                                      
                                    </td>


                                  </tr>
                                </tbody>

                              </table>
                            </td>
                            <td align="right" colSpan="2" data-id="__react-email-column" style="border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                              <p style="font-size:16px;line-height:1.4;margin:0;padding:0;color:rgb(102,102,102)">${
                                customerInfo?.name
                              }</p>
                              <p style="font-size:16px;line-height:1.4;margin:0;padding:0">${
                                customerInfo?.email
                              }</p>
                              <p style="font-size:16px;line-height:1.4;margin:0;padding:0">${
                                customerInfo?.mobile
                              }</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style=" font-size: 5px; opacity: 0; visibility: hidden;">space</p>
             
              <table align="right" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                <tbody>
                  <tr>
                    <td>
                      <table align="center" width="100%" border="0" cellPadding="10" cellSpacing="0" role="presentation">
                          <thead style="border-collapse:collapse;border-spacing:1rem;color:rgb(51,51,51);background-color:rgb(250,250,250);font-size:12px; padding: 0 .5rem;">
                              <tr style="background-color: rgb(209, 209, 209);">
                                  <th align="left">
                                    <p style="font-size:14px;line-height:24px;margin:0;font-weight:900">Name</p>
                                  </th>
                                  <th >
                                    <p style="font-size:14px;line-height:24px;margin:0;font-weight:900">Gender</p>
                                  </th>
                                  <th >
                                    <p style="font-size:14px;line-height:24px;margin:0;font-weight:900">Size</p>
                                  </th>
                                  <th >
                                    <p style="font-size:14px;line-height:24px;margin:0;font-weight:900">Quantity</p>
                                  </th>
                                  <th >
                                    <p style="font-size:14px;line-height:24px;margin:0;font-weight:900">Unit price</p>
                                  </th>
                                  <th >
                                    <p style="font-size:14px;line-height:24px;margin:0;font-weight:900">Total Price</p>
                                  </th>
                                </tr>
                          </thead>
                        <tbody style="width:100%">
                        ${cartItems?.map(
                          (paymentInfo) =>
                            `<tr style="width:100% ">
                              
                            <td align="left" data-id="__react-email-column" style="display:table-cell; ">
                              <p style="font-size:10px;line-height:1rem;margin:0;color:rgb(102,102,102);font-weight:600; max-width: 100px;">${paymentInfo.name}</p>
                            </td>
                            <td align="left" data-id="__react-email-column" style="display:table-cell; ">
                              <p style="font-size:10px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600; text-align: center;">${paymentInfo.gender}</p>
                            </td>
                            <td align="left" data-id="__react-email-column" style="display:table-cell; ">
                              <p style="font-size:10px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600; text-align: center;">${paymentInfo.sizeName}</p>
                            </td>
                            <td align="left" data-id="__react-email-column" style="display:table-cell; ">
                              <p style="font-size:13px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600; text-align: center;">${paymentInfo.quantity}
                              </p>
                            </td>
                            <td align="left" data-id="__react-email-column" style="display:table-cell; ">
                              <p style="font-size:16px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600; text-align: center;">${paymentInfo.price}</p>
                            </td>
                            <td align="right" data-id="__react-email-column" style="display:table-cell;width:90px">
                              <p style="font-size:16px;line-height:24px;margin:0px 20px 0px 0px;font-weight:600;white-space:nowrap; text-align: center;">$${paymentInfo.total}</p>
                            </td>
                          </tr>`
                        )}
                          
                          
                        </tbody>
                        
                      </table>
                    </td>
                    
                  </tr>
                </tbody>
              </table>
              <p style=" font-size: 5px; opacity: 0; visibility: hidden;">space</p>
        
              <table align="center" width="100%"  cellPadding="5" cellSpacing="" role="presentation" style="border-collapse:collapse;border-spacing:1rem;color:rgb(51,51,51);background-color:rgb(250,250,250);font-size:12px;">
                <tbody>
                    <tr style="background-color: rgb(209, 209, 209);">
                    <td align="center">
                      <p style="font-size:14px;line-height:24px;margin:0;padding-left:10px;font-weight:900">Payment Info</p>
                    </td>
                  </tr>
                  
                </tbody>
              </table>
              
              <table align="right" width="100%" border="0" cellPadding="10" cellSpacing="5" role="presentation">
                <tbody>
                  <tr>
                    <td>
                      <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                        <tbody style="width:100%">
                          <tr style="width:100%">
                              <td align="left" data-id="__react-email-column" style="display:table-cell">
                                <p style="font-size:13px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600;padding:0px 30px 0px 0px; color: #473D90; padding: 8px 0;">Payment Method:</p>
                              </td>
                              <td align="right" data-id="__react-email-column" style="display:table-cell;width:90px">
                                <p style="font-size:16px;line-height:24px;margin:0px 20px 0px 0px;font-weight:900;white-space:nowrap;text-align:right; color: #473D90; padding: 8px 0; ">${paymentMethod}</p>
                              </td>
                            </tr>

                                <tr style="width:100%">
                              <td align="left" data-id="__react-email-column" style="display:table-cell">
                                <p style="font-size:13px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600;padding:0px 30px 0px 0px;">Subtotal:</p>
                              </td>
                              <td align="right" data-id="__react-email-column" style="display:table-cell;width:90px">
                                <p style="font-size:16px;line-height:24px;margin:0px 20px 0px 0px;font-weight:600;white-space:nowrap;text-align:right">$${totalPrice}</p>
                              </td>
                            </tr>

                           
                            
                         
                      

                             <tr style="width:100%">
                            <td align="left" data-id="__react-email-column" style="display:table-cell">
                              <p style="font-size:13px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600;padding:0px 30px 0px 0px;">${
                                customerAddress
                                  ? `Platform fees(Include shipping):`
                                  : `Platform fees`
                              }</p>
                            </td>
                            <td align="right" data-id="__react-email-column" style="display:table-cell;width:90px">
                              <p style="font-size:16px;line-height:24px;margin:0px 20px 0px 0px;font-weight:600;white-space:nowrap;text-align:right">$${tax.toFixed(
                                2
                              )}</p>
                            </td>
                          </tr>
                        
                          <tr style="width:100% ">
                              
                              <td align="left" data-id="__react-email-column" style="display:table-cell; ">
                                <p style="font-size:13px;line-height:24px;margin:0;color:rgb(102,102,102);font-weight:600;padding:0px 30px 0px 0px;">Total:</p>
                              </td>
                              <td align="right" data-id="__react-email-column" style="display:table-cell;width:90px">
                                <p style="font-size:16px;line-height:24px;margin:0px 20px 0px 0px;font-weight:600;white-space:nowrap;text-align:right">$${Math.round(
                                  tax + totalPrice
                                ).toFixed(2)}</p>
                              </td>
                            </tr>
                          
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              
        
              
             
             
               
              <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                <tbody>
                  <tr>
                    <td>
                      <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                        <tbody style="width:100%">
                          <tr style="width:100%">
                            <td align="center" data-id="__react-email-column" style="display:block;margin:40px 0 0 0"><img class="adapt-img" src="https://i.ibb.co/QFvyd39/Che-B-NEW-Logo.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="186"></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size:12px;line-height:24px;margin:8px 0 0 0;text-align:center;color:rgb(102,102,102)">
              <p style="font-size:12px;line-height:24px;margin:25px 0 0 0;text-align:center;color:rgb(102,102,102)">Copyright © 2023 CheB Inc. <br /> All rights reserved</p>
        
        
        
              
            </td>
          </tr>
        
          
        </tbody>
        </table>
  
      <script src="./main.js"></script>
    </body>
  
  </html>`;

    await sendEmailWithResend(recepient, "Order Conformation", message);
  } catch (error) {
    console.log(error, "send payment mail error");
  }
}
