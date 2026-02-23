const getBaseUrl = () => (process.env.APP_URL || '').replace(/\/$/, '');
const getApiUrl = () => `${getBaseUrl()}/api`;

const getProductImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${getApiUrl()}${normalizedPath}`;
};

const getFrontendAssetUrl = (assetPath) => {
  if (!assetPath) return null;
  if (assetPath.startsWith('http')) return assetPath;
  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${getBaseUrl()}${normalizedPath}`;
};

function generateOtpEmailBody(otp, name = '') {
  const businessName = process.env.BUSINESS_NAME || 'POS System';
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">${businessName}</h1>
    </div>

    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; margin-top: 0;">Hello ${name || 'User'},</h2>
      <p style="color: #555555; font-size: 16px;">Your One-Time Password (OTP) for email verification is:</p>

      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; padding: 15px 30px; color: #ffffff; background-color: #2e86de; border-radius: 8px; letter-spacing: 3px;">
          ${otp}
        </span>
      </div>

      <p style="color: #555555; font-size: 14px;">This OTP is valid for <strong>60 Seconds</strong>. Please do not share it with anyone.</p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

      <p style="color: #777777; font-size: 12px; text-align: center;">
        If you did not request this OTP, please ignore this email.<br/>
        &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
      </p>
    </div>
  </div>
  `;
};

function generateWelcomeEmailBody(name = '') {
  const businessName = process.env.BUSINESS_NAME || 'POS System';
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">

    <!-- Header -->
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">${businessName}</h1>
    </div>

    <!-- Content Box -->
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; margin-top: 0;">Hello ${name || 'User'},</h2>
      <p style="color: #555555; font-size: 16px;">
        Welcome to <strong>${businessName}</strong>! Your account has been successfully created.
      </p>
      <p style="color: #555555; font-size: 16px;">
        We're excited to have you on board. Explore our collections and enjoy a seamless shopping experience.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${getFrontendAssetUrl('')}" style="background-color: #2e86de; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Visit ${businessName}</a>
      </div>

      <p style="color: #777777; font-size: 14px;">
        If you have any questions or need assistance, feel free to contact our support team.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #777777; font-size: 12px; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
    </div>
  </div>
  `;
};

function generateLoginNotificationEmailBody(name = '', lastLogin = null) {
  const businessName = process.env.BUSINESS_NAME || 'POS System';
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">

    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">${businessName}</h1>
    </div>

    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; margin-top: 0;">Hello ${name || 'User'},</h2>
      <p style="color: #555555; font-size: 16px;">
        You have successfully logged into your account.
      </p>
      <p style="color: #555555; font-size: 16px;">
        ${lastLogin ? `Your last login was on <strong>${new Date(lastLogin).toLocaleString()}</strong>.` : 'This is your first login.'}
      </p>
      <p style="color: #555555; font-size: 16px;">
        If this wasn't you, please secure your account immediately by changing your password.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${getFrontendAssetUrl('')}" style="background-color: #2e86de; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Go to Your Account</a>
      </div>
    </div>

    <div style="text-align: center; color: #777777; font-size: 12px; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
    </div>
  </div>
  `;
};

function generateOrderStatusEmailBody(orderId, name = '', status, timelineData = [], notes = '') {
  const businessName = process.env.BUSINESS_NAME || 'POS System';
  const isCancelled = status === 'cancelled';

  const stages = [
    { key: 'pending_payment', label: 'Pending Payment' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'completed', label: 'Completed' }
  ];

  let currentIndex = stages.findIndex(s => s.key === status);
  if (currentIndex === -1) currentIndex = 0; // fallback

  // Create a fast lookup map for stage timestamps from the injected history array
  const stageTimes = {};
  if (Array.isArray(timelineData)) {
    for (const record of timelineData) {
      stageTimes[record.status] = record.updated_at;
    }
  }

  let timelineHTML = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">`;

  if (isCancelled) {
    const cancelledTime = stageTimes['cancelled'] ? new Date(stageTimes['cancelled']).toLocaleString() : new Date().toLocaleString();
    timelineHTML += `
      <tr>
        <td width="30" valign="top" style="text-align: center;">
          <div style="width: 24px; height: 24px; line-height: 24px; background-color: #e74c3c; color: white; border-radius: 50%; font-size: 14px; margin: 0 auto;">
            &#10005;
          </div>
        </td>
        <td valign="top" style="padding-left: 15px; padding-bottom: 20px;">
          <div style="color: #e74c3c; font-weight: bold; font-size: 16px;">Cancelled</div>
          <div style="color: #7f8c8d; font-size: 13px; margin-top: 4px;">${cancelledTime}</div>
          ${notes ? `<div style="color: #e74c3c; font-size: 13px; margin-top: 8px; padding: 10px; background-color: #fadbd8; border-left: 3px solid #e74c3c; border-radius: 4px;">${notes}</div>` : ''}
        </td>
      </tr>
    `;
  } else {
    stages.forEach((stage, index) => {
      const isPast = index < currentIndex;
      const isCurrent = index === currentIndex;
      const isFuture = index > currentIndex;

      let color = isCurrent ? '#3498db' : (isPast ? '#2ecc71' : '#bdc3c7');
      let icon = isPast ? '&#10003;' : (isCurrent ? '&#9679;' : '&#9675;');
      let borderStr = index < stages.length - 1 ? `border-left: 2px solid ${isPast ? '#2ecc71' : '#e0e0e0'};` : 'border-left: 2px solid transparent;';

      const stageTimestamp = stageTimes[stage.key] ? new Date(stageTimes[stage.key]).toLocaleString() : null;

      timelineHTML += `
        <tr>
          <td width="30" valign="top" style="text-align: center;">
            <div style="width: 24px; height: 24px; line-height: 24px; background-color: ${color}; color: white; border-radius: 50%; font-size: 14px; margin: 0 auto;">
              ${icon}
            </div>
            <div style="height: 35px; width: 0; ${borderStr} margin: 4px auto;"></div>
          </td>
          <td valign="top" style="padding-left: 15px; padding-bottom: 10px;">
            <div style="${isCurrent ? 'background-color: #f0f8ff; padding: 10px 15px; border-radius: 6px; border: 1px solid #bce8f1;' : 'padding: 5px 0;'}">
              <div style="color: ${isFuture ? '#95a5a6' : '#2c3e50'}; font-weight: ${isCurrent ? 'bold' : 'normal'}; font-size: 16px;">
                ${stage.label}
              </div>
              ${stageTimestamp ? `<div style="color: #7f8c8d; font-size: 13px; margin-top: 4px;">${stageTimestamp}</div>` : ''}
              ${isCurrent && notes ? `<div style="color: #31708f; font-size: 13px; margin-top: 8px; padding: 8px; background-color: #d9edf7; border-left: 3px solid #31708f; border-radius: 4px;">${notes}</div>` : ''}
            </div>
          </td>
        </tr>
      `;
    });
  }
  timelineHTML += `</table>`;

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f8; border-radius: 12px;">
    <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="padding-bottom: 20px; border-bottom: 2px solid #eeeeee; margin-bottom: 25px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" valign="middle" width="50%">
              <img src="${getFrontendAssetUrl('VCARELogo%201.png')}" alt="Vcare Logo" style="max-height: 55px; display: block;" onerror="this.style.display='none'" />
            </td>
            <td align="right" valign="middle" width="50%">
              <div style="color: #868e96; font-size: 13px; margin-bottom: 8px;">
                ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style="display: inline-block; background-color: #f0f4f8; border: 1px solid #d9e2ec; color: #486581; font-size: 11px; padding: 4px 10px; border-radius: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                ORDER #${orderId}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Greeting -->
      <h2 style="color: #2c3e50; font-size: 20px; font-weight: 600; margin-top: 0;">Hello ${name || 'Customer'},</h2>
      <p style="color: #5a6268; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
        We're reaching out to provide an update on your recent order. Below is the current progress of your shipment.
      </p>

      <!-- Timeline Container -->
      <div style="background-color: #ffffff; padding: 0;">
        <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 14px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 700; border-bottom: 2px solid #f8f9fa; padding-bottom: 10px;">Order Timeline</h3>
        ${timelineHTML}
      </div>

    </div>

    <!-- Footer with Contact Info -->
    <div style="margin-top: 30px; border-top: 2px solid #eeeeee; background-color: #f8f9fa; padding: 25px; border-radius: 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color: #5a6268; font-size: 13px; line-height: 1.6; text-align: left;">
        <tr>
          <td width="33%" valign="top" style="padding-right: 15px; border-right: 1px solid #dee2e6;">
            <strong style="color: #2c3e50; font-size: 13px; text-transform: uppercase;">Address</strong><br>
            1100/1 Pannipitiya Road,<br>
            Battaramulla, Sri Lanka
          </td>
          <td width="33%" valign="top" style="padding: 0 15px; border-right: 1px solid #dee2e6;">
            <strong style="color: #2c3e50; font-size: 13px; text-transform: uppercase;">Contact</strong><br>
            +94 11 234 5678<br>
            +94 77 123 4567<br>
            info@vcare.lk<br>
            sales@vcare.lk
          </td>
          <td width="34%" valign="top" style="padding-left: 15px;">
            <strong style="color: #2c3e50; font-size: 13px; text-transform: uppercase;">Business Hours</strong><br>
            Mon - Sat: 9:00 AM - 6:00 PM<br>
            Sun: 10:00 AM - 4:00 PM
          </td>
        </tr>
      </table>
      <div style="text-align: center; color: #adb5bd; font-size: 12px; margin-top: 25px; border-top: 1px solid #dee2e6; padding-top: 15px;">
        <p style="margin: 0 0 5px 0;">If you have any questions, please contact our support team at info@vcare.lk</p>
        &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
      </div>
    </div>
  </div>
  `;
}

function generateOrderSummaryEmailBody(order, items = []) {
  const businessName = process.env.BUSINESS_NAME || 'POS System';

  let itemsHTML = '';
  if (items && items.length > 0) {
    itemsHTML = `
      <table width="100%" cellpadding="12" cellspacing="0" border="0" style="margin-top: 20px; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
            <th align="left" style="color: #495057; font-size: 13px; text-transform: uppercase;" width="80">Product</th>
            <th align="left" style="color: #495057; font-size: 13px; text-transform: uppercase;">Details</th>
            <th align="center" style="color: #495057; font-size: 13px; text-transform: uppercase;">Qty</th>
            <th align="right" style="color: #495057; font-size: 13px; text-transform: uppercase;">Price</th>
            <th align="right" style="color: #495057; font-size: 13px; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach((item, index) => {
      const borderBottom = index < items.length - 1 ? 'border-bottom: 1px solid #eeeeee;' : '';

      let variantInfo = '';
      if (item.selectedSize || item.colorName) {
        variantInfo = `
          <div style="margin-top: 8px;">
            ${item.selectedSize ? `<span style="display: inline-block; background-color: #f1f3f5; color: #495057; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-right: 5px; text-transform: uppercase;">Size: ${item.selectedSize}</span>` : ''}
            ${item.colorName ? `<span style="display: inline-block; background-color: #f1f3f5; color: #495057; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">Color: ${item.colorName}</span>` : ''}
          </div>
        `;
      }

      let imgHtml = `
        <div style="width: 60px; height: 60px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden; border: 1px solid #eeeeee; text-align: center; line-height: 60px; color: #dee2e6; font-size: 24px;">
           &#128230;
        </div>
      `;

      if (item.productImage) {
        const imgUrl = getProductImageUrl(item.productImage);

        imgHtml = `
          <img src="${imgUrl}" alt="${item.productName}" width="60" height="60" style="object-fit: cover; border-radius: 8px; border: 1px solid #eeeeee; display: block;" />
        `;
      }

      itemsHTML += `
        <tr style="${borderBottom}">
          <td valign="top" style="padding: 15px 12px;">
            ${imgHtml}
          </td>
          <td valign="top" style="padding: 15px 12px; color: #2c3e50; font-size: 15px; font-weight: 600;">
            <div style="margin-bottom: 2px;">${item.productName}</div>
            ${variantInfo}
          </td>
          <td valign="top" align="center" style="padding: 15px 12px; color: #495057; font-size: 15px;">${item.quantity}</td>
          <td valign="top" align="right" style="padding: 15px 12px; color: #495057; font-size: 14px;">Rs ${(parseFloat(item.unitPrice) || 0).toFixed(2)}</td>
          <td valign="top" align="right" style="padding: 15px 12px; color: #2c3e50; font-weight: 700; font-size: 15px;">Rs ${(parseFloat(item.totalPrice) || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    itemsHTML += `
        </tbody>
      </table>
    `;
  }

  const deliveryCharge = parseFloat(order.delivery_charge || order.deliveryCharge || 0);
  const totalAmount = parseFloat(order.total_amount || order.totalAmount || 0);
  // Subtract delivery to find pure subtotal if total_amount strictly includes delivery charge.
  const subtotal = totalAmount - deliveryCharge;

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; padding: 20px; background-color: #f4f6f8; border-radius: 12px;">
    <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="padding-bottom: 20px; border-bottom: 2px solid #eeeeee; margin-bottom: 25px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" valign="middle" width="50%">
              <img src="${getFrontendAssetUrl('VCARELogo%201.png')}" alt="Vcare Logo" style="max-height: 55px; display: block;" onerror="this.style.display='none'" />
            </td>
            <td align="right" valign="middle" width="50%">
              <div style="color: #868e96; font-size: 13px; margin-bottom: 8px;">
                ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style="display: inline-block; background-color: #f0f4f8; border: 1px solid #d9e2ec; color: #486581; font-size: 11px; padding: 4px 10px; border-radius: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                ORDER RECEIPT
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Greeting & Overview -->
      <h2 style="color: #2c3e50; font-size: 20px; font-weight: 600; margin-top: 0;">Thank you for your order, ${order.customer_name || order.customerName || 'Customer'}!</h2>
      <p style="color: #5a6268; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
        We have received your order <strong>#${order.id}</strong> and are getting it ready for you.
      </p>

      <!-- Customer Details Grid -->
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="50%" valign="top" style="padding-right: 15px;">
              <div style="color: #adb5bd; font-size: 12px; text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Delivery Address</div>
              <div style="color: #2c3e50; font-size: 14px; line-height: 1.5;">
                ${order.customer_address || order.customerAddress || 'N/A'}<br>
                ${order.delivery_location || order.deliveryLocation || ''}
              </div>
            </td>
            <td width="50%" valign="top" style="padding-left: 15px;">
              <div style="color: #adb5bd; font-size: 12px; text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Contact Info</div>
              <div style="color: #2c3e50; font-size: 14px; line-height: 1.5;">
                ${order.customer_email || order.customerEmail || 'N/A'}<br>
                ${order.customer_phone || order.customerPhone || 'N/A'}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #495057; font-size: 15px; border-bottom: 2px solid #f8f9fa; padding-bottom: 8px;">Order Summary</h3>
        ${itemsHTML}
      </div>

      <!-- Totals -->
      <table width="100%" cellpadding="8" cellspacing="0" border="0" style="margin-top: 15px; border-top: 2px solid #2c3e50; padding-top: 10px;">
        <tr>
          <td align="right" style="color: #6c757d; font-size: 14px; font-weight: 500;">Subtotal:</td>
          <td align="right" width="120" style="color: #2c3e50; font-size: 14px; font-weight: 500;">Rs ${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td align="right" style="color: #6c757d; font-size: 14px; font-weight: 500;">Delivery Charge:</td>
          <td align="right" width="120" style="color: #2c3e50; font-size: 14px; font-weight: 500;">Rs ${deliveryCharge.toFixed(2)}</td>
        </tr>
        <tr>
          <td align="right" style="color: #2c3e50; font-size: 18px; font-weight: 700; padding-top: 15px;">Total:</td>
          <td align="right" width="120" style="color: #2ecc71; font-size: 18px; font-weight: 700; padding-top: 15px;">Rs ${totalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Payment Method -->
      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eeeeee; padding-top: 25px;">
        <span style="color: #868e96; font-size: 13px;">Payment Method: </span>
        <strong style="color: #2c3e50; font-size: 14px; text-transform: uppercase;">${(order.payment_method || order.paymentMethod || '').replace(/_/g, ' ')}</strong>
      </div>

    </div>

    <!-- Footer with Contact Info -->
    <div style="margin-top: 30px; border-top: 2px solid #eeeeee; background-color: #f8f9fa; padding: 25px; border-radius: 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color: #5a6268; font-size: 13px; line-height: 1.6; text-align: left;">
        <tr>
          <td width="33%" valign="top" style="padding-right: 15px; border-right: 1px solid #dee2e6;">
            <strong style="color: #2c3e50; font-size: 13px; text-transform: uppercase;">Address</strong><br>
            1100/1 Pannipitiya Road,<br>
            Battaramulla, Sri Lanka
          </td>
          <td width="33%" valign="top" style="padding: 0 15px; border-right: 1px solid #dee2e6;">
            <strong style="color: #2c3e50; font-size: 13px; text-transform: uppercase;">Contact</strong><br>
            +94 11 234 5678<br>
            +94 77 123 4567<br>
            info@vcare.lk<br>
            sales@vcare.lk
          </td>
          <td width="34%" valign="top" style="padding-left: 15px;">
            <strong style="color: #2c3e50; font-size: 13px; text-transform: uppercase;">Business Hours</strong><br>
            Mon - Sat: 9:00 AM - 6:00 PM<br>
            Sun: 10:00 AM - 4:00 PM
          </td>
        </tr>
      </table>
      <div style="text-align: center; color: #adb5bd; font-size: 12px; margin-top: 25px; border-top: 1px solid #dee2e6; padding-top: 15px;">
        <p style="margin: 0 0 5px 0;">If you have any questions, please contact our support team at info@vcare.lk</p>
        &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
      </div>
    </div>
  </div>
  `;
}

function generateForgotPasswordEmailBody(tempPassword, name = '') {
  const businessName = process.env.BUSINESS_NAME || 'POS System';
  return `
    < div style = "font-family: Arial, sans-serif; max-width:600px;margin:auto;padding:20px;background-color:#f7f7f7;border-radius:8px;" >
    <div style="text-align:center;padding-bottom:20px;">
      <h1 style="color:#2e86de;margin:0;">${businessName}</h1>
    </div>

    <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color:#333;">Hello ${name || 'Customer'},</h2>
      <p style="color:#555;font-size:16px;">
        We received a request to reset your password. A temporary password has been created for you.
      </p>

      <div style="background:#f0f3f9;padding:15px;text-align:center;font-size:20px;font-weight:bold;color:#2e86de;border-radius:6px;margin:20px 0;">
        ${tempPassword}
      </div>

      <p style="color:#555;font-size:16px;">
        Please use this password to log in, then change it immediately in your account settings for security.
      </p>

      <div style="text-align:center;margin-top:30px;">
        <a href="${getFrontendAssetUrl('login')}" 
           style="background:#2e86de;color:#fff;text-decoration:none;padding:12px 30px;border-radius:6px;font-weight:bold;">
           Go to Login
        </a>
      </div>
    </div>

    <div style="text-align:center;color:#777;font-size:12px;margin-top:20px;">
      &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
    </div>
  </div >
    `;
}

function generatePasswordChangeEmailBody(name = '', updatedAt = null) {
  const businessName = process.env.BUSINESS_NAME || 'POS System';
  return `
    < div style = "font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 8px;" >
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">${businessName}</h1>
    </div>

    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333333;">Hello ${name || 'Customer'},</h2>
      <p style="color: #555555; font-size: 16px;">
        Your password was successfully changed on <strong>${updatedAt ? new Date(updatedAt).toLocaleString() : new Date().toLocaleString()}</strong>.
      </p>
      <p style="color: #555555; font-size: 16px;">
        If you did not make this change, please reset your password immediately and contact our support team.
      </p>
    </div>

    <div style="text-align: center; color: #777777; font-size: 12px; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
    </div>
  </div >
    `;
}


module.exports = {
  generateOtpEmailBody,
  generateWelcomeEmailBody,
  generateLoginNotificationEmailBody,
  generateOrderStatusEmailBody,
  generateOrderSummaryEmailBody,
  generateForgotPasswordEmailBody,
  generatePasswordChangeEmailBody
};