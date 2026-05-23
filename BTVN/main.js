// =========================================================================
// 1. KHAI BÁO CÁC BIẾN TOÀN CỤC & PHẦN TỬ DOM
// =========================================================================
const btnOpenForm = document.getElementById('btn-open-form');
const btnCloseForm = document.getElementById('btn-close-form');
const formModal = document.getElementById('form-modal');
const studentForm = document.getElementById('student-form');
const studentTbody = document.getElementById('student-tbody');

// Các ô input trong form
const txtId = document.getElementById('student-id');
const txtName = document.getElementById('fullname');
const txtDob = document.getElementById('dob');
const txtClass = document.getElementById('class-name');
const txtGpa = document.getElementById('gpa');
const txtEmail = document.getElementById('email');

// Thống kê & thông báo
const txtTotalStudents = document.getElementById('total-students');
const txtAverageScore = document.getElementById('average-score');
const notificationArea = document.getElementById('notification-area');

// Biến lưu trạng thái sửa: null = Thêm mới, nếu chứa chuỗi = Đang sửa Mã SV đó
let currentEditId = null; 

// Mảng chứa danh sách sinh viên ban đầu gồm 5 phần tử mẫu
let students = JSON.parse(localStorage.getItem('students')) || [
    { id: "SV001", name: "Nguyễn Văn A", dob: "2003-05-15", class: "CNTT1", gpa: "8.5", email: "vana@gmail.com" },
    { id: "SV002", name: "Trần Thị B", dob: "2004-09-20", class: "CNTT2", gpa: "7.8", email: "thib@gmail.com" },
    { id: "SV003", name: "Trần Thị C", dob: "2045-09-20", class: "CNTT2", gpa: "7.0", email: "thi@gmail.com" },
    { id: "SV004", name: "Trần B", dob: "2025-09-20", class: "CNTT2", gpa: "8.0", email: "b@gmail.com" },
    { id: "SV005", name: "Trần", dob: "2000-09-20", class: "CNTT2", gpa: "9.0", email: "th@gmail.com" }
];

// =========================================================================
// 2. CÁC HÀM XỬ LÝ GIAO DIỆN CƠ BẢN (Ẩn/Hiện Form & Thông báo)
// =========================================================================

function openModal() {
    formModal.classList.remove('hidden');
    txtId.disabled = false; 
    clearAllErrors(); // Xóa sạch các thông báo lỗi cũ khi mở form mới
}

function closeModal() {
    formModal.classList.add('hidden');
    studentForm.reset();
    currentEditId = null;
    document.getElementById('form-title').innerText = "Thêm Mới Sinh Viên";
    clearAllErrors();
}

function showNotification(message, type = 'success') {
    notificationArea.innerText = message;
    notificationArea.className = `notification ${type}`;
    setTimeout(() => {
        notificationArea.className = 'notification hidden';
    }, 3000);
}

// Xóa nhanh thông báo lỗi hiển thị trên giao diện của một ô input
function clearError(inputElement, errorElement) {
    inputElement.classList.remove('input-error');
    errorElement.innerText = '';
}

// Hiển thị thông báo lỗi lên giao diện của một ô input
function showError(inputElement, errorElement, message) {
    inputElement.classList.add('input-error');
    errorElement.innerText = message;
}

// Làm sạch tất cả các vị trí báo lỗi trên form
function clearAllErrors() {
    const inputs = studentForm.querySelectorAll('input');
    const errorMessages = studentForm.querySelectorAll('.error-message');
    inputs.forEach(input => input.classList.remove('input-error'));
    errorMessages.forEach(msg => msg.innerText = '');
}

// =========================================================================
// 3. HÀM VALIDATION - KIỂM TRA TÍNH HỢP LỆ CỦA BIỂU MẪU
// =========================================================================
function validateForm() {
    let isValid = true;

    // Lấy giá trị hiện tại
    const idValue = txtId.value.trim();
    const nameValue = txtName.value.trim();
    const dobValue = txtDob.value;
    const classValue = txtClass.value.trim();
    const gpaValue = txtGpa.value.trim();
    const emailValue = txtEmail.value.trim();

    // Các thẻ hiển thị lỗi tương ứng
    const errId = document.getElementById('error-student-id');
    const errName = document.getElementById('error-fullname');
    const errDob = document.getElementById('error-dob');
    const errClass = document.getElementById('error-class-name');
    const errGpa = document.getElementById('error-gpa');
    const errEmail = document.getElementById('error-email');

    // 1. Kiểm tra Mã sinh viên
    if (idValue === '') {
        showError(txtId, errId, "Mã sinh viên không được để trống.");
        isValid = false;
    } else if (!/^SV\d+$/i.test(idValue)) { // Yêu cầu nâng cao: Định dạng SVxxx (Ví dụ: SV001)
        showError(txtId, errId, "Mã sinh viên không đúng định dạng quy định (Ví dụ: SV001, SV02).");
        isValid = false;
    } else if (currentEditId === null) { 
        // Kiểm tra trùng mã sinh viên (chỉ áp dụng khi thêm mới)
        const isDuplicate = students.some(s => s.id.toLowerCase() === idValue.toLowerCase());
        if (isDuplicate) {
            showError(txtId, errId, "Mã sinh viên này đã tồn tại trong hệ thống.");
            isValid = false;
        } else {
            clearError(txtId, errId);
        }
    } else {
        clearError(txtId, errId);
    }

    // 2. Kiểm tra Họ và Tên
    if (nameValue === '') {
        showError(txtName, errName, "Họ và tên không được để trống.");
        isValid = false;
    } else if (nameValue.length < 2 || nameValue.length > 50) { // Yêu cầu nâng cao: Kiểm tra độ dài chuỗi
        showError(txtName, errName, "Độ dài họ và tên phải từ 2 đến 50 ký tự.");
        isValid = false;
    } else {
        clearError(txtName, errName);
    }

    // 3. Kiểm tra Ngày sinh
    if (dobValue === '') {
        showError(txtDob, errDob, "Vui lòng chọn ngày sinh.");
        isValid = false;
    } else {
        const selectedDate = new Date(dobValue);
        const currentDate = new Date();
        if (selectedDate > currentDate) { // Yêu cầu nâng cao: Kiểm tra ngày hợp lệ ở quá khứ
            showError(txtDob, errDob, "Ngày sinh không được vượt quá ngày hiện tại.");
            isValid = false;
        } else {
            clearError(txtDob, errDob);
        }
    }

    // 4. Kiểm tra Lớp học
    if (classValue === '') {
        showError(txtClass, errClass, "Lớp học không được để trống.");
        isValid = false;
    } else {
        clearError(txtClass, errClass);
    }

    // 5. Kiểm tra Điểm trung bình
    if (gpaValue === '') {
        showError(txtGpa, errGpa, "Điểm trung bình không được để trống.");
        isValid = false;
    } else {
        const gpaNum = parseFloat(gpaValue);
        if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) { // Yêu cầu nâng cao: Giá trị trong khoảng cho phép
            showError(txtGpa, errGpa, "Điểm trung bình phải là số hợp lệ từ 0 đến 10.");
            isValid = false;
        } else {
            clearError(txtGpa, errGpa);
        }
    }

    // 6. Kiểm tra Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Định dạng email cơ bản
    if (emailValue === '') {
        showError(txtEmail, errEmail, "Email không được để trống.");
        isValid = false;
    } else if (!emailRegex.test(emailValue)) {
        showError(txtEmail, errEmail, "Địa chỉ email không đúng định dạng (Ví dụ: abc@gmail.com).");
        isValid = false;
    } else {
        clearError(txtEmail, errEmail);
    }

    return isValid;
}

// =========================================================================
// 4. HÀM HIỂN THỊ DANH SÁCH & THỐNG KÊ (Render Data)
// =========================================================================
function renderTable() {
    studentTbody.innerHTML = ''; 

    if (students.length === 0) {
        studentTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888;">Danh sách trống. Vui lòng thêm sinh viên mới!</td></tr>`;
        txtTotalStudents.innerText = '0'; 
        txtAverageScore.innerText = '0.0'; 
        return;
    }

    let totalGpa = 0;
    let countGpaStudents = 0;

    students.forEach((student) => {
        const row = document.createElement('tr');
        
        if (student.gpa !== '' && student.gpa !== null) {
            totalGpa += parseFloat(student.gpa); 
            countGpaStudents++;
        }

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.dob || '-'}</td>
            <td>${student.class || '-'}</td>
            <td>${student.gpa !== '' ? student.gpa : '-'}</td>
            <td>${student.email || '-'}</td>
            <td>
                <button class="btn-edit" onclick="editStudent('${student.id}')">Sửa</button>
                <button class="btn-delete" onclick="deleteStudent('${student.id}')">Xóa</button>
            </td>
        `; 
        studentTbody.appendChild(row); 
    });

    txtTotalStudents.innerText = students.length;
    const avgScore = countGpaStudents > 0 ? (totalGpa / countGpaStudents).toFixed(2) : '0.0';
    txtAverageScore.innerText = avgScore;
}

// =========================================================================
// 5. CHỨC NĂNG THÊM & CẬP NHẬT (Submit Form)
// =========================================================================
studentForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Chặn reload trang

    // Chạy bộ lọc Validation, nếu trả về false (có lỗi) thì không cho lưu dữ liệu
    if (!validateForm()) {
        return; 
    }

    const idValue = txtId.value.trim();
    const nameValue = txtName.value.trim();
    const dobValue = txtDob.value;
    const classValue = txtClass.value.trim();
    const gpaValue = parseFloat(txtGpa.value).toFixed(1); // Chuẩn hóa 1 chữ số thập phân
    const emailValue = txtEmail.value.trim();

    if (currentEditId !== null) {
        const index = students.findIndex(s => s.id === currentEditId);
        if (index !== -1) {
            students[index] = {
                id: currentEditId,
                name: nameValue,
                dob: dobValue,
                class: classValue,
                gpa: gpaValue,
                email: emailValue
            };
            showNotification("Cập nhật thông tin sinh viên thành công!");
        }
    } else {
        const newStudent = {
            id: idValue,
            name: nameValue,
            dob: dobValue,
            class: classValue,
            gpa: gpaValue,
            email: emailValue
        };

        students.push(newStudent); 
        showNotification("Thêm mới sinh viên thành công!");
    }

    localStorage.setItem('students', JSON.stringify(students));
    renderTable();
    closeModal(); 
});

// =========================================================================
// 6. CHỨC NĂNG SỬA SINH VIÊN
// =========================================================================
window.editStudent = function(id) {
    const student = students.find(s => s.id === id); 
    if (!student) return;

    currentEditId = id; 

    txtId.value = student.id;
    txtId.disabled = true; 
    txtName.value = student.name;
    txtDob.value = student.dob;
    txtClass.value = student.class;
    txtGpa.value = student.gpa;
    txtEmail.value = student.email;

    document.getElementById('form-title').innerText = "Cập Nhật Sinh Viên";
    formModal.classList.remove('hidden');
    clearAllErrors();
};

// =========================================================================
// 7. CHỨC NĂNG XÓA SINH VIÊN
// =========================================================================
window.deleteStudent = function(id) {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa sinh viên có Mã SV: ${id}?`);
    
    if (confirmDelete) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        renderTable();
        showNotification("Đã xóa sinh viên thành công!", "error");
    }
};

// =========================================================================
// 8. ĐĂNG KÝ SỰ KIỆN KHỞI CHẠY
// =========================================================================
btnOpenForm.addEventListener('click', openModal); 
btnCloseForm.addEventListener('click', closeModal); 

document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify(students));
    }
    renderTable(); 
});