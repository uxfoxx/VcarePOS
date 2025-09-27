function generateOtpEmailBody(otp, name = '') {
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">VCare Furniture</h1>
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
        &copy; ${new Date().getFullYear()} VCare Furniture. All rights reserved.
      </p>
    </div>
  </div>
  `;
};

function generateWelcomeEmailBody(name = '') {
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
    
    <!-- Header -->
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">VCare Furniture</h1>
    </div>

    <!-- Content Box -->
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; margin-top: 0;">Hello ${name || 'User'},</h2>
      <p style="color: #555555; font-size: 16px;">
        Welcome to <strong>VCare Furniture</strong>! Your account has been successfully created.
      </p>
      <p style="color: #555555; font-size: 16px;">
        We’re excited to have you on board. Explore our furniture collections and enjoy a seamless shopping experience.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || '#'}" style="background-color: #2e86de; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Visit VCare Furniture</a>
      </div>

      <p style="color: #777777; font-size: 14px;">
        If you have any questions or need assistance, feel free to contact our support team.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #777777; font-size: 12px; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} VCare Furniture. All rights reserved.
    </div>
  </div>
  `;
};

function generateLoginNotificationEmailBody(name = '', lastLogin = null) {
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">VCare Furniture</h1>
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
        If this wasn’t you, please secure your account immediately by changing your password.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || '#'}" style="background-color: #2e86de; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Go to Your Account</a>
      </div>
    </div>

    <div style="text-align: center; color: #777777; font-size: 12px; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} VCare Furniture. All rights reserved.
    </div>
  </div>
  `;
};

function generateOrderStatusEmailBody(name = '', status, notes = '', updatedAt = null) {
  // Pick a color for the current status
  const statusColors = {
    pending_payment: '#f39c12', // orange
    processing: '#3498db',      // blue
    shipped: '#9b59b6',         // purple
    completed: '#27ae60',       // green
    cancelled: '#e74c3c'        // red
  };

  const color = statusColors[status] || '#2e86de';

  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 8px;">
    
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">VCare Furniture</h1>
    </div>

    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333333;">Hello ${name || 'Customer'},</h2>
      <p style="color: #555555; font-size: 16px; margin-bottom: 25px;">
        Your order status has been updated. See the timeline below:
      </p>

      <!-- Timeline -->
      <div style="border-left: 3px solid #ddd; margin-left: 20px; padding-left: 20px;">
        
        <div style="position: relative; margin-bottom: 20px;">
          <span style="position: absolute; left: -33px; top: 0; width: 16px; height: 16px; background-color: ${color}; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 2px ${color};"></span>
          <p style="margin: 0; font-size: 16px; color: ${color}; font-weight: bold;">
            ${status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
          <p style="margin: 5px 0; color: #555555; font-size: 14px;">
            ${updatedAt ? new Date(updatedAt).toLocaleString() : new Date().toLocaleString()}
          </p>
          ${notes ? `<p style="margin: 0; color: #777777; font-size: 14px;"><em>${notes}</em></p>` : ''}
        </div>

      </div>
      <!--   
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || '#'}" 
           style="background-color: ${color}; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">
           View Order
        </a>
      </div>
      -->
    </div>

    <div style="text-align: center; color: #777777; font-size: 12px; margin-top: 20px;">
      &copy; ${new Date().getFullYear()} VCare Furniture. All rights reserved.
    </div>
  </div>
  `;
}

function generateForgotPasswordEmailBody(tempPassword, name = '') {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px;margin:auto;padding:20px;background-color:#f7f7f7;border-radius:8px;">
    <div style="text-align:center;padding-bottom:20px;">
      <h1 style="color:#2e86de;margin:0;">VCare Furniture</h1>
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
        <a href="${`${process.env.APP_URL}/login` || '#'}" 
           style="background:#2e86de;color:#fff;text-decoration:none;padding:12px 30px;border-radius:6px;font-weight:bold;">
           Go to Login
        </a>
      </div>
    </div>

    <div style="text-align:center;color:#777;font-size:12px;margin-top:20px;">
      &copy; ${new Date().getFullYear()} VCare Furniture. All rights reserved.
    </div>
  </div>
  `;
}

function generatePasswordChangeEmailBody(name = '', updatedAt = null) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #2e86de; margin: 0;">VCare Furniture</h1>
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
      &copy; ${new Date().getFullYear()} VCare Furniture. All rights reserved.
    </div>
  </div>
  `;
}


module.exports = {
  generateOtpEmailBody,
  generateWelcomeEmailBody,
  generateLoginNotificationEmailBody,
  generateOrderStatusEmailBody,
  generateForgotPasswordEmailBody,
  generatePasswordChangeEmailBody
};