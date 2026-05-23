// =========================================================================
// 1. PHÂN TÍCH THÀNH PHẦN DOM & KHAI BÁO BIẾN TOÀN CỤC
// =========================================================================
const btnOpenForm = document.getElementById('btn-open-form');
const btnCloseForm = document.getElementById('btn-close-form');
const formModal = document.getElementById('form-modal');
const taskForm = document.getElementById('task-form');
const taskListContainer = document.getElementById('task-list');

// Các trường nhập liệu trong biểu mẫu popup
const txtTitle = document.getElementById('task-title');
const txtDesc = document.getElementById('task-desc');
const txtDeadline = document.getElementById('task-deadline');
const slcPriority = document.getElementById('task-priority');

// Các vị trí hiển thị con số thống kê
const txtTotalTasks = document.getElementById('total-tasks');
const txtCompletedTasks = document.getElementById('completed-tasks');
const txtPendingTasks = document.getElementById('pending-tasks');
const notificationArea = document.getElementById('notification-area');

// Biến lưu trạng thái hành động form: null = "Thêm mới", nếu chứa ID số = "Đang Sửa"
let currentEditTaskId = null;

// MẢNG DỮ LIỆU MẪU BAN ĐẦU (Gồm 5 công việc đáp ứng yêu cầu đề bài)
const defaultTasks = [
    { id: 1, title: "Lập lịch tuần làm việc", desc: "Xây dựng mục tiêu học tập và làm việc cho tuần mới", deadline: "2026-05-25", priority: "Cao", completed: true },
    { id: 2, title: "Luyện tập JavaScript", desc: "Thực hành viết các hàm xử lý mảng và LocalStorage", deadline: "2026-05-26", priority: "Cao", completed: false },
    { id: 3, title: "Đọc sách lập trình", desc: "Đọc tiếp chương 3 cuốn sách Clean Code phổ biến", deadline: "2026-05-29", priority: "Trung bình", completed: false },
    { id: 4, title: "Dọn dẹp góc làm việc", desc: "Vệ sinh bàn máy tính và sắp xếp tài liệu gọn gàng", deadline: "2026-05-24", priority: "Thấp", completed: true },
    { id: 5, title: "Chuẩn bị bài thuyết trình", desc: "Làm slide Powerpoint cho bài thảo luận nhóm", deadline: "2026-05-28", priority: "Trung bình", completed: false }
];

// Đọc dữ liệu từ bộ nhớ trình duyệt, nếu trống thì gán bằng mảng 5 dữ liệu mẫu
let tasks = JSON.parse(localStorage.getItem('tasks')) || defaultTasks;

// =========================================================================
// 2. CÁC HÀM TIỆN ÍCH GIAO DIỆN CƠ BẢN
// =========================================================================

// Mở popup modal
function openModal() {
    formModal.classList.remove('hidden');
}

// Đóng và làm sạch form popup
function closeModal() {
    formModal.classList.add('hidden');
    taskForm.reset();
    currentEditTaskId = null;
    document.getElementById('form-title').innerText = "Thêm Mới Công Việc";
}

// Bật thông báo nhanh (Thành công / Cảnh báo)
function showNotification(message, type = 'success') {
    notificationArea.innerText = message;
    notificationArea.className = `notification ${type}`;
    setTimeout(() => {
        notificationArea.className = 'notification hidden';
    }, 2500);
}

// Thống kê số lượng theo trạng thái
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    txtTotalTasks.innerText = total;
    txtCompletedTasks.innerText = completed;
    txtPendingTasks.innerText = pending;
}

// =========================================================================
// 3. LUỒNG XỬ LÝ A: HIỂN THỊ DANH SÁCH CÔNG VIỆC (RENDER CARDS)
// =========================================================================
function renderTasks() {
    taskListContainer.innerHTML = ''; // Làm sạch danh sách cũ

    if (tasks.length === 0) {
        taskListContainer.innerHTML = `<div style="text-align:center; color:#888; padding:30px;">Danh sách công việc trống. Hãy tạo công việc đầu tiên nhé!</div>`;
        updateStatistics();
        return;
    }

    tasks.forEach(task => {
        // Chuẩn hóa tên class phục vụ đổ màu viền Ưu tiên
        const priorityClass = task.priority === 'Cao' ? 'priority-cao' : (task.priority === 'Trung bình' ? 'priority-trung-binh' : 'priority-thap');
        const completedClass = task.completed ? 'is-completed' : '';

        // Khởi tạo đối tượng thẻ Div chứa Card công việc
        const card = document.createElement('div');
        card.className = `task-card ${priorityClass} ${completedClass}`;

        card.innerHTML = `
            <div class="task-info">
                <input type="checkbox" class="status-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTaskStatus(${task.id})">
                <div class="task-details">
                    <h3>${task.title}</h3>
                    <p>${task.desc || '<i>Không có mô tả chi tiết</i>'}</p>
                    <div class="task-meta">
                        <span class="badge-date">📅 Hạn: ${task.deadline}</span>
                        <span class="badge-priority">📌 Mức độ: ${task.priority}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-edit-task" onclick="loadTaskToForm(${task.id})">Sửa</button>
                <button class="btn-delete-task" onclick="deleteTask(${task.id})">Xóa</button>
            </div>
        `;
        taskListContainer.appendChild(card);
    });

    updateStatistics();
}

// =========================================================================
// 4. LUỒNG XỬ LÝ B & C: THÊM MỚI VÀ CẬP NHẬT CÔNG VIỆC (SUBMIT FORM)
// =========================================================================
taskForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang khi gửi form

    const titleValue = txtTitle.value.trim();
    const descValue = txtDesc.value.trim();
    const deadlineValue = txtDeadline.value;
    const priorityValue = slcPriority.value;

    // CHẾ ĐỘ: CẬP NHẬT (SỬA CÔNG VIỆC)
    if (currentEditTaskId !== null) {
        const index = tasks.findIndex(t => t.id === currentEditTaskId);
        if (index !== -1) {
            tasks[index].title = titleValue;
            tasks[index].desc = descValue;
            tasks[index].deadline = deadlineValue;
            tasks[index].priority = priorityValue;
            
            showNotification("Đã cập nhật thông tin công việc!");
        }
    } 
    // CHẾ ĐỘ: THÊM MỚI CÔNG VIỆC
    else {
        const newTask = {
            id: Date.now(), // Tạo ID độc nhất ngẫu nhiên bằng mốc thời gian timestamp
            title: titleValue,
            desc: descValue,
            deadline: deadlineValue,
            priority: priorityValue,
            completed: false // Công việc mới mặc định là chưa hoàn thành
        };

        tasks.push(newTask);
        showNotification("Thêm mới công việc thành công!");
    }

    // Đồng bộ ghi mảng mới xuống localStorage và hiển thị lại giao diện
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    closeModal();
});

// Đưa dữ liệu cũ lên form khi người dùng ấn nút Sửa
window.loadTaskToForm = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    currentEditTaskId = id; // Đánh dấu ID đang chỉnh sửa

    // Điền dữ liệu cũ vào các ô input biểu mẫu
    txtTitle.value = task.title;
    txtDesc.value = task.desc;
    txtDeadline.value = task.deadline;
    slcPriority.value = task.priority;

    // Đổi tiêu đề popup form để phân biệt
    document.getElementById('form-title').innerText = "Cập Nhật Công Việc";
    openModal();
};

// =========================================================================
// 5. LUỒNG XỬ LÝ D: XÓA CÔNG VIỆC (CÓ XÁC NHẬN)
// =========================================================================
window.deleteTask = function(id) {
    const isConfirm = confirm("Bạn có chắc chắn muốn xóa vĩnh viễn công việc này không?");
    if (isConfirm) {
        tasks = tasks.filter(t => t.id !== id); // Lọc bỏ phần tử ra khỏi mảng dữ liệu
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        showNotification("Đã xóa công việc khỏi danh sách!", "error");
    }
};

// =========================================================================
// 6. LUỒNG XỬ LÝ E: THAY ĐỔI TRẠNG THÁI HOÀN THÀNH (CHECKBOX)
// =========================================================================
window.toggleTaskStatus = function(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index].completed = !tasks[index].completed; // Đảo ngược giá trị true <-> false
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(); // Render lại để áp dụng hiệu ứng gạch ngang text qua class CSS
    }
};

// =========================================================================
// 7. ĐĂNG KÝ SỰ KIỆN KHỞI CHẠY LẦN ĐẦU
// =========================================================================
btnOpenForm.addEventListener('click', openModal);
btnCloseForm.addEventListener('click', closeModal);

document.addEventListener('DOMContentLoaded', function() {
    // Nếu đây là lần chạy đầu tiên (chưa có key 'tasks' ở bộ nhớ), ta lưu 5 dữ liệu mẫu vào luôn
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    renderTasks(); // Gọi vẽ danh sách cards ra màn hình
});