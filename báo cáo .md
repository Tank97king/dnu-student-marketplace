                            BỘ GIÁO DỤC VÀ ĐÀO TẠO
                           TRƯỜNG ĐẠI HỌC ĐẠI NAM

                                            

                                 ĐINH THẾ THÀNH
                                    MSV: 1671020292

XÂY DỰNG HỆ THỐNG MUA BÁN ĐỒ DÙNG CŨ CHO SINH VIÊN DNU SỬ DỤNG REACTJS VÀ NODEJS
                     BÁO CÁO ĐỒ ÁN TỐT NGHIỆP 
                          NGÀNH: CÔNG NGHỆ THÔNG TIN
 
                                     HÀ NỘI, NĂM 2026
                         BỘ GIÁO DỤC VÀ ĐÀO TẠO
                        TRƯỜNG ĐẠI HỌC ĐẠI NAM






                                 ĐINH THẾ THÀNH
                                   MSV: 1671020292

XÂY DỰNG HỆ THỐNG MUA BÁN ĐỒ DÙNG CŨ CHO SINH VIÊN DNU SỬ DỤNG REACTJS VÀ NODEJS 


BÁO CÁO ĐỒ ÁN TỐT NGHIỆP
 NGÀNH: CÔNG NGHỆ THÔNG TIN
GIẢNG VIÊN HƯỚNG DẪN:
                                      TS. TRẦN QUÝ NAM
                                        HÀ NỘI, NĂM 2026
 
LỜI CAM ĐOAN
Tôi xin cam đoan rằng đồ án tốt nghiệp với đề tài “Xây dựng hệ thống mua bán đồ dùng cũ cho sinh viên DNU sử dụng ReactJS và NodeJS” là kết quả nghiên cứu, tìm hiểu và thực hiện của chính bản thân tôi trong suốt quá trình học tập và rèn luyện tại trường, đặc biệt là trong học kỳ thực hiện đồ án tốt nghiệp dưới sự hướng dẫn tận tình của thầy Trần Quý Nam.
Toàn bộ nội dung trình bày trong đồ án đều do tôi tự thu thập, phân tích và biên soạn dựa trên cơ sở lý thuyết đã học, các tài liệu tham khảo có nguồn gốc rõ ràng và quá trình thực tế khảo sát, thực hiện. Tôi hoàn toàn không sao chép nội dung của bất kỳ cá nhân hay tổ chức nào khác một cách trái phép. Những trích dẫn, bảng biểu, hình ảnh, tài liệu tham khảo trong đồ án đều đã được tôi chú thích rõ ràng nguồn gốc, tuân thủ đúng quy định về đạo đức học thuật và bản quyền.
Tôi xin chịu hoàn toàn trách nhiệm trước Hội đồng chấm đồ án, Khoa, Nhà trường và pháp luật về tính trung thực, bản quyền và nội dung của đồ án này. Trong trường hợp phát hiện có bất kỳ hành vi gian lận, đạo văn hoặc vi phạm quy định, tôi xin cam kết chấp nhận mọi hình thức xử lý theo quy định hiện hành.
Tôi cũng xin cam kết rằng đồ án này chỉ được sử dụng vào mục đích học tập, nghiên cứu khoa học và phục vụ cho việc tốt nghiệp theo đúng quy định của Nhà trường. Mọi hình thức sử dụng khác như thương mại hóa, chuyển nhượng nội dung hoặc phát hành công khai mà không có sự đồng ý của tác giả và Nhà trường đều không được phép. Nếu có bất kỳ cá nhân hoặc tổ chức nào muốn sử dụng tài liệu này vào các mục đích khác, cần liên hệ và có sự đồng ý bằng văn bản của tôi cũng như sự chấp thuận của Nhà trường.
                                                      Họ và tên sinh viên

 
                                                      Đinh Thế Thành
 
LỜI CẢM ƠN
Sau quá trình học tập tại trường, sinh viên được hệ thống lại toàn bộ lý thuyết chuyên ngành và có cơ hội tham gia kiến tập tại một số vị trí nghiệp vụ cơ bản liên quan đến những kiến thức đã được tiếp thu. Với sự cho phép của Khoa Công nghệ thông tin – Trường Đại học Đại Nam, cùng sự quan tâm, chỉ đạo và hướng dẫn tận tình từ các thầy cô, em đã tiến hành thực hiện đồ án tốt nghiệp của mình.
Mặc dù thời gian thực hiện đồ án không dài, nhưng quá trình này đã mang lại cho em nhiều kinh nghiệm quý báu, giúp em nâng cao kiến thức chuyên môn và kỹ năng thực tiễn. Tuy nhiên, do hạn chế về thời gian cũng như kinh nghiệm còn chưa nhiều, nội dung đồ án chắc chắn không tránh khỏi những thiếu sót và hạn chế nhất định. Đồ án này là kết quả của quá trình tổng hợp kiến thức, tìm hiểu và nghiên cứu về bài toán học máy, được xây dựng từ nền tảng học tập và rèn luyện trong suốt quá trình học. Em rất mong nhận được những ý kiến đóng góp quý báu từ quý thầy cô để có thể hoàn thiện hơn cả về nội dung đồ án lẫn bản thân trong quá trình học tập và làm việc sau này.
Em xin trân trọng gửi lời cảm ơn đến thầy Trần Quý Nam – giảng viên Khoa Công nghệ thông tin, người đã tận tình hướng dẫn và tạo điều kiện thuận lợi để em hoàn thành tốt học phần đồ án tốt nghiệp.
                                                                  Em xin chân thành cảm ơn!
 
DANH MỤC VIẾT TẮT
STT	Từ viết tắt	Lý giải từ viết tắt
1	SP	SẢN PHẨM
2	CMCN	Cách mạng công nghiệp
3	ML	Machine Learning
4	AI	Trí tuệ nhân tạo
5	C2C	Consumer-to-Consumer (Mô hình giao dịch giữa các cá nhân/người tiêu dùng với nhau)
6	B2C	Business-to-Consumer (Doanh nghiệp bán cho khách hàng)
7	B2B	Business-to-Business (Doanh nghiệp bán cho doanh nghiệp)
8	RAG	Retrieval-Augmented Generation (Truy xuất tăng cường tạo sinh)
9	LLM / LLMs	Large Language Models (Mô hình ngôn ngữ lớn)
10	DB / CSDL	Database / Cơ sở dữ liệu
11	API	Application Programming Interface (Giao diện lập trình ứng dụng)
12	JWT	JSON Web Token
13	UI	User Interface (Giao diện người dùng)
14	SPA	Single Page Application (Ứng dụng đơn trang)
15	DOM	Document Object Model (Mô hình Đối tượng Tài liệu - sử dụng trong cơ chế Virtual DOM và Real DOM của React)
16	ERD	Entity-Relationship Diagram (Sơ đồ quan hệ thực thể)
17	UML	Unified Modeling Language (Ngôn ngữ mô hình hóa thống nhất - dùng trong sơ đồ UML Use Case, Activity Diagram, Sequence Diagram)
18	OTP	One-Time Password (Mật khẩu sử dụng một lần)
19	FAQ	Frequently Asked Questions (Các câu hỏi thường gặp)
20	UAT	User Acceptance Testing (Kiểm thử chấp nhận người dùng)
21	VAT	Value Added Tax (Thuế giá trị gia tăng - được tính khi thực hiện đối soát dòng tiền thanh toán)






DANH MỤC HÌNH ẢNH
Hình 1.1: Sơ sơ đồ hoạt động - Thực trạng và Giải pháp DNU Marketplace ....................8
Hình 1.2: Quy trình phát triển……………………………………………………...……14
Hình 3.1: Sơ đồ Use Case tổng quát hệ thống DNU Marketplace………………..…......40
Hình 3.2: Sơ đồ Use Case phân rã chức năng Giao dịch và Thanh toán QR……..……. 41
Hình 3.3: Sơ đồ Use Case phân rã chức năng Trợ lý ảo AI Chatbot RAG …………..…42
Hình 3.4: Sơ đồ hoạt động (Activity Diagram) Quy trình Mua hàng và Thanh toán QR …………………………………………………………………………………….……..48
Hình 3.5: Sơ đồ tuần tự (Sequence Diagram) Quy trình Mua hàng và Duyệt biên lai ……………………………………………………………………………..…………….49
Hình 3.6: Sơ đồ hoạt động (Activity Diagram) Quy trình xử lý của Trợ lý AI RAG …………………………………………………………………………….………..……50
 Hình 3.7: Sơ đồ tuần tự (Sequence Diagram) Quy trình hỗ trợ AI Chatbot RAG ………………………………………………………………………………..………….51
Hình 3.8: Sơ đồ hoạt động (Activity Diagram) Tác vụ Cron Job hủy đơn hàng quá hạn……………………………………………………………………………………….52
Hình 3.9: Sơ đồ thực thể quan hệ (ERD) cơ sở dữ liệu MongoDB……….…..….…… ..53
.Hình 3.10: Bản vẽ chi tiết luồng xử lý và kiến trúc phân tầng hệ thống ……..….….….59
Hình 3.11: Chọn đăng bán Sp ………………………………………………..….………61
Hình 3.12: Điền thông tin sp đăng bán …………………………………………….….….61
Hình 3.13: Admin duyệt sản phẩm…………………………………………….………… 62
Hình 3.14: Thông báo sp được duyệt ………………………………………….......……..62
 Hình 3.15: Ba cách tìm sản phẩm………………………………………………….……. 63
Hình 3.16: Điền thông tin để đặt sản phẩm …………………………….….…….……....63
Hình 3.17: Hoàn tất giao dịch……………………………………………….………..….64
Hình 3.18: Người bán và admin xác nhận sp………………………………..….………..64
Hình 3.19: Shipper nhận sp và giao …………………………………….…………….…..65
Hình 3.20: Đánh giá sp khi nhận sp……………………………………..……..….…….. 65
Hình 3.21: Quy trình admin trả tiền cho người bán……………………….……...…….. 66
Hình 4.1: Giao diện Trang chủ ………………………………………………….……….78
Hình 4.2: Giao diện đăng nhập ………………………………………….……………….78
Hình 4.3: Giao diện đăng ký Trang …………………………………………….………..79
Hình 4.4: Giao diện chatbot ……………………………………………..……………….79
Hình 4.5: Giao diện danh sách sản phẩm …………………………………………..…….80
Hình 4.6: Giao diện mạng xã hội …………………………………………….………….80
Hình 4.7: Giao diện bán sản phẩm ………………………………………………..……...81
Hình 4.8: Giao diện Sản phẩm ………………………………………………….……….81
Hình 4.9: Giao diện mua sản phẩm…………………………………………….…….…. 82
Hình 4.10: Giao diện quản lý bán sản phẩm ………………………………….……..…..82
Hình 4.11: Giao diện chat Trang……………………………………………..…………. 83
Hình 4.12: Giao diện Quản lý của admin ………………………….………….….…..….83
Hình 4.13: Giao diện quản lý hàng của shipper……………………….……….….……. 84




















DANH MỤC BẢNG BIỂU
Bảng 3.1: Đặc tả chi tiết Use Case UC-01 "Đăng ký và Xác thực tài khoản học đường" ……………………………………………………………..………….….43
Bảng 3.2: Đặc tả chi tiết Use Case UC-02 "Đăng sản phẩm bán"…………...….. 43
Bảng 3.3: Đặc tả chi tiết Use Case UC-05 "Khởi tạo đơn hàng và Thanh toán QR động" ……………………………………………………...………………….…..45
Bảng 3.4: Đặc tả chi tiết Use Case UC-06 "Chat trực tiếp thời gian thực"……….45
Bảng 3.5: Đặc tả chi tiết Use Case UC-08 "Tương tác với Trợ lý AI Chatbot RAG" …………………………………………………………………….………..…..…46
Bảng 3.6: Đặc tả chi tiết Use Case UC-10 "Kiểm duyệt thanh toán và Đối soát biên lai (Admin)" ………………………………………………...………….……...….47
Bảng 3.7: Đặc tả cấu trúc Collection Users (Lưu thông tin người dùng)…………54
Bảng 3.8: Đặc tả cấu trúc Collection Products (Lưu thông tin sản phẩm)…… ….55
Bảng 3.9: Đặc tả cấu trúc Collection Orders (Quản lý đơn hàng) …......................56
Bảng 3.10: Đặc tả cấu trúc Collection Payments (Chứng từ thanh toán……...…..56
Bảng 3.11: Đặc tả cấu trúc Collection BankQR (Tài khoản ngân hàng của sàn) ……………………………………………………………………...……..........…57
Bảng 5.1: Kịch bản kiểm thử chức năng Đăng ký tài khoản sinh viên (OTP DNU) ………………………………………………………………………….…….…...86
Bảng 5.2: Kịch bản kiểm thử chức năng Thanh toán QR & Đối soát biên lai………………………………………………………………………...….…….87
Bảng 5.3: Kịch bản kiểm thử chức năng Trợ lý AI Chatbot RAG …………....….88
Bảng 5.4: Thống kê thời gian phản hồi trung bình của các API chính……….…..89 
LỜI MỞ ĐẦU
Trong những năm gần đây, sự phát triển vượt bậc của cuộc Cách mạng công nghiệp lần thứ tư (CMCN 4.0) đã và đang làm thay đổi sâu sắc mọi khía cạnh của đời sống kinh tế - xã hội. Đặc biệt, xu hướng số hóa và chuyển đổi số đã trở thành động lực cốt lõi thúc đẩy các tổ chức, doanh nghiệp và các cơ sở giáo dục đổi mới phương thức hoạt động nhằm nâng cao năng suất, hiệu quả và tối ưu hóa nguồn lực. 
Sinh viên đại học là một cộng đồng năng động, có nhu cầu trao đổi thông tin, mua bán và thanh lý các đồ dùng cá nhân, giáo trình học tập, tài liệu ôn thi hay các thiết bị công nghệ cũ là vô cùng lớn. Việc này không chỉ giúp người bán thu hồi một phần chi phí sinh hoạt mà còn tạo cơ hội cho người mua (đặc biệt là các tân sinh viên có hoàn cảnh khó khăn) tiếp cận được các công cụ học tập thiết yếu với mức giá phù hợp. Tuy nhiên, khảo sát thực tế tại trường Đại học Đại Nam (DNU) cho thấy, hoạt động mua bán này hiện nay vẫn diễn ra một cách tự phát, chủ yếu thông qua các hội nhóm trên mạng xã hội như Facebook, Zalo. Phương thức giao dịch truyền thống này bộc lộ rất nhiều rủi ro và hạn chế: thông tin bài đăng dễ bị trôi lạc, không có cơ chế xác minh danh tính dẫn đến nguy cơ lừa đảo, quy trình thanh toán thiếu an toàn và thiếu một trợ lý ảo hỗ trợ người dùng giải đáp các thắc mắc thường gặp.
Nhận thấy tầm quan trọng của vấn đề và mong muốn ứng dụng các công nghệ lập trình Web hiện đại (MERN Stack) kết hợp với Trí tuệ nhân tạo (Generative AI) để giải quyết bài toán thực tế của nhà trường, em đã quyết định lựa chọn đề tài nghiên cứu: "Xây dựng hệ thống sàn thương mại điện tử mua bán đồ dùng cũ tích hợp AI Chatbot cho sinh viên Đại học Đại Nam (DNU Marketplace)".
Đồ án tốt nghiệp của em hy vọng sẽ đóng góp một giải pháp công nghệ thiết thực, tạo ra một không gian mua bán an toàn, văn minh và tiện ích cho cộng đồng sinh viên Đại học Đại Nam, đồng thời thể hiện khả năng làm chủ công nghệ mới của sinh viên ngành Công nghệ thông tin trước khi ra trường.




MỤC LỤC
CHƯƠNG 1 :TỔNG QUAN VỀ ĐỀ TÀI VÀ CƠ SỞ THỰC TIỄN	6
1.1.Lý do chọn đề tài	6
1.1.1.Bối cảnh chuyển đổi số toàn diện trong giáo dục đại học và sự phát triển của công nghệ Web/AI	6
1.1.2. Nhu cầu thực tế mang tính chu kỳ và đặc thù của cộng đồng sinh viên Đại học Đại Nam (DNU)	6
1.1.3. Thực trạng và những hạn chế nghiêm trọng của các kênh giao dịch tự phát hiện nay	8
1.1.4. DNU Marketplace - Giải pháp đột phá ứng dụng công nghệ hiện đại	9
1.2. Mục tiêu nghiên cứu và phát triển	10
1.2.1. Mục tiêu tổng quát	10
1.2.2. Mục tiêu cụ thể	10
1.3. Đối tượng và phạm vi nghiên cứu	12
1.3.1. Đối tượng nghiên cứu	12
1.3.2. Phạm vi nghiên cứu	12
1.4. Phương pháp nghiên cứu	13
1.4.1. Phương pháp nghiên cứu lý thuyết	13
1.4.2. Phương pháp nghiên cứu thực tiễn và khảo sát	13
1.4.3. Phương pháp xây dựng và thực nghiệm phần mềm (Software Engineering)	14
CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG	16
2.1. Tổng quan về mô hình Thương mại điện tử	16
2.1.1. Khái niệm và vị trí của Thương mại điện tử trong nền kinh tế chia sẻ	16
2.1.2. Đặc điểm của giao dịch C2C trong môi trường học đường	16
2.1.3. Vấn đề xây dựng lòng tin, bảo mật thông tin và giải quyết tranh chấp trong mô hình C2C học đường	17
2.2. Công nghệ phát triển Backend	18
2.2.1. Node.js & Express.js: Nền tảng xây dựng RESTful API hiệu năng cao, bất đồng bộ	18
2.2.2. MongoDB & Mongoose: Hệ quản trị cơ sở dữ liệu NoSQL dạng tài liệu (Document-oriented)	20
2.2.3. JWT (JSON Web Token): Phương pháp xác thực phân quyền API không trạng thái (Stateless Authentication)	21
2.3. Công nghệ phát triển Frontend (Phía máy khách)	22
2.3.1. ReactJS (Vite): Thư viện JavaScript xây dựng giao diện SPA động	22
2.3.2. Redux Toolkit: Thư viện quản lý trạng thái tập trung (State Management)	23
2.3.3. Tailwind CSS: Framework CSS dạng tiện ích (Utility-First CSS)	24
2.4. Công nghệ tương tác thời gian thực (Real-Time Communication)	24
2.4.1. Bản chất của giao thức WebSockets và sự khác biệt với HTTP	24
2.4.2. Socket.IO: Thư viện truyền thông điệp thời gian thực mạnh mẽ	25
2.5. Trí tuệ nhân tạo (Generative AI) và kỹ thuật RAG	26
2.5.1. Google Gemini AI API: Mô hình ngôn ngữ lớn (LLM) và ứng dụng	26
2.5.2. Kỹ thuật RAG (Retrieval-Augmented Generation) và Vector Embeddings	27
2.5.3. Vectra (Vector Database) và Tìm kiếm ngữ nghĩa (Semantic Search)	28
2.6. Các công cụ và dịch vụ hỗ trợ khác	29
2.6.1. Cloudinary: Giải pháp quản lý và tối ưu hóa hình ảnh đám mây	29
2.6.2. Nodemailer: Dịch vụ gửi email xác thực và phục hồi tài khoản	29
2.6.3. Node-cron: Lập lịch chạy các tác vụ nền tự động (Cron Jobs)	29
CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG	31
3.1. Phân tích yêu cầu hệ thống	31
3.1.1. Phân tích chi tiết các Yêu cầu chức năng (Functional Requirements)	31
3.1.2. Phân tích chi tiết các Yêu cầu phi chức năng (Non-functional Requirements)	37
3.2. Thiết kế Use Case và Phân rã chức năng (UML Use Case Modeling)	39
3.2.1. Sơ đồ Use Case tổng quát hệ thống (General UML Use Case Diagram)	40
3.2.2. Sơ đồ Use Case phân rã chức năng Giao dịch và Thanh toán (Transaction & Payment Decomposition)	41
3.2.3. Sơ đồ Use Case phân rã chức năng Trợ lý ảo AI Chatbot RAG (AI Chatbot Decomposition)	41
3.2.4. Đặc tả chi tiết các Use Case cốt lõi	42
3.3. Thiết kế Quy trình nghiệp vụ (UML Activity & Sequence Diagrams)	47
3.3.1. Quy trình Mua hàng và Thanh toán QR ngân hàng	48
3.3.2. Quy trình Trợ lý AI Chatbot tích hợp RAG	49
3.3.3. Quy trình Tác vụ nền tự động (Cron Jobs Expiration)	51
3.4. Thiết kế Cơ sở dữ liệu (Database Design & ERD)	52
3.4.1. Sơ đồ quan hệ thực thể (UML ERD Diagram)	53
3.4.2. Đặc tả chi tiết các Collection cốt lõi	53
3.5. Thiết kế kiến trúc hệ thống (System Architecture Design)	58
3.5.1. Bản vẽ chi tiết luồng xử lý phân tầng (Architecture Layers)	59
3.5.2. Giải thích chi tiết các phân tầng kiến trúc	60
3.6 Quy trình hoạt động mua/bán sản phẩm trên web quy trình bán sp	61
CHƯƠNG 4: XÂY DỰNG, CÀI ĐẶT VÀ GIAO DIỆN HỆ THỐNG	67
4.1. Môi trường triển khai và cấu hình	67
4.1.1. Môi trường phát triển và cài đặt (Development Environment)	67
4.1.2. Quản lý cấu hình biến môi trường bảo mật (`.env`)	67
4.2. Hiện thực hóa các thành phần cốt lõi (Backend & Integration)	68
4.2.1. Xác thực và Bảo mật Middleware (Authentication & Validation)	68
4.2.2. Xử lý kết nối thời gian thực Socket.IO (Real-Time Communication)	70
4.2.3. Tích hợp Trợ lý AI Chatbot RAG (Google Gemini & Vectra)	71
4.2.4. Tự động hóa tác vụ chạy ngầm Cron Jobs (Node-Cron Automation)	73
4.3. Xây dựng giao diện ứng dụng (Frontend Screens)	76
4.3.1. Cấu trúc cây thư mục mã nguồn (Code Tree Structure)	77
4.3.2. Giao diện hệ thống	78
CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ KẾT QUẢ	85
5.1. Kế hoạch kiểm thử (Test Plan)	85
5.1.1. Mục tiêu kiểm thử	85
5.1.2. Đối tượng và phương pháp kiểm thử	85
5.2. Kiểm thử chức năng (Black-box Test Cases)	86
5.2.1. Kịch bản kiểm thử Đăng ký và Xác thực tài khoản	86
5.2.2. Kịch bản kiểm thử Thanh toán QR ngân hàng động	87
5.2.3. Kịch bản kiểm thử Trợ lý ảo AI Chatbot RAG	88
5.3. Đánh giá bảo mật và hiệu năng (Security & Performance)	89
5.3.1. Đánh giá hiệu năng hệ thống (Response Time)	89
5.3.2. Đánh giá tính an toàn bảo mật	90
KẾT LUẬN………………………………………………...………………….....91
DANH MỤC TÀI LIỆU THAM KHẢO………………..…………………...…92



CHƯƠNG 1 :TỔNG QUAN VỀ ĐỀ TÀI VÀ CƠ SỞ THỰC TIỄN
1.1.Lý do chọn đề tài
1.1.1.Bối cảnh chuyển đổi số toàn diện trong giáo dục đại học và sự phát triển của công nghệ Web/AI
Trong kỷ nguyên số hóa hiện nay, cuộc Cách mạng công nghiệp lần thứ tư (CMCN 4.0) đang tái định hình mọi lĩnh vực trong cuộc sống của chúng ta. Trong đó, hệ thống giáo dục đại học không nằm ngoài làn sóng dịch chuyển này. Các trường đại học không chỉ đơn thuần là nơi truyền thụ tri thức mà đang dần chuyển mình thành các "đô thị số thu nhỏ" hay "hệ sinh thái thông minh". Tại đó, mọi dịch vụ hỗ trợ học tập, nghiên cứu và đời sống sinh hoạt của sinh viên đều được tối ưu hóa thông qua các giải pháp công nghệ thông tin. Việc xây dựng các tiện ích số nội bộ nhằm nâng cao trải nghiệm sống và học tập của sinh viên đã trở thành một chỉ số đánh giá quan trọng cho mức độ hiện đại hóa và uy tín của mỗi cơ sở giáo dục.
-Về mặt công nghệ, hai xu hướng nổi bật nhất trong những năm gần đây chính là Lập trình Web ứng dụng hiệu năng cao (Full-stack Web Development) và Trí tuệ nhân tạo tạo sinh (Generative AI). 
  - Sự kết hợp của kiến trúc MERN Stack (MongoDB, ExpressJS, ReactJS, Node.js) đã khẳng định vị thế vượt trội trong việc xây dựng các hệ thống web có khả năng xử lý bất đồng bộ cao, mượt mà và dễ mở rộng. 
   - Đồng thời, sự bùng nổ của các mô hình ngôn ngữ lớn (Large Language Models - LLM) như dòng mô hình Google Gemini đã mở ra những khả năng chưa từng có trong việc tương tác giữa con người và máy tính.
- Đặc biệt, sự ra đời của kỹ thuật RAG (Retrieval-Augmented Generation) đã khắc phục điểm yếu lớn nhất của các mô hình LLM truyền thống là hiện tượng "ảo tưởng" (hallucination) bằng cách tích hợp thêm các kho tri thức cục bộ (Vector Database) để AI tra cứu thông tin thực tế trước khi sinh câu trả lời.
- Việc kết hợp MERN Stack với các dịch vụ AI RAG thời gian thực để tạo nên một ứng dụng thương mại điện tử C2C thông minh dành riêng cho sinh viên là một hướng đi vô cùng mới mẻ, mang tính khoa học cao và bắt kịp xu hướng phát triển công nghệ hiện đại trên thế giới.
1.1.2. Nhu cầu thực tế mang tính chu kỳ và đặc thù của cộng đồng sinh viên Đại học Đại Nam (DNU)
Trường Đại học Đại Nam (DNU) với quy mô đào tạo hàng chục ngàn sinh viên thuộc nhiều khối ngành khác nhau đang chứng kiến một nhu cầu trao đổi, mua bán đồ dùng vô cùng sôi động và mang tính chu kỳ cao. Đời sống sinh viên có những nét đặc thù rất riêng biệt liên quan trực tiếp đến vấn đề tài chính và chu kỳ học tập:
1. Tính chu kỳ theo học kỳ: Mỗi sinh viên sau khi kết thúc một học kỳ sẽ không còn nhu cầu sử dụng các bộ giáo trình, tài liệu ôn thi hay dụng cụ thí nghiệm của môn học đó. Ngược lại, các tân sinh viên hoặc sinh viên chuẩn bị bước vào học kỳ mới lại rất cần những tài liệu này để tiết kiệm chi phí học tập.
2. Sự dịch chuyển địa lý và nhà trọ: Vào các thời điểm đầu năm học hoặc khi tốt nghiệp ra trường, nhu cầu chuyển đổi phòng trọ của sinh viên tăng đột biến. Việc mang vác các đồ dùng cồng kềnh như bàn học, tủ quần áo, quạt điện, bếp gas, nồi cơm điện là cực kỳ vất vả và tốn kém. Do đó, nhu cầu thanh lý nhanh các món đồ cũ này với mức giá rẻ cho các khóa sau là vô cùng cấp thiết.
3. Hạn chế về mặt tài chính: Phần lớn sinh viên chưa tự chủ hoàn toàn về kinh tế, phải phụ thuộc vào trợ cấp của gia đình hoặc thu nhập từ việc làm thêm ít ỏi. Việc mua sắm đồ dùng mới 100% tại các cửa hàng điện máy hay siêu thị đôi khi vượt quá khả năng chi trả của các em. Cơ hội tiếp cận các món đồ cũ có độ mới từ 70% đến 95% với mức giá chỉ bằng 30% - 50% so với giá gốc là một giải pháp tài chính cực kỳ tối ưu.
4. Xu hướng sống xanh và bảo vệ môi trường: Tái sử dụng (Reuse) và tái chế (Recycle) đồ dùng cũ đang trở thành một trào lưu sống văn minh, được thế hệ trẻ (Gen Z) tại DNU nhiệt liệt hưởng ứng. Việc kéo dài vòng đời sử dụng của một cuốn sách hay một chiếc quạt điện góp phần giảm thiểu rác thải ra môi trường, hướng tới một khuôn viên đại học phát triển bền vững.
1.1.3. Thực trạng và những hạn chế nghiêm trọng của các kênh giao dịch tự phát hiện nay
Mặc dù nhu cầu giao dịch là rất lớn, nhưng hiện nay sinh viên Đại học Đại Nam vẫn chưa có một nền tảng công nghệ chính thống nào hỗ trợ. Hoạt động trao đổi mua bán chủ yếu diễn ra thông qua các kênh tự phát như các nhóm Facebook (Facebook Groups), các nhóm chat Zalo hay các bài đăng cá nhân. Cách thức hoạt động này bộc lộ rất nhiều lỗ hổng và rủi ro nghiêm trọng:
Hình 1.1 Sơ đồ hoạt động - Thực trạng và Giải pháp DNU Marketplace
-Thiếu cơ chế xác thực danh tính người dùng (Identity Verification)
-Trên các hội nhóm Facebook hay Zalo, bất kỳ ai cũng có thể tham gia mà không cần qua bất kỳ bước kiểm duyệt thông tin cá nhân nào. Điều này dẫn đến việc người ngoài trường, những đối tượng có hành vi gian lận dễ dàng trà trộn vào để đăng tin giả, lừa đảo chiếm đoạt tài sản của sinh viên. Sinh viên không thể biết chắc chắn đối tác giao dịch với mình có thực sự là bạn học cùng trường hay không, tạo nên tâm lý e ngại, thiếu tin tưởng lẫn nhau.
- Thông tin bài đăng bị trôi lạc nhanh chóng và cấu trúc tìm kiếm kém
-Cơ chế hiển thị của Facebook dựa trên thuật toán tương tác (bài viết nào nhiều bình luận/like sẽ được đẩy lên đầu). Điều này khiến những bài đăng bán đồ dùng cũ nhưng ít tương tác bị trôi xuống dưới rất nhanh chỉ sau vài giờ. Người mua khi có nhu cầu rất khó tìm kiếm lại bài viết bằng từ khóa. Hơn nữa, việc không phân loại sản phẩm theo danh mục rõ ràng (ví dụ: Sách học, Đồ điện tử, Nội thất...) làm cho việc duyệt danh sách sản phẩm trở nên hỗn độn, mất thời gian.
- Quy trình thanh toán chuyển khoản ẩn chứa rủi ro cực kỳ cao
Trong các giao dịch C2C tự phát, người mua và người bán thường tự thỏa thuận chuyển khoản đặt cọc trước hoặc thanh toán toàn bộ qua số tài khoản cá nhân. Đã có rất nhiều trường hợp sinh viên chuyển khoản đặt cọc xong thì bị người bán chặn liên lạc, khóa tài khoản (bùng cọc). Do không có một hệ thống trung gian ghi nhận thông tin giao dịch, mã hóa đơn hay lưu trữ bằng chứng chuyển khoản (biên lai) một cách có hệ thống, sinh viên rất khó để tự bảo vệ quyền lợi của mình khi xảy ra tranh chấp.
- Thời gian phản hồi chậm và thiếu sự hỗ trợ tự động hóa
Khi mua bán qua mạng xã hội, người mua phải đợi người bán online mới có thể hỏi về tình trạng sản phẩm, giá cả hay cách thức nhận hàng. Nếu người bán bận học hoặc đi làm thêm, cuộc hội thoại bị gián đoạn khiến giao dịch bị trì trệ. Ngoài ra, việc thiếu một bộ phận chăm sóc khách hàng tự động để trả lời các câu hỏi về quy định đăng bài, chính sách bảo mật hay cách thức sử dụng sàn làm giảm trải nghiệm người dùng, đặc biệt là với các sinh viên mới tiếp cận công nghệ.
1.1.4. DNU Marketplace - Giải pháp đột phá ứng dụng công nghệ hiện đại
Để khắc phục hoàn toàn những nhược điểm nêu trên và đem lại một môi trường mua bán trực tuyến an toàn, tin cậy tuyệt đối, việc phát triển ứng dụng DNU Marketplace là vô cùng cấp thiết. Hệ thống mang lại những giải pháp công nghệ mang tính cách mạng:
- Xác thực học đường khép kín: Hệ thống bắt buộc người dùng đăng ký tài khoản bằng email định danh của trường Đại học Đại Nam có đuôi là `@dnu.edu.vn`. Quá trình này đi kèm với việc nhập Mã số sinh viên (MSSV) để hệ thống tự động lưu trữ và đối chiếu. Điều này đảm bảo 100% thành viên trên sàn đều là sinh viên hoặc cán bộ của nhà trường, loại bỏ hoàn toàn các đối tượng lừa đảo bên ngoài.
- Quy trình thanh toán QR ngân hàng thông minh & Đối soát an toàn: Hệ thống tích hợp tính năng quét mã QR ngân hàng động được tạo ra duy nhất cho mỗi đơn hàng (chứa mã giao dịch trong nội dung chuyển khoản). Người mua sau khi chuyển khoản sẽ tải ảnh biên lai lên hệ thống. Đội ngũ Admin/Super Admin sẽ đóng vai trò trung gian đối soát và duyệt thanh toán trước khi người bán chuyển hàng, bảo đảm an toàn dòng tiền cho cả hai bên.
- Tích hợp Trợ lý ảo AI Chatbot (Google Gemini AI + RAG): Đây là điểm sáng công nghệ lớn nhất của đề tài. Trợ lý ảo được tích hợp trực tiếp trên khung chat, sử dụng cơ sở dữ liệu vector (Vectra) để truy vấn nhanh danh sách sản phẩm đang bán, tìm kiếm ngữ nghĩa theo nhu cầu người mua ("Tìm cho tôi sách lập trình hướng đối tượng giá dưới 50k") và tự động giải đáp các câu hỏi thường gặp về chính sách của sàn.
- Tự động hóa tối đa bằng Cron Jobs: Giảm thiểu sự can thiệp thủ công bằng cách tự động hóa các tác vụ quản lý đơn hàng. Các đơn hàng chờ thanh toán quá 24h hoặc các yêu cầu thanh toán không tải biên lai sẽ bị hệ thống tự động hủy, giải phóng sản phẩm để người khác có cơ hội mua, tránh tình trạng "giữ hàng ảo".
- Trải nghiệm mạng xã hội thu nhỏ: Tích hợp các tính năng tương tác như bảng tin chung (Feed), tin ngắn biến mất sau 24h (Stories), tạo các bộ sưu tập sản phẩm (Collections) và theo dõi người dùng (Following) để tăng cường kết nối và tương tác giữa các sinh viên trong trường.
1.2. Mục tiêu nghiên cứu và phát triển
1.2.1. Mục tiêu tổng quát
-Mục tiêu tổng quát của đề tài nghiên cứu này là ứng dụng các công nghệ lập trình Web tiên tiến và Trí tuệ nhân tạo (AI) để thiết kế, xây dựng và triển khai thực tế một hệ thống sàn thương mại điện tử C2C (Consumer-to-Consumer) đồng bộ, an toàn và thông minh, được tối ưu hóa riêng biệt cho cộng đồng sinh viên và cán bộ giảng viên trường Đại học Đại Nam. Hệ thống hướng đến việc tạo dựng một không gian số khép kín, nơi các giao dịch trao đổi, mua bán đồ cũ được thực hiện một cách nhanh chóng, minh bạch và an toàn dưới sự giám sát tự động của công nghệ và đội ngũ quản trị viên, đồng thời tích hợp trợ lý ảo thông minh để nâng cao trải nghiệm người dùng và tự động hóa hoạt động hỗ trợ khách hàng.
1.2.2. Mục tiêu cụ thể
- Để đạt được mục tiêu tổng quát nêu trên, đề tài đề ra các mục tiêu cụ thể cần hoàn thành như sau:
- Thiết lập cơ sở hạ tầng kỹ thuật và cơ sở dữ liệu vững chắc (Backend Development)
   -Xây dựng hệ thống máy chủ RESTful API bằng Node.js và Express.js đạt hiệu năng cao, ổn định, có khả năng xử lý đồng thời nhiều kết nối bất đồng bộ.
   -Thiết kế cơ sở dữ liệu phi quan hệ với MongoDB sử dụng Mongoose ODM, chuẩn hóa cấu trúc của 22 collections để tối ưu hóa hiệu năng truy vấn, thiết lập các chỉ mục (indexes) trên các trường tìm kiếm chính (như tiêu đề sản phẩm, email người dùng).
   -Áp dụng các biện pháp bảo mật nâng cao như mã hóa mật khẩu một chiều bằng thuật toán `bcryptjs`, quản lý phiên làm việc bằng mã thông báo không trạng thái `JSON Web Token (JWT)`, bảo vệ tài nguyên API khỏi các cuộc tấn công DDoS và Spam bằng cơ chế giới hạn lượt gọi (`express-rate-limit`).
- Phát triển giao diện người dùng mượt mà và tối ưu trải nghiệm (Frontend Development)
- Xây dựng ứng dụng đơn trang (Single Page Application) sử dụng React 18 và bộ build công cụ nhanh Vite.
- Thiết kế giao diện đẹp mắt, mang tính thẩm mỹ cao, trực quan và dễ sử dụng bằng Tailwind CSS, bảo đảm tính tương thích hoàn hảo (Responsive Design) trên mọi loại thiết bị đầu cuối như điện thoại thông minh, máy tính bảng và máy tính cá nhân.
- Sử dụng Redux Toolkit để quản lý trạng thái toàn cục một cách khoa học, giúp đồng bộ hóa dữ liệu nhanh chóng giữa các màn hình chức năng mà không gặp hiện tượng trễ hoặc tải lại trang không cần thiết.
- Hiện thực hóa quy trình thanh toán QR ngân hàng động và đối soát giao dịch an toàn
- Xây dựng quy trình đặt hàng và thanh toán trực tiếp tích hợp mã QR ngân hàng động. Hệ thống tự động sinh mã giao dịch duy nhất cho mỗi yêu cầu thanh toán và tích hợp mã này vào nội dung chuyển khoản trong mã QR ngân hàng.
- Thiết kế tính năng tải ảnh biên lai chuyển khoản (Payment Proof) để người mua xác minh giao dịch.
- Xây dựng trang Dashboard quản trị cho Admin để đối soát số tiền nhận được trên tài khoản ngân hàng thực tế với biên lai người dùng tải lên, từ đó ra quyết định phê duyệt hoặc từ chối đơn hàng, đảm bảo tính an toàn tài chính tuyệt đối cho sinh viên.
- Tích hợp trợ lý ảo AI Chatbot thông minh sử dụng kiến trúc RAG
Xây dựng kho kiến thức (Knowledge Base) từ các tài liệu quy định, FAQ và chính sách bảo mật của sàn, thực hiện vector hóa (Vector Embeddings) dữ liệu này thông qua API của Google Gemini và lưu vào Vector Index cục bộ sử dụng thư viện Vectra.
- Triển khai các tính năng tương tác thời gian thực và mạng xã hội nội bộ
- Tích hợp Socket.IO để thực hiện tính năng chat trực tiếp thời gian thực giữa người mua và người bán, đi kèm trạng thái hoạt động trực tuyến (online/offline) và các thông báo (notifications) tức thời.
   - Xây dựng hệ thống mạng xã hội thu nhỏ bao gồm Bảng tin chung (Feed), Tin ngắn 24 giờ (Stories), Theo dõi người dùng (Following/Followers) để gia tăng tần suất tương tác và tạo sự gắn kết trong cộng đồng sinh viên Đại học Đại Nam.
-Kiểm thử chất lượng và đánh giá thực tiễn
  - Viết mã kiểm thử tự động sử dụng thư viện Jest cho các API quan trọng để phát hiện sớm các lỗi logic trong quá trình phát triển.
  - Tiến hành kiểm thử hộp đen (Black-box testing) cho toàn bộ chức năng và lấy ý kiến khảo sát thực tế từ sinh viên DNU để đánh giá mức độ hữu ích của dự án.
1.3. Đối tượng và phạm vi nghiên cứu
1.3.1. Đối tượng nghiên cứu
- Hạ tầng Web Fullstack: Nghiên cứu về mô hình lập trình web hiện đại Client-Server với NodeJS/ExpressJS ở Backend và ReactJS ở Frontend. Nghiên cứu phương pháp tối ưu hóa truy vấn dữ liệu NoSQL (MongoDB).
- WebSockets: Nghiên cứu giao thức giao tiếp song công thời gian thực (duplex communication) để truyền tải thông điệp tức thời thông qua Socket.IO.
- Trí tuệ nhân tạo tạo sinh (Generative AI): Nghiên cứu cách hoạt động và tích hợp mô hình ngôn ngữ lớn (LLM) của Google Gemini thông qua API.
- Kiến trúc RAG (Retrieval-Augmented Generation): Nghiên cứu các phương pháp biểu diễn văn bản dưới dạng vector toán học (Vector Embeddings), các thuật toán đo khoảng cách và độ tương đồng vector (như độ tương đồng Cosine), và cách thiết lập kho dữ liệu vector (Vectra Local Index).
-  Quy trình thanh toán phi tiền mặt: Nghiên cứu kiến trúc tạo mã QR động theo tiêu chuẩn VietQR và quy trình đối soát giao dịch thương mại điện tử C2C.
1.3.2. Phạm vi nghiên cứu
 - Về mặt chức năng hệ thống: Dự án tập trung giải quyết trọn vẹn luồng nghiệp vụ mua bán hàng hóa cũ giữa sinh viên với sinh viên (C2C). Đối với phần thanh toán, do giới hạn pháp lý và kỹ thuật của tài khoản ngân hàng cá nhân, hệ thống thực hiện luồng đối soát bán tự động (Admin kiểm tra thực tế và bấm nút duyệt trên Web) thay vì tích hợp trực tiếp API nhận biến động số dư từ cổng thanh toán tự động của ngân hàng thương mại.
  - Về mặt không gian triển khai: Ứng dụng được giới hạn cài đặt và thử nghiệm thực tế trong phạm vi nội bộ sinh viên, giảng viên hiện đang học tập và công tác tại trường Đại học Đại Nam (DNU).
 - Về mặt dữ liệu AI: Chatbot AI chỉ được huấn luyện/nạp tri thức (qua RAG) về hai mảng thông tin chính:
  -  Dữ liệu sản phẩm thực tế đang tồn tại trong database (để gợi ý sản phẩm phù hợp cho người mua).
 - Tài liệu chính sách, nội quy và hướng dẫn sử dụng của sàn DNU Marketplace. Chatbot sẽ từ chối hoặc đưa ra câu trả lời chung chung đối với các câu hỏi nằm ngoài phạm vi hoạt động của trường Đại học Đại Nam.
1.4. Phương pháp nghiên cứu
- Để thực hiện đề tài một cách khoa học, logic và đạt hiệu quả tối ưu, đồ án đã áp dụng kết hợp các nhóm phương pháp nghiên cứu sau:
1.4.1. Phương pháp nghiên cứu lý thuyết
  - Nghiên cứu tài liệu chính thống (Literature Review): Đọc và phân tích các tài liệu kỹ thuật, đặc tả API của React, Node.js, Express, Mongoose, Socket.IO và thư viện tích hợp Google Gemini AI.
   - Nghiên cứu lý thuyết AI RAG: Tìm hiểu các bài báo khoa học về kỹ thuật Retrieval-Augmented Generation, cách thức phân đoạn văn bản (chunking), kỹ thuật tối ưu hóa prompt (Prompt Engineering) và cách thức hoạt động của các cơ sở dữ liệu vector.
- Nghiên cứu kiến trúc an toàn thông tin: Tìm hiểu lý thuyết về mã hóa, cơ chế hoạt động của mã độc hại, bảo mật Web (CORS, CSRF, XSS) và các chuẩn bảo mật headers thông qua thư viện Helmet.
1.4.2. Phương pháp nghiên cứu thực tiễn và khảo sát
- Phương pháp điều tra bằng bảng hỏi (Survey): Tạo các biểu mẫu khảo sát trực tuyến gửi đến các hội nhóm sinh viên Đại học Đại Nam để thu thập số liệu về: nhu cầu mua bán đồ cũ, các sản phẩm thường xuyên cần thanh lý, mức chi trả bình quân và các khó khăn lớn nhất gặp phải khi mua đồ cũ qua Facebook/Zalo.
- Phương pháp phân tích trường hợp điển hình (Case Study): Phân tích mô hình hoạt động của các sàn giao dịch đồ cũ lớn tại Việt Nam (như Chợ Tốt) và các ứng dụng thương mại điện tử học đường trên thế giới, từ đó rút ra các bài học kinh nghiệm về thiết kế giao diện, luồng giao dịch và cơ chế chống lừa đảo để áp dụng vào DNU Marketplace.
 1.4.3. Phương pháp xây dựng và thực nghiệm phần mềm (Software Engineering)
Dự án áp dụng mô hình phát triển phần mềm linh hoạt Agile/Scrum với chu kỳ phát triển lặp lại. Quy trình thực hiện qua các giai đoạn:
                             Hình 1.2 Quy trình phát triển

1. Giai đoạn phân tích yêu cầu (Requirements Analysis): Xác định các tác nhân (Actors), viết các câu chuyện người dùng (User Stories) để làm rõ yêu cầu chức năng và phi chức năng.
2. Giai đoạn thiết kế hệ thống (System Design): 
-Thiết kế kiến trúc hệ thống và luồng dữ liệu (Data Flow Diagram).
- Thiết kế cơ sở dữ liệu MongoDB (ERD) nhằm tránh dư thừa dữ liệu và tăng tốc truy vấn.
-Vẽ wireframe và thiết kế chi tiết giao diện người dùng trên máy tính và điện thoại.
3. Giai đoạn hiện thực hóa và lập trình (Implementation):
 - Backend: Viết code Express.js, thiết lập Mongoose Models, Controllers, Routes và các Middleware xác thực.
-	Frontend: Phát triển các trang giao diện bằng React và Tailwind CSS, tích hợp Redux Toolkit để quản lý state.
  - AI & Real-time: Viết các service tích hợp Socket.IO và dịch vụ AI RAG.
4. Giai đoạn kiểm thử (Testing):
 - Kiểm thử đơn vị: Viết test cases sử dụng Jest để test các luồng API cốt lõi.
   - Kiểm thử tích hợp và kiểm thử hệ thống: Chạy thử toàn bộ ứng dụng, giả lập các thao tác mua bán, thanh toán, chat thời gian thực và chat với trợ lý AI.
5. Giai đoạn đánh giá kết quả (Evaluation): Triển khai thử nghiệm cho một nhóm nhỏ sinh viên DNU trải nghiệm, ghi nhận nhật ký lỗi hệ thống (system logs) và thu thập bảng khảo sát UAT (User Acceptance Testing) để hoàn thiện sản phẩm cuối cùng.





















 CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG
2.1. Tổng quan về mô hình Thương mại điện tử 
2.1.1. Khái niệm và vị trí của Thương mại điện tử trong nền kinh tế chia sẻ
-Thương mại điện tử C2C (Consumer-to-Consumer) là mô hình giao dịch thương mại trong đó các cá nhân (người tiêu dùng) trực tiếp thực hiện việc mua bán, trao đổi hàng hóa hoặc dịch vụ với nhau thông qua một nền tảng trực tuyến trung gian. Nền tảng trung gian này (như DNU Marketplace) không trực tiếp bán sản phẩm của mình mà đóng vai trò cung cấp môi trường kết nối, các công cụ tìm kiếm, hệ thống thanh toán, giải pháp giao tiếp và kiểm soát quy trình để hỗ trợ giao dịch diễn ra an toàn, thuận lợi.
-So với các mô hình truyền thống như B2C (Business-to-Consumer - Doanh nghiệp bán cho khách hàng) hay B2B (Business-to-Business - Doanh nghiệp bán cho doanh nghiệp), mô hình C2C sở hữu tính linh hoạt rất cao và chi phí vận hành ban đầu thấp. Trong nền kinh tế tuần hoàn và xu hướng tiêu dùng bền vững hiện nay, mô hình C2C đóng vai trò đặc biệt quan trọng. Nó giúp tối ưu hóa giá trị sử dụng của các sản phẩm đã qua sử dụng bằng cách luân chuyển chúng từ những người không còn nhu cầu sang những người đang cần, góp phần giảm thiểu rác thải tiêu dùng và tiết kiệm tài nguyên cho xã hội.
2.1.2. Đặc điểm của giao dịch C2C trong môi trường học đường
-Hoạt động giao dịch C2C diễn ra trong phạm vi một trường đại học mang những đặc trưng văn hóa và hành vi rất khác biệt so với các sàn giao dịch thương mại điện tử đại chúng (như Chợ Tốt hay Shopee):
1. Tính đồng nhất và khép kín cao 
-Tất cả các thành viên tham gia hệ thống (người mua, người bán, người quản trị) đều thuộc cùng một cộng đồng giáo dục – trường Đại học Đại Nam. Họ chia sẻ chung các giá trị văn hóa, nội quy ứng xử và lịch sinh hoạt học đường. Mối liên kết ngầm này tạo ra một bộ lọc tự nhiên giúp giảm bớt các hành vi lừa đảo mang tính chất chuyên nghiệp vốn thường xuyên xảy ra trên các sàn thương mại tự do.
2. Sự tập trung về mặt địa lý:
-Điểm khác biệt lớn nhất của mô hình C2C học đường là các bên giao dịch có vị trí địa lý cực kỳ gần nhau (trong khuôn viên trường, ký túc xá hoặc các khu nhà trọ xung quanh trường). Điều này giúp loại bỏ gần như hoàn toàn chi phí vận chuyển (shipping fee) – một trong những rào cản lớn nhất của TMĐT thông thường. Người mua và người bán có thể hẹn gặp trực tiếp tại giảng đường, căng tin để kiểm tra hàng hóa trước khi chốt giao dịch.
3. Tính chu kỳ gắn liền với kế hoạch học tập:
-Nhu cầu mua bán đồ cũ của sinh viên biến động mạnh mẽ theo lịch trình của năm học. Đầu năm học hoặc đầu mỗi kỳ học, nhu cầu mua sách giáo khoa, giáo trình, máy tính bỏ túi và dụng cụ nhà trọ tăng vọt. Cuối học kỳ hoặc thời điểm sinh viên năm cuối tốt nghiệp ra trường, nhu cầu thanh lý, ký gửi đồ dùng lại đạt đỉnh. Hiểu rõ tính chu kỳ này giúp hệ thống có thể tối ưu hóa các thuật toán gợi ý sản phẩm và đẩy thông báo (push notification) đúng thời điểm.
4. Quy mô giá trị giao dịch nhỏ nhưng mang tính thiết thực:
-Hàng hóa trao đổi chủ yếu là giáo trình học tập cũ, tài liệu ôn thi, trang thiết bị phòng trọ giá trị trung bình thấp (quạt điện, ấm siêu tốc, bàn học) và quần áo. Mặc dù giá trị từng đơn hàng không lớn, nhưng tần suất giao dịch lại rất cao và có ý nghĩa thực tế cực lớn đối với việc tối ưu hóa chi phí sinh hoạt của sinh viên.
 2.1.3. Vấn đề xây dựng lòng tin, bảo mật thông tin và giải quyết tranh chấp trong mô hình C2C học đường
- Xây dựng lòng tin (Trust Building) và khắc phục sự bất đối xứng thông tin
-Rào cản lớn nhất của mô hình C2C là hiện tượng "Bất đối xứng thông tin" (Information Asymmetry) – khi người bán nắm rõ chất lượng thật của món đồ cũ còn người mua chỉ có thể đánh giá qua vài bức ảnh mô tả sơ sài. Để thiết lập lòng tin vững chắc trong hệ thống DNU Marketplace, đề tài áp dụng hai giải pháp công nghệ:
- Xác thực email tên miền trường (`@dnu.edu.vn`): Đây là bước tường lửa ngăn chặn các đối tượng xấu trà trộn. Người dùng bắt buộc phải xác minh quyền sở hữu email sinh viên trước khi đăng bài hoặc mua hàng.
 - Hệ thống đánh giá uy tín chéo (Rating and Review): Sau khi hoàn thành giao dịch, người mua có quyền đánh giá số sao (1-5 sao) và viết nhận xét về người bán. Số điểm uy tín trung bình này được hiển thị công khai trên hồ sơ của người bán, thúc đẩy họ trung thực hơn trong việc mô tả chất lượng sản phẩm.
-Bảo mật thông tin người dùng (Data Privacy & Security)
-Sinh viên khi tham gia sàn giao dịch trực tuyến thường lo ngại việc thông tin cá nhân (như Mã số sinh viên, số điện thoại, email) bị thu thập trái phép phục vụ cho mục đích quảng cáo rác hoặc lừa đảo viễn thông. Hệ thống bảo vệ dữ liệu người dùng thông qua:
 - Ẩn số điện thoại liên lạc trên giao diện công khai, khuyến khích người dùng liên lạc qua hệ thống Chat Socket.IO nội bộ.
  - Mã hóa và phân quyền truy cập nghiêm ngặt đối với thông tin nhạy cảm. Chỉ khi giao dịch chuyển sang trạng thái được xác nhận (Confirmed), người bán mới thấy được địa chỉ nhận hàng của người mua.
  - Bảo vệ ảnh biên lai chuyển khoản (Payment Proof) để tránh việc rò rỉ thông tin tài khoản ngân hàng cá nhân của người mua ra bên ngoài
- Quy trình giải quyết tranh chấp (Dispute Resolution)
Tranh chấp trong giao dịch đồ cũ thường xoay quanh việc sản phẩm bị hỏng hóc ẩn giấu (không hoạt động sau khi mang về nhà trọ) hoặc người mua tải lên biên lai chuyển khoản giả mạo (Fake receipt). 
Hệ thống thiết kế quy trình giải quyết tranh chấp thông qua vai trò trọng tài của Ban Quản trị (Admin):
   -Khi có khiếu nại, đơn hàng sẽ chuyển sang trạng thái tạm giữ (Review/Dispute).
   -Admin sẽ tiến hành đối soát mã giao dịch trên tài khoản ngân hàng của hệ thống và kiểm duyệt tính xác thực của biên lai được tải lên.
   -Hệ thống cung cấp lịch sử chat được lưu trữ an toàn trong database làm bằng chứng đối chất giữa hai bên khi cần thiết.
2.2. Công nghệ phát triển Backend 
2.2.1. Node.js & Express.js: Nền tảng xây dựng RESTful API hiệu năng cao, bất đồng bộ
- Khái niệm và nguyên lý hoạt động của Node.js
Node.js là một môi trường chạy mã (Runtime Environment) JavaScript phía máy chủ, được xây dựng trên nền tảng công cụ dịch mã JavaScript V8 của Google Chrome (V8 Engine). Node.js sở hữu mô hình kiến trúc đặc thù: Đơn luồng (Single-threaded) kết hợp cơ chế Vòng lặp sự kiện (Event Loop) và mô hình Vào/Ra không chặn (Non-blocking I/O).
-Trong các hệ thống web truyền thống (như Apache/PHP hoặc Tomcat/Java), mỗi request từ client sẽ được xử lý bởi một luồng (thread) riêng biệt. Khi hệ thống nhận hàng ngàn request đồng thời, việc tạo mới và chuyển đổi ngữ cảnh giữa các luồng (context switching) sẽ tiêu tốn tài nguyên RAM và CPU cực kỳ lớn, dễ dẫn đến nghẽn mạng. 
-Ngược lại, Node.js sử dụng một luồng duy nhất để tiếp nhận tất cả các request. Khi gặp các tác vụ tốn thời gian (như truy vấn MongoDB hoặc tải ảnh lên Cloudinary), Node.js sẽ đẩy tác vụ đó xuống tầng hệ điều hành hoặc Thread Pool chạy ngầm và tiếp tục nhận các request khác. Khi tác vụ chạy ngầm hoàn thành, nó phát ra một sự kiện (Event) kèm theo dữ liệu trả về để luồng chính xử lý tiếp (Callback). Nhờ kiến trúc bất đồng bộ này, Node.js có thể duy trì hàng chục ngàn kết nối đồng thời với mức tiêu hao tài nguyên phần cứng cực kỳ thấp, rất phù hợp cho ứng dụng thời gian thực như DNU Marketplace.
- Express.js Framework và cơ chế Middleware
Express.js là một framework phát triển web tối giản, linh hoạt và phổ biến nhất chạy trên nền tảng Node.js. Nó cung cấp một tập hợp các tính năng mạnh mẽ để xây dựng các ứng dụng web một trang, nhiều trang và đặc biệt là hệ thống RESTful API.
-Trọng tâm của Express.js là cơ chế Middleware (Phần mềm trung gian). Middleware là các hàm có quyền truy cập vào đối tượng yêu cầu (`req`), đối tượng phản hồi (`res`) và hàm middleware tiếp theo (`next`) trong vòng đời Request-Response của ứng dụng.
Hệ thống DNU Marketplace tận dụng triệt để cơ chế Middleware của Express để xây dựng các lớp phòng thủ bảo mật và chuẩn hóa dữ liệu:
1. Xác thực phân quyền (`auth.js`): Kiểm tra sự tồn tại của JWT token trong HTTP headers, xác minh tính hợp lệ và đính kèm thông tin user vào request trước khi chuyển tiếp đến controller xử lý.
2. Giới hạn truy cập (`rateLimiter.js`): Ngăn chặn spam request đến API Chatbot bằng cách đếm số lượt gọi từ mỗi địa chỉ IP trong khoảng thời gian xác định.
3. Kiểm tra tính hợp lệ dữ liệu (`express-validator`): Middleware lọc và kiểm tra tính hợp chuẩn của dữ liệu đầu vào (ví dụ: phát hiện lỗi nhập sai định dạng email, độ dài mật khẩu không đủ trước khi hệ thống thực hiện nghiệp vụ ghi dữ liệu vào database).
- Kiến trúc RESTful API
-Hệ thống Backend được thiết kế theo chuẩn kiến trúc REST (Representational State Transfer). Dữ liệu được trao đổi dưới định dạng chuẩn JSON. Các tài nguyên hệ thống được định nghĩa qua các đường dẫn (endpoints) tường minh và thực thi hành động tương ứng thông qua các phương thức HTTP chuẩn:
   `GET /api/products`: Lấy danh sách sản phẩm đăng bán (hỗ trợ phân trang, lọc).
   `POST /api/products`: Đăng một sản phẩm mới lên sàn.
   `PUT /api/products/:id`: Cập nhật thông tin chi tiết sản phẩm.
   `DELETE /api/products/:id`: Xóa sản phẩm khỏi sàn (soft delete hoặc hard delete).

 2.2.2. MongoDB & Mongoose: Hệ quản trị cơ sở dữ liệu NoSQL dạng tài liệu (Document-oriented)
- Tại sao chọn cơ sở dữ liệu NoSQL MongoDB?
MongoDB là một hệ quản trị cơ sở dữ liệu mã nguồn mở phi quan hệ (NoSQL), lưu trữ dữ liệu dưới dạng tài liệu (Documents) linh hoạt có cấu trúc tương đương với đối tượng JSON (gọi là BSON - Binary JSON). Đối với một dự án thương mại điện tử tích hợp các tính năng xã hội như DNU Marketplace, MongoDB đem lại nhiều ưu điểm vượt trội so với cơ sở dữ liệu quan hệ (RDBMS) truyền thống như MySQL hay PostgreSQL:
   -Schema linh hoạt (Schemaless): Hàng hóa cũ do sinh viên đăng bán có thuộc tính rất đa dạng. Ví dụ: Sách cần lưu trữ thông tin về Tác giả, Nhà xuất bản, Năm xuất bản; trong khi Đồ điện tử cần lưu trữ Thương hiệu, Thời gian bảo hành, Công suất. MongoDB cho phép các tài liệu trong cùng một Collection sở hữu các trường dữ liệu khác nhau mà không cần thực hiện các thao tác định nghĩa bảng phức tạp hay tạo ra nhiều cột trống (null).
   -Khả năng mở rộng ngang (Horizontal Scalability): Dễ dàng mở rộng hệ thống bằng cơ chế phân mảnh dữ liệu (Sharding) khi số lượng người dùng và sản phẩm của trường tăng cao.
  - Hiệu năng truy vấn cao: Nhờ lưu trữ dữ liệu liên quan trong cùng một tài liệu dưới dạng lồng nhau (Embedded Documents) thay vì phân chia ra nhiều bảng, MongoDB giảm thiểu được các phép liên kết bảng (JOIN) phức tạp, giúp tăng tốc độ đọc dữ liệu lên nhiều lần.
- Sử dụng Mongoose ODM để quản lý mô hình dữ liệu
-Mặc dù MongoDB là hệ cơ sở dữ liệu không ràng buộc schema, nhưng trong môi trường ứng dụng thực tế, chúng ta vẫn cần quản lý và kiểm soát cấu trúc dữ liệu để tránh lỗi logic phần mềm. Mongoose đóng vai trò là một thư viện ODM (Object Document Mapper) giúp ánh xạ các tài liệu trong MongoDB thành các đối tượng JavaScript trong mã nguồn Node.js.
-Mongoose cung cấp các tính năng cốt lõi cho dự án DNU Marketplace:
1. Định nghĩa Schemas chặt chẽ: Định nghĩa rõ ràng kiểu dữ liệu của từng trường (String, Number, Date, Boolean, Array, ObjectId), thiết lập giá trị mặc định (default values) và các ràng buộc dữ liệu bắt buộc (required fields).
2. Mối liên kết tham chiếu (Population): Mongoose sử dụng trường `ref` (chứa ObjectId) để liên kết giữa các tài liệu. Khi lấy thông tin đơn hàng (Order), hàm `.populate('buyerId sellerId productId')` sẽ tự động thực hiện truy vấn phụ để lấy thông tin chi tiết của người mua, người bán và sản phẩm tương ứng, giúp lập trình viên thao tác với dữ liệu liên kết một cách cực kỳ đơn giản.
3. Hooks / Middlewares trong DB: Hỗ trợ chạy các hàm tự động trước hoặc sau các sự kiện lưu dữ liệu (ví dụ: tự động băm mật khẩu trước khi lưu tài khoản mới vào collection `Users`).
 2.2.3. JWT (JSON Web Token): Phương pháp xác thực phân quyền API không trạng thái (Stateless Authentication)
- Cấu trúc chi tiết của một token JWT
-JSON Web Token (JWT) là một tiêu chuẩn mở (RFC 7519) định nghĩa phương thức truyền tải thông tin an toàn giữa các bên dưới dạng một đối tượng JSON. Một chuỗi JWT chuẩn gồm 3 phần được phân tách bằng dấu chấm (`.`):
1. Header (Tiêu đề): Chứa loại token (JWT) và thuật toán mã hóa chữ ký được sử dụng (ví dụ: HMAC SHA256 hoặc RSA).
2. Payload (Nội dung dữ liệu): Chứa các thông tin cần truyền tải (Claims). Trong dự án, payload lưu các thông tin định danh của người dùng như `id` (ObjectId), `email`, `role` (vai trò: student, admin, superadmin) và thời gian hết hạn của token (`exp`). Lưu ý: Không lưu mật khẩu hay thông tin cực kỳ nhạy cảm ở đây vì Payload chỉ được mã hóa Base64 và có thể bị giải mã dễ dàng.
3. Signature (Chữ ký): Được tạo ra bằng cách lấy phần Header đã mã hóa Base64 kết hợp với phần Payload đã mã hóa Base64, sau đó ký bằng một khóa bí mật (`JWT_SECRET`) chỉ có ở máy chủ (Backend). Chữ ký này đảm bảo tính toàn vẹn của token: nếu bất kỳ ai cố tình chỉnh sửa thông tin trong Payload trên trình duyệt, chữ ký sẽ không còn khớp và token ngay lập tức bị hệ thống coi là không hợp lệ.
- Cơ chế Stateless Authentication (Xác thực không trạng thái)
-Trong cơ chế xác thực truyền thống (Session-based), máy chủ phải lưu trữ thông tin phiên làm việc của người dùng trong bộ nhớ RAM hoặc cơ sở dữ liệu (Session Store), đồng thời gửi cho trình duyệt một Session ID qua Cookie. Mỗi lần người dùng gửi request, máy chủ phải tìm kiếm Session ID đó trong bộ nhớ để xác định danh tính. Cơ chế này tiêu tốn bộ nhớ máy chủ và gặp khó khăn lớn khi hệ thống mở rộng chạy trên nhiều máy chủ độc lập (Load Balancing).
- Phân quyền người dùng (Authorization Role-based)
Hệ thống sử dụng thông tin `role` trích xuất từ Payload của JWT để phân quyền sử dụng API.
- Quyền Sinh viên (`student`): Được phép đăng sản phẩm, xem bài viết, mua hàng, chat, sử dụng chatbot AI.
- Quyền Quản trị viên (`admin`): Được truy cập trang Admin Dashboard, duyệt tin bài, xử lý các báo cáo vi phạm và duyệt/từ chối các giao dịch thanh toán chuyển khoản.
- Quyền Quản trị viên cấp cao (`superadmin`): Sở hữu toàn quyền hệ thống, bao gồm quyền chỉnh sửa/xóa tài khoản ngân hàng nhận tiền của hệ thống (Bank QR Management) và cấp quyền/thu hồi quyền của các Admin khác.
2.3. Công nghệ phát triển Frontend (Phía máy khách)
2.3.1. ReactJS (Vite): Thư viện JavaScript xây dựng giao diện SPA động
- Khái niệm và Kiến trúc hướng thành phần (Component-Based Architecture)
+ ReactJS là một thư viện mã nguồn mở JavaScript được phát triển bởi Meta (Facebook) chuyên dùng để xây dựng giao diện người dùng (UI), đặc biệt là các ứng dụng đơn trang (Single Page Application - SPA). Nguyên lý cốt lõi của ReactJS là chia nhỏ giao diện người dùng phức tạp thành các khối UI độc lập, tự quản lý trạng thái và có khả năng tái sử dụng cao gọi là Components.
+ Trong dự án DNU Marketplace, Các thành phần như thanh điều hướng (`Navbar`), khung chat của AI (`Chatbot`), ô nhập dữ liệu, hay nút bấm thanh toán (`PaymentModal`) đều được đóng gói thành các component riêng biệt. Điều này giúp mã nguồn frontend trở nên cực kỳ gọn gàng, dễ bảo trì, nâng cấp và giảm thiểu sự trùng lặp code.
+ Cơ chế DOM ảo (Virtual DOM) và Thuật toán đối sánh (Diffing Algorithm)
- Trong phát triển web truyền thống, mỗi khi dữ liệu thay đổi, trình duyệt phải dựng lại toàn bộ cây cấu trúc tài liệu HTML (Real DOM). Thao tác này cực kỳ tốn tài nguyên và là nguyên nhân chính gây ra hiện tượng giật, lag trên trình duyệt.
- ReactJS giải quyết triệt để vấn đề này bằng khái niệm Virtual DOM (DOM ảo). DOM ảo là một bản sao gọn nhẹ của Real DOM được lưu trữ trên bộ nhớ RAM dưới dạng đối tượng JavaScript. 
- Khi trạng thái (State) của component thay đổi (ví dụ: người dùng gõ từ khóa tìm kiếm sản phẩm), React sẽ cập nhật sự thay đổi đó lên cây DOM ảo trước.
- Sau đó, React thực hiện Thuật toán đối sánh (Diffing Algorithm) để so sánh cây DOM ảo mới với cây DOM ảo cũ nhằm xác định chính xác những nút (nodes) nào thực sự bị thay đổi.
- Cuối cùng, React chỉ cập nhật những phần thay đổi thực tế đó lên Real DOM của trình duyệt (quá trình này gọi là Reconciliation). Nhờ cơ chế này, tốc độ hiển thị giao diện của DNU Marketplace luôn được duy trì ở mức tối ưu, đem lại trải nghiệm mượt mà cho sinh viên.
- React Hooks và Công cụ build Vite
React Hooks: Dự án sử dụng mô hình Functional Components kết hợp với các React Hooks như `useState` (quản lý trạng thái nội bộ của component), `useEffect` (xử lý các tác vụ phụ như gọi API, thiết lập lắng nghe Socket.IO), và `useRef` (truy cập trực tiếp phần tử DOM để tự động cuộn khung chat xuống dưới khi có tin nhắn mới).
-Vite: Thay vì sử dụng công cụ Webpack truyền thống thường mất nhiều thời gian để khởi động và biên dịch, dự án sử dụng Vite làm công cụ build thế hệ mới. Vite tận dụng cơ chế ES Modules (ESM) gốc của trình duyệt giúp khởi chạy server phát triển gần như ngay lập tức và tăng tốc độ biên dịch (Hot Module Replacement - HMR) lên gấp nhiều lần.
2.3.2. Redux Toolkit: Thư viện quản lý trạng thái tập trung (State Management)
-Tại sao cần quản lý trạng thái tập trung trong ứng dụng SPA?
-Trong các ứng dụng React quy mô lớn, dữ liệu (State) thường phải chia sẻ giữa nhiều component nằm ở các nhánh khác nhau trên cây giao diện. Nếu truyền dữ liệu theo cách thông thường thông qua các thuộc tính (Props), lập trình viên sẽ gặp phải hiện tượng Prop Drilling (phải truyền prop qua rất nhiều tầng component trung gian không có nhu cầu sử dụng). Điều này làm code trở nên rối rắm và khó kiểm soát lỗi.
-Redux Toolkit giải quyết vấn đề này bằng cách thiết lập một kho chứa trạng thái tập trung duy nhất gọi là Store. Bất kỳ component nào trong ứng dụng cũng có thể truy cập trực tiếp vào Store để lấy dữ liệu hoặc gửi đi các yêu cầu thay đổi dữ liệu mà không cần thông qua component cha.
- Kiến trúc luồng dữ liệu một chiều (Unidirectional Data Flow) của Redux
Redux hoạt động nghiêm ngặt theo luồng dữ liệu một chiều để đảm bảo trạng thái ứng dụng luôn ổn định và dễ dự đoán:
1. View (Giao diện): Người dùng thực hiện tương tác (ví dụ: nhấn nút "Thêm vào yêu thích").
2. Actions: Component phát ra một đối tượng Action chứa thông tin về hành động và dữ liệu đi kèm.
3. Reducers: Các hàm thuần túy (Pure Functions) tiếp nhận Action và trạng thái hiện tại để tính toán ra một trạng thái mới hoàn toàn (không chỉnh sửa trực tiếp trạng thái cũ).
- Redux Toolkit và các API tối ưu
Dự án sử dụng Redux Toolkit – phiên bản nâng cấp chính thức giúp đơn giản hóa Redux truyền thống nhờ loại bỏ các code cấu hình rườm rà (boilerplate code):
   `createSlice`: Định nghĩa đồng thời cả Actions và Reducers trong cùng một khối mã, tự động tích hợp thư viện `Immer` cho phép viết code thay đổi trạng thái theo phong cách trực quan (nhưng bên dưới vẫn bảo đảm tính bất biến - immutability).
   `createAsyncThunk`: Quản lý các hành động bất đồng bộ như gọi API Axios để xác thực tài khoản, tải danh sách sản phẩm hay lịch sử giao dịch ngân hàng một cách hệ thống (quản lý cả 3 trạng thái: pending, fulfilled, và rejected).
 2.3.3. Tailwind CSS: Framework CSS dạng tiện ích (Utility-First CSS)
-Tailwind CSS là một framework CSS hướng tiện ích (Utility-first CSS) cung cấp hàng ngàn class nhỏ, nguyên tử (atomic classes) tương ứng với từng thuộc tính CSS riêng lẻ (ví dụ: `flex` để bật flexbox, `pt-4` để padding-top 1rem, `bg-blue-500` để đặt màu nền xanh).
-Ưu điểm vượt trội của Tailwind CSS đối với DNU Marketplace bao gồm:
1. Tốc độ phát triển giao diện nhanh vượt trội: Lập trình viên có thể viết CSS trực tiếp trong file React component thông qua thuộc tính `className` mà không cần chuyển đổi liên tục giữa file JS và file CSS riêng biệt.
2. Khả năng Responsive trực quan: Thiết kế giao diện tương thích với mọi màn hình cực kỳ đơn giản bằng cách đặt tiền tố kích thước màn hình trước class (ví dụ: `w-full md:w-1/2` – chiều rộng 100% trên điện thoại nhưng chỉ chiếm 50% trên máy tính).
3. Tối ưu hóa dung lượng file CSS xuất bản (Production Build): Tailwind tích hợp công cụ PurgeCSS để quét toàn bộ mã nguồn React và tự động loại bỏ tất cả các class CSS không được sử dụng. Nhờ đó, file CSS sản phẩm cuối cùng thường chỉ nặng dưới 10KB, giúp tăng tốc độ tải trang ban đầu của website lên đáng kể.
2.4. Công nghệ tương tác thời gian thực (Real-Time Communication)
2.4.1. Bản chất của giao thức WebSockets và sự khác biệt với HTTP
 - Hạn chế của giao thức HTTP trong các tính năng thời gian thực
-Giao thức HTTP truyền thống hoạt động theo cơ chế Yêu cầu - Phản hồi (Request - Response) và mang tính chất Không trạng thái (Stateless). Trong mô hình này, chỉ có Client mới có quyền chủ động khởi tạo một kết nối gửi yêu cầu lên Server, và Server sau khi trả về kết quả sẽ lập tức đóng kết nối. Server hoàn toàn không thể chủ động gửi dữ liệu về Client nếu không có yêu cầu trước đó.
-Để xây dựng tính năng chat hoặc thông báo thời gian thực bằng HTTP, lập trình viên buộc phải sử dụng các kỹ thuật thô sơ như Short Polling (Client liên tục gửi request lên server sau mỗi 2-3 giây để hỏi xem có dữ liệu mới không). Kỹ thuật này gây ra sự lãng phí tài nguyên máy chủ vô cùng lớn do phải liên tục thiết lập kết nối TCP, tạo ra hàng triệu request vô nghĩa khi không có tin nhắn mới, đồng thời tạo độ trễ cao trong giao tiếp.
 - Giao thức WebSockets và cơ chế bắt tay (Handshake)
WebSockets (được chuẩn hóa theo tiêu chuẩn RFC 6455) ra đời để giải quyết triệt để bài toán thời gian thực. Giao thức này thiết lập một kênh kết nối hai chiều, song công toàn phần (Full-duplex) liên tục giữa Client và Server trên một kết nối TCP duy nhất.
Quy trình hoạt động của WebSockets gồm hai bước chính:
1.  Bắt tay WebSocket (Handshake): Client gửi một yêu cầu HTTP tiêu chuẩn lên Server kèm theo các Header đặc biệt (`Upgrade: websocket` và `Connection: Upgrade`). Nếu Server hỗ trợ, nó sẽ trả về mã phản hồi `101 Switching Protocols` chấp nhận nâng cấp giao thức.
2.  Truyền tải dữ liệu: Sau bước bắt tay thành công, kết nối HTTP bị hủy bỏ và thay thế bằng kết nối WebSocket chạy trên nền TCP. Kể từ lúc này, cả hai bên có thể gửi dữ liệu dạng khung văn bản (text frames) hoặc nhị phân (binary frames) cho nhau bất kỳ lúc nào với dung lượng header cực kỳ nhỏ (chỉ vài bytes thay vì hàng trăm bytes như HTTP request), giúp độ trễ giảm xuống gần như bằng 0.
2.4.2. Socket.IO: Thư viện truyền thông điệp thời gian thực mạnh mẽ
-Tại sao lựa chọn Socket.IO thay vì thư viện WebSockets thuần (Native WebSockets)?
Mặc dù WebSockets đã được hỗ trợ bởi hầu hết các trình duyệt hiện đại, nhưng việc lập trình WebSockets thuần gặp rất nhiều khó khăn khi triển khai thực tế. Socket.IO là một thư viện JavaScript cao cấp xây dựng trên nền tảng WebSockets, cung cấp nhiều tính năng tự động hóa vượt trội:
1. Cơ chế dự phòng (HTTP Long-Polling Fallback): Nếu người dùng sử dụng thiết bị cũ hoặc đứng sau các tường lửa chặn kết nối WebSocket, Socket.IO sẽ tự động hạ cấp giao thức xuống HTTP Long-Polling để đảm bảo tính năng chat vẫn hoạt động bình thường mà không gây lỗi ứng dụng.
2. Tự động kết nối lại (Auto-reconnection): Nếu người dùng đi vào vùng sóng yếu hoặc mất mạng tạm thời, Socket.IO Client sẽ tự động thực hiện cơ chế kết nối lại theo chu kỳ tăng dần (exponential backoff) ngay khi có mạng mà lập trình viên không cần viết thêm code xử lý.
3. Quản lý kết nối theo Phòng (Rooms) và Không gian tên (Namespaces): Socket.IO Server cung cấp tính năng gộp các socket kết nối lại với nhau vào các "Phòng" (Rooms) ảo. Đây là tính năng cốt lõi để xây dựng ứng dụng chat.
- Ứng dụng cụ thể của Socket.IO trong DNU Marketplace
Hệ thống Backend tích hợp Socket.IO để vận hành các nghiệp vụ real-time:
-Quản lý Trạng thái Trực tuyến: Khi sinh viên kết nối, server lắng nghe sự kiện và cập nhật trạng thái trực tuyến. Đồng thời phát tín hiệu đến các bạn bè đang theo dõi để hiển thị chấm xanh hoạt động trên giao diện.
-Hệ thống phòng chat cá nhân (One-to-One Chat): Khi hai sinh viên mở khung chat với nhau, socket của họ sẽ được server đưa vào một phòng chat chung có tên trùng với `conversationId` lưu trong cơ sở dữ liệu. Khi một người gửi tin nhắn:
    1.  Client phát ra sự kiện `send-message` kèm theo nội dung tin nhắn.
    2.  Server bắt được sự kiện này, lưu tin nhắn vào MongoDB và phát ngược lại sự kiện `receive-message` vào riêng phòng chat `conversationId` đó. Chỉ có người nhận nằm trong phòng mới nhận được tin nhắn này, đảm bảo tính riêng tư.
   -Sự kiện gõ phím (Typing Indicator): Khi sinh viên bắt đầu nhập văn bản, client phát sự kiện `typing` lên server để hiển thị hiệu ứng "đang nhập tin nhắn..." trên màn hình của đối phương, tạo cảm giác giao tiếp sống động.
   -Hệ thống Thông báo đẩy: Mỗi khi Admin duyệt thanh toán thành công, hệ thống sẽ gọi Socket.IO để phát sự kiện `new-notification` đến đúng socket của người mua, giúp hiển thị thông báo toast màu xanh trên giao diện ngay lập tức mà không cần F5 trình duyệt.
 2.5. Trí tuệ nhân tạo (Generative AI) và kỹ thuật RAG
2.5.1. Google Gemini AI API: Mô hình ngôn ngữ lớn (LLM) và ứng dụng
-Trí tuệ nhân tạo tạo sinh (Generative AI), đặc biệt là các Mô hình ngôn ngữ lớn (Large Language Models - LLMs) hoạt động trên nền tảng kiến trúc mạng Transformer (được phát triển bởi Google vào năm 2017 với cơ chế tự chú ý - Self-Attention). Các mô hình này được huấn luyện trên khối lượng dữ liệu khổng lồ chứa hàng tỷ từ ngữ, giúp chúng có khả năng hiểu ngữ cảnh, suy luận logic cơ bản và sinh ra văn bản tự nhiên giống như con người.
-Dự án DNU Marketplace tích hợp Google Gemini AI API để xây dựng trợ lý chatbot hỗ trợ sinh viên mua bán. Các lý do cốt lõi để lựa chọn Google Gemini bao gồm:
-  Mô hình tối ưu hóa hiệu năng cao (`gemini-2.5-flash` / `gemini-2.0-flash`): Đây là các mô hình thế hệ mới của Google được thiết kế riêng cho các tác vụ cần tốc độ phản hồi nhanh (độ trễ cực thấp) và chi phí vận hành API tối ưu.
-  Cửa sổ ngữ cảnh cực lớn (Context Window): Khả năng tiếp nhận lượng dữ liệu đầu vào (Prompt) rất lớn giúp hệ thống dễ dàng chèn thông tin ngữ cảnh từ nhiều sản phẩm và các file tài liệu chính sách vào prompt mà không lo vượt giới hạn token.
 -  Khả năng xử lý tiếng Việt xuất sắc: Qua thực nghiệm, Google Gemini tỏ ra vượt trội trong việc hiểu các thuật ngữ tiếng Việt thường dùng của sinh viên (như "đồ cũ", "pass giáo trình", "bao test"), giúp câu trả lời trở nên tự nhiên và gần gũi.
2.5.2. Kỹ thuật RAG (Retrieval-Augmented Generation) và Vector Embeddings
 - Khái niệm Vector Embeddings (Nhúng từ/văn bản)
Con người hiểu ngôn ngữ qua ngữ nghĩa và ký tự, nhưng máy tính chỉ có thể tính toán trên các con số. Vector Embeddings là kỹ thuật biểu diễn các đoạn văn bản (từ, câu hoặc cả đoạn văn) thành một mảng các số thực float có kích thước cố định (ví dụ: mảng 3072 chiều khi sử dụng model `models/gemini-embedding-001`).
-Điểm đặc biệt của Vector Embeddings là nó bảo toàn mối quan hệ ngữ nghĩa giữa các từ trong không gian vector toán học. Những câu văn có ý nghĩa tương quan gần nhau (dù không chia sẻ chung bất kỳ từ khóa nào) sẽ có khoảng cách vector rất ngắn và góc giữa chúng rất nhỏ (độ tương đồng Cosine cao). Ví dụ: vector của câu "Tôi muốn mua sách viết code C++" sẽ nằm rất gần vector của câu "Tìm giáo trình lập trình hướng đối tượng" trong không gian 3072 chiều.
-Khái niệm kỹ thuật RAG (Truy xuất tăng cường thế hệ)
Mặc dù các mô hình ngôn ngữ lớn (LLM) rất thông minh, nhưng chúng gặp phải hai hạn chế chí mạng:
1. Hiện tượng ảo tưởng (Hallucination): Tự động bịa ra các thông tin không có thật nhưng viết dưới văn phong rất tự tin và thuyết phục.
2. Thiếu kiến thức nội bộ/thời gian thực: Gemini không thể tự biết trong database của DNU Marketplace đang có sản phẩm nào bán, hay chính sách đối soát ngân hàng của trường Đại học Đại Nam là gì.
Kỹ thuật RAG (Retrieval-Augmented Generation) giải quyết vấn đề này bằng quy trình 3 bước khép kín:
1. Retrieval (Truy xuất): Khi sinh viên đặt câu hỏi, hệ thống chuyển câu hỏi đó sang dạng vector và thực hiện tìm kiếm ngữ nghĩa trên database sản phẩm và tài liệu hướng dẫn để lấy ra các thông tin thực tế liên quan nhất.
2. Augmentation (Tăng cường ngữ cảnh): Hệ thống chèn các thông tin vừa truy xuất được vào làm "nguồn tham khảo duy nhất" bên trong Prompt gửi đến AI.
3. Generation (Sinh câu trả lời): AI Gemini đóng vai trò như một người đọc hiểu tài liệu tham khảo được cung cấp, tổng hợp lại thành một câu trả lời hoàn chỉnh, mạch lạc và gửi lại cho người dùng. Cách làm này bảo đảm câu trả lời luôn chính xác 100% theo thực tế dữ liệu của hệ thống, loại bỏ hoàn toàn hiện tượng ảo tưởng thông tin.
 2.5.3. Vectra (Vector Database) và Tìm kiếm ngữ nghĩa (Semantic Search)
-Vectra là một thư viện quản lý cơ sở dữ liệu vector gọn nhẹ được lưu trữ trực tiếp trên local server dưới dạng file chỉ mục (Index). Đối với dự án quy mô vừa và nhỏ như sàn giao dịch sinh viên nội bộ trường DNU, Vectra là sự lựa chọn tối ưu vì nó giúp hệ thống không cần phụ thuộc vào các dịch vụ đám mây cơ sở dữ liệu vector bên thứ ba phức tạp (như Pinecone hay Milvus), giảm thiểu chi phí vận hành và dễ dàng cấu hình.
-Trong dịch vụ 
Vectra được ứng dụng để vận hành luồng Tìm kiếm ngữ nghĩa (Semantic Search) trên các file tài liệu chính sách của trường gồm `faq.md` (câu hỏi thường gặp), `guide.md` (hướng dẫn quy trình mua bán) và `policy.md` (nội quy sàn):
1.  Tiến trình Chunking và Indexing (Chạy nền):
 - Hệ thống đọc các file markdown chính sách và chia chúng thành các đoạn nhỏ (chunks) theo tiêu đề (heading `` hoặc ``).
-  Sử dụng API Gemini để chuyển từng chunk thành vector embeddings.
       Insert vector kèm theo nội dung văn bản (metadata) của chunk vào cơ sở dữ liệu Vectra thông qua lệnh `index.insertItem()`.
2.  Tiến trình Querying (Khi user nhắn tin):
  - Vector hóa câu hỏi của sinh viên.
 Sử dụng hàm `index.queryItems(vector, topK)` của Vectra để thực hiện tính toán độ tương đồng Cosine Similarity:
$$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
-Vectra tính toán góc giữa vector câu hỏi ($\mathbf{A}$) và các vector tài liệu lưu trữ ($\mathbf{B}$). Kết quả trả về các chunk tài liệu có điểm số tương đồng (score) cao nhất (hệ thống đặt ngưỡng lọc lớn hơn 0.3 để loại bỏ các thông tin không liên quan). Dữ liệu này được đưa vào promt làm ngữ cảnh.
2.6. Các công cụ và dịch vụ hỗ trợ khác
2.6.1. Cloudinary: Giải pháp quản lý và tối ưu hóa hình ảnh đám mây
-Trong các ứng dụng thương mại điện tử, tài nguyên hình ảnh sản phẩm là vô cùng lớn (mỗi bài đăng của sinh viên cho phép upload tối đa 10 ảnh). Việc lưu trữ ảnh trực tiếp trên ổ cứng cục bộ của server backend gặp nhiều rủi ro: tốn băng thông đường truyền của server, nhanh đầy dung lượng ổ cứng và làm chậm tốc độ tải trang của người dùng do ảnh gốc thường có dung lượng lớn (3MB - 10MB).
-DNU Marketplace sử dụng Cloudinary – dịch vụ lưu trữ hình ảnh đám mây chuyên nghiệp. Quy trình xử lý ảnh diễn ra như sau:
1.  Sinh viên upload ảnh sản phẩm từ ứng dụng React.
2.  Backend ExpressJS sử dụng middleware `Multer` để tiếp nhận file ảnh tạm thời, sau đó gọi hàm upload của thư viện Cloudinary 
3.  Cloudinary tiếp nhận ảnh, thực hiện các thuật toán tối ưu hóa tự động (nén dung lượng, đổi định dạng ảnh sang định dạng WebP gọn nhẹ mà không làm giảm chất lượng hiển thị) và trả về một liên kết URL an toàn (HTTPS). URL này sau đó được lưu vào MongoDB.
 2.6.2. Nodemailer: Dịch vụ gửi email xác thực và phục hồi tài khoản
-Nodemailer là một module cực kỳ phổ biến trong Node.js giúp đơn giản hóa việc gửi thư điện tử từ máy chủ thông qua giao thức SMTP (Simple Mail Transfer Protocol).
-Trong ứng dụng DNU Marketplace, việc bảo đảm cộng đồng khép kín yêu cầu người dùng phải xác minh hòm thư email của trường. Nodemailer được cấu hình kết nối trực tiếp với Gmail SMTP Server thông qua tài khoản email hệ thống được bảo mật bằng mật khẩu ứng dụng (App Password). Hệ thống tự động gửi thư trong hai trường hợp:
 - Xác thực đăng ký tài khoản: Gửi một mã xác nhận OTP hoặc link token kích hoạt tài khoản có thời hạn 10 phút. Chỉ khi người dùng bấm vào link xác thực, trường `isVerified` trong MongoDB mới chuyển sang `true` để cho phép truy cập sàn.
 - Khôi phục mật khẩu: Khi sinh viên quên mật khẩu, hệ thống gửi một email chứa mã token đặt lại mật khẩu tạm thời có thời hạn sử dụng trong vòng 10 phút để đảm bảo an toàn tuyệt đối, tránh việc bị kẻ xấu hack tài khoản.
 2.6.3. Node-cron: Lập lịch chạy các tác vụ nền tự động (Cron Jobs)
-Trong vận hành thương mại điện tử, có rất nhiều nghiệp vụ cần được xử lý tự động theo thời gian mà không cần con người can thiệp. Node-cron là một thư viện cho phép thiết lập các tiến trình chạy ngầm (Cron Jobs) trong ứng dụng Node.js bằng cách sử dụng các biểu thức định thì chuẩn của hệ điều hành Linux (Cron Syntax gồm 5 trường: phút, giờ, ngày trong tháng, tháng, ngày trong tuần).
























CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
3.1. Phân tích yêu cầu hệ thống
Hệ thống DNU Marketplace là một nền tảng chuyên biệt phục vụ các giao dịch thương mại điện tử C2C trong khuôn viên trường học Đại học Đại Nam. Nhằm bảo đảm tính khả thi trong phát triển và tính hoàn thiện khi vận hành, toàn bộ các yêu cầu của hệ thống được bóc tách và phân tích sâu sắc dưới hai khía cạnh: Yêu cầu chức năng (các nghiệp vụ hệ thống bắt buộc phải xử lý) và Yêu cầu phi chức năng (các chỉ số kỹ thuật về bảo mật, hiệu năng và độ ổn định).
3.1.1. Phân tích chi tiết các Yêu cầu chức năng (Functional Requirements)
- Hệ thống cung cấp một tập hợp các tính năng hoàn chỉnh từ khâu đăng ký tài khoản học đường, quản lý bài đăng, tương tác thương thảo, thanh toán an toàn bằng QR động đến hỗ trợ khách hàng tự động bằng AI. Chi tiết từng yêu cầu chức năng được đặc tả nghiệp vụ sâu như sau:
1. Yêu cầu chức năng RQ-01: Đăng ký, Xác thực và Quản lý Người dùng
- Mục tiêu nghiệp vụ: Đảm bảo toàn bộ thành viên tham gia hệ thống đều là sinh viên hoặc giảng viên trực thuộc Đại học Đại Nam, ngăn chặn tối đa người ngoài trường xâm nhập phục vụ ý đồ lừa đảo.
Luồng xử lý dữ liệu:
- Đăng ký: Người dùng cung cấp Họ tên, Mã số sinh viên (MSSV), Mật khẩu và Email. Hệ thống kiểm tra bằng biểu thức chính quy (Regex) để bắt buộc email có đuôi tên miền `@dnu.edu.vn`. Nếu hợp lệ, hệ thống tạo bản ghi tạm thời trong collection `PendingRegistration` và tạo mã OTP ngẫu nhiên gồm 6 chữ số gửi qua dịch vụ Nodemailer. Mã OTP này có thời hạn hết hạn (TTL) là 10 phút.
- Xác thực kích hoạt: Sinh viên nhập mã OTP nhận được trong email. Hệ thống đối soát, nếu khớp, thông tin sinh viên được chuyển sang collection chính `Users` với trường `isVerified: true`, đồng thời xóa bản ghi tạm để giải phóng bộ nhớ.
 - Đăng nhập & Phiên làm việc: Sinh viên đăng nhập bằng email và mật khẩu. Máy chủ sử dụng `bcryptjs` để kiểm tra độ khớp của mật khẩu đã băm. Nếu đúng, hệ thống sinh ra một mã thông báo `JWT` chứa thông tin định danh và quyền hạn (Role), gửi về client để lưu vào `localStorage`.
 - Khôi phục mật khẩu: Khi quên mật khẩu, người dùng nhập email trường. Hệ thống sinh mã Token đặt lại mật khẩu tạm gửi qua email với thời hạn 10 phút, lưu tại collection `PendingPasswordReset`.

 2. Yêu cầu chức năng RQ-02: Quản lý bài đăng bán sản phẩm (Pass đồ cũ)
-Mục tiêu nghiệp vụ: Cho phép người bán đăng tải đầy đủ, trực quan thông tin sản phẩm cần thanh lý để người mua dễ dàng tiếp cận và đánh giá chất lượng.
-Luồng xử lý dữ liệu:
+ Khởi tạo tin đăng: Người bán điền Tiêu đề, Mô tả chi tiết sản phẩm, chọn Danh mục (ví dụ: Sách học, Thiết bị điện tử, Đồ gia dụng phòng trọ, Thời trang, Khác), Tình trạng sản phẩm (Mới 99%, Tốt, Khá, Cũ), Giá bán mong muốn (phải là số nguyên dương lớn hơn 0) và chọn Khu vực giao dịch trong trường (Ký túc xá, Giảng đường A, Giảng đường B, Giảng đường C, Khu căn tin).
+ Xử lý hình ảnh: Người bán được tải lên tối đa 10 ảnh thực tế của sản phẩm. Phía frontend chuyển tiếp tệp tin qua API sử dụng thư viện `Multer` ở Backend. Backend tải tệp ảnh lên dịch vụ Cloudinary để tối ưu dung lượng và định dạng, sau đó nhận về danh sách các đường link HTTPS để lưu vào trường `images` trong collection `Products`.
+ Kiểm duyệt tự động & Phê duyệt: Trước khi lưu vào DB, nội dung chữ (tiêu đề, mô tả) đi qua bộ lọc kiểm duyệt từ ngữ nhạy cảm (Content Moderation). Trạng thái mặc định của sản phẩm sau khi đăng là Chờ duyệt (`isApproved: false`). Chỉ khi Admin phê duyệt trên trang quản trị, sản phẩm mới hiển thị công khai trên giao diện trang chủ.
+ Cập nhật trạng thái sản phẩm: Người bán có quyền chỉnh sửa thông tin, xóa sản phẩm (hệ thống thực hiện cập nhật `status: 'deleted'`) hoặc đánh dấu sản phẩm đã bán (`status: 'sold'`).
3. Yêu cầu chức năng RQ-03: Tìm kiếm nâng cao, Lọc và Gợi ý sản phẩm
-Mục tiêu nghiệp vụ: Hỗ trợ người mua nhanh chóng tìm kiếm được món đồ cần thiết trong hàng ngàn bài đăng trên sàn, cá nhân hóa trải nghiệm hiển thị.
-Luồng xử lý dữ liệu:
+Tìm kiếm từ khóa (Search Autocomplete): Sử dụng truy vấn Regex của MongoDB kết hợp chỉ mục văn bản (Text Index) trên trường `title` và `description` để trả về kết quả gợi ý ngay khi người dùng đang gõ từ khóa trên ô tìm kiếm. Hệ thống lưu lại lịch sử tìm kiếm vào collection `SearchHistory`.
- Bộ lọc đa tiêu chí: Người dùng có thể lọc danh sách sản phẩm theo Danh mục (`category`), khoảng giá (`minPrice` - `maxPrice`), tình trạng (`condition`), khu vực giao dịch (`location`) và sắp xếp theo thứ tự giá tăng dần, giá giảm dần hoặc sản phẩm mới nhất.
- Gợi ý thông minh (Recommendations): Dựa trên hành vi xem sản phẩm của người dùng lưu tại collection `ProductView`, hệ thống tính toán danh mục và từ khóa được người dùng quan tâm nhiều nhất trong 7 ngày gần nhất để tự động hiển thị mục "Sản phẩm gợi ý cho bạn" ở trang chủ. Đồng thời, API cung cấp danh sách sản phẩm tương tự (Similar Products) dựa trên cùng danh mục và tầm giá khi người dùng đang xem một sản phẩm cụ thể.
4. Yêu cầu chức năng RQ-04: Chat trực tiếp thời gian thực giữa hai bên giao dịch
- Mục tiêu nghiệp vụ: Tạo kênh giao tiếp an toàn, tức thời để hai sinh viên trực tiếp thương thảo chất lượng sản phẩm và hẹn lịch gặp trực tiếp mà không cần để lộ thông tin liên lạc cá nhân.
 - Luồng xử lý dữ liệu:
 + Khởi tạo cuộc hội thoại: Khi người mua nhấn "Chat với người bán", hệ thống kiểm tra sự tồn tại của phòng chat trong collection `Conversations` giữa 2 ID người dùng. Nếu chưa có, hệ thống tạo mới.
+ Truyền nhận tin nhắn: Khi một bên gửi tin nhắn, frontend phát sự kiện `send-message` kèm theo dữ liệu payload { conversationId, senderId, receiverId, content } qua Socket.IO Client. Máy chủ bắt sự kiện, ghi nhận tin nhắn vào collection `Messages` với trạng thái `isRead: false`. Sau đó, server định vị kết nối socket của người nhận và phát sự kiện `receive-message` tương ứng.
+ Trạng thái hoạt động (Online/Offline State): Socket.IO tự động cập nhật chấm xanh trực tuyến của người dùng. Khi kết nối socket bị ngắt (disconnect), máy chủ cập nhật trường `isOnline: false` và lưu `lastSeen: Date.now()`.
+ Hiệu ứng gõ phím (Typing Indicator): Phát sự kiện `typing` khi người dùng đang nhập văn bản và `stop-typing` khi ngừng nhập, hiển thị hiệu ứng ba chấm động trên màn hình đối phương.
 5. Yêu cầu chức năng RQ-05: Quản lý đơn hàng (Nghiệp vụ Mua ngay - Buy Now)
- Mục tiêu nghiệp vụ: Mô hình hóa quy trình giao dịch thành các trạng thái rõ ràng, ràng buộc trách nhiệm của cả người mua và người bán.
- Luồng xử lý dữ liệu:
+ Khởi tạo đơn hàng: Người mua nhấn "Mua ngay", điền địa chỉ giao hàng và số điện thoại nhận hàng. Hệ thống tạo một bản ghi trong collection `Orders` có trạng thái ban đầu là Chờ xác nhận (`status: 'pending'`). Đồng thời, hệ thống thiết lập một thuộc tính `expiresAt` có giá trị bằng thời gian hiện tại cộng thêm 24 giờ.
+ Xác nhận phía Người bán: Người bán nhận được thông báo đơn hàng mới. Người bán có quyền bấm "Đồng ý" (trạng thái đơn chuyển sang `confirmed` - Đã xác nhận) hoặc "Từ chối" (trạng thái đơn chuyển sang `cancelled` - Đã hủy). Nếu quá 24h người bán không thao tác, Cron Job tự động quét và hủy đơn hàng này.
+ Hoàn thành đơn hàng: Đơn hàng chuyển sang trạng thái Hoàn thành (`completed`) sau khi thanh toán được duyệt và người mua xác nhận đã nhận đủ hàng.
 6. Yêu cầu chức năng RQ-06: Thương lượng và trả giá tự động (Offer)
Mục tiêu nghiệp vụ: Cho phép người mua đưa ra mức giá đề xuất thấp hơn giá niêm yết và người bán phản hồi mức giá đó một cách tự động, minh bạch.
Luồng xử lý dữ liệu:
-	Gửi đề nghị (Offer): Người mua gửi mức giá đề xuất `offerPrice`. Hệ thống tạo bản ghi trong collection `Offers` ở trạng thái chờ (`pending`).
-	Phản hồi đề nghị: Người bán nhận được đề nghị. Họ có 3 lựa chọn phản hồi:
1. Chấp nhận (Accept): Đề nghị chuyển sang trạng thái `accepted`. Hệ thống tự động tạo một Đơn hàng (`Order`) mới với giá của đơn hàng bằng đúng giá đề nghị `offerPrice`.
2. Từ chối (Reject): Đề nghị chuyển sang trạng thái `rejected`.
3. Đề nghị giá mới (Counter-offer): Người bán phản hồi mức giá mong muốn khác `counterOfferPrice`. Trạng thái chuyển sang `countered`, quyền quyết định lúc này thuộc về người mua.
- Hết hạn đề nghị: Đề nghị trả giá quá 7 ngày không được xử lý sẽ tự động hết hạn (`status: 'expired'`) thông qua Cron Job chạy nền định kỳ mỗi ngày.
7. Yêu cầu chức năng RQ-07: Thanh toán bằng mã QR ngân hàng động và tải ảnh biên lai
-Mục tiêu nghiệp vụ: Cung cấp phương thức thanh toán không tiền mặt an toàn, thuận tiện, đồng thời bảo vệ người bán khỏi rủi ro lừa đảo chuyển khoản giả.
-Luồng xử lý dữ liệu:
+ Sinh mã QR động: Khi người mua nhấn nút "Thanh toán" cho đơn hàng đã xác nhận, Backend tự động gọi helper sinh mã giao dịch duy nhất gồm chuỗi ký tự viết hoa không dấu (ví dụ: `DNUMP5A8B9C`). Hệ thống kết hợp thông tin cấu hình tài khoản ngân hàng của trường (lưu tại collection `BankQR` đang kích hoạt) và thông số `finalPrice` để tạo ra chuỗi VietQR chuẩn. Chuỗi này được biểu diễn dưới dạng ảnh QR Code hiển thị trên frontend. Nội dung chuyển khoản bắt buộc phải trùng khớp với mã giao dịch tự sinh.
+ Tải ảnh biên lai (Payment Proof): Người mua thực hiện chuyển tiền bằng app ngân hàng của mình, chụp màn hình biên lai thành công và tải ảnh lên hệ thống. Ảnh biên lai được chuyển lên Cloudinary, và URL được cập nhật vào trường `paymentProof` của collection `Payments` cùng trạng thái thanh toán chuyển sang chờ duyệt (`status: 'pending'`). Người mua có tối đa 24 giờ để hoàn thành bước này kể từ lúc tạo yêu cầu thanh toán, nếu không hệ thống sẽ tự động hủy đơn.
 8. Yêu cầu chức năng RQ-08: Trợ lý ảo AI Chatbot hỗ trợ người dùng (Gemini AI + RAG)
- Mục tiêu nghiệp vụ: Giải đáp tức thời mọi thắc mắc của sinh viên về quy chế sử dụng sàn, xử lý sự cố thanh toán và tìm kiếm sản phẩm thông minh thông qua hội thoại ngôn ngữ tự nhiên.
- Luồng xử lý dữ liệu:
+ Nhận câu hỏi: Sinh viên gửi tin nhắn hỏi chatbot. API controller tiếp nhận câu hỏi.
+ Truy xuất tài liệu chính sách (Knowledge RAG): Hệ thống vector hóa câu hỏi của sinh viên và thực hiện truy vấn Cosine Similarity trên Vector Database Vectra cục bộ (đã nạp sẵn tri thức từ các file `faq.md`, `guide.md`, `policy.md`). Các chunk tài liệu có score tương đồng lớn hơn 0.3 được lấy ra làm ngữ cảnh (Context 1).
+ Truy xuất sản phẩm thực tế (Database RAG): Hệ thống bóc tách từ khóa trong câu hỏi để thực hiện query danh sách sản phẩm liên quan trong collection `Products` (chỉ lấy các sản phẩm đang có trạng thái `available` và đã duyệt). Dữ liệu này được định dạng thành văn bản danh sách sản phẩm (Context 2).
+ Tạo câu trả lời: Hệ thống ghép Context 1 và Context 2 vào System Prompt hướng dẫn nghiệp vụ, kết hợp lịch sử trò chuyện lưu tại collection `ChatHistory`, sau đó gửi toàn bộ khối prompt cho mô hình `gemini-2.5-flash` để sinh câu trả lời tiếng Việt chính xác và hiển thị cho người dùng.
9. Yêu cầu chức năng RQ-09: Tính năng tương tác Mạng xã hội học đường
- Mục tiêu nghiệp vụ: Gia tăng tính kết nối, biến sàn thương mại trở thành một không gian số năng động, thân thiện và tăng thời gian giữ chân người dùng trên app.
- Luồng xử lý dữ liệu:
+ Bảng tin (Feed) và Bài viết (Posts): Sinh viên có thể tạo các bài đăng chia sẻ kinh nghiệm học tập, review giảng viên hoặc pass đồ dùng theo dạng bài viết ngắn kèm hình ảnh, gắn các thẻ hashtag (ví dụ: passsach, dnu_k16). Các bài viết được lưu trữ tại collection `Posts`. Người dùng khác có thể bình luận công khai (`Comments`).
+ Bộ sưu tập (Collections): Người dùng có thể nhóm các sản phẩm yêu thích thành các bộ sưu tập cá nhân (ví dụ: "Đồ dùng cần mua cho kỳ mới", "Sách ôn thi tốt nghiệp") để lưu trữ và chia sẻ cho bạn bè.
+ Theo dõi (Follow/Unfollow): Sinh viên có thể theo dõi nhau. Khi người dùng đăng sản phẩm mới, hệ thống tự động gửi thông báo real-time tới tất cả những người đang theo dõi họ.
 10. Yêu cầu chức năng RQ-10: Dashboard và quản lý thanh toán dành cho Admin
- Mục tiêu nghiệp vụ: Cung cấp công cụ quản lý tài chính tập trung, đối soát dòng tiền giao dịch để bảo vệ quyền lợi của sinh viên.
- Luồng xử lý dữ liệu:
+ Hiển thị danh sách chờ duyệt: Hệ thống lọc ra tất cả các bản ghi trong collection `Payments` có trạng thái `status: 'pending'` hiển thị lên trang quản trị của Admin dưới dạng bảng danh sách kèm hình ảnh biên lai giao dịch.
+ Đối soát và Phê duyệt: Admin kiểm tra tài khoản ngân hàng thực tế của sàn xem số tiền tương ứng với mã giao dịch đã được ghi nhận hay chưa.
+ Nếu đúng, Admin nhấn "Duyệt". Hệ thống cập nhật trạng thái Payment thành `confirmed`, đơn hàng chuyển sang `completed`, đồng thời gửi thông báo real-time cho cả người mua và người bán.
+ Nếu phát hiện biên lai giả mạo hoặc sai thông tin, Admin nhấn "Từ chối", nhập lý do từ chối. Hệ thống chuyển trạng thái Payment thành `rejected` và gửi thông báo yêu cầu người mua tải lại biên lai hợp lệ.
+ Dashboard thống kê: Cung cấp các biểu đồ trực quan về tổng doanh thu giao dịch, số lượng đơn hàng thành công, số lượng tài khoản mới tạo và biểu đồ xu hướng danh mục sản phẩm được quan tâm nhiều nhất.
11. Yêu cầu chức năng RQ-11: Phê duyệt bài đăng và Xử lý báo cáo vi phạm (Admin)
- Mục tiêu nghiệp vụ: Duy trì môi trường thương mại lành mạnh, văn minh, loại bỏ các mặt hàng cấm hoặc hành vi quấy rối.
- Luồng xử lý dữ liệu:
+ Duyệt tin đăng bán: Admin xem danh sách các sản phẩm đang có trạng thái `isApproved: false`. Admin có quyền phê duyệt (`isApproved: true`) để cho phép hiển thị sản phẩm lên sàn hoặc từ chối duyệt (nhập lý do và gửi email thông báo cho người bán).
+ Xử lý báo cáo (Reports): Khi sinh viên nhấn "Báo cáo" một bài đăng vi phạm (với các lý do: Giá ảo, Hàng giả, Lừa đảo, Nội dung phản cảm), hệ thống thêm bản ghi vào mảng `reports` của sản phẩm đó. Khi số lượng báo cáo vượt quá 3 hoặc khi Admin duyệt danh sách báo cáo, Admin có quyền khóa bài đăng (`status: 'deleted'`) hoặc khóa tài khoản của người dùng vi phạm quy chế.
12. Yêu cầu chức năng RQ-12: Cấu hình tài khoản ngân hàng nhận tiền (Super Admin)
-Mục tiêu nghiệp vụ: Cho phép người chịu trách nhiệm cao nhất cấu hình linh hoạt thông tin tài khoản nhận tiền chuyển khoản của sàn mà không cần thay đổi mã nguồn hệ thống.
-Luồng xử lý dữ liệu:
+Super Admin truy cập giao diện cấu hình đặc quyền.
+ Thực hiện các thao tác CRUD (Tạo mới, Đọc, Cập nhật, Xóa) thông tin tài khoản ngân hàng tại collection `BankQR` bao gồm: Tên ngân hàng, Số tài khoản, Tên chủ tài khoản, Ảnh logo ngân hàng và trạng thái kích hoạt (`isActive`).
+ Chỉ các tài khoản ngân hàng có trường `isActive: true` mới được hệ thống lựa chọn để tự động tính toán mã QR động hiển thị cho người mua.
3.1.2. Phân tích chi tiết các Yêu cầu phi chức năng (Non-functional Requirements)
Để đảm bảo phần mềm hoạt động trơn tru trong thực tế giảng đường và mang lại sự tin cậy cao, hệ thống DNU Marketplace bắt buộc phải đáp ứng 5 tiêu chuẩn phi chức năng dưới đây:
1. Hiệu năng hệ thống (Performance)
-Thời gian phản hồi (Response Time): Thời gian phản hồi trung bình đối với các API thông thường (như lấy danh sách sản phẩm, hồ sơ cá nhân) phải dưới 1.0 giây dưới điều kiện mạng bình thường. Đối với các API phức tạp hơn như gọi chatbot AI kết hợp RAG, thời gian phản hồi tối đa không được vượt quá 3.5 giây.
 - Xử lý đồng thời (Concurrency): Hệ thống được thiết kế để chịu tải tối thiểu 500 người dùng hoạt động đồng thời (Active Users) tại cùng một thời điểm mà không xảy ra hiện tượng mất kết nối hoặc tràn bộ nhớ máy chủ.
 - Tối ưu hóa Database: Áp dụng cơ chế đánh chỉ mục (Index) trong MongoDB cho các trường thường xuyên được sử dụng để truy vấn và tìm kiếm:
+ Index đơn: `email` trên collection `Users`, `status` trên collection `Products`.
+ Index kết hợp (Compound Index): `buyerId` + `status` trên collection `Orders`.
+ Index văn bản (Text Index): `title` + `description` trên collection `Products` phục vụ tính năng tìm kiếm nhanh.
 2. An toàn và Bảo mật thông tin 
- Mã hóa dữ liệu mật khẩu: Mật khẩu của người dùng bắt buộc phải được mã hóa trước khi ghi vào cơ sở dữ liệu bằng thư viện `bcryptjs` với độ muối (salt rounds) là 10. Hệ thống tuyệt đối không lưu mật khẩu dưới dạng văn bản thô (plain text).
-Xác thực không trạng thái qua JWT: Sử dụng khóa bí mật độ dài tối thiểu 256-bit (`JWT_SECRET`) lưu trữ tại biến môi trường hệ thống để ký và tạo ra các Token JWT. Token có thời hạn sử dụng là 7 ngày. Middleware backend phải xác thực kỹ chữ ký của token trên mỗi request API gửi lên.
- Kiểm tra và chuẩn hóa dữ liệu (Input Validation): Áp dụng thư viện `express-validator` tại tầng định tuyến Express để lọc sạch dữ liệu đầu vào. Ngăn chặn triệt để các lỗ hổng bảo mật phổ biến như SQL Injection, NoSQL Injection, và XSS (Cross-Site Scripting) bằng cách khử độc (sanitize) các ký tự đặc biệt trong input.
  - Bảo vệ HTTP Headers: Tích hợp middleware `Helmet.js` để tự động thiết lập các HTTP headers bảo mật (như Content Security Policy, X-Frame-Options) bảo vệ trang web khỏi các cuộc tấn công Clickjacking.
 -  Phân quyền chặt chẽ: Phân quyền API theo vai trò (Role-based Access Control). Các API nhạy cảm liên quan đến tài chính (duyệt thanh toán) hay cấu hình tài khoản (Bank QR) phải được chặn bởi middleware kiểm tra quyền Admin/Super Admin.
3. Tính khả dụng và Trải nghiệm Người dùng (Usability & UX)
- Tương thích mọi thiết bị (Responsive Design): Do sinh viên chủ yếu sử dụng điện thoại thông minh khi đang ở trên giảng đường hoặc căng tin, toàn bộ giao diện của ứng dụng được thiết kế tối ưu hóa theo triết lý "Mobile-First" sử dụng hệ lưới (Grid) và Flexbox của Tailwind CSS. Layout tự động co giãn mượt mà từ màn hình điện thoại (320px) đến màn hình máy tính cỡ lớn (1920px).
- Tốc độ hiển thị ban đầu: Trình đóng gói Vite được tối ưu cấu hình để chia nhỏ gói mã nguồn (code-splitting). Kết hợp cùng tính năng nén và chuyển đổi định dạng tự động của Cloudinary sang WebP giúp giảm thiểu dung lượng trang web tải xuống ban đầu, tăng tốc độ hiển thị giao diện dưới 2 giây.
- Phản hồi giao diện trực quan: Tích hợp hệ thống thông báo Toast (Toast Notifications) thời gian thực để đưa ra phản hồi tức thì cho mỗi hành động của người dùng (ví dụ: báo lỗi khi nhập sai mật khẩu, báo xanh lá khi đăng sản phẩm thành công). Các nút bấm gửi dữ liệu phải có trạng thái loading (spinners) để tránh việc người dùng bấm gửi nhiều lần gây trùng lặp bản ghi.
4. Tính tin cậy và Khả năng chịu lỗi (Reliability & Fault Tolerance)
- Tự động phục hồi kết nối WebSockets: Socket.IO Client được cấu hình cơ chế tự động kết nối lại (Auto-reconnection) với khoảng thời gian chờ tăng dần nếu kết nối internet của sinh viên bị gián đoạn. Trong suốt thời gian mất mạng, các sự kiện chat sẽ được xếp hàng chờ tạm thời ở client và tự động gửi bù khi kết nối được khôi phục.
-Xử lý ngoại lệ tập trung (Centralized Error Handling): Backend xây dựng middleware xử lý lỗi tập trung `errorHandler.js`. Mọi lỗi phát sinh trong quá trình chạy runtime (như mất kết nối DB, lỗi gọi API Gemini bị quá giới hạn quota) đều được bắt lại (catch), ghi nhật ký lỗi (logs) nội bộ và trả về cho client một thông báo lỗi chuẩn hóa có cấu trúc JSON rõ ràng thay vì làm crash máy chủ.
 - Sao lưu dữ liệu: Cơ sở dữ liệu MongoDB được thiết lập cơ chế tự động sao lưu định kỳ hàng ngày để phòng ngừa rủi ro mất mát dữ liệu do sự cố phần cứng.
5. Khả năng bảo trì và Phát triển mở rộng (Maintainability & Scalability)
- Cấu trúc thư mục mô-đun hóa: Mã nguồn dự án được tổ chức tách biệt rõ ràng theo mô hình MVC (Model-View-Controller) cho Backend Việc chia nhỏ mã nguồn giúp các nhà phát triển sau dễ dàng tiếp cận, bảo trì hoặc bổ sung các module chức năng mới (như thêm cổng thanh toán tự động) mà không ảnh hưởng đến các thành phần cũ.
- Tài liệu hóa hệ thống API: Toàn bộ các endpoints API của hệ thống được đặt tên chuẩn RESTful và ghi tài liệu chi tiết (đầu vào, đầu ra, mã lỗi trả về), giúp cho việc phát triển các phiên bản Mobile App sau này sử dụng chung hệ Backend trở nên cực kỳ dễ dàng.
 3.2. Thiết kế Use Case và Phân rã chức năng (UML Use Case Modeling)
- Thiết kế Use Case đóng vai trò then chốt trong giai đoạn phân tích hệ thống nhằm xác định rõ ranh giới giữa người dùng và phần mềm, chỉ ra các hành động mà hệ thống phải hỗ trợ cho từng đối tượng tác nhân (Actors). Trong hệ thống DNU Marketplace, các tác nhân chính bao gồm:
   - Sinh viên (Người dùng thông thường): Đóng vai trò kép vừa là Người mua (Buyer) vừa là Người bán (Seller), có quyền tham gia mạng xã hội học đường và giao tiếp với trợ lý ảo AI.
-	Quản trị viên (Admin): Cán bộ hoặc sinh viên đại diện ban quản lý sàn, có trách nhiệm phê duyệt nội dung tin bài, giải quyết tranh chấp và đối soát thanh toán.
-	Quản trị viên cấp cao (Super Admin): Có đặc quyền cao nhất, quản lý cấu hình hệ thống ngân hàng nhận tiền và cấp quyền quản trị.
 3.2.1. Sơ đồ Use Case tổng quát hệ thống (General UML Use Case Diagram)
Sơ đồ Use Case tổng quát mô tả các tương tác vĩ mô giữa ba tác nhân chính và các phân hệ chức năng trong hệ sinh thái DNU Marketplace.

Hình 3.1: Sơ đồ Use Case tổng quát hệ thống DNU Marketplace
Nội dung chi tiết Hình 3.1 Biểu đồ UML Use Case tổng quát chỉ rõ Sinh viên tương tác với 8 use case cốt lõi để mua bán và tương tác mạng xã hội. Admin tương tác trực tiếp với các use case kiểm duyệt chất lượng bài đăng, quản lý biên lai và báo cáo vi phạm. Super Admin kế thừa toàn bộ quyền hạn của Admin và có thêm Use Case đặc quyền UC-12 để cấu hình cổng ngân hàng.
3.2.2. Sơ đồ Use Case phân rã chức năng Giao dịch và Thanh toán (Transaction & Payment Decomposition)
Phân hệ Giao dịch và Thanh toán là nghiệp vụ phức tạp nhất, đòi hỏi sự phối hợp chặt chẽ giữa hai sinh viên (Mua và Bán) cùng sự kiểm duyệt của Admin để đảm bảo an toàn tài chính. Sơ đồ Hình 3.2 mô tả chi tiết các Use Case thành phần và mối quan hệ kế thừa, bao hàm (include), mở rộng (extend).
Hình 3.2: Sơ đồ Use Case phân rã chức năng Giao dịch và Thanh toán QR
- Nội dung chi tiết Hình 3.2: Sơ đồ phân rã chỉ ra rằng Use Case `Tải ảnh biên lai` (UC-05.4) đóng vai trò là một nhánh mở rộng (extend) của Use Case `Tạo mã QR` (UC-05.3). Ngược lại, Use Case `Kiểm duyệt & Đối soát tiền` (UC-05.5) của Admin bắt buộc phải bao hàm (include) việc sinh viên đã tải lên ảnh biên lai thành công làm chứng cứ đối soát.
 3.2.3. Sơ đồ Use Case phân rã chức năng Trợ lý ảo AI Chatbot RAG (AI Chatbot Decomposition)
- Phân hệ Trợ lý ảo AI Chatbot cho thấy cách thức hệ thống kết nối câu hỏi sinh viên với kho tài liệu chỉ mục vector (Vectra) và cơ sở dữ liệu sản phẩm trong MongoDB.

Hình 3.3: Sơ đồ Use Case phân rã chức năng Trợ lý ảo AI Chatbot RAG
- Nội dung chi tiết Hình 3.3 Sơ đồ chỉ rõ để hoàn tất việc hỗ trợ người dùng (`Tương tác Trợ lý AI`), hệ thống bắt buộc phải thực thi đồng thời hai luồng truy xuất ngầm: truy xuất chính sách trên file vector (UC-08.2) và truy xuất thông tin sản phẩm thật trong cơ sở dữ liệu (UC-08.3) để làm đầu vào cho mô hình Gemini sinh văn bản (UC-08.4).
 3.2.4. Đặc tả chi tiết các Use Case cốt lõi
Dưới đây là các bảng đặc tả chi tiết các trường hợp sử dụng (Use Cases) cốt lõi của hệ thống DNU Marketplace theo đúng chuẩn tài liệu phân tích thiết kế phần mềm UML:
Thuộc tính đặc tả	Mô tả chi tiết
Mã Use Case	UC-01
Tên Use Case	Đăng ký và Xác thực tài khoản học đường
Tác nhân	Sinh viên
Mục đích	Tạo tài khoản an toàn sử dụng email định danh @dnu.edu.vn để tham gia sàn.
Tiền điều kiện	Sinh viên chưa có tài khoản trên hệ thống DNU Marketplace.
Luồng sự kiện chính	1. Sinh viên nhấn nút “Đăng ký” tại màn hình đăng nhập.
2. Hệ thống hiển thị biểu mẫu yêu cầu nhập: Họ tên, Mã số sinh viên (MSSV), Mật khẩu và Email trường.
3. Sinh viên điền đầy đủ thông tin và nhấn “Gửi yêu cầu”.4. Hệ thống kiểm tra tính hợp lệ của email (đuôi @dnu.edu.vn) và định dạng MSSV.5. Hệ thống sinh mã OTP ngẫu nhiên gồm 6 chữ số, lưu vào PendingRegistration (hết hạn sau 10 phút), đồng thời gửi email qua Nodemailer.6. Hệ thống hiển thị màn hình nhập mã xác thực OTP.7. Sinh viên nhập mã OTP nhận được trong email và nhấn “Xác minh”.8. Hệ thống đối soát mã OTP. Nếu chính xác, hệ thống chuyển thông tin sang collection Users với trạng thái isVerified: true và thông báo đăng ký thành công.
Luồng rẽ nhánh	Tại bước 4: Nếu email sai định dạng học đường, hệ thống báo lỗi đỏ: “Email phải có đuôi @dnu.edu.vn” và dừng tiến trình.Tại bước 8: Nếu mã OTP nhập sai hoặc đã quá 10 phút hết hạn, hệ thống hiển thị thông báo lỗi: “Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng bấm gửi lại mã”.
Hậu điều kiện	Tài khoản sinh viên được kích hoạt thành công, có thể dùng đăng nhập để sử dụng mọi chức năng của sàn.
Bảng 3.1: Đặc tả chi tiết Use Case UC-01 "Đăng ký và Xác thực tài khoản học đường"
Thuộc tính đặc tả	Mô tả chi tiết
Mã Use Case	UC-02
Tên Use Case	Đăng sản phẩm bán (Pass đồ cũ)
Tác nhân	Sinh viên (Người bán)
Mục đích	Tạo tin đăng bán đồ dùng cũ kèm theo hình ảnh thực tế lên sàn DNU Marketplace.
Tiền điều kiện	Sinh viên đã đăng nhập và tài khoản đã được xác minh (isVerified: true).
Luồng sự kiện chính	1. Người bán chọn biểu tượng nút “Đăng tin” trên giao diện.
2. Hệ thống chuyển hướng đến trang điền thông tin sản phẩm.
3. Người bán điền đầy đủ các thông tin: Tiêu đề sản phẩm, Mô tả chi tiết (độ mới, tính năng), Giá bán mong muốn (VNĐ), chọn Danh mục sản phẩm, chọn Tình trạng và chọn Khu vực giao dịch trong trường DNU.4. Người bán chọn tải lên hình ảnh thực tế (tối đa 10 ảnh) từ thiết bị.
5. Hệ thống gọi Cloudinary upload ảnh và lưu tạm thời danh sách URL ảnh.
6. Người bán kiểm tra lại thông tin và bấm nút “Đăng bài”.
7. Hệ thống chạy middleware kiểm duyệt từ ngữ, lưu thông tin sản phẩm vào MongoDB ở trạng thái chờ duyệt (isApproved: false, status: 'available').
Luồng rẽ nhánh	Tại bước 3: Nếu giá bán bỏ trống hoặc nhập số âm, hệ thống thông báo lỗi: “Giá sản phẩm phải là số nguyên dương”.
Tại bước 4: Nếu tải lên quá 10 hình ảnh hoặc kích thước file ảnh quá lớn (>5MB), hệ thống chặn lại và báo lỗi: “Hệ thống chỉ hỗ trợ tối đa 10 ảnh dung lượng nhỏ hơn 5MB”.
Bảng 3.2: Đặc tả chi tiết Use Case UC-02 "Đăng sản phẩm bán"
Thuộc tính đặc tả	Mô tả chi tiết
Mã Use Case	UC-05
Tên Use Case	Khởi tạo đơn hàng và Thanh toán QR động
Tác nhân	Sinh viên (Người mua), Sinh viên (Người bán), Quản trị viên
Mục đích	Đặt mua sản phẩm và thanh toán chuyển khoản qua mã QR động an toàn được hệ thống kiểm duyệt.
Tiền điều kiện	Người dùng đã đăng nhập, sản phẩm đang ở trạng thái đăng bán (status: 'available').
Luồng sự kiện chính	1. Người mua nhấn nút “Mua ngay” trên chi tiết sản phẩm.
2. Hệ thống hiển thị Form điền địa chỉ giao hàng và Số điện thoại.
3. Người mua điền thông tin và xác nhận. Hệ thống tạo Đơn hàng mới (status: 'pending') và gửi thông báo Socket.IO cho Người bán.
4. Người bán đồng ý bán đơn hàng. Trạng thái đơn hàng chuyển sang confirmed (Đã xác nhận).
5. Người mua nhấn “Thanh toán”. Hệ thống sinh mã giao dịch duy nhất (Transaction Code), truy xuất thông tin BankQR đang hoạt động của sàn để tạo ảnh mã QR động chứa sẵn số tài khoản, số tiền và nội dung chuyển khoản
6. Người mua quét mã QR trên ứng dụng ngân hàng, thực hiện chuyển tiền thành công, chụp ảnh màn hình biên lai và tải lên hệ thống.
7. Hệ thống cập nhật trạng thái thanh toán là chờ duyệt (status: 'pending'), gửi thông báo đến trang quản trị của Admin.
8. Quản trị viên kiểm tra tiền thực tế nhận được trong tài khoản ngân hàng và đối chiếu mã giao dịch trên biên lai. Admin bấm “Phê duyệt”.
9. Hệ thống chuyển đổi trạng thái Payment thành confirmed, đơn hàng chuyển sang completed (Hoàn thành) và gửi thông báo real-time chúc mừng cho cả hai bên.
Luồng rẽ nhánh	Tại bước 4: Nếu người bán từ chối đơn hàng hoặc quá 24 giờ không xác nhận, hệ thống tự động hủy đơn (status: 'cancelled') thông qua Cron Job.
Tại bước 8: Nếu ảnh biên lai bị mờ, không rõ thông tin chuyển khoản hoặc số tiền thực nhận chưa có trên ngân hàng, Admin bấm “Từ chối” kèm lý do. Trạng thái Payment đổi thành rejected, hệ thống gửi thông báo yêu cầu người mua tải lại ảnh biên lai hợp lệ.
Hậu điều kiện	Giao dịch mua bán hoàn tất an toàn. Tiền được chuyển từ người mua sang hệ thống tạm giữ để đối soát, trước khi chuyển giao cho người bán.
Bảng 3.3: Đặc tả chi tiết Use Case UC-05 "Khởi tạo đơn hàng và Thanh toán QR động"
Thuộc tính đặc tả	Mô tả chi tiết
Mã Use Case	UC-06
Tên Use Case	Chat trực tiếp thời gian thực
Tác nhân	Sinh viên (Người mua & Người bán)
Mục đích	Hai sinh viên trao đổi thông tin chi tiết về sản phẩm, địa điểm gặp mặt trực tiếp trong trường để giao dịch.
Tiền điều kiện	Cả hai sinh viên đã đăng nhập tài khoản.
Luồng sự kiện chính	1. Người mua bấm nút “Liên hệ người bán” trên trang chi tiết sản phẩm.
2. Hệ thống kiểm tra trong collection Conversations. Nếu chưa có cuộc trò chuyện giữa 2 người dùng này, hệ thống sẽ tự động khởi tạo bản ghi mới.
3. Hệ thống mở cửa sổ chat và hiển thị lịch sử tin nhắn cũ (nếu có).
4. Khi người dùng nhập ký tự, hệ thống phát tín hiệu typing qua Socket.IO để hiển thị dòng trạng thái “đang nhập tin nhắn...” trên màn hình đối phương.
5. Người dùng gõ tin nhắn và nhấn gửi.
6. Hệ thống lưu tin nhắn vào collection Messages ở trạng thái chưa đọc (isRead: false).
7. Socket.IO Server định vị kết nối của người nhận và đẩy tin nhắn mới về client hiển thị ngay lập tức (real-time).
Luồng rẽ nhánh	Tại bước 7: Nếu người nhận đang offline (không có kết nối socket hoạt động), hệ thống sẽ tăng chỉ số số tin nhắn chưa đọc (unread count badge) trên thanh Navbar của người nhận để họ đọc khi đăng nhập lại.
Hậu điều kiện	Tin nhắn được truyền nhận an toàn, lịch sử chat được lưu giữ đầy đủ trong DB làm cơ sở đối chiếu khi xảy ra tranh chấp giao dịch.
   Bảng 3.4: Đặc tả chi tiết Use Case UC-06 "Chat trực tiếp thời gian thực"

Thuộc tính đặc tả	Mô tả chi tiết
Mã Use Case	UC-08
Tên Use Case	Tương tác với Trợ lý AI Chatbot RAG
Tác nhân	Sinh viên
Mục đích	Sinh viên hỏi đáp tự động với AI về quy trình mua bán, chính sách bảo mật, nội quy trường học hoặc tìm sản phẩm.
Tiền điều kiện	Người dùng mở khung Chatbot hỗ trợ trên giao diện web.
Luồng sự kiện chính	1. Người dùng nhập câu hỏi vào ô chat (Ví dụ: “Làm thế nào để đăng bài bán hàng?”) và gửi đi.
2. Hệ thống đếm tần suất gửi request từ địa chỉ IP này. Nếu nhỏ hơn 20 lần/phút, hệ thống cho phép tiếp tục xử lý.
3. Hệ thống gọi API Google Gemini chuyển đổi câu hỏi thành vector embeddings (3072 chiều).
4. Hệ thống dùng thư viện Vectra để tính độ tương đồng Cosine giữa vector câu hỏi và vector của các chunk tài liệu chính sách (faq.md, guide.md, policy.md). Lọc lấy các chunk có điểm tương đồng > 0.3.5. Hệ thống gọi truy vấn MongoDB để lọc tìm danh sách sản phẩm đăng bán có từ khóa trùng với câu hỏi của người dùng.
5. Hệ thống tổng hợp các thông tin trên làm ngữ cảnh (Context), gắn vào prompt mẫu và gửi cho mô hình gemini-2.5-flash kèm theo 5 câu thoại chat gần nhất từ collection ChatHistory.
6. Mô hình AI suy luận trên ngữ cảnh và trả về câu trả lời bằng tiếng Việt thân thiện, chính xác.8. Hệ thống cập nhật câu trả lời lên giao diện khung chat của sinh viên.
Luồng rẽ nhánh	Tại bước 2: Nếu địa chỉ IP gửi vượt quá 20 request/phút, hệ thống chặn request và trả về thông báo lỗi: “Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút”.
Tại bước 4 & 5: Nếu không tìm thấy bất kỳ chunk tài liệu hay sản phẩm nào liên quan trong kho tri thức, hệ thống sử dụng prompt fallback hướng dẫn AI đưa ra câu trả lời trung thực: “Xin lỗi, tôi chưa tìm thấy thông tin này trong chính sách hệ thống. Bạn vui lòng liên hệ admin tại văn phòng trường để được hỗ trợ cụ thể”.
Hậu điều kiện	Sinh viên nhận được câu trả lời tự động hữu ích ngay lập tức mà không cần F5 trình duyệt. Lịch sử chat được lưu trữ.
Bảng 3.5: Đặc tả chi tiết Use Case UC-08 "Tương tác với Trợ lý AI Chatbot RAG"
Thuộc tính đặc tả	Mô tả chi tiết
Mã Use Case	UC-10
Tên Use Case	Kiểm duyệt thanh toán và Đối soát biên lai
Tác nhân	Quản trị viên (Admin)
Mục đích	Đối soát số dư ngân hàng với biên lai sinh viên tải lên để phê duyệt hoặc từ chối các giao dịch đơn hàng.
Tiền điều kiện	Admin đã đăng nhập tài khoản có quyền Admin/Super Admin.
Luồng sự kiện chính	1. Admin truy cập mục “Quản lý thanh toán” trên trang Admin Dashboard.
2. Hệ thống hiển thị danh sách các thanh toán có trạng thái pending (Đang chờ duyệt).
3. Admin chọn một dòng thanh toán cụ thể để xem chi tiết thông tin: Tên sinh viên mua, Mã đơn hàng, Mã giao dịch chuyển khoản, Số tiền và ảnh Biên lai chuyển khoản.
4. Admin thực hiện đối soát số tiền và mã nội dung chuyển khoản trên tài khoản ngân hàng thực tế của sàn giao dịch.
5. Nếu thông tin khớp, Admin nhấn nút “Phê duyệt giao dịch”. Hệ thống cập nhật trạng thái thanh toán thành confirmed và đơn hàng liên kết thành completed. Đồng thời tự động cập nhật số dư ví ảo của người bán và bắn thông báo chúc mừng tới hai bên.
6. Nếu thông tin sai lệch hoặc nghi ngờ biên lai giả mạo, Admin nhấn nút “Từ chối thanh toán”, nhập lý do từ chối.
7. Hệ thống cập nhật trạng thái Payment thành rejected và gửi thông báo yêu cầu người mua tải lại biên lai hợp lệ trong vòng thời gian còn lại của đơn hàng.
Luồng rẽ nhánh	Tại bước 4: Nếu số tiền trên biên lai không khớp với giá trị đơn hàng, Admin ghi nhận lý do từ chối là “Số tiền chuyển khoản không chính xác” ở bước 6.
Hậu điều kiện	Giao dịch được xác thực đúng đắn về tài chính, tiền hàng được ghi nhận tạm giữ hợp pháp trước khi giải ngân cho người bán.
Bảng 3.6: Đặc tả chi tiết Use Case UC-10 "Kiểm duyệt thanh toán và Đối soát biên lai (Admin)"

3.3. Thiết kế Quy trình nghiệp vụ (UML Activity & Sequence Diagrams)
- Các biểu đồ quy trình nghiệp vụ cung cấp góc nhìn động về hệ thống, làm rõ cách thức các luồng dữ liệu di chuyển qua các thành phần của phần mềm theo thời gian và các điều kiện logic cụ thể.
 3.3.1. Quy trình Mua hàng và Thanh toán QR ngân hàng
- Nghiệp vụ này liên kết Người mua, Người bán, Hệ thống máy chủ (Backend), và Quản trị viên đối soát (Admin).
- Biểu đồ hoạt động (UML Activity Diagram)
- Biểu đồ hoạt động (Hình 3.4) mô tả trình tự các bước thực hiện của các tác nhân và hệ thống, chỉ rõ các nhánh rẽ điều kiện kiểm duyệt và hủy đơn.
Hình 3.4: Sơ đồ hoạt động (Activity Diagram) Quy trình Mua hàng và Thanh toán QR
Nội dung chi tiết Hình 3.4: Sơ đồ hoạt động phân tích hai giai đoạn kiểm duyệt độc lập: (1) Kiểm duyệt giao dịch từ phía người bán, nếu người bán không chấp nhận trong 24 giờ thì đơn hàng lập tức bị hủy để giải phóng sản phẩm. (2) Kiểm duyệt dòng tiền từ phía Admin, bảo đảm tiền hàng chuyển khoản khớp 100% về số tiền và mã nội dung chuyển khoản trước khi chuyển đơn hàng sang trạng thái hoàn tất.
-Biểu đồ tuần tự (UML Sequence Diagram)
-Biểu đồ tuần tự (Hình 3.5) trực quan hóa các lời gọi hàm (API calls) và các thông điệp truyền tải thời gian thực giữa Người mua, Người bán, Máy chủ (Backend), và Admin theo trục thời gian.
  
Hình 3.5: Sơ đồ tuần tự (Sequence Diagram) Quy trình Mua hàng và Duyệt biên lai
- Nội dung chi tiết Hình 3.5: Biểu đồ tuần tự gồm 15 bước giao tiếp. Thể hiện rõ các API endpoints được gọi (`/api/orders`, `/api/payments`, v.v.) và cơ chế đồng bộ hóa trạng thái tức thời thông qua Socket.IO Hub. Các sự kiện client-side được lắng nghe liên tục để thay đổi giao diện người dùng mà không cần reload trang.
 3.3.2. Quy trình Trợ lý AI Chatbot tích hợp RAG
- Nghiệp vụ này mô tả luồng tính toán chuyển đổi ngôn ngữ tự nhiên thành vector để tra cứu tài liệu nội bộ trước khi Gemini sinh câu trả lời.
- Biểu đồ hoạt động (UML Activity Diagram)
- Biểu đồ hoạt động (Hình 3.9) mô tả các bước xử lý dữ liệu bất đồng bộ từ lúc tiếp nhận câu hỏi của sinh viên đến khi chatbot hiển thị kết quả.
 
Hình 3.6: Sơ đồ hoạt động (Activity Diagram) Quy trình xử lý của Trợ lý AI RAG
- Nội dung chi tiết Hình 3.6: Biểu đồ mô tả quy trình RAG khép kín. Nổi bật là cơ chế bảo mật rate limit ở đầu vào, hai luồng tra cứu song song (Vectra cho tài liệu tĩnh và MongoDB cho sản phẩm động) và cơ chế prompt engineering trước khi gọi mô hình Gemini để sinh câu trả lời.
- Biểu đồ tuần tự (UML Sequence Diagram)
- Biểu đồ tuần tự (Hình 3.7) mô tả chi tiết sự tương tác giữa Sinh viên, Chatbot Controller, Google Gemini API, cơ sở dữ liệu Vector cục bộ (Vectra), và MongoDB. 
Hình 3.7: Sơ đồ tuần tự (Sequence Diagram) Quy trình hỗ trợ AI Chatbot RAG
-Nội dung chi tiết Hình 3.7: Sơ đồ minh họa 11 bước gọi hàm bất đồng bộ. Làm rõ quy trình thiết lập ngữ cảnh động của `Chatbot Controller` bằng cách kết hợp thông tin cấu trúc chính sách từ Vectra, thông tin sản phẩm thời gian thực từ MongoDB và lịch sử trò chuyện để đảm bảo cuộc hội thoại diễn ra tự nhiên, chính xác nhất.
3.3.3. Quy trình Tác vụ nền tự động (Cron Jobs Expiration)
- Tiến trình chạy ngầm này được thực thi độc lập và tự động hóa toàn bộ việc quét dọn, giải phóng tài nguyên.
 - Sơ đồ hoạt động (UML Activity Diagram)
- Sơ đồ hoạt động (Hình 3.11) mô tả tiến trình tự động hủy đơn và khôi phục trạng thái sản phẩm đăng bán.

Hình 3.8: Sơ đồ hoạt động (Activity Diagram) Tác vụ Cron Job hủy đơn hàng quá hạn
Nội dung chi tiết Hình 3.8: Sơ đồ thể hiện một vòng lặp quét tự động (Loop). Khi phát hiện đơn hàng quá hạn 24h không thanh toán, hệ thống tự động hủy đơn và khôi phục lại trạng thái sản phẩm về "Đang bán" (`available`) để người khác có thể mua, tránh hiện tượng sản phẩm bị giam giữ ảo.
3.4. Thiết kế Cơ sở dữ liệu (Database Design & ERD)
Hệ thống DNU Marketplace sử dụng cơ sở dữ liệu NoSQL MongoDB với tổng cộng 22 collections. Trong cơ sở dữ liệu tài liệu (document database), mặc dù không có ràng buộc khóa ngoại cứng ở tầng database như SQL, hệ thống vẫn liên kết chặt chẽ các thực thể ở tầng ứng dụng thông qua thuộc tính lưu ID tham chiếu (`ObjectId`).
 3.4.1. Sơ đồ quan hệ thực thể (UML ERD Diagram)
Sơ đồ ERD (Hình 3.9) mô tả mối quan hệ logic 1-nhiều và 1-1 giữa các thực thể cốt lõi trong hệ thống DNU Marketplace.

Hình 3.9: Sơ đồ thực thể quan hệ (ERD) cơ sở dữ liệu MongoDB
Nội dung chi tiết Hình 3.12: Sơ đồ thực thể biểu diễn các mối quan hệ logic. Người dùng (`USERS`) có mối quan hệ 1-nhiều với `PRODUCTS`, `ORDERS`, `POSTS`. Đơn hàng (`ORDERS`) liên kết 1-1 với chứng từ `PAYMENTS` để đối soát, chứng từ này lại ánh xạ đến tài khoản ngân hàng `BANK_QR` của hệ thống để tạo mã QR động.
 3.4.2. Đặc tả chi tiết các Collection cốt lõi
Dưới đây là mô tả cấu trúc dữ liệu vật lý của các Collection trung tâm trong hệ thống DNU Marketplace:
Tên trường dữ liệu	Kiểu dữ liệu	Ràng buộc dữ liệu	Ý nghĩa và ví dụ
_id	ObjectId	Primary Key, Auto	Khóa chính tự sinh của MongoDB.
name	String	Required, Trim	Họ tên sinh viên (ví dụ: “Nguyễn Văn A”).
email	String	Required, Unique, Lowercase	Email tên miền trường (bắt buộc @dnu.edu.vn).
studentId	String	Required, Unique	Mã số sinh viên (ví dụ: 1951010012).
password	String	Required	Mật khẩu tài khoản (đã băm bằng bcryptjs).
avatar	String	Default URL	Link ảnh đại diện lưu trên Cloudinary.
role	String	Default: 'student'	Phân quyền ('student', 'admin', 'superadmin').
isVerified	Boolean	Default: false	Trạng thái xác thực tài khoản qua OTP email.
followers	Array [ObjectId]	Ref: 'Users'	Mảng chứa các ID người dùng đang theo dõi user này.
isOnline	Boolean	Default: false	Trạng thái trực tuyến thời gian thực.
lastSeen	Date	Default: Now	Thời gian hoạt động cuối cùng của người dùng.
Bảng 3.7: Đặc tả cấu trúc Collection `Users` (Lưu thông tin người dùng)

Tên trường dữ liệu	Kiểu dữ liệu	Ràng buộc dữ liệu	Ý nghĩa và ví dụ
_id	ObjectId	Primary Key, Auto	Khóa chính tự sinh của MongoDB.
name	String	Required, Trim	Họ tên sinh viên (ví dụ:“Nguyễn Văn A”).
email	String	Required, Unique, Lowercase	Email tên miền trường (bắt buộc @dnu.edu.vn).
studentId	String	Required, Unique	Mã số sinh viên (ví dụ: “1951010012”).
password	String	Required	Mật khẩu tài khoản (đã băm bằng bcryptjs).
avatar	String	Default URL	Link ảnh đại diện lưu trên Cloudinary.
role	String	Default: 'student'	Phân quyền ('student', 'admin', 'superadmin').
isVerified	Boolean	Default: false	Trạng thái xác thực tài khoản qua OTP email.
followers	Array [ObjectId]	Ref: 'Users'	Mảng chứa các ID người dùng đang theo dõi user này.
isOnline	Boolean	Default: false	Trạng thái trực tuyến thời gian thực.
lastSeen	Date	Default: Now	Thời gian hoạt động cuối cùng của người dùng.
Bảng 3.8: Đặc tả cấu trúc Collection `Products` (Lưu thông tin sản phẩm)

Tên trường dữ liệu	Kiểu dữ liệu	Ràng buộc dữ liệu	Ý nghĩa và ví dụ
_id	ObjectId	Primary Key, Auto	Khóa chính của sản phẩm.
userId	ObjectId	Required, Ref: 'Users'	Tham chiếu đến sinh viên đăng sản phẩm.
title	String	Required, Trim, Max: 100	Tiêu đề tin đăng (ví dụ: “Giáo trình C++ cũ”).
description	String	Required, Max: 1000	Mô tả sản phẩm (độ mới, tình trạng trang sách).
price	Number	Required, Min: 0	Giá bán sản phẩm (ví dụ: 50000).
category	String	Required, Enum	Danh mục ('Sách', 'Điện tử', 'Nội thất', 'Khác').
condition	String	Required, Enum	Độ mới ('Mới 99%', 'Tốt', 'Khá', 'Cũ').
images	Array [String]	Required, Max: 10	Danh sách URL ảnh lưu trữ trên Cloudinary.
location	String	Required, Enum	Địa điểm giao dịch ('Ký túc xá', 'Giảng đường A', ...).
isApproved	Boolean	Default: false	Trạng thái phê duyệt tin bài của Admin.
status	String	Default: 'available', Enum	Trạng thái bán hàng ('available', 'sold', 'deleted').
Bảng 3.9: Đặc tả cấu trúc Collection `Orders` (Quản lý đơn hàng)

Tên trường dữ liệu	Kiểu dữ liệu	Ràng buộc dữ liệu	Ý nghĩa và ví dụ
_id	ObjectId	Primary Key, Auto	Khóa chính của đơn hàng.
buyerId	ObjectId	Required, Ref: 'Users'	Tham chiếu tới ID của người mua.
sellerId	ObjectId	Required, Ref: 'Users'	Tham chiếu tới ID của người bán.
productId	ObjectId	Required, Ref: 'Products'	Tham chiếu tới ID sản phẩm được mua.
finalPrice	Number	Required, Min: 0	Giá trị thanh toán cuối cùng của đơn hàng.
status	String	Default: 'pending', Enum	Trạng thái đơn ('pending', 'confirmed', 'completed', 'cancelled').
shippingAddress	String	Required	Địa chỉ nhận hàng chi tiết của người mua.
phoneNumber	String	Required	Số điện thoại liên hệ giao hàng của người mua.
expiresAt	Date	Required	Hạn giờ hủy đơn tự động sau 24h từ lúc tạo.
 Bảng 3.10: Đặc tả cấu trúc Collection `Payments` (Chứng từ thanh toán)



Tên trường dữ liệu	Kiểu dữ liệu	Ràng buộc dữ liệu	Ý nghĩa và ví dụ
_id	ObjectId	Primary Key, Auto	Khóa chính của chứng từ thanh toán.
orderId	ObjectId	Required, Ref: 'Orders'	Tham chiếu tới đơn hàng tương ứng.
transactionCode	String	Required, Unique	Mã giao dịch tự sinh (ví dụ: “DNUMP98A7B”).
paymentProof	String	Required (khi update)	Link ảnh biên lai chuyển khoản (Cloudinary URL).
status	String	Default: 'pending', Enum	Trạng thái duyệt tiền ('pending', 'confirmed', 'rejected').
bankQRId	ObjectId	Required, Ref: 'BankQR'	Tham chiếu tới tài khoản ngân hàng nhận tiền.
Bảng 3.11: Đặc tả cấu trúc Collection `BankQR` (Tài khoản ngân hàng của sàn)

Tên trường dữ liệu	Kiểu dữ liệu	Ràng buộc dữ liệu	Ý nghĩa và ví dụ
_id	ObjectId	Primary Key, Auto	Khóa chính của tài khoản nhận tiền.
bankName	String	Required, Upper	Tên viết tắt ngân hàng (ví dụ: “VIETINBANK”, “MBBANK”).
accountNumber	String	Required, Num String	Số tài khoản ngân hàng nhận tiền.
accountName	String	Required, Upper	Tên chủ sở hữu tài khoản viết hoa không dấu.
isActive	Boolean	Default: true	Đánh dấu tài khoản có được dùng tạo QR động.
Bảng 3.18: Đặc tả cấu trúc Collection `Messages` (Lưu lịch sử chat)

 3.5. Thiết kế kiến trúc hệ thống (System Architecture Design)
Hệ thống DNU Marketplace được thiết kế dựa trên kiến trúc phân tầng (Multi-tier Architecture) nhằm tách biệt rõ ràng giữa các thành phần giao diện, điều phối trung gian, kiểm soát nghiệp vụ, và lưu trữ dữ liệu. Kiến trúc này giúp nâng cao tính độc lập của mã nguồn, nâng cao khả năng bảo trì và cho phép dễ dàng tích hợp thêm các công nghệ hoặc nền tảng di động khác sau này.
 3.5.1. Bản vẽ chi tiết luồng xử lý phân tầng (Architecture Layers)
- Kiến trúc hệ thống (Hình 3.10) phân chia phần mềm thành 4 phân tầng chức năng chính:

Hình 3.10: Bản vẽ chi tiết luồng xử lý và kiến trúc phân tầng hệ thống
Nội dung chi tiết Hình 3.10: Biểu đồ mô tả quy trình đi của một yêu cầu (Request). Bắt đầu từ Tầng 1 (Giao diện React), thông qua Axios gửi request tới Tầng 2 (Express Gateway). Tại đây, request phải đi qua các chốt chặn middleware để xác định quyền hạn (JWT), giới hạn IP và validate dữ liệu thô. Nếu hợp lệ, request mới được chuyển giao cho Tầng 3 (Controllers) để thực thi logic nghiệp vụ. Cuối cùng, tầng nghiệp vụ giao tiếp với Tầng 4 (CSDL MongoDB & Vectra Index) qua Mongoose ODM để ghi nhận hoặc truy xuất dữ liệu trả về cho người dùng.
3.5.2. Giải thích chi tiết các phân tầng kiến trúc
1.  Tầng Giao diện (Client - React SPA):
- Chịu trách nhiệm trực quan hóa dữ liệu và tương tác trực tiếp với sinh viên. Sử dụng React Router v6 để điều hướng trang. Redux Store đóng vai trò là "nguồn chân lý duy nhất" lưu trữ trạng thái đăng nhập và dữ liệu chat. Axios chịu trách nhiệm đóng gói dữ liệu JSON gửi lên máy chủ, còn Socket.IO Client lắng nghe các sự kiện bất đồng bộ đẩy từ server.
2. Tầng Định tuyến & Middleware (Express Gateway):
- Đóng vai trò là chốt chặn an ninh cho toàn bộ hệ thống. Bộ định tuyến Express Router nhận request và phân loại theo Endpoint. Từng Endpoint được gắn các Middleware chuyên trách: `auth.js` để từ chối các request không có token hợp lệ, `rateLimiter.js` để phạt các IP spam chatbot AI, và `validator` để bảo vệ cơ sở dữ liệu khỏi các dữ liệu rác hoặc mã độc.
3. Tầng Nghiệp vụ (Controllers & Services):
- Nơi chứa toàn bộ logic nghiệp vụ thực tế của sàn DNU Marketplace. Ví dụ: `Payment Controller` xử lý luồng ghi nhận ảnh biên lai; `RAG Service` điều phối việc nhúng câu hỏi sinh viên và tìm kiếm vector; `CronScheduler` lập lịch quét đơn hàng hết hạn chạy ngầm độc lập.
4. Tầng Cơ sở dữ liệu (Storage & Index):
- Nơi lưu trữ dữ liệu vật lý lâu dài của hệ thống. MongoDB lưu trữ dữ liệu động (người dùng, đơn hàng, bài viết). Vectra Index lưu trữ dữ liệu vector (FAQ, chính sách). Mongoose ODM đóng vai trò trung gian mô hình hóa và thực thi các câu lệnh truy vấn dữ liệu từ NodeJS xuống MongoDB một cách an toàn, có hệ thống.

3.6 Quy trình hoạt động mua/bán sản phẩm trên web quy trình bán sp
-chọn đăng bán
                        Hình 3.11: Chọn đăng bán Sp
-Điền thông tin sản phẩm muốn bán kèm hình ảnh (ấn và AI để tự động chọn Tag và mô tả sản phẩm nếu muốn) và đăng và chờ admin duyệt sản phẩm
 
                    Hình 3.12: Điền thông tin sp đăng bán

-Sản phầm được duyệt sẽ có thông báo 
 
                             Hình 3.13: Admin duyệt sản phẩm

-	Sau khi duyệt sản phẩm sẽ có thông báo cho người bán là sản phẩm đã được duyệt

                           Hình 3.14 thông báo sp đc duyệt





Quy trình mua sản phẩm
- chọn 1 trong 3 cách để tìm sản phẩm
+ tìm bằng thanh tìm kiếm
+tìm bằng chatbot AI
+tìm bằng vào xem danh sách sản phẩm

                                    Hình 3.15 ba cách tìm sản phẩm
- Sau khi tìm sản phẩm ưng ý ấn mua và điền thông tin
 
                    Hình 3.16: điền thông tin để dặt sản phẩm


-	Ấn đặt sản phẩm thành công vào quản lý đơn hang chọn Thanh Toán, Sau khi gửi biên lai Xác nhận là thành công admin sẽ xác nhận giao dịch


                          Hình 3.17: Hoàn tất giao dịch
-	Admin xác nhận tiền đã nhận đc tiền và duyệt và người bán cũng sẽ xác nhận đơn hang đã đặt

                  Hình 3.18: người bán và admin xác nhận sp



-Shipper sẽ nhận đơn hàng trên hệ thống để xác nhận giao, Shipper sẽ nhận đơn của người bán chuyển tới người mua
- Nếu bạn thanh toán rồi sẽ hiện trên hệ thống shipper sẽ biết nếu không thì sẽ chuyển khoản hoặc tiền mặt

                              Hình 3.19: Shipper nhận sp và giao
-	Sau khi nhận sp bạn có thể đánh giá sản phẩm 

                           Hình 3.20: đánh giá sp khi nhận sp
-Quy trình admin trả tiền cho người bán
Người bán sẽ xác nhận thông tin tiền đã nhận , Admin sẽ gửi tiền cho người bán sau trừ vat + thuế sàn

                 Hình 3.21: Quy trình admin trả tiền cho người bán

CHƯƠNG 4: XÂY DỰNG, CÀI ĐẶT VÀ GIAO DIỆN HỆ THỐNG
Chương này tập trung mô tả chi tiết môi trường cài đặt phần mềm, cấu trúc thư mục dự án, các đoạn mã nguồn hiện thực hóa các chức năng cốt lõi (Xác thực, Socket.IO chat, Trợ lý AI RAG, Tự động hóa Cron Job) và trực quan hóa giao diện người dùng thực tế của hệ thống DNU Marketplace.
 4.1. Môi trường triển khai và cấu hình
 4.1.1. Môi trường phát triển và cài đặt (Development Environment)
-Dự án được xây dựng và chạy thực tế trên các môi trường phần cứng và phần mềm tiêu chuẩn như sau:
- Hệ điều hành: Microsoft Windows 10/11 (hoặc macOS/Linux).
- Môi trường chạy Backend: Node.js phiên bản từ `v16.x` trở lên đi kèm trình quản lý thư viện `npm`.
 - Hệ quản trị cơ sở dữ liệu: MongoDB Community Server (v6.x) chạy cục bộ kết hợp công cụ trực quan hóa dữ liệu MongoDB Compass, hoặc sử dụng dịch vụ đám mây MongoDB Atlas.
 - Môi trường phát triển tích hợp (IDE): Visual Studio Code hoặc Cursor Editor.
 - Trình duyệt kiểm thử: Google Chrome, Microsoft Edge phiên bản mới nhất hỗ trợ gỡ lỗi Developer Tools và React Developer Tools.
 4.1.2. Quản lý cấu hình biến môi trường bảo mật (`.env`)
Hệ thống sử dụng các file `.env` đặt độc lập tại hai thư mục `backend/` và `frontend/` để quản lý các cấu hình nhạy cảm và các API Keys kết nối dịch vụ bên thứ ba mà không cần ghi đè cứng vào mã nguồn.
- Cấu hình biến môi trường Backend (`backend/.env`)
File cấu hình Backend chứa các tham số kết nối database, khóa bí mật JWT, API key của Google Gemini, và dịch vụ email SMTP:
PORT=5000
NODE_ENV=development
 MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/dnu-marketplace


 JWT Security Key
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
 Cloudinary image upload config
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

 SMTP Email Config (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
 Frontend application URL (CORS protection)
FRONTEND_URL=http://localhost:3000

 Google Gemini AI API key (for chatbot and embedding)
GEMINI_API_KEY=your-gemini-api-key-here

 Cấu hình biến môi trường Frontend (`frontend/.env`)
File cấu hình Frontend định nghĩa đường dẫn gọi API của máy chủ Backend:
VITE_API_URL=http://localhost:5000/api
 4.2. Hiện thực hóa các thành phần cốt lõi (Backend & Integration)
 4.2.1. Xác thực và Bảo mật Middleware (Authentication & Validation)
Middleware xác thực `auth.js` đóng vai trò kiểm tra tính hợp lệ của token JWT gửi lên từ client. Dưới đây là đoạn mã hiện thực của middleware xác thực phân quyền người dùng:
// file: backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header Authorization
      token = req.headers.authorization.split(' ')[1];
      // Xác minh chữ ký token bằng khóa bí mật
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Lấy thông tin user từ database (loại bỏ trường mật khẩu) và gán vào request
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Không được phép, token không hợp lệ' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Không được phép, thiếu token xác thực' });
  }
};
// Middleware kiểm tra quyền admin
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Vai trò [${req.user ? req.user.role : 'Guest'}] không có quyền truy cập tài nguyên này` 
      });
    }
    next();
  };
};
module.exports = { protect, authorize };
4.2.2. Xử lý kết nối thời gian thực Socket.IO (Real-Time Communication)
- Tại file khởi động chính `server.js`, Socket.IO Server được tích hợp để quản lý các sự kiện trực tuyến, sự kiện chat và thông báo tức thời. Đoạn mã dưới đây mô tả cấu hình Socket.IO:
// file: backend/server.js (Trích đoạn tích hợp Socket.IO)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT"]
  }
});
// Bản đồ lưu socketId theo userId đang online
const onlineUsers = new Map();
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  // Khi user đăng nhập thành công và báo trạng thái online
  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`[Socket] User ${userId} is online with socket ${socket.id}`);
    io.emit('user-status-changed', { userId, status: 'online' });
  });
  // Tham gia vào phòng chat cụ thể (Room) theo conversationId
  socket.on('join-room', (conversationId) => {
    socket.join(conversationId);
    console.log(`[Socket] Socket ${socket.id} joined room ${conversationId}`);
  });
 // Lắng nghe sự kiện gõ phím
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing-indicator', { userId, isTyping: true });
  });
  socket.on('stop-typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing-indicator', { userId, isTyping: false });
  });
  // Khi client ngắt kết nối
  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      console.log(`[Socket] User ${disconnectedUserId} went offline`);
      io.emit('user-status-changed', { userId: disconnectedUserId, status: 'offline' });
    }
  });
});
4.2.3. Tích hợp Trợ lý AI Chatbot RAG (Google Gemini & Vectra)
Dịch vụ `ragService.js` chịu trách nhiệm vector hóa kho tri thức chính sách và thực hiện tìm kiếm ngữ nghĩa Cosine Similarity bằng thư viện Vectra kết hợp gọi API Google Gemini:
```javascript
// file: backend/utils/ragService.js (Trích đoạn xử lý cốt lõi)
const { LocalIndex } = require('vectra');
const { generateEmbedding } = require('./gemini');
// Đường dẫn lưu trữ Vector Index cục bộ
const KNOWLEDGE_INDEX_PATH = require('path').join(__dirname, '../data/knowledge_index');
/
  Thực hiện tìm kiếm ngữ nghĩa trong kho tri thức
  @param {string} queryText - Câu hỏi thô của sinh viên
  @param {number} topK - Số lượng chunk tài liệu cần lấy ra
  @returns {Promise<Array>} Danh sách chunk tài liệu kèm score
 /
async function knowledgeSearch(queryText, topK = 3) {
  try {
    // 1. Chuyển đổi câu hỏi của sinh viên thành vector embeddings qua Gemini
    const vector = await generateEmbedding(queryText);
    if (!vector) return [];
    // 2. Mở cơ sở dữ liệu vector chỉ mục cục bộ
    const index = new LocalIndex(KNOWLEDGE_INDEX_PATH);
    if (!(await index.isIndexCreated())) {
      console.log('[RAG Service] Vector Index chưa được khởi tạo.');
      return [];
    }
    // 3. Truy vấn tìm các vector có khoảng cách góc Cosine ngắn nhất
    const results = await index.queryItems(vector, topK);
    // Trả về định dạng chuẩn hóa
    return results.map(r => ({
      text: r.item.metadata?.text || '',
      source: r.item.metadata?.source || 'unknown',
      score: r.score, // Giá trị độ tương đồng từ 0.0 đến 1.0
    }));
  } catch (err) {
    console.error('[RAG Service] Lỗi khi thực hiện tìm kiếm ngữ nghĩa:', err.message);
    return [];
  }
}
/
  Ghép nối các nguồn ngữ cảnh thành một khối văn bản tham khảo
 /
function buildRAGContext(productHits, knowledgeHits, productDocs) {
  let context = '';
  // Nạp thông tin từ file hướng dẫn nội quy (Vectra)
  if (knowledgeHits.length > 0) {
    context += '=== HƯỚNG DẪN & CHÍNH SÁCH DNU MARKETPLACE ===\n';
    for (const hit of knowledgeHits) {
      if (hit.score > 0.3) { // Chỉ lấy các thông tin có độ tương đồng đủ cao
        context += `[Nguồn: ${hit.source.toUpperCase()}]\n${hit.text}\n\n`;
      }
    }
  }
  // Nạp thông tin sản phẩm thật đang bán trong database (MongoDB)
  if (productDocs && productDocs.length > 0) {
    context += '=== SẢN PHẨM KHẢ DỤNG TRÊN SÀN ===\n';
    productDocs.forEach((p, i) => {
      const price = Number(p.price || 0).toLocaleString('vi-VN');
      context += `${i + 1}. "${p.title}" - Giá: ${price} VNĐ - Danh mục: ${p.category} - Vị trí: ${p.location}\n`;
    });
    context += '\n';
  }
  return context.trim();
}
```
 4.2.4. Tự động hóa tác vụ chạy ngầm Cron Jobs (Node-Cron Automation)
- Tiến trình `orderExpiration.js` chịu trách nhiệm quét cơ sở dữ liệu để tự động xử lý đơn hàng và thanh toán quá hạn 24 giờ mà người dùng không phản hồi:
// file: backend/cron/orderExpiration.js (Toàn văn hiện thực hóa)
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { createAndEmitNotification } = require('../utils/notifications');
let io = null;
const setIO = (socketIO) => { io = socketIO; };
// Tác vụ 1: Tự động hủy đơn hàng quá 24h chưa được người bán xác nhận
const expireOrders = async () => {
  try {
    const now = new Date();
    const expiredOrders = await Order.find({
      status: 'pending',
      expiresAt: { $lt: now } // So sánh thời gian hết hạn nhỏ hơn hiện tại
    }).populate('productId', 'title').populate('buyerId', 'name').populate('sellerId', 'name');
    console.log(`[Cron Job] Phát hiện ${expiredOrders.length} đơn hàng quá hạn xác nhận`);
    for (const order of expiredOrders) {
      order.status = 'cancelled';
      order.cancelledAt = now;
      order.cancellationReason = 'Tự động hủy do người bán không xác nhận sau 24 giờ';
      await order.save();
      // Khôi phục trạng thái sản phẩm để hiển thị lên sàn trở lại
      await Product.findByIdAndUpdate(order.productId._id, { status: 'available' });
      // Đẩy thông báo Socket.IO real-time cho hai bên
      if (io) {
        await createAndEmitNotification(
          io, order.buyerId._id, 'order_expired', 'Đơn hàng đã hết hạn',
          `Đơn hàng mua sản phẩm "${order.productId.title}" đã tự động hủy do người bán không xác nhận kịp thời.`,
          { orderId: order._id }
        );
        await createAndEmitNotification(
          io, order.sellerId._id, 'order_expired', 'Đơn hàng đã hết hạn',
          `Đơn hàng bán sản phẩm "${order.productId.title}" đã hết hạn và bị hủy.`,
          { orderId: order._id }
        );
      }
    }
  } catch (error) {
    console.error('[Cron Error] Lỗi khi xử lý hủy đơn quá hạn:', error);
  }
};
// Tác vụ 2: Tự động hủy yêu cầu thanh toán chưa upload ảnh biên lai sau 24h
const expirePayments = async () => {
  try {
    const now = new Date();
    const expiredPayments = await Payment.find({
      status: 'pending',
      expiresAt: { $lt: now },
      paymentProof: null // Người mua không tải biên lai lên
    }).populate('orderId').populate('buyerId', 'name');
    console.log(`[Cron Job] Phát hiện ${expiredPayments.length} yêu cầu thanh toán hết hạn tải biên lai`);
    for (const payment of expiredPayments) {
      payment.status = 'rejected';
      payment.rejectionReason = 'Tự động hủy do quá hạn upload biên lai giao dịch (24 giờ)';
      await payment.save();
      // Nếu đơn hàng liên kết vẫn đang ở trạng thái pending -> Hủy đơn
      if (payment.orderId && payment.orderId.status === 'pending') {
        payment.orderId.status = 'cancelled';
        payment.orderId.cancelledAt = now;
        payment.orderId.cancellationReason = 'Đơn hàng bị hủy do người mua không hoàn thành thanh toán';
        await payment.orderId.save();
        if (payment.orderId.productId) {
          await Product.findByIdAndUpdate(payment.orderId.productId, { status: 'available' });
        }
      }
      // Thông báo cho người mua
      if (io && payment.buyerId) {
        await createAndEmitNotification(
          io, payment.buyerId._id, 'payment_expired', 'Thanh toán hết hạn',
          `Yêu cầu thanh toán của bạn đã bị hủy do không tải lên biên lai chuyển khoản trong vòng 24 giờ.`,
          { paymentId: payment._id }
        );
      }
    }
  } catch (error) {
    console.error('[Cron Error] Lỗi khi xử lý thanh toán hết hạn:', error);
  }
};
module.exports = { setIO, expireOrders, expirePayments };
```
 4.3. Xây dựng giao diện ứng dụng (Frontend Screens)
- Ứng dụng Frontend được thiết kế tối ưu bằng cấu trúc component phân cấp. Dưới đây là mô tả trực quan các màn hình giao diện thực tế của dự án DNU Marketplace.

 4.3.1. Cấu trúc cây thư mục mã nguồn (Code Tree Structure)
- Mã nguồn của hệ thống được tổ chức phân rã độc lập theo mô hình mô-đun hóa, cấu trúc cây thư mục giúp hệ thống dễ dàng bảo trì và phát triển:
- Cấu trúc cây thư mục mã nguồn dự án DNU Marketplace

├── backend/
│   ├── config/              Cấu hình DB db.js
│   ├── controllers/         Logic: authController.js, paymentController.js, ...
│   ├── cron/                Tác vụ định kỳ orderExpiration.js
│   ├── middleware/          auth.js, rateLimiter.js, errorHandler.js
│   ├── models/              Schema: User.js, Product.js, Order.js, Payment.js
│   ├── routes/              Định tuyến: auth.js, product.js, payment.js, chatbot.js
│   ├── utils/               RAG: ragService.js, gemini.js, sendEmail.js
│   └── server.js            Entry point khởi động ứng dụng
└── frontend/
    ├── public/              Tài nguyên tĩnh
    └── src/
        ├── components/      Layout, ChatbotAI.jsx, PaymentModal.jsx, BuyNowModal.jsx
        ├── pages/           Screens: Home.jsx, BankQRManagement.jsx, MyPayments.jsx, ...
        ├── store/           Slices: authSlice.js, chatSlice.js, store.js
        ├── App.jsx          Cấu hình routes React Router
        └── main.jsx         Điểm render ReactDOM
 4.3.2. Giao diện hệ thống 
1. Giao diện Trang chủ 
 
                                      Hình 4.1 Giao diện Trang chủ
2. Giao diện đăng nhập và đăng ký
 
                                  Hình 4.2: Giao diện đăng nhập
 
                                       Hình 4.3: Giao diện đăng ký
3.	Giao diện chat bot

                            Hình 4.4: Giao diện chatbot


4.	Giao diện danh sách sản phẩm

                       Hình 4.5: Giao diện danh sách sản phẩm
5. Giao diện mạng xã hội
 
                        Hình 4.6: Giao diện mạng xã hội


6. Giao diện mua/bán sản phẩm 
 
                                   Hình 4.7: Giao diện bán sản phẩm
 
                                   Hình 4.8: Giao diện Sản phẩm

 
                           Hình 4.9: Giao diện mua sản phẩm

7. Giao diện quản lý bán sản phẩm
 
                            Hình 4.10: Giao diện quản lý bán sản phẩm






8. Giao diện chat
 
                                        Hình 4.11: Giao diện chat


9. Giao diện Quản lý của admin

 
                           Hình 4.12: Giao diện Quản lý của admin
10. Giao diện quản lý hàng của shipper
 
                      Hình 4.13: Giao diện quản lý hàng của shipper
















CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ KẾT QUẢ
Chương này trình bày kế hoạch kiểm thử hệ thống DNU Marketplace, kết quả kiểm thử tự động (Unit Test với Jest) và kiểm thử chức năng thủ công (Black-box Testing), đánh giá các chỉ số bảo mật/hiệu năng, khảo sát trải nghiệm người dùng thực tế tại trường Đại học Đại Nam và đưa ra phần kết luận chung cùng hướng phát triển đề tài trong tương lai.
 5.1. Kế hoạch kiểm thử (Test Plan)
 5.1.1. Mục tiêu kiểm thử
-Quá trình kiểm thử nhằm phát hiện các lỗi phát sinh trong mã nguồn, kiểm tra tính đúng đắn của luồng xử lý nghiệp vụ so với đặc tả yêu cầu chức năng. Các mục tiêu cốt lõi bao gồm:
 -  Đảm bảo tính chính xác tuyệt đối của luồng nghiệp vụ tài chính (mua hàng, sinh mã QR, đối soát biên lai).
 -  Đảm bảo tính an toàn bảo mật (xác thực email học đường `@dnu.edu.vn`, chữ ký mã hóa JWT token, phân quyền admin).
 -  Kiểm chứng hiệu năng thực tế của chatbot AI RAG (khả năng lọc thông tin chính xác theo cosine similarity và tốc độ sinh phản hồi của Gemini).
  - Đảm bảo tính tương thích và hiển thị mượt mà trên nhiều thiết bị di động khác nhau.
 5.1.2. Đối tượng và phương pháp kiểm thử
 -  Đối tượng kiểm thử: Hệ thống Backend API (Express.js), cơ sở dữ liệu (MongoDB), các WebSocket events (Socket.IO), các Vector Index (Vectra), và giao diện người dùng ReactJS.
 Phương pháp kiểm thử:
1.  Kiểm thử hộp đen thủ công (Manual Black-box Testing): Thiết kế các kịch bản test-case chi tiết giả lập các hành động thực tế của sinh viên và admin trên giao diện để kiểm tra tính đúng đắn của logic phần mềm.
2.  Kiểm thử chấp nhận người dùng (UAT - User Acceptance Testing): Phát hành phiên bản thử nghiệm giới hạn cho sinh viên Đại học Đại Nam sử dụng thực tế và thu thập bảng câu hỏi khảo sát mức độ hài lòng.
5.2. Kiểm thử chức năng (Black-box Test Cases)
-Quy trình kiểm thử hộp đen thủ công tập trung thiết kế các kịch bản kiểm thử chi tiết cho 3 luồng nghiệp vụ cốt lõi nhất của hệ thống: Đăng ký tài khoản học đường, Thanh toán QR ngân hàng động, và Tương tác chatbot AI RAG.
5.2.1. Kịch bản kiểm thử Đăng ký và Xác thực tài khoản
Mã Case	Tên Kịch bản	Các bước thực hiện	Dữ liệu đầu vào	Kết quả mong đợi	Kết quả thực tế	Trạng thái
TC-REG-01	Đăng ký thành công với Email DNU hợp lệ	1. Nhập họ tên, MSSV.
2. Nhập Email có đuôi @dnu.edu.vn.3. Nhập mật khẩu hợp lệ.
4. Nhấn “Đăng ký”.	Name: “Lê Văn A”Email: a.le@dnu.edu.vnMSSV: 2051010012Pass: Matkhau123	Hệ thống báo thành công, gửi mã OTP về email và chuyển hướng sang trang nhập OTP.	Đúng như mong đợi, nhận được email chứa OTP 6 số.	PASS
TC-REG-02	Đăng ký thất bại do Email ngoài trường học	1. Nhập họ tên,MSSV.
2. Nhập email cá nhân.
3. Nhấn “Đăng ký”.	Email: levana@gmail.com	Hệ thống chặn lại, hiển thị cảnh báo đỏ “Email phải có đuôi @dnu.edu.vn”.	Chặn thành công, không tạo bản ghi trong database.	PASS
TC-REG-03	Xác minh OTP thất bại do nhập sai mã	1. Đăng ký thành công.
2. Nhập mã OTP sai vào ô xác thực.
3. Nhấn “Xác minh”.	OTP: 000000(Mã thật gửi về là 584930)	Giao diện báo lỗi “Mã OTP không chính xác”, giữ nguyên màn hình nhập OTP.	Hiển thị thông báo báo lỗi chính xác.	PASS
TC-REG-04	Xác minh OTP thất bại do mã hết hạn	1. Đăng ký thành công.
2. Đợi quá 10 phút.
3. Nhập mã OTP đúng nhận được trong mail.
4. Nhấn “Xác minh”.	OTP: 584930Thời gian chờ: 11 phút	Hệ thống báo lỗi “Mã OTP đã hết hạn. Vui lòng bấm gửi lại mã”.	Báo lỗi hết hạn, collection PendingRegistration đã tự hủy bản ghi.	PASS
Bảng 5.1: Kịch bản kiểm thử chức năng Đăng ký tài khoản sinh viên (OTP DNU)
 5.2.2. Kịch bản kiểm thử Thanh toán QR ngân hàng động
Mã Case	Tên Kịch bản	Các bước thực hiện	Dữ liệu đầu vào	Kết quả mong đợi	Kết quả thực tế	Trạng thái
TC-PAY-01	Tạo mã QR động thanh toán thành công	1. Người mua mở đơn hàng đã xác nhận.
2. Nhấn nút “Thanh toán”.	Order ID: ORD6789FinalPrice: 150,000 VNĐ	Hệ thống hiển thị ảnh QR động VietQR chứa đúng tài khoản đích và nội dung chứa mã giao dịch duy nhất.	Hiển thị mã QR động chính xác kèm mã giao dịch (VD: DNUMP887B).	PASS
TC-PAY-02	Upload biên lai hợp lệ thành công	1. Người mua quét QR chuyển tiền.
2. Chọn tệp ảnh biên lai chuyển tiền thành công.
3. Nhấn “Gửi biên lai”.	Tệp: receipt.png(Dung lượng: 1.2MB)	Giao diện hiển thị thanh tải lên, báo thành công, đổi trạng thái thanh toán thành chờ duyệt (pending).	Tải lên Cloudinary thành công, lưu link URL vào MongoDB.	PASS
TC-PAY-03	Admin phê duyệt thanh toán hợp lệ	1. Admin vào trang quản trị thanh toán.
2. Xem biên lai của ORD6789, đối soát khớp tiền trên app ngân hàng thật.
3. Bấm “Phê duyệt”.	Trạng thái: Duyệt	Đơn hàng đổi sang completed. Sản phẩm đổi sang sold. Gửi thông báo real-time chúc mừng hai bên.	Cập nhật đồng loạt các trạng thái, hai bên nhận được thông báo sau 0.5s.	PASS
TC-PAY-04	Admin từ chối biên lai thanh toán lỗi	1. Admin phát hiện số tiền chuyển thiếu 20,000đ.
2. Bấm “Từ chối”.
3. Nhập lý do từ chối.	Lý do: “Chuyển khoản thiếu 20k. Vui lòng gửi bù”	Bản ghi thanh toán chuyển thành rejected. Gửi thông báo yêu cầu người mua nộp lại biên lai hợp lệ.	Đổi trạng thái thành rejected, người mua nhận được thông báo yêu cầu upload lại.	PASS

 Bảng 5.2: Kịch bản kiểm thử chức năng Thanh toán QR & Đối soát biên lai

5.2.3. Kịch bản kiểm thử Trợ lý ảo AI Chatbot RAG
Mã Case	Tên Kịch bản	Các bước thực hiện	Dữ liệu đầu vào	Kết quả mong đợi	Kết quả thực tế	Trạng thái
TC-AI-01	Hỏi đáp về chính sách quy chế của sàn	1. Sinh viên mở khung chatbot.
2. Nhập câu hỏi về cách đăng tin bán hàng và gửi đi.	Message: “Làm thế nào để tôi có thể đăng bài bán đồ cũ?”	Hệ thống vector hóa, truy xuất file guide.md, Gemini trả lời chính xác quy trình đăng tin của sàn.	Trả lời đầy đủ 7 bước đăng bài đúng theo chính sách thực tế của sàn DNU.	PASS
TC-AI-02	Hỏi tìm sản phẩm đang có trên sàn	1. Nhập câu hỏi tìm mua giáo trình môn học.
2. Nhấn gửi.	Message: “Tìm cho tôi cuốn sách C++ giá rẻ”	Hệ thống query database, Gemini liệt kê danh sách sách C++ đang bán kèm giá và link xem chi tiết.	Liệt kê đúng 2 sản phẩm sách C++ hiện có trong database (tên sách, giá bán VNĐ).	PASS
TC-AI-03	Hỏi câu hỏi ngoài phạm vi hệ thống	1. Nhập câu hỏi không liên quan đến sàn DNU Marketplace.	Message: “Thủ đô của nước Pháp là gì?”	Gemini nhận diện câu hỏi ngoài phạm vi và trả lời theo prompt fallback hướng dẫn liên hệ admin.	Phản hồi từ chối trả lời thông tin ngoài lề một cách thân thiện.	PASS
TC-AI-04	Kiểm soát chống spam request (Rate Limit)	1. Nhập câu hỏi liên tục.
2. Gửi quá 20 tin nhắn trong vòng 1 phút.	Gửi 21 tin nhắn liên tiếp trong 45 giây	Hệ thống chặn request thứ 21, trả về mã lỗi 429 và hiển thị thông báo yêu cầu thử lại sau 1 phút.	Chặn thành công từ request thứ 21, bảo vệ máy chủ khỏi bị quá tải API Gemini.	PASS

      Bảng 5.3: Kịch bản kiểm thử chức năng Trợ lý AI Chatbot RAG
 5.3. Đánh giá bảo mật và hiệu năng (Security & Performance)
 5.3.1. Đánh giá hiệu năng hệ thống (Response Time)
-Quá trình đo đạc thời gian phản hồi (Response Time) của hệ thống được thực hiện bằng công cụ Chrome Developer Tools trong môi trường chạy thử nghiệm. Kết quả đo được tổng hợp trong bảng dưới đây:
Endpoint API / Sự nghiệp	Thời gian phản hồi trung bình	Đánh giá trải nghiệm	Endpoint API / Sự nghiệp	Thời gian phản hồi trung bình	Đánh giá trải nghiệm	Endpoint API / Sự nghiệp
POST /api/auth/login (Xác thực băm mật khẩu)	450 ms	Rất nhanh, mượt mà	POST /api/auth/login (Xác thực băm mật khẩu)	450 ms	Rất nhanh, mượt mà	POST /api/auth/login (Xác thực băm mật khẩu)
GET /api/products (Lấy danh sách, có phân trang)	120 ms	Cực kỳ nhanh	GET /api/products (Lấy danh sách, có phân trang)	120 ms	Cực kỳ nhanh	GET /api/products (Lấy danh sách, có phân trang)
POST /api/payments (Tạo QR Code động)	350 ms	Nhanh, tạo QR tức thì	POST /api/payments (Tạo QR Code động)	350 ms	Nhanh, tạo QR tức thì	POST /api/payments (Tạo QR Code động)
POST /api/chatbot/chat (Xử lý luồng AI RAG)	2.8 giây	Chấp nhận được đối với tác vụ AI sinh câu	POST /api/chatbot/chat (Xử lý luồng AI RAG)	2.8 giây	Chấp nhận được đối với tác vụ AI sinh câu	POST /api/chatbot/chat (Xử lý luồng AI RAG)
 Bảng 5.4: Thống kê thời gian phản hồi trung bình của các API chính
 5.3.2. Đánh giá tính an toàn bảo mật
 -Bảo mật dữ liệu: MongoDB Compass kiểm tra cho thấy trường mật khẩu hoàn toàn được lưu dưới dạng chuỗi băm phức tạp (ví dụ: `$2a$10$X9...`).
- Chống XSS/NoSQL Injection: Thử nghiệm chèn thẻ `<script>alert('hack')</script>` vào mô tả sản phẩm cho thấy hệ thống đã lọc sạch (Sanitize) các thẻ nguy hiểm trước khi lưu vào DB.
- Rate Limiting: Cơ chế giới hạn IP đã hoạt động chính xác cho API Chatbot AI, ngăn chặn thành công việc spam làm tăng chi phí API Key của Google.
 Hướng phát triển trong tương lai
Để phát triển hệ thống ngày càng hoàn thiện và nâng cao tính ứng dụng thực tiễn, đề tài đề xuất một số hướng nâng cấp trong tương lai như sau:
   - Tích hợp cổng thanh toán tự động: Nâng cấp API kết nối với các dịch vụ thanh toán tự động (như PayOS, Casso) để nhận webhook biến động số dư ngân hàng tức thời. Hệ thống sẽ tự động duyệt đơn hàng ngay khi người mua chuyển khoản đúng số tiền và mã giao dịch mà không cần Admin phê duyệt thủ công.
   - Phát triển Mobile App đa nền tảng: Xây dựng ứng dụng di động sử dụng framework React Native hoặc Flutter để tận dụng tối đa hệ thống thông báo đẩy (Push Notifications) của hệ điều hành, giúp sinh viên nhận tin nhắn chat và thông báo đơn hàng tức thì.
  - Tối ưu hóa công cụ gợi ý AI: Nghiên cứu và áp dụng mô hình gợi ý lọc cộng tác (Collaborative Filtering) kết hợp phân tích cảm xúc (Sentiment Analysis) các bài viết/bình luận của sinh viên để cá nhân hóa chính xác danh sách sản phẩm hiển thị trên trang chủ.
  - Nâng cấp hạ tầng Caching: Tích hợp bộ nhớ đệm Redis Caching cho các API có tần suất truy cập cao (danh sách sản phẩm, tin nhắn cũ) để giảm tải cho database MongoDB, đồng thời cache lại các câu hỏi chatbot AI phổ biến để tiết kiệm chi phí gọi API Key của Google Gemini.
KẾT LUẬN 
 Kết quả đạt được Đề tài "Xây dựng hệ thống sàn thương mại điện tử mua bán đồ dùng cũ tích hợp AI Chatbot cho sinh viên Đại học Đại Nam (DNU Marketplace)" đã được nghiên cứu, thiết kế và hiện thực hóa thành công đáp ứng đầy đủ các yêu cầu đặt ra ban đầu. Các kết quả cụ thể đạt được bao gồm:Hạ tầng Web Stack vững chắc: Xâydựng hoàn chỉnh hệ thống RESTful API Backend trên Node.js/Express/MongoDB và Frontend trên ReactJS/Redux/Tailwind CSS chạy mượt mà, responsive tốt trên các thiết bị.Bảo mật học đường khép kín: Triển khai thành công bộ lọc tài khoản bằng email sinh viên định danh `@dnu.edu.vn` đi kèm mã số sinh viên, loại bỏ hoàn toàn các đối tượng lừa đảo tự do trà trộn.Quy trình thanh toán QR ngân hàng động an toàn: Phát triển luồng tạo QR động chứa mã giao dịch đối soát, giúp Admin dễ dàng kiểm duyệt biên lai và bảo đảm an toàn dòng tiền cho cả hai bên giao dịch C2C.Ứng dụng Trí tuệ nhân tạo (AI RAG) thực tiễn: Tích hợp thành công mô hình ngôn ngữ lớn Google Gemini AI cùng cơ sở dữ liệu vector cục bộ (Vectra) để xây dựng trợ lý chatbot thông minh hỗ trợ tìm kiếm sản phẩm và giải đáp chính sách dựa trên dữ liệu thực tế của hệ thống mà không bị ảo tưởng thông tin. Tương tác thời gian thực & Tự động hóa: Ứng dụng Socket.IO đồng bộ hóa trạng thái chat, thông báo tức thời và lập lịch Cron Jobs tự động quét hủy đơn hàng quá hạn 24h để giải phóng tài nguyên hệ thống. kết cộng đồng: Tích hợp các tính năng mạng xã hội thu nhỏ (Feed bài viết, Following) tạo không gian sinh hoạt số sống động cho sinh viên.Những mặt hạn chế của hệ thốngMặc dù đã đạt được nhiều kết quả tích cực, hệ thống vẫn tồn tại một số điểm hạn chế cần cải thiện. Duyệt thanh toán bán tự động: Quy trình đối soát dòng tiền vẫn cần Admin kiểm tra thủ công tài khoản ngân hàng và nhấn nút duyệt trên web. Hệ thống chưa thể tự động nhận biến động số dư do hạn chế về chi phí thuê cổng thanh toán tự động doanh nghiệp. Giới hạn nền tảng: Ứng dụng hiện tại mới chỉ chạy trên trình duyệt Web (Web App), chưa có phiên bản ứng dụng di động cài đặt trực tiếp (Mobile App Native) trên Android và iOS để gửi thông báo đẩy (push notification) nhanh hơn khi người dùng tắt trình duyệt




DANH MỤC TÀI LIỆU THAM KHẢO
[1] Nguyễn Hữu Đức (2020), Giáo trình Nhập môn Công nghệ phần mềm, Nhà xuất bản Giáo dục Việt Nam.  
[2] Trần Công Nghị (2021), Phát triển ứng dụng Web hiệu năng cao với NodeJS, Express và MongoDB, Nhà xuất bản Khoa học và Kỹ thuật.  
[3] Phạm Thế Anh (2022), Lập trình giao diện Web hiện đại, tối ưu trải nghiệm người dùng với ReactJS và Tailwind CSS, Nhà xuất bản Bách Khoa Hà Nội.  
[4] Trường Đại học Đại Nam (2023), Quy chế Đào tạo và Hướng dẫn triển khai Đồ án Tốt nghiệp ngành Công nghệ Thông tin, Tài liệu lưu hành nội bộ DNU.  
[5] Nguyễn Minh Triết, Lê Hoàng Nam (2023), "Ứng dụng cơ chế truyền thông WebSockets trong xây dựng hệ thống trò chuyện thời gian thực", Tạp chí Khoa học và Công nghệ Việt Nam, số 12, tr. 45-52.  
[6] Alex Banks and Eve Porcello (2020), Learning React: Modern Patterns for Developing React Apps, O'Reilly Media.  
[7] Brad Dayley, Brendan Dayley, Caleb Dayley (2021), Node.js, Express and MongoDB Development, Addison-Wesley Professional.  
[8] Lewis, Patrick, et al. (2020), "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", Advances in Neural Information Processing Systems (NeurIPS), Vol. 33, pp. 9459-9474.  
[9] Google Cloud (2023), Google Gemini API Documentation: Generative AI for Developers Reference, Google Developer Documentation.  
[10] MongoDB Inc (2022), MongoDB Professional Reference Manual: Document Database Schema Design and Indexing, MongoDB Press.  
[11] React Official Team, React Documentation - Describing the UI and State Management, truy cập tại: <https://react.dev> (lần cuối truy cập ngày 24/05/2026).  
[12] Socket.IO Developer Group, Socket.IO Client and Server API Documentation, truy cập tại: <https://socket.io/docs/v4/> (lần cuối truy cập ngày 24/05/2026).  
[13] ExpressJS Community, Express - Fast, unopinionated, minimalist web framework for Node.js, truy cập tại: <https://expressjs.com> (lần cuối truy cập ngày 24/05/2026). 



