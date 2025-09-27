-- OTP Verification Table 
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY, 
    email VARCHAR(100) NOT NULL, 
    otp VARCHAR(10) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE 
);
      
       -- Index for faster lookups by email 
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);