// OTP Request System has been decommissioned per marketplace simplification.
// Service requests are direct: Request -> Provider Accept/Decline -> Direct In-App Communication.

export const otpService = {
  generateOtp: async () => ({ success: false, error: 'OTP system decommissioned' }),
  verifyOtp: async () => ({ success: false, error: 'OTP system decommissioned' }),
  getOtpState: () => null,
  clearOtpState: () => {}
};
