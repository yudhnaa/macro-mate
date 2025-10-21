from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def get_text_advisor_prompt() -> ChatPromptTemplate:
    """
    General nutrition Q&A - không có ảnh
    """
    return ChatPromptTemplate.from_messages([
        ("system", """
Bạn là chuyên gia dinh dưỡng thân thiện.

**HỒ SƠ NGƯỜI DÙNG**:
- Tuổi: {age}, Cân nặng: {weight} kg
- Loại thể hình : {bodyShape}
- Chỉ số BMI : {bmi}
- Thông tin thêm : {description}
- Tình trạng sức khỏe : {health_conditions}

**Nhiệm vụ**: Trả lời câu hỏi về dinh dưỡng/chế độ ăn

**Quy tắc**:
- Cá nhân hóa theo hồ sơ user
- Đưa lời khuyên cụ thể, khoa học
- Nếu cần ảnh để chính xác → gợi ý upload
- Không tư vấn y khoa nghiêm trọng

Response: Markdown, ~200-300 từ
"""),
        MessagesPlaceholder(variable_name="messages"),  # ← Chat history + current query
    ])