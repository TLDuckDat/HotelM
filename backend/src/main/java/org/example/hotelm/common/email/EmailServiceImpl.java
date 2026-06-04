package org.example.hotelm.common.email;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final ResendClient resendClient;

    @Override
    @Async
    public void sendOtp(String toEmail, String otp) {
        resendClient.sendTextEmail(
                toEmail,
                "SOT Resort - Mã xác thực OTP",
                "Xin chào,\n\n"
                        + "Mã OTP của bạn là: " + otp + "\n\n"
                        + "Mã có hiệu lực trong 5 phút.\n"
                        + "Không chia sẻ mã này với ai.\n\n"
                        + "SOT Resort & Hotel"
        );
    }
}
