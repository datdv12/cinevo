"""AI: trợ lý ảo. GIAI ĐOẠN KHUNG: trả lời theo từ khóa, chưa gọi LLM thật."""


class ChatbotService:
    FAQ = [
        (("đặt vé", "dat ve", "mua vé"), "Bạn chọn phim, rạp, suất chiếu và ghế. Chỉ khi bấm tiếp tục sau bước chọn ghế, Cinevo mới yêu cầu đăng nhập."),
        (("thanh toán", "thanh toan"), "Cinevo hỗ trợ QR, ví điện tử và ngân hàng. Hiện đang chạy chế độ demo, chưa trừ tiền thật."),
        (("hủy", "huy", "hoàn"), "Chức năng hủy vé và hoàn tiền sẽ được bổ sung ở giai đoạn sau."),
        (("combo", "bắp", "nước"), "Sau khi xác nhận đặt vé, bạn có thể chọn Combo A (69.000đ), Combo B (99.000đ) hoặc bỏ qua."),
        (("ghế", "ghe"), "Hãy dùng nút Gợi ý ghế AI ở bước chọn ghế, Cinevo sẽ chọn ghế trung tâm đẹp cho 1-2 người."),
    ]

    def reply(self, message: str, history: list | None = None) -> dict:
        text = (message or "").lower()
        for keywords, answer in self.FAQ:
            if any(k in text for k in keywords):
                return {"source": "mock-keyword", "reply": answer}
        # TODO (AI thật): gọi LLM với history + dữ liệu phim/suất chiếu làm ngữ cảnh.
        return {"source": "mock-keyword",
                "reply": "Mình là trợ lý Cinevo (bản demo). Bạn có thể hỏi về đặt vé, thanh toán, combo hoặc chọn ghế."}
