# 🚀 Hướng Dẫn Push Code Lên GitHub

## 📋 Các Bước Thực Hiện

### Bước 1: Kiểm tra Git đã được cài đặt

Mở PowerShell hoặc Command Prompt và chạy:

```powershell
git --version
```

Nếu chưa có Git, tải tại: https://git-scm.com/download/win

---

### Bước 2: Khởi tạo Git Repository (Nếu chưa có)

Nếu thư mục của bạn chưa phải là git repository:

```powershell
# Di chuyển vào thư mục dự án
cd "D:\4 Năm ĐH\ĐỒ ÁN"

# Khởi tạo git repository
git init

# Kiểm tra trạng thái
git status
```

---

### Bước 3: Cấu hình Git (Nếu lần đầu)

```powershell
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

**Ví dụ:**
```powershell
git config --global user.name "Nguyen Van A"
git config --global user.email "your-email@dnu.edu.vn"
```

---

### Bước 4: Thêm Remote Repository (GitHub)

#### 4.1. Tạo Repository mới trên GitHub

1. Đăng nhập vào https://github.com
2. Click nút **"+"** ở góc trên bên phải → **"New repository"**
3. Đặt tên repository (ví dụ: `dnu-marketplace`)
4. Chọn **Public** hoặc **Private**
5. **KHÔNG** tick "Initialize this repository with a README"
6. Click **"Create repository"**

#### 4.2. Kết nối với GitHub

Sau khi tạo repository, GitHub sẽ hiển thị URL. Copy URL đó và chạy:

```powershell
# Thay YOUR_USERNAME và REPO_NAME bằng thông tin của bạn
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Ví dụ:
# git remote add origin https://github.com/yourusername/dnu-marketplace.git
```

**Kiểm tra remote đã thêm:**
```powershell
git remote -v
```

---

### Bước 5: Kiểm tra và cập nhật .gitignore

Đảm bảo file `.gitignore` có các nội dung sau (để không push các file nhạy cảm):

```
node_modules/
.env
*.log
.DS_Store
dist/
build/
uploads/
.vscode/
.idea/
```

---

### Bước 6: Thêm các file vào Git

```powershell
# Thêm tất cả các file (trừ những file trong .gitignore)
git add .

# Hoặc thêm từng file cụ thể
git add SET_SUPER_ADMIN.bat
git add backend/removeSuperAdmin.js
git add LOGIC_MUA_HANG.md
```

**Kiểm tra các file sẽ được commit:**
```powershell
git status
```

---

### Bước 7: Commit các thay đổi

```powershell
# Commit với message mô tả
git commit -m "Add: SET_SUPER_ADMIN.bat and removeSuperAdmin.js for admin management"

# Hoặc commit với message ngắn gọn
git commit -m "Update admin scripts and add purchase flow documentation"
```

**Các message ví dụ khác:**
```powershell
git commit -m "Initial commit"
git commit -m "Add super admin management scripts"
git commit -m "Fix: batch file encoding issues"
git commit -m "Add: purchase flow documentation"
```

---

### Bước 8: Push lên GitHub

#### 8.1. Push lần đầu (Tạo branch main)

```powershell
# Đổi tên branch thành main (nếu đang là master)
git branch -M main

# Push lên GitHub
git push -u origin main
```

#### 8.2. Push các lần sau

```powershell
git push
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi 1: "fatal: not a git repository"

**Nguyên nhân:** Chưa khởi tạo git repository

**Giải pháp:**
```powershell
git init
```

---

### Lỗi 2: "fatal: remote origin already exists"

**Nguyên nhân:** Đã có remote origin

**Giải pháp:**
```powershell
# Xem remote hiện tại
git remote -v

# Xóa remote cũ (nếu cần)
git remote remove origin

# Thêm lại remote mới
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

---

### Lỗi 3: "error: failed to push some refs"

**Nguyên nhân:** Remote repository đã có code (README, LICENSE, v.v.)

**Giải pháp:**
```powershell
# Pull code từ remote trước
git pull origin main --allow-unrelated-histories

# Sau đó push lại
git push -u origin main
```

---

### Lỗi 4: Authentication failed

**Nguyên nhân:** Chưa đăng nhập GitHub

**Giải pháp:**

#### Cách 1: Dùng Personal Access Token

1. Vào GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Chọn quyền: `repo` (Full control of private repositories)
4. Copy token
5. Khi push, nhập username và dán token thay cho password

#### Cách 2: Dùng GitHub CLI

```powershell
# Cài đặt GitHub CLI
winget install --id GitHub.cli

# Đăng nhập
gh auth login

# Sau đó push bình thường
git push
```

#### Cách 3: Dùng SSH Key

1. Tạo SSH key:
```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Copy public key:
```powershell
cat ~/.ssh/id_ed25519.pub
```

3. Thêm SSH key vào GitHub: Settings → SSH and GPG keys → New SSH key

4. Thay đổi remote URL sang SSH:
```powershell
git remote set-url origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

---

## 📝 Quy Trình Làm Việc Hàng Ngày

Sau khi đã setup xong, quy trình làm việc:

```powershell
# 1. Kiểm tra thay đổi
git status

# 2. Thêm file vào staging
git add .

# 3. Commit với message rõ ràng
git commit -m "Mô tả thay đổi"

# 4. Push lên GitHub
git push

# 5. (Nếu làm việc nhóm) Pull code mới nhất trước khi push
git pull origin main
git push
```

---

## 🎯 Tóm Tắt Lệnh Nhanh

```powershell
# Khởi tạo repository
git init

# Thêm remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Thêm file
git add .

# Commit
git commit -m "Your commit message"

# Push
git branch -M main
git push -u origin main
```

---

## ✅ Checklist Trước Khi Push

- [ ] Đã kiểm tra file `.gitignore` (không push `.env`, `node_modules`)
- [ ] Đã commit với message rõ ràng
- [ ] Đã kiểm tra không có thông tin nhạy cảm (password, API keys)
- [ ] Đã test code trước khi push

---

**Lưu ý quan trọng:**
- **KHÔNG BAO GIỜ** push file `.env` lên GitHub (chứa mật khẩu, API keys)
- **KHÔNG BAO GIỜ** push `node_modules/` (quá nặng, người khác sẽ tự cài)
- Luôn commit với message mô tả rõ ràng

