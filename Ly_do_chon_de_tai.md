# CHƯƠNG 1: MỞ ĐẦU

## 1.1. Lý do chọn đề tài

Trong môi trường đại học hiện nay, nhu cầu trao đổi, mua bán các vật dụng học tập, đồ dùng cá nhân và thiết bị điện tử cũ của sinh viên là rất lớn. Đặc biệt, đối với sinh viên trường Đại học Đại Nam (DNU), việc tìm kiếm các món đồ giá rẻ, phù hợp với túi tiền hoặc thanh lý đồ dùng sau khi kết thúc khóa học, chuyển phòng trọ là nhu cầu thiết yếu hàng ngày.

Tuy nhiên, việc mua bán hiện nay chủ yếu diễn ra thông qua các hội nhóm tự phát trên mạng xã hội như Facebook Groups hay Zalo. Cách làm này bộc lộ nhiều hạn chế đáng kể:
1.  **Thiếu tính xác thực:** Người mua và người bán không được xác minh danh tính cụ thể, dẫn đến nguy cơ lừa đảo, hàng giả, hàng kém chất lượng.
2.  **Thông tin bị trôi lạc:** Bài đăng trên mạng xã hội bị trôi đi rất nhanh, gây khó khăn cho việc tìm kiếm lại sản phẩm qua từ khóa hoặc danh mục.
3.  **Quy trình thanh toán thiếu an toàn:** Việc chuyển khoản trực tiếp cho người lạ tiềm ẩn nhiều rủi ro khi không có hệ thống ghi nhận bằng chứng giao dịch rõ ràng.
4.  **Hỗ trợ người dùng hạn chế:** Người mới tham gia thường gặp khó khăn trong việc tìm hiểu nội quy, quy trình giao dịch hoặc cần tư vấn nhanh về sản phẩm.

Nhận thấy những hạn chế đó, em đã quyết định thực hiện đề tài: **"Xây dựng hệ thống sàn thương mại điện tử dành riêng cho sinh viên Đại học Đại Nam - DNU Marketplace"**.

Đề tài không chỉ tập trung vào việc giải quyết các bài toán cơ bản của một trang thương mại điện tử (đăng bài, mua bán, chat real-time) mà còn ứng dụng những công nghệ tiên tiến nhất hiện nay:
-   **Xác thực sinh viên:** Sử dụng email định danh `@dnu.edu.vn` để đảm bảo cộng đồng mua bán an toàn và tin cậy.
-   **Tích hợp Trí tuệ nhân tạo (AI):** Ứng dụng mô hình ngôn ngữ lớn (Google Gemini) kết hợp với kỹ thuật RAG (Retrieval-Augmented Generation) để tạo ra Chatbot hỗ trợ thông minh, có khả năng tra cứu sản phẩm và giải đáp chính sách dựa trên thực tế dữ liệu của hệ thống.
-   **Hệ thống thanh toán minh bạch:** Tích hợp quy trình quét mã QR ngân hàng và tải lên biên lai giao dịch, giúp Admin và người bán dễ dàng kiểm soát quá trình thanh toán.
-   **Tính năng mạng xã hội:** Tích hợp Feed, Stories và Following để tăng tính tương tác và gắn kết trong cộng đồng sinh viên trường.

Việc thực hiện đề tài này không chỉ giúp em củng cố kiến thức về lập trình Web (MERN Stack) và trí tuệ nhân tạo mà còn tạo ra một sản phẩm có tính ứng dụng thực tiễn cao, đóng góp một phần nhỏ vào việc xây dựng hệ sinh thái tiện ích cho sinh viên trường Đại học Đại Nam.

## 1.2. Mục tiêu đề tài

Mục tiêu tổng quát của đề tài nghiên cứu này là thiết kế và xây dựng thành công một hệ thống sàn thương mại điện tử đồng bộ, hiện đại và bảo mật, được tối ưu hóa riêng biệt cho nhu cầu của cộng đồng sinh viên trường Đại học Đại Nam. Không chỉ dừng lại ở một trang web mua bán thông thường, dự án hướng tới việc tạo ra một hệ sinh thái số thông minh, nơi mà trí tuệ nhân tạo đóng vai trò cốt lõi trong việc hỗ trợ và kết nối người dùng một cách hiệu quả và tự động hóa.

Mục tiêu cụ thể đầu tiên là xây dựng một nền tảng hạ tầng kỹ thuật vững chắc hỗ trợ đầy đủ các nghiệp vụ thương mại điện tử quan trọng nhất. Hệ thống cần đảm bảo khả năng quản lý danh mục sản phẩm đa dạng từ đồ dùng học tập đến thiết bị điện tử, xử lý các luồng đơn hàng từ khi khởi tạo đến khi hoàn tất một cách logic, chính xác và có tính hệ thống cao. Đặc biệt, việc tích hợp quy trình thanh toán minh bạch thông qua mã QR chuyển khoản ngân hàng và hệ thống quản lý biên lai giao dịch là một trong những mục tiêu trọng tâm nhằm giải quyết triệt để bài toán tin cậy trong giao dịch nội bộ giữa các sinh viên với nhau.

Mục tiêu quan trọng tiếp theo của đề tài là nghiên cứu và ứng dụng thành công trí tuệ nhân tạo thông qua trợ lý ảo hỗ trợ người dùng tích hợp trực tiếp trên nền tảng. Bằng cách kết hợp sức mạnh của mô hình ngôn ngữ lớn Google Gemini AI cùng với kỹ thuật Retrieval-Augmented Generation, trợ lý này sẽ không chỉ dừng lại ở việc trả lời các câu hỏi phổ biến mà còn có khả năng hiểu sâu sắc ngữ cảnh dữ liệu thực tế của hệ thống. Từ đó, AI có thể thực hiện tư vấn sản phẩm chính xác theo nhu cầu, hướng dẫn chi tiết quy trình sử dụng dịch vụ và giải đáp mọi thắc mắc về chính sách của sàn một cách tự động, chuyên nghiệp và thân thiện như một nhân viên hỗ trợ thực thụ.

Bên cạnh các yếu tố kỹ thuật, đề tài còn hướng tới mục tiêu xây dựng một cộng đồng mua bán an toàn, văn minh và bền vững. Việc thiết lập hệ thống xác thực tài khoản dựa trên email sinh viên định danh của trường là bước đi tiên quyết để đảm bảo mọi thành viên tham gia đều là sinh viên hoặc cán bộ của nhà trường, từ đó giúp giảm thiểu tối đa các rủi ro về lừa đảo, gian lận thông tin hoặc các hành vi vi phạm quy định sàn. Đồng thời, việc tích hợp các tính năng mang tính chất tương tác xã hội như bảng tin chung, chia sẻ tin ngắn hàng ngày và hệ thống theo dõi người dùng sẽ giúp tăng cường sự gắn kết giữa các thành viên, biến sàn thương mại trở thành một không gian số sống động và giàu tính kết nối.

Cuối cùng, dự án đặt mục tiêu tối ưu hóa trải nghiệm người dùng trên mọi nền tảng thiết bị di động và máy tính. Giao diện của ứng dụng được nghiên cứu và thiết kế để đạt được sự cân bằng hoàn hảo giữa tính thẩm mỹ hiện đại, sang trọng và sự tiện dụng tối đa cho người dùng cuối. Mục tiêu là giúp mọi sinh viên, kể cả những người không quá am hiểu về công nghệ, vẫn có thể dễ dàng tiếp cận, tìm kiếm thông tin và thực hiện các giao dịch một cách nhanh chóng, mượt mà nhất. Thông qua tất cả những mục tiêu cụ thể nêu trên, đề tài mong muốn mang lại một giải pháp công nghệ toàn diện, có giá trị thực tiễn cao và đóng góp một phần vào sự phát triển chung của các hạ tầng dịch vụ số hóa trong môi trường giáo dục.

## 1.3. Đối tượng và phạm vi nghiên cứu

### 1.3.1. Đối tượng nghiên cứu
*   **Đối tượng sử dụng:** Sinh viên, cán bộ, giảng viên hiện đang công tác và học tập tại trường Đại học Đại Nam.
*   **Nghiệp vụ thương mại:** Quy trình đăng tin, duyệt bài, đặt hàng, xác nhận đơn hàng, thanh toán và đánh giá sau mua hàng.
*   **Công nghệ cốt lõi:** Kỹ thuật RAG (Retrieval-Augmented Generation), mô hình ngôn ngữ lớn (LLM), lập trình Web full-stack với MERN (MongoDB, Express, React, Node.js).

### 1.3.2. Phạm vi nghiên cứu
*   **Về chức năng:** Hệ thống tập trung vào các luồng nghiệp vụ mua bán đồ cũ, quản lý thanh toán nội bộ qua QR code, hệ thống chat thời gian thực và trợ lý AI hỗ trợ người dùng.
*   **Về không gian:** Ứng dụng được triển khai và thử nghiệm trong phạm vi nội bộ trường Đại học Đại Nam.
*   **Về dữ liệu AI:** Nghiên cứu cách tạo lập và quản lý kho kiến thức (Knowledge Base) từ các tài liệu hướng dẫn và dữ liệu sản phẩm trong database để AI có thể truy xuất chính xác.

## 1.4. Phương pháp nghiên cứu

Để thực hiện đề tài một cách khoa học và hiệu quả, em sử dụng kết hợp các phương pháp nghiên cứu sau:

*   **Phương pháp nghiên cứu lý thuyết:**
    *   Tìm hiểu về kiến trúc RAG và cách tích hợp các mô hình Generative AI vào ứng dụng thực tế.
    *   Nghiên cứu các tài liệu kỹ thuật về ReactJS, Node.js, Socket.IO và hệ quản trị cơ sở dữ liệu MongoDB.
    *   Tìm hiểu về các mô hình thương mại điện tử C2C (Consumer-to-Consumer) hiện đại.
*   **Phương pháp quan sát và khảo sát thực tế:**
    *   Khảo sát nhu cầu thực tế của sinh viên DNU thông qua các nhóm trao đổi trên mạng xã hội.
    *   Phân tích ưu và nhược điểm của các nền tảng mua bán đồ cũ phổ biến để rút ra bài học kinh nghiệm.
*   **Phương pháp xây dựng và thực hiện phần mềm (Mô hình Agile/Scrum):**
    *   **Lập kế hoạch (Planning):** Chia dự án thành các giai đoạn nhỏ (sprint) để thực hiện.
    *   **Phân tích (Analysis):** Xác định các User Stories và yêu cầu hệ thống.
    *   **Thiết kế (Design):** Thiết kế Database, UI/UX và kiến trúc luồng dữ liệu AI.
    *   **Cài đặt (Implementation):** Viết code cho cả Frontend và Backend, tích hợp AI và các dịch vụ bên thứ ba.
    *   **Kiểm thử và Đánh giá (Testing & Evaluation):** Thực hiện kiểm thử đơn vị (Unit Test), kiểm thử tích hợp và thu thập phản hồi từ người dùng thử nghiệm để cải thiện sản phẩm.
