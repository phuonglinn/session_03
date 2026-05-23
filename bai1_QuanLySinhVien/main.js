// =========================================================================
// 1. KHAI BÁO CÁC BIẾN TOÀN CỤC & PHẦN TỬ DOM [cite: 30, 31]
// =========================================================================
const btnOpenForm = document.getElementById('btn-open-form'); // [cite: 32]
const btnCloseForm = document.getElementById('btn-close-form'); // [cite: 33]
const formModal = document.getElementById('form-modal'); // [cite: 27]
const studentForm = document.getElementById('student-form'); // [cite: 34]
const studentTbody = document.getElementById('student-tbody'); // [cite: 36]

// Các ô input trong form [cite: 35]
const txtId = document.getElementById('student-id');
const txtName = document.getElementById('fullname');
const txtDob = document.getElementById('dob');
const txtClass = document.getElementById('class-name');
const txtGpa = document.getElementById('gpa');
const txtEmail = document.getElementById('email');

// Thống kê & thông báo [cite: 37, 38]
const txtTotalStudents = document.getElementById('total-students');
const txtAverageScore = document.getElementById('average-score');
const notificationArea = document.getElementById('notification-area');

// Biến lưu trạng thái sửa: null = Thêm mới, nếu chứa chuỗi = Đang sửa Mã SV đó
let currentEditId = null; 

// Mảng chứa danh sách sinh viên, đọc từ localStorage [cite: 48, 49]
// Thay vì chỉ đọc localStorage, ta sẽ kiểm tra nếu chưa có dữ liệu thì nạp 2 dòng gốc này vào
let students = JSON.parse(localStorage.getItem('students')) || [
    {
        id: "SV001",
        name: "Nguyễn Văn A",
        dob: "2003-05-15",
        class: "CNTT1",
        gpa: "8.5",
        email: "vana@gmail.com"
    },
    {
        id: "SV002",
        name: "Trần Thị B",
        dob: "2004-09-20",
        class: "CNTT2",
        gpa: "7.8",
        email: "thib@gmail.com"
    },
    {
        id: "SV003",
        name: "Trần Thị C",
        dob: "2045-09-20",
        class: "CNTT2",
        gpa: "7",
        email: "thi@gmail.com"
    },
    {
        id: "SV004",
        name: "Trần B",
        dob: "2025-09-20",
        class: "CNTT2",
        gpa: "8",
        email: "b@gmail.com"
    },
    {
        id: "SV005",
        name: "Trần",
        dob: "2000-09-20",
        class: "CNTT2",
        gpa: "9",
        email: "th@gmail.com"
    }
];

// =========================================================================
// 2. CÁC HÀM XỬ LÝ GIAO DIỆN CƠ BẢN (Ẩn/Hiện Form & Thông báo)
// =========================================================================

// Mở form [cite: 40, 53]
function openModal() {
    formModal.classList.remove('hidden');
    txtId.disabled = false; // Khi thêm mới thì cho phép nhập Mã SV
}

// Đóng form [cite: 41, 61]
function closeModal() {
    formModal.classList.add('hidden');
    studentForm.reset();
    currentEditId = null;
    document.getElementById('form-title').innerText = "Thêm Mới Sinh Viên";
}

// Hiển thị thông báo [cite: 28]
function showNotification(message, type = 'success') {
    notificationArea.innerText = message;
    notificationArea.className = `notification ${type}`;
    setTimeout(() => {
        notificationArea.className = 'notification hidden';
    }, 3000);
}

// =========================================================================
// 3. HÀM HIỂN THỊ DANH SÁCH & THỐNG KÊ (Render Data) [cite: 47]
// =========================================================================
function renderTable() {
    studentTbody.innerHTML = ''; 

    if (students.length === 0) {
        studentTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888;">Danh sách trống. Vui lòng thêm sinh viên mới!</td></tr>`;
        txtTotalStudents.innerText = '0'; // 
        txtAverageScore.innerText = '0.0'; // 
        return;
    }

    let totalGpa = 0;
    let countGpaStudents = 0;

    students.forEach((student) => {
        const row = document.createElement('tr');
        
        if (student.gpa !== '' && student.gpa !== null) {
            totalGpa += parseFloat(student.gpa); // [cite: 14]
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
        `; // [cite: 9]
        studentTbody.appendChild(row); // [cite: 50]
    });

    // Cập nhật thống kê [cite: 13, 14, 60]
    txtTotalStudents.innerText = students.length;
    const avgScore = countGpaStudents > 0 ? (totalGpa / countGpaStudents).toFixed(2) : '0.0';
    txtAverageScore.innerText = avgScore;
}

// =========================================================================
// 4. CHỨC NĂNG THÊM & CẬP NHẬT (Submit Form) [cite: 42, 44]
// =========================================================================
studentForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Chặn trang bị reload lại khi bấm submit

    // Lấy dữ liệu từ ô input [cite: 55]
    const idValue = txtId.value.trim();
    const nameValue = txtName.value.trim();
    const dobValue = txtDob.value;
    const classValue = txtClass.value.trim();
    const gpaValue = txtGpa.value;
    const emailValue = txtEmail.value.trim();

    // Chế độ: CẬP NHẬT (SỬA) [cite: 44, 67]
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
    } 
    // Chế độ: THÊM MỚI [cite: 42, 57]
    else {
        // Kiểm tra trùng Mã SV trùng khi thêm mới
        const isDuplicate = students.some(s => s.id === idValue);
        if (isDuplicate) {
            showNotification("Mã sinh viên này đã tồn tại!", "error");
            return;
        }

        // Tạo object sinh viên mới [cite: 56]
        const newStudent = {
            id: idValue,
            name: nameValue,
            dob: dobValue,
            class: classValue,
            gpa: gpaValue,
            email: emailValue
        };

        students.push(newStudent); // Thêm vào mảng [cite: 57]
        showNotification("Thêm mới sinh viên thành công!");
    }

    // Lưu mảng dữ liệu vào localStorage và cập nhật lại bảng [cite: 58, 59, 68, 69]
    localStorage.setItem('students', JSON.stringify(students));
    renderTable();
    closeModal(); // Đóng popup form [cite: 61]
});

// =========================================================================
// 5. CHỨC NĂNG SỬA SINH VIÊN (Đưa dữ liệu lên form) [cite: 43, 62]
// =========================================================================
window.editStudent = function(id) {
    const student = students.find(s => s.id === id); // [cite: 64]
    if (!student) return;

    currentEditId = id; // Ghi nhớ lại mã sinh viên đang sửa

    // Đưa dữ liệu lên các ô input [cite: 10, 65]
    txtId.value = student.id;
    txtId.disabled = true; // Không cho sửa Mã SV (Khóa lại)
    txtName.value = student.name;
    txtDob.value = student.dob;
    txtClass.value = student.class;
    txtGpa.value = student.gpa;
    txtEmail.value = student.email;

    // Đổi tiêu đề form sang trạng thái cập nhật [cite: 66]
    document.getElementById('form-title').innerText = "Cập Nhật Sinh Viên";
    
    // Mở popup lên để người dùng chỉnh sửa
    formModal.classList.remove('hidden');
};

// =========================================================================
// 6. CHỨC NĂNG XÓA SINH VIÊN [cite: 45, 71]
// =========================================================================
window.deleteStudent = function(id) {
    // Hiển thị hộp xác nhận trước khi xóa [cite: 11, 73]
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa sinh viên có Mã SV: ${id}?`);
    
    if (confirmDelete) {
        // Lọc bỏ sinh viên được chọn khỏi mảng [cite: 74]
        students = students.filter(s => s.id !== id);
        
        // Cập nhật lại localStorage và vẽ lại bảng [cite: 12, 75, 76, 77]
        localStorage.setItem('students', JSON.stringify(students));
        renderTable();
        showNotification("Đã xóa sinh viên thành công!", "error");
    }
};
// =========================================================================
// 7. ĐĂNG KÝ SỰ KIỆN KHỞI CHẠY
// =========================================================================
btnOpenForm.addEventListener('click', openModal); 
btnCloseForm.addEventListener('click', closeModal); 

// Tải trang là hiển thị bảng ngay và đồng bộ dữ liệu ban đầu
document.addEventListener('DOMContentLoaded', function() {
    // Nếu đây là lần đầu tiên chạy ứng dụng (localStorage chưa có gì), 
    // ta chủ động lưu 2 dòng dữ liệu gốc này vào localStorage luôn để đồng bộ hệ thống.
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify(students));
    }
    
    // Gọi hàm vẽ bảng
    renderTable(); 
});