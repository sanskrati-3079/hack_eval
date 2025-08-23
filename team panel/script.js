// Countdown Timer Functionality
function updateCountdown() {
    // Set the deadline for Round 1 (example: 3 days from now)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    deadline.setHours(23, 59, 59, 999);

    const now = new Date().getTime();
    const distance = deadline.getTime() - now;

    if (distance < 0) {
        // Deadline has passed
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown(); // Initial call

// Leaderboard Tab Switching
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.leaderboard-tab');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Category selector functionality
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            // Here you would typically fetch new data based on the selected category
            console.log('Selected category:', this.value);
            // For demo purposes, we'll just show a message
            showNotification('Category changed to: ' + this.options[this.selectedIndex].text, 'info');
        });
    }
});

// Modal Functionality
const modal = document.getElementById('uploadModal');
const uploadBtns = document.querySelectorAll('.upload-btn');
const closeModal = document.getElementById('closeModal');
const cancelUpload = document.getElementById('cancelUpload');
const fileInput = document.getElementById('fileInput');
const uploadList = document.getElementById('uploadList');
const submitUpload = document.getElementById('submitUpload');

// Open modal
uploadBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Close modal
function closeModalFunc() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    // Clear file list
    uploadList.innerHTML = '';
    fileInput.value = '';
}

closeModal.addEventListener('click', closeModalFunc);
cancelUpload.addEventListener('click', closeModalFunc);

// Close modal when clicking outside
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModalFunc();
    }
});

// File upload functionality
fileInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    uploadList.innerHTML = '';
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <button class="remove-file" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        uploadList.appendChild(fileItem);
    });
});

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Submit upload
submitUpload.addEventListener('click', function() {
    const files = fileInput.files;
    if (files.length === 0) {
        showNotification('Please select files to upload', 'warning');
        return;
    }
    
    // Simulate upload process
    this.disabled = true;
    this.textContent = 'Uploading...';
    
    setTimeout(() => {
        showNotification('Files uploaded successfully!', 'success');
        closeModalFunc();
        this.disabled = false;
        this.textContent = 'Submit';
        
        // Update submission status
        updateSubmissionStatus('Round 1 Submission', 'uploaded');
    }, 2000);
});

// Update submission status
function updateSubmissionStatus(submissionName, status) {
    const submissionCard = Array.from(document.querySelectorAll('.submission-card')).find(card => 
        card.querySelector('h3').textContent === submissionName
    );
    
    if (submissionCard) {
        const statusSpan = submissionCard.querySelector('.status');
        const actionsDiv = submissionCard.querySelector('.submission-actions');
        
        statusSpan.className = `status ${status}`;
        
        if (status === 'uploaded') {
            statusSpan.innerHTML = '<i class="fas fa-check-circle"></i> Uploaded';
            actionsDiv.innerHTML = `
                <button class="btn btn-secondary">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-primary">
                    <i class="fas fa-upload"></i> Update
                </button>
            `;
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification-item ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <h4>${getNotificationTitle(type)}</h4>
            <p>${message}</p>
            <span class="notification-time">Just now</span>
        </div>
    `;
    
    const notificationsList = document.querySelector('.notifications-list');
    notificationsList.insertBefore(notification, notificationsList.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationTitle(type) {
    const titles = {
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        info: 'Information'
    };
    return titles[type] || 'Information';
}

// Download functionality for uploaded submissions
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-secondary') && e.target.closest('.submission-actions')) {
        const submissionCard = e.target.closest('.submission-card');
        const submissionName = submissionCard.querySelector('h3').textContent;
        showNotification(`Downloading ${submissionName} files...`, 'info');
        
        // Simulate download
        setTimeout(() => {
            showNotification(`${submissionName} download completed`, 'success');
        }, 1500);
    }
});

// Update submission functionality
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-primary') && e.target.closest('.submission-actions') && 
        !e.target.closest('.upload-btn')) {
        const submissionCard = e.target.closest('.submission-card');
        const submissionName = submissionCard.querySelector('h3').textContent;
        
        // Open upload modal for update
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update modal title
        const modalTitle = document.querySelector('.modal-header h3');
        modalTitle.textContent = `Update ${submissionName}`;
    }
});

// Real-time updates simulation
setInterval(() => {
    // Simulate real-time score updates
    const scores = document.querySelectorAll('.score');
    scores.forEach(score => {
        const currentScore = parseFloat(score.textContent);
        const change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
        const newScore = Math.max(0, Math.min(100, currentScore + change));
        score.textContent = newScore.toFixed(1);
    });
}, 30000); // Update every 30 seconds

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (!this.disabled && !this.classList.contains('btn-disabled')) {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 1000);
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModalFunc();
    }
    
    // Ctrl/Cmd + U to open upload modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        if (!modal.classList.contains('active')) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
});

// Add some sample data updates for demonstration
setTimeout(() => {
    showNotification('New judge feedback available for your submission', 'info');
}, 10000);

setTimeout(() => {
    showNotification('Team ranking updated - you moved to #2 in AI/ML category!', 'success');
}, 20000); 