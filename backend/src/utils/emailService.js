const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(EMAIL_CONFIG);

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email service configuration error:', { error: error.message });
  } else {
    logger.info('Email service is ready to send messages');
  }
});

/**
 * Get business branding information
 */
const getBusinessInfo = () => {
  return {
    businessName: process.env.BUSINESS_NAME || 'VCare Furniture Store',
    businessEmail: process.env.BUSINESS_EMAIL || 'orders@vcarefurniture.com',
    businessPhone: process.env.BUSINESS_PHONE || '(555) 123-4567',
    businessAddress: process.env.BUSINESS_ADDRESS || '123 Main Street, City, State 12345',
    businessWebsite: process.env.BUSINESS_WEBSITE || 'www.vcarefurniture.com'
  };
};

/**
 * Send order confirmation email
 * @param {Object} orderData - Order details
 */
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const businessInfo = getBusinessInfo();
    
    const mailOptions = {
      from: `"${businessInfo.businessName}" <${businessInfo.businessEmail}>`,
      to: orderData.customer_email,
      subject: `Order Confirmation - ${orderData.id}`,
      html: generateOrderConfirmationHTML(orderData, businessInfo)
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info('Order confirmation email sent', {
      orderId: orderData.id,
      customerEmail: orderData.customer_email,
      messageId: info.messageId
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send order confirmation email', {
      orderId: orderData.id,
      customerEmail: orderData.customer_email,
      error: error.message
    });
    throw error;
  }
};

/**
 * Send order status update email
 * @param {Object} orderData - Order details
 * @param {string} newStatus - New order status
 * @param {string} statusMessage - Optional status message
 */
const sendOrderStatusUpdateEmail = async (orderData, newStatus, statusMessage = '') => {
  try {
    const businessInfo = getBusinessInfo();
    
    const mailOptions = {
      from: `"${businessInfo.businessName}" <${businessInfo.businessEmail}>`,
      to: orderData.customer_email,
      subject: `Order Update - ${orderData.id}`,
      html: generateOrderStatusUpdateHTML(orderData, newStatus, statusMessage, businessInfo)
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info('Order status update email sent', {
      orderId: orderData.id,
      customerEmail: orderData.customer_email,
      newStatus,
      messageId: info.messageId
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send order status update email', {
      orderId: orderData.id,
      customerEmail: orderData.customer_email,
      newStatus,
      error: error.message
    });
    throw error;
  }
};

/**
 * Generate order confirmation email HTML
 */
const generateOrderConfirmationHTML = (orderData, businessInfo) => {
  const deliveryAreaText = orderData.delivery_area === 'inside_colombo' ? 'Inside Colombo' : 'Outside Colombo';
  const paymentMethodText = orderData.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0E72BD; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #0E72BD; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .bank-details { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${businessInfo.businessName}</h1>
          <h2>Order Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear ${orderData.customer_name},</p>
          <p>Thank you for your order! We have received your order and it is being processed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.timestamp).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${paymentMethodText}</p>
            <p><strong>Delivery Area:</strong> ${deliveryAreaText}</p>
            <p><strong>Status:</strong> ${orderData.status.toUpperCase()}</p>
          </div>
          
          <div class="order-details">
            <h3>Items Ordered</h3>
            ${orderData.items ? orderData.items.map(item => `
              <div class="item">
                <strong>${item.product.name}</strong><br>
                Quantity: ${item.quantity}<br>
                ${item.selectedSize ? `Size: ${item.selectedSize}<br>` : ''}
                Price: Rs.${(item.product.price * item.quantity).toFixed(2)}
              </div>
            `).join('') : ''}
          </div>
          
          <div class="order-details">
            <h3>Order Summary</h3>
            <p>Subtotal: Rs.${parseFloat(orderData.subtotal).toFixed(2)}</p>
            <p>Delivery Charge: Rs.${parseFloat(orderData.delivery_charge).toFixed(2)}</p>
            ${parseFloat(orderData.total_tax) > 0 ? `<p>Tax: Rs.${parseFloat(orderData.total_tax).toFixed(2)}</p>` : ''}
            ${parseFloat(orderData.discount) > 0 ? `<p>Discount: -Rs.${parseFloat(orderData.discount).toFixed(2)}</p>` : ''}
            <p class="total">Total: Rs.${parseFloat(orderData.total).toFixed(2)}</p>
          </div>
          
          ${orderData.payment_method === 'bank_transfer' ? `
            <div class="bank-details">
              <h3>Bank Transfer Details</h3>
              <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
              <p><strong>Account Name:</strong> ${businessInfo.businessName}</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Branch:</strong> Colombo Main Branch</p>
              <p><strong>Amount to Transfer:</strong> Rs.${parseFloat(orderData.total).toFixed(2)}</p>
              <p><em>Please upload your bank transfer receipt through your account or contact us with the receipt.</em></p>
            </div>
          ` : ''}
          
          <div class="order-details">
            <h3>Delivery Information</h3>
            <p><strong>Delivery Address:</strong><br>${orderData.customer_address}</p>
            <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
            <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
          </div>
          
          <p>If you have any questions about your order, please contact us:</p>
          <p>Email: ${businessInfo.businessEmail}<br>
             Phone: ${businessInfo.businessPhone}</p>
        </div>
        
        <div class="footer">
          <p>${businessInfo.businessName}<br>
             ${businessInfo.businessAddress}<br>
             ${businessInfo.businessWebsite}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate order status update email HTML
 */
const generateOrderStatusUpdateHTML = (orderData, newStatus, statusMessage, businessInfo) => {
  const statusMessages = {
    'confirmed': 'Your order has been confirmed and is being prepared.',
    'processing': 'Your order is currently being processed.',
    'shipped': 'Your order has been shipped and is on its way to you.',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled.',
    'pending_payment': 'Your order is pending payment confirmation.'
  };
  
  const defaultMessage = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`;
  const finalMessage = statusMessage || defaultMessage;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0E72BD; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-update { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #0E72BD; }
        .order-summary { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${businessInfo.businessName}</h1>
          <h2>Order Status Update</h2>
        </div>
        
        <div class="content">
          <p>Dear ${orderData.customer_name},</p>
          
          <div class="status-update">
            <h3>Status Update for Order ${orderData.id}</h3>
            <p><strong>New Status:</strong> ${newStatus.toUpperCase()}</p>
            <p>${finalMessage}</p>
            <p><strong>Updated on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="order-summary">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.timestamp).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> Rs.${parseFloat(orderData.total).toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${orderData.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
            <p><strong>Delivery Area:</strong> ${orderData.delivery_area === 'inside_colombo' ? 'Inside Colombo' : 'Outside Colombo'}</p>
          </div>
          
          ${newStatus === 'shipped' ? `
            <div class="status-update">
              <h3>Tracking Information</h3>
              <p>Your order is on its way! Expected delivery: 1-2 business days.</p>
              <p>Please ensure someone is available to receive the delivery.</p>
            </div>
          ` : ''}
          
          ${newStatus === 'pending_payment' ? `
            <div class="status-update">
              <h3>Payment Required</h3>
              <p>Please complete your bank transfer and upload the receipt to proceed with your order.</p>
              <p><strong>Bank Details:</strong></p>
              <p>Bank: Commercial Bank of Ceylon<br>
                 Account: ${businessInfo.businessName}<br>
                 Account Number: 1234567890<br>
                 Amount: Rs.${parseFloat(orderData.total).toFixed(2)}</p>
            </div>
          ` : ''}
          
          <p>If you have any questions, please contact us:</p>
          <p>Email: ${businessInfo.businessEmail}<br>
             Phone: ${businessInfo.businessPhone}</p>
        </div>
        
        <div class="footer">
          <p>${businessInfo.businessName}<br>
             ${businessInfo.businessAddress}<br>
             ${businessInfo.businessWebsite}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send welcome email to new customers
 * @param {Object} customerData - Customer details
 */
const sendWelcomeEmail = async (customerData) => {
  try {
    const businessInfo = getBusinessInfo();
    
    const mailOptions = {
      from: `"${businessInfo.businessName}" <${businessInfo.businessEmail}>`,
      to: customerData.email,
      subject: `Welcome to ${businessInfo.businessName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0E72BD; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${businessInfo.businessName}!</h1>
            </div>
            <div class="content">
              <p>Dear ${customerData.firstName} ${customerData.lastName},</p>
              <p>Welcome to ${businessInfo.businessName}! We're excited to have you as a customer.</p>
              <p>You can now browse our collection of premium furniture and place orders online.</p>
              <p>If you need any assistance, please don't hesitate to contact us:</p>
              <p>Email: ${businessInfo.businessEmail}<br>
                 Phone: ${businessInfo.businessPhone}</p>
            </div>
            <div class="footer">
              <p>${businessInfo.businessName}<br>
                 ${businessInfo.businessAddress}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info('Welcome email sent', {
      customerEmail: customerData.email,
      messageId: info.messageId
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send welcome email', {
      customerEmail: customerData.email,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendWelcomeEmail
};