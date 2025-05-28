// Global variables
let posts = [];
let currentUser = {
    name: "Nguyễn Công Phúc",
    avatar: "https://via.placeholder.com/40x40/4267B2/ffffff?text=PC",
    location: "Đông Hưng, Thái Bình",
    school: "HUMG",
    major: "Robot và AI",
    birthYear: 2005
};

// DOM Elements
const postInput = document.querySelector('.post-input');
const postsContainer = document.querySelector('.center-content');
const searchInput = document.querySelector('.search-bar input');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadInitialPosts();
    setupEventListeners();
    updateOnlineStatus();
    startAutoRefresh();
});

// Initialize application
function initializeApp() {
    console.log('PhucBook initialized!');
    showWelcomeMessage();
    updateUserStats();
}

// Show welcome message
function showWelcomeMessage() {
    if (localStorage.getItem('hasVisited') !== 'true') {
        setTimeout(() => {
            showNotification('Chào mừng bạn đến với PhucBook! 🎉');
            localStorage.setItem('hasVisited', 'true');
        }, 1000);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Post input click
    postInput.addEventListener('click', openCreatePostModal);
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Header navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Post actions
    document.addEventListener('click', handlePostActions);
    
    // Story creation
    document.querySelector('.create-story').addEventListener('click', createStory);
    
    // Infinite scroll
    window.addEventListener('scroll', handleInfiniteScroll);
    
    // Online status
    window.addEventListener('online', () => updateConnectionStatus(true));
    window.addEventListener('offline', () => updateConnectionStatus(false));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle post actions (like, comment, share)
function handlePostActions(event) {
    const target = event.target.closest('.post-action');
    if (!target) return;
    
    const action = target.textContent.trim().toLowerCase();
    const post = target.closest('.post');
    
    switch(action) {
        case 'thích':
            handleLike(post);
            break;
        case 'bình luận':
            handleComment(post);
            break;
        case 'chia sẻ':
            handleShare(post);
            break;
    }
}

// Handle like action
function handleLike(postElement) {
    const likeBtn = postElement.querySelector('.post-action');
    const likeIcon = likeBtn.querySelector('i');
    const statsElement = postElement.querySelector('.post-stats-left span');
    
    let currentLikes = parseInt(statsElement.textContent) || 0;
    
    if (likeIcon.classList.contains('far')) {
        // Like the post
        likeIcon.classList.remove('far');
        likeIcon.classList.add('fas');
        likeBtn.style.color = '#1877f2';
        statsElement.textContent = currentLikes + 1;
        
        // Add animation
        likeIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeIcon.style.transform = 'scale(1)';
        }, 200);
        
        showNotification('Bạn đã thích bài viết này! 👍');
    } else {
        // Unlike the post
        likeIcon.classList.remove('fas');
        likeIcon.classList.add('far');
        likeBtn.style.color = '#65676b';
        statsElement.textContent = Math.max(0, currentLikes - 1);
    }
}

// Handle comment action
function handleComment(postElement) {
    const commentSection = postElement.querySelector('.comments-section');
    
    if (commentSection) {
        commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
    } else {
        createCommentSection(postElement);
    }
}

// Create comment section
function createCommentSection(postElement) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <div class="comment-input-container">
            <img src="${currentUser.avatar}" alt="Your avatar" class="comment-avatar">
            <div class="comment-input-wrapper">
                <input type="text" placeholder="Viết bình luận..." class="comment-input">
                <button class="comment-submit">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
        <div class="comments-list"></div>
    `;
    
    postElement.appendChild(commentSection);
    
    // Setup comment submission
    const commentInput = commentSection.querySelector('.comment-input');
    const submitBtn = commentSection.querySelector('.comment-submit');
    
    const submitComment = () => {
        const text = commentInput.value.trim();
        if (text) {
            addComment(commentSection, text);
            commentInput.value = '';
        }
    };
    
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitComment();
    });
    
    submitBtn.addEventListener('click', submitComment);
    
    // Focus on input
    commentInput.focus();
}

// Add comment
function addComment(commentSection, text) {
    const commentsList = commentSection.querySelector('.comments-list');
    const comment = document.createElement('div');
    comment.className = 'comment';
    comment.innerHTML = `
        <img src="${currentUser.avatar}" alt="Avatar" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-bubble">
                <strong>${currentUser.name}</strong>
                <p>${text}</p>
            </div>
            <div class="comment-actions">
                <span class="comment-time">Vừa xong</span>
                <span class="comment-action">Thích</span>
                <span class="comment-action">Phản hồi</span>
            </div>
        </div>
    `;
    
    commentsList.appendChild(comment);
    
    // Update comment count
    const postStats = commentSection.parentElement.querySelector('.post-stats-right');
    const commentCount = postStats.querySelector('span');
    const currentCount = parseInt(commentCount.textContent.match(/\d+/)[0]) || 0;
    commentCount.textContent = `${currentCount + 1} bình luận`;
    
    // Animation
    comment.style.opacity = '0';
    comment.style.transform = 'translateY(10px)';
    setTimeout(() => {
        comment.style.opacity = '1';
        comment.style.transform = 'translateY(0)';
        comment.style.transition = 'all 0.3s ease';
    }, 10);
}

// Handle share action
function handleShare(postElement) {
    const shareModal = createShareModal();
    document.body.appendChild(shareModal);
    
    // Update share count
    const shareCount = postElement.querySelector('.post-stats-right span:last-child');
    const currentShares = parseInt(shareCount.textContent.match(/\d+/)[0]) || 0;
    shareCount.textContent = `${currentShares + 1} chia sẻ`;
    
    showNotification('Đã chia sẻ bài viết! 📤');
}

// Create share modal
function createShareModal() {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chia sẻ bài viết</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="share-options">
                    <div class="share-option" data-platform="facebook">
                        <i class="fab fa-facebook"></i>
                        <span>Facebook</span>
                    </div>
                    <div class="share-option" data-platform="messenger">
                        <i class="fab fa-facebook-messenger"></i>
                        <span>Messenger</span>
                    </div>
                    <div class="share-option" data-platform="zalo">
                        <i class="fas fa-comment"></i>
                        <span>Zalo</span>
                    </div>
                    <div class="share-option" data-platform="copy">
                        <i class="fas fa-link"></i>
                        <span>Sao chép liên kết</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Close modal events
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) {
            modal.remove();
        }
    });
    
    // Share options
    modal.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', () => {
            const platform = option.dataset.platform;
            handleShareToPlatform(platform);
            modal.remove();
        });
    });
    
    return modal;
}

// Handle share to platform
function handleShareToPlatform(platform) {
    const url = window.location.href;
    const text = 'Xem bài viết này trên PhucBook!';
    
    switch(platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            break;
        case 'copy':
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Đã sao chép liên kết! 📋');
            });
            break;
        default:
            showNotification(`Chia sẻ qua ${platform}! 📱`);
    }
}

// Handle navigation
function handleNavigation(event) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    event.currentTarget.classList.add('active');
    
    // Simple navigation simulation
    const icons = ['fa-home', 'fa-users', 'fa-tv', 'fa-store', 'fa-gamepad'];
    const pages = ['Trang chủ', 'Bạn bè', 'Watch', 'Marketplace', 'Gaming'];
    
    const iconClass = event.currentTarget.querySelector('i').className;
    const pageIndex = icons.findIndex(icon => iconClass.includes(icon.split('-')[1]));
    
    if (pageIndex !== -1) {
        showNotification(`Đang tải ${pages[pageIndex]}... 🔄`);
        
        // Simulate page loading
        setTimeout(() => {
            showNotification(`Chào mừng đến ${pages[pageIndex]}! ✨`);
        }, 1000);
    }
}

// Handle search
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (query.length > 2) {
        // Simulate search results
        const searchResults = [
            'Robot và AI',
            'HUMG University',
            'Cầu lông',
            'Đá bóng',
            'Cờ vua',
            'Công nghệ',
            'Thái Bình',
            'Sinh viên'
        ];
        
        const matches = searchResults.filter(item => 
            item.toLowerCase().includes(query)
        );
        
        if (matches.length > 0) {
            showSearchResults(matches);
        }
    } else {
        hideSearchResults();
    }
}

// Show search results
function showSearchResults(results) {
    let dropdown = document.querySelector('.search-dropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        document.querySelector('.search-bar').appendChild(dropdown);
    }
    
    dropdown.innerHTML = results.map(result => 
        `<div class="search-result-item">
            <i class="fas fa-search"></i>
            <span>${result}</span>
        </div>`
    ).join('');
    
    dropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            searchInput.value = item.querySelector('span').textContent;
            hideSearchResults();
            showNotification(`Tìm kiếm: ${item.querySelector('span').textContent} 🔍`);
        });
    });
}

// Hide search results
function hideSearchResults() {
    const dropdown = document.querySelector('.search-dropdown');
    if (dropdown) {
        dropdown.remove();
    }
}

// Open create post modal
function openCreatePostModal() {
    const modal = createPostModal();
    document.body.appendChild(modal);
}

// Create post modal
function createPostModal() {
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content create-post-modal">
                <div class="modal-header">
                    <h3>Tạo bài viết</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="post-creator-info">
                        <img src="${currentUser.avatar}" alt="Avatar">
                        <div>
                            <strong>${currentUser.name}</strong>
                            <div class="privacy-selector">
                                <i class="fas fa-globe-americas"></i>
                                <span>Công khai</span>
                            </div>
                        </div>
                    </div>
                    <textarea placeholder="${currentUser.name} ơi, bạn đang nghĩ gì thế?" class="post-textarea"></textarea>
                    <div class="post-media-preview"></div>
                    <div class="post-options">
                        <div class="post-option" data-type="photo">
                            <i class="fas fa-images"></i>
                            <span>Ảnh/video</span>
                        </div>
                        <div class="post-option" data-type="feeling">
                            <i class="fas fa-smile"></i>
                            <span>Cảm xúc</span>
                        </div>
                        <div class="post-option" data-type="location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Vị trí</span>
                        </div>
                        <div class="post-option" data-type="tag">
                            <i class="fas fa-user-tag"></i>
                            <span>Gắn thẻ</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="post-submit-btn" disabled>Đăng</button>
                </div>
            </div>
        </div>
    `;
    
    const textarea = modal.querySelector('.post-textarea');
    const submitBtn = modal.querySelector('.post-submit-btn');
    
    // Enable/disable submit button
    textarea.addEventListener('input', () => {
        submitBtn.disabled = textarea.value.trim() === '';
    });
    
    // Submit post
    submitBtn.addEventListener('click', () => {
        const content = textarea.value.trim();
        if (content) {
            createNewPost(content);
            modal.remove();
            showNotification('Đã đăng bài viết! 🎉');
        }
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) {
            modal.remove();
        }
    });
    
    // Focus textarea
    setTimeout(() => {
        textarea.focus();
    }, 100);
    
    return modal;
}

// Create new post
function createNewPost(content) {
    const post = {
        id: Date.now(),
        author: currentUser.name,
        avatar: currentUser.avatar,
        content: content,
        time: 'Vừa xong',
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: Date.now()
    };
    
    posts.unshift(post);
    addPostToDOM(post, true);
}

// Add post to DOM
function addPostToDOM(post, isNew = false) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    if (isNew) {
        postElement.classList.add('new-post');
    }
    
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${post.avatar}" alt="Profile" class="profile-pic">
            <div class="post-info">
                <h4>${post.author}</h4>
                <span>${post.time} · <i class="fas fa-globe-americas"></i></span>
            </div>
            <div class="post-menu">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="post-stats">
            <div class="post-stats-left">
                <div class="reactions">
                    <span class="reaction like">👍</span>
                    <span class="reaction love">❤️</span>
                </div>
                <span>${post.likes}</span>
            </div>
            <div class="post-stats-right">
                <span>${post.comments} bình luận</span>
                <span>${post.shares} chia sẻ</span>
            </div>
        </div>
        <div class="post-actions">
            <div class="post-action">
                <i class="far fa-thumbs-up"></i>
                <span>Thích</span>
            </div>
            <div class="post-action">
                <i class="far fa-comment"></i>
                <span>Bình luận</span>
            </div>
            <div class="post-action">
                <i class="far fa-share"></i>
                <span>Chia sẻ</span>
            </div>
        </div>
    `;
    
    const createPostElement = document.querySelector('.create-post');
    createPostElement.parentNode.insertBefore(postElement, createPostElement.nextSibling);
    
    if (isNew) {
        // Animation for new post
        postElement.style.opacity = '0';
        postElement.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            postElement.style.opacity = '1';
            postElement.style.transform = 'translateY(0)';
            postElement.style.transition = 'all 0.5s ease';
        }, 10);
    }
}

// Create story
function createStory() {
    const storyModal = createStoryModal();
    document.body.appendChild(storyModal);
}

// Create story modal
function createStoryModal() {
    const modal = document.createElement('div');
    modal.className = 'story-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content story-modal-content">
                <div class="modal-header">
                    <h3>Tạo tin</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="story-options">
                    <div class="story-option" data-type="photo">
                        <i class="fas fa-images"></i>
                        <h4>Tạo tin ảnh</h4>
                        <p>Chia sẻ ảnh hoặc tạo thiết kế đầy màu sắc</p>
                    </div>
                    <div class="story-option" data-type="text">
                        <i class="fas fa-font"></i>
                        <h4>Tạo tin văn bản</h4>
                        <p>Chia sẻ một cập nhật nhanh bằng văn bản và màu sắc</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    // Story options
    modal.querySelectorAll('.story-option').forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            showNotification(`Tạo tin ${type === 'photo' ? 'ảnh' : 'văn bản'}! 📸`);
            modal.remove();
        });
    });
    
    return modal;
}

// Load initial posts
function loadInitialPosts() {
    const initialPosts = [
        {
            id: 1,
            author: currentUser.name,
            avatar: currentUser.avatar,
            content: "Chúc mọi người một ngày tốt lành! Hôm nay mình sẽ tiếp tục nghiên cứu về machine learning. Ai có tài liệu hay thì chia sẻ nhé! 🤖📚",
            time: "5 phút",
            likes: 42,
            comments: 8,
            shares: 3
        },
        {
            id: 2,
            author: "AI Study Group",
            avatar: "https://via.placeholder.com/40x40/42b883/ffffff?text=AI",
            content: "Workshop về Deep Learning sẽ diễn ra vào cuối tuần này tại HUMG. Đăng ký ngay để không bỏ lỡ cơ hội học hỏi nhé! 🧠⚡",
            time: "1 giờ",
            likes: 78,
            comments: 15,
            shares: 12
        }
    ];
    
    initialPosts.forEach(post => {
        addPostToDOM(post);
    });
}

// Update online status
function updateOnlineStatus() {
    setInterval(() => {
        const contacts = document.querySelectorAll('.contact');
        contacts.forEach(contact => {
            const indicator = contact.querySelector('.online-indicator');
            if (indicator && Math.random() > 0.8) {
                indicator.classList.toggle('offline');
            }
        });
    }, 30000); // Update every 30 seconds
}

// Update connection status
function updateConnectionStatus(isOnline) {
    const message = isOnline ? 'Đã kết nối lại! 🟢' : 'Mất kết nối internet! 🔴';
    showNotification(message);
}

// Handle infinite scroll
function handleInfiniteScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        loadMorePosts();
    }
}

// Load more posts
function loadMorePosts() {
    const morePosts = [
        "Hôm nay đã hoàn thành project robot mini! Cảm ơn team đã support 🤖✨",
        "Trận cầu lông chiều nay thật sôi động! Ai muốn tham gia tuần sau không? 🏸",
        "Đang nghiên cứu về Computer Vision, có ai cùng sở thích không nhỉ? 👁️‍🗨️",
        "Weekend coding session với playlist nhạc chill 🎵💻",
        "Chia sẻ một số tips học AI cho newbie trong group nhé! 📝"
    ];
    
    const randomPost = morePosts[Math.floor(Math.random() * morePosts.length)];
    const newPost = {
        id: Date.now(),
        author: Math.random() > 0.5 ? currentUser.name : "Bạn bè HUMG",
        avatar: Math.random() > 0.5 ? currentUser.avatar : "https://via.placeholder.com/40x40/ff6b6b/ffffff?text=BF",
        content: randomPost,
        time: `${Math.floor(Math.random() * 24)} giờ`,
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10)
    };
    
    addPostToDOM(newPost);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: type === 'error' ? '#f44336' : '#1877f2',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        zIndex: '9999',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Hide notification
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInput.focus();
    }
    
    // Ctrl/Cmd + Enter to create post
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        openCreatePostModal();
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.parentElement.remove());
    }
}

// Update user stats
function updateUserStats() {
    const age = new Date().getFullYear() - currentUser.birthYear;
    console.log(`${currentUser.name} - ${age} tuổi - ${currentUser.major} tại ${currentUser.school}`);
}

// Start auto refresh
function startAutoRefresh() {
    setInterval(() => {
        if (Math.random() > 0.9) { // 10% chance every minute
            const activities = [
                "Có thông báo mới từ Robot Club 🤖",
                "Ai đó đã thích bài viết của bạn ❤️",
                "Bạn có tin nhắn mới 💬",
                "Sự kiện AI Workshop sắp diễn ra 📅"
            ];
            
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            showNotification(randomActivity);
        }
    }, 60000); // Check every minute
}

// Export functions for external use
window.PhucBook = {
    showNotification,
    createNewPost,
    updateUserStats,
    currentUser,
    loadMorePosts,
    handleLike,
    openCreatePostModal
};

// Additional CSS for modals and animations
const additionalStyles = `
/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(5px);
}

.modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e6ea;
}

.modal-header h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1c1e21;
}

.modal-close {
    background: #e4e6ea;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    color: #65676b;
    transition: background-color 0.2s;
}

.modal-close:hover {
    background-color: #d8dadf;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #e4e6ea;
    display: flex;
    justify-content: flex-end;
}

/* Create Post Modal */
.create-post-modal {
    max-width: 500px;
}

.post-creator-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.post-creator-info img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.privacy-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #65676b;
    font-size: 13px;
    margin-top: 4px;
}

.post-textarea {
    width: 100%;
    min-height: 120px;
    border: none;
    outline: none;
    font-size: 24px;
    font-family: inherit;
    resize: none;
    margin-bottom: 16px;
    color: #1c1e21;
}

.post-textarea::placeholder {
    color: #8a8d91;
}

.post-media-preview {
    margin-bottom: 16px;
    min-height: 0;
}

.post-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid #e4e6ea;
    border-radius: 8px;
}

.post-options .post-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 15px;
    font-weight: 500;
    color: #65676b;
}

.post-options .post-option:hover {
    background-color: #f0f2f5;
}

.post-options .post-option i {
    font-size: 20px;
}

.post-submit-btn {
    background-color: #1877f2;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}

.post-submit-btn:hover:not(:disabled) {
    background-color: #166fe5;
}

.post-submit-btn:disabled {
    background-color: #e4e6ea;
    color: #bcc0c4;
    cursor: not-allowed;
}

/* Share Modal */
.share-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 20px;
}

.share-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
    border: 1px solid #e4e6ea;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
}

.share-option:hover {
    background-color: #f0f2f5;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.share-option i {
    font-size: 24px;
    color: #1877f2;
}

.share-option span {
    font-weight: 500;
    color: #1c1e21;
}

/* Story Modal */
.story-modal-content {
    max-width: 400px;
}

.story-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
}

.story-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid #e4e6ea;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.story-option:hover {
    background-color: #f0f2f5;
    border-color: #1877f2;
}

.story-option i {
    font-size: 24px;
    color: #1877f2;
    width: 40px;
    text-align: center;
}

.story-option h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #1c1e21;
}

.story-option p {
    margin: 0;
    font-size: 13px;
    color: #65676b;
}

/* Comments Section */
.comments-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e4e6ea;
}

.comment-input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

.comment-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f0f2f5;
    border-radius: 20px;
    padding: 8px 12px;
}

.comment-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #1c1e21;
}

.comment-input::placeholder {
    color: #65676b;
}

.comment-submit {
    background: none;
    border: none;
    color: #1877f2;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.comment-submit:hover {
    background-color: rgba(24, 119, 242, 0.1);
}

.comment {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.comment-content {
    flex: 1;
}

.comment-bubble {
    background-color: #f0f2f5;
    border-radius: 16px;
    padding: 8px 12px;
    margin-bottom: 4px;
}

.comment-bubble strong {
    font-size: 13px;
    color: #1c1e21;
}

.comment-bubble p {
    margin: 2px 0 0 0;
    font-size: 14px;
    color: #1c1e21;
}

.comment-actions {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #65676b;
    font-weight: 600;
}

.comment-action {
    cursor: pointer;
    transition: color 0.2s;
}

.comment-action:hover {
    color: #1c1e21;
}

.comment-time {
    font-weight: 400;
}

/* Search Dropdown */
.search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    margin-top: 4px;
    overflow: hidden;
}

.search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.search-result-item:hover {
    background-color: #f0f2f5;
}

.search-result-item i {
    color: #65676b;
    width: 16px;
}

.search-result-item span {
    font-size: 15px;
    color: #1c1e21;
}

/* Notification Styles */
.notification {
    animation: notificationSlide 0.3s ease-out;
}

@keyframes notificationSlide {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* New Post Animation */
.new-post {
    animation: newPostSlide 0.5s ease-out;
}

@keyframes newPostSlide {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Loading States */
.loading-posts {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    color: #65676b;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e4e6ea;
    border-top: 3px solid #1877f2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 12px;
}

/* Responsive Modal Styles */
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 20px;
        max-height: calc(100vh - 40px);
    }
    
    .post-textarea {
        font-size: 18px;
    }
    
    .share-options {
        grid-template-columns: 1fr;
    }
    
    .story-options {
        padding: 16px;
    }
}

/* Dark Mode for Modals */
@media (prefers-color-scheme: dark) {
    .modal-overlay {
        background-color: rgba(0, 0, 0, 0.8);
    }
    
    .modal-content {
        background: #242526;
        color: #e4e6ea;
    }
    
    .modal-header {
        border-bottom-color: #3a3b3c;
    }
    
    .modal-footer {
        border-top-color: #3a3b3c;
    }
    
    .modal-close {
        background: #3a3b3c;
        color: #e4e6ea;
    }
    
    .modal-close:hover {
        background: #4e4f50;
    }
    
    .post-textarea {
        color: #e4e6ea;
        background: transparent;
    }
    
    .post-textarea::placeholder {
        color: #b0b3b8;
    }
    
    .post-options {
        border-color: #3a3b3c;
        background: #18191a;
    }
    
    .post-options .post-option:hover {
        background-color: #3a3b3c;
    }
    
    .share-option, .story-option {
        border-color: #3a3b3c;
        background: #18191a;
    }
    
    .share-option:hover, .story-option:hover {
        background-color: #3a3b3c;
    }
    
    .comment-input-wrapper {
        background-color: #3a3b3c;
    }
    
    .comment-bubble {
        background-color: #3a3b3c;
    }
    
    .search-dropdown {
        background: #242526;
        border: 1px solid #3a3b3c;
    }
    
    .search-result-item:hover {
        background-color: #3a3b3c;
    }
}

/* Accessibility Improvements */
.modal-content:focus {
    outline: 2px solid #1877f2;
    outline-offset: 2px;
}

.post-action:focus,
.sidebar-item:focus,
.contact:focus {
    outline: 2px solid #1877f2;
    outline-offset: 2px;
    border-radius: 4px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
    .post, .create-post {
        border: 2px solid #000;
    }
    
    .modal-content {
        border: 3px solid #000;
    }
    
    .post-action:hover {
        background-color: #000;
        color: #fff;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Advanced features
class PhucBookAdvanced {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupAdvancedFeatures();
        this.setupPerformanceOptimizations();
        this.setupAnalytics();
    }
    
    setupAdvancedFeatures() {
        // Real-time typing indicator
        this.setupTypingIndicator();
        
        // Auto-save drafts
        this.setupAutoSave();
        
        // Image upload and preview
        this.setupImageUpload();
        
        // Emoji picker
        this.setupEmojiPicker();
        
        // Mention system
        this.setupMentionSystem();
    }
    
    setupTypingIndicator() {
        let typingTimer;
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span>Đang soạn tin...</span>';
        typingIndicator.style.display = 'none';
        
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('comment-input')) {
                clearTimeout(typingTimer);
                typingIndicator.style.display = 'block';
                
                const commentSection = e.target.closest('.comments-section');
                if (commentSection && !commentSection.querySelector('.typing-indicator')) {
                    commentSection.appendChild(typingIndicator.cloneNode(true));
                }
                
                typingTimer = setTimeout(() => {
                    const indicator = commentSection?.querySelector('.typing-indicator');
                    if (indicator) {
                        indicator.style.display = 'none';
                    }
                }, 1000);
            }
        });
    }
    
    setupAutoSave() {
        let autoSaveTimer;
        
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('post-textarea')) {
                clearTimeout(autoSaveTimer);
                
                autoSaveTimer = setTimeout(() => {
                    const content = e.target.value;
                    if (content.trim()) {
                        localStorage.setItem('phucbook_draft', content);
                        this.showAutoSaveIndicator();
                    }
                }, 2000);
            }
        });
        
        // Restore draft on page load
        window.addEventListener('load', () => {
            const draft = localStorage.getItem('phucbook_draft');
            if (draft) {
                const shouldRestore = confirm('Bạn có muốn khôi phục bản nháp đã lưu không?');
                if (shouldRestore) {
                    // Will be used when post modal opens
                    window.phucbookDraft = draft;
                }
            }
        });
    }
    
    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = '✓ Đã lưu nháp';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #42b883;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => indicator.style.opacity = '1', 10);
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
    
    setupImageUpload() {
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.accept?.includes('image')) {
                const files = Array.from(e.target.files);
                files.forEach(file => this.previewImage(file, e.target));
            }
        });
        
        // Drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('post-textarea')) {
                e.target.style.backgroundColor = '#f0f8ff';
            }
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('post-textarea')) {
                e.target.style.backgroundColor = '';
                const files = Array.from(e.dataTransfer.files);
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        this.previewImage(file, e.target);
                    }
                });
            }
        });
    }
    
    previewImage(file, target) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; border-radius: 8px; margin: 8px 0;">
                <button class="remove-image" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
            `;
            preview.style.position = 'relative';
            
            const modal = target.closest('.modal-content');
            const previewContainer = modal?.querySelector('.post-media-preview');
            if (previewContainer) {
                previewContainer.appendChild(preview);
            }
            
            preview.querySelector('.remove-image').addEventListener('click', () => {
                preview.remove();
            });
        };
        reader.readAsDataURL(file);
    }
    
    setupEmojiPicker() {
        const emojis = ['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '❤️', '🎉', '🔥', '💯', '🤖', '📚', '🏸', '⚽', '♟️', '🎵'];
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.post-option[data-type="feeling"]')) {
                this.showEmojiPicker(e.target);
            }
        });
    }
    
    showEmojiPicker(target) {
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = `
            <div class="emoji-grid">
                ${['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '❤️', '🎉', '🔥', '💯', '🤖', '📚', '🏸', '⚽', '♟️', '🎵'].map(emoji => 
                    `<span class="emoji-item">${emoji}</span>`
                ).join('')}
            </div>
        `;
        
        picker.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #e4e6ea;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 1000;
        `;
        
        const grid = picker.querySelector('.emoji-grid');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
        `;
        
        picker.querySelectorAll('.emoji-item').forEach(item => {
            item.style.cssText = `
                padding: 8px;
                cursor: pointer;
                border-radius: 4px;
                text-align: center;
                font-size: 20px;
                transition: background-color 0.2s;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f0f2f5';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
            
            item.addEventListener('click', () => {
                const textarea = document.querySelector('.post-textarea');
                if (textarea) {
                    textarea.value += ` ${item.textContent}`;
                    textarea.focus();
                }
                picker.remove();
            });
        });
        
        target.appendChild(picker);
        
        // Close picker when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeEmojiPicker(e) {
                if (!picker.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', closeEmojiPicker);
                }
            });
        }, 10);
    }
    
    setupMentionSystem() {
        const users = [
            'Robot Club HUMG',
            'AI Study Group',
            'Badminton Team',
            'Football Club',
            'Chess Society',
            'Tech Community'
        ];
        
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('post-textarea') || e.target.classList.contains('comment-input')) {
                const text = e.target.value;
                const lastAtIndex = text.lastIndexOf('@');
                
                if (lastAtIndex !== -1) {
                    const query = text.substring(lastAtIndex + 1);
                    if (query.length > 0) {
                        const matches = users.filter(user => 
                            user.toLowerCase().includes(query.toLowerCase())
                        );
                        
                        if (matches.length > 0) {
                            this.showMentionDropdown(e.target, matches, lastAtIndex);
                        }
                    }
                }
            }
        });
    }
    
    showMentionDropdown(input, matches, atIndex) {
        // Remove existing dropdown
        const existing = document.querySelector('.mention-dropdown');
        if (existing) existing.remove();
        
        const dropdown = document.createElement('div');
        dropdown.className = 'mention-dropdown';
        dropdown.innerHTML = matches.map(user => 
            `<div class="mention-item">${user}</div>`
        ).join('');
        
        dropdown.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #e4e6ea;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        dropdown.querySelectorAll('.mention-item').forEach(item => {
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
                border-bottom: 1px solid #f0f2f5;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f0f2f5';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
            
            item.addEventListener('click', () => {
                const currentValue = input.value;
                const beforeAt = currentValue.substring(0, atIndex);
                const afterQuery = currentValue.substring(input.selectionStart);
                
                input.value = `${beforeAt}@${item.textContent} ${afterQuery}`;
                input.focus();
                dropdown.remove();
            });
        });
        
        // Position dropdown
        const rect = input.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.width = `${rect.width}px`;
        
        document.body.appendChild(dropdown);
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMentionDropdown(e) {
                if (!dropdown.contains(e.target) && e.target !== input) {
                    dropdown.remove();
                    document.removeEventListener('click', closeMentionDropdown);
                }
            });
        }, 10);
    }
    
    setupPerformanceOptimizations() {
        // Lazy loading for images
        this.setupLazyLoading();
        
        // Virtual scrolling for large lists
        this.setupVirtualScrolling();
        
        // Debounced search
        this.setupDebouncedSearch();
    }
    
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    setupVirtualScrolling() {
        // Implementation for virtual scrolling would go here
        // This is a simplified version
        let visiblePosts = [];
        const POSTS_PER_PAGE = 10;
        
        const updateVisiblePosts = () => {
            const scrollTop = window.pageYOffset;
            const viewportHeight = window.innerHeight;
            
            // Calculate which posts should be visible
            // This is a basic implementation
        };
        
        window.addEventListener('scroll', this.throttle(updateVisiblePosts, 100));
    }
    
    setupDebouncedSearch() {
        const originalHandleSearch = window.handleSearch;
        window.handleSearch = this.debounce(originalHandleSearch, 300);
    }
    
    setupAnalytics() {
        // Track user interactions
        this.trackPageView();
        this.trackUserEngagement();
        this.trackPerformanceMetrics();
    }
    
    trackPageView() {
        console.log('📊 Page view tracked:', {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            user: currentUser.name
        });
    }
    
    trackUserEngagement() {
        let engagementData = {
            clicks: 0,
            scrollDepth: 0,
            timeOnPage: Date.now()
        };
        
        document.addEventListener('click', () => {
            engagementData.clicks++;
        });
        
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            engagementData.scrollDepth = Math.max(engagementData.scrollDepth, scrollPercent);
        });
        
        window.addEventListener('beforeunload', () => {
            engagementData.timeOnPage = Date.now() - engagementData.timeOnPage;
            console.log('📊 Engagement data:', engagementData);
        });
    }
    
    trackPerformanceMetrics() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const paintMetrics = performance.getEntriesByType('paint');
                
                const metrics = {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    firstPaint: paintMetrics.find(entry => entry.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paintMetrics.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                    timeToInteractive: perfData.domInteractive - perfData.navigationStart
                };
                
                console.log('⚡ Performance metrics:', metrics);
                
                // Send to analytics service (mock)
                this.sendAnalytics('performance', metrics);
            }, 1000);
        });
    }
    
    sendAnalytics(type, data) {
        // Mock analytics service
        console.log(`📈 Analytics [${type}]:`, data);
        
        // In a real application, you would send this to your analytics service
        // fetch('/api/analytics', {
        // method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ type, data, timestamp: Date.now() })
        // });
    }
    
    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize advanced features
const phucBookAdvanced = new PhucBookAdvanced();

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔧 SW registered: ', registration);
                showNotification('Ứng dụng đã sẵn sàng hoạt động offline! 📱');
            })
            .catch(registrationError => {
                console.log('🔧 SW registration failed: ', registrationError);
            });
    });
}

// Progressive Web App features
class PWAManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupInstallPrompt();
        this.setupPushNotifications();
        this.setupBackgroundSync();
    }
    
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            this.showInstallButton(deferredPrompt);
        });
        
        window.addEventListener('appinstalled', () => {
            showNotification('Ứng dụng đã được cài đặt thành công! 🎉');
            console.log('📱 PWA was installed');
        });
    }
    
    showInstallButton(deferredPrompt) {
        const installButton = document.createElement('div');
        installButton.className = 'install-app-button';
        installButton.innerHTML = `
            <div class="install-prompt">
                <div class="install-content">
                    <i class="fas fa-download"></i>
                    <div>
                        <strong>Cài đặt PhucBook</strong>
                        <p>Cài đặt ứng dụng để trải nghiệm tốt hơn!</p>
                    </div>
                    <button class="install-btn">Cài đặt</button>
                    <button class="close-install">×</button>
                </div>
            </div>
        `;
        
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 9999;
            animation: slideInUp 0.3s ease-out;
        `;
        
        const installPromptStyle = `
            .install-prompt {
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                padding: 16px;
                max-width: 320px;
                border: 1px solid #e4e6ea;
            }
            
            .install-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .install-content i {
                color: #1877f2;
                font-size: 24px;
            }
            
            .install-content strong {
                font-size: 16px;
                color: #1c1e21;
                display: block;
                margin-bottom: 4px;
            }
            
            .install-content p {
                font-size: 14px;
                color: #65676b;
                margin: 0;
            }
            
            .install-btn {
                background: #1877f2;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
                margin-left: auto;
            }
            
            .close-install {
                background: #e4e6ea;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                cursor: pointer;
                color: #65676b;
                font-size: 16px;
                margin-left: 8px;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(100px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        if (!document.querySelector('#install-prompt-styles')) {
            const style = document.createElement('style');
            style.id = 'install-prompt-styles';
            style.textContent = installPromptStyle;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(installButton);
        
        // Install button click
        installButton.querySelector('.install-btn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`👤 User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
                installButton.remove();
            }
        });
        
        // Close button click
        installButton.querySelector('.close-install').addEventListener('click', () => {
            installButton.remove();
        });
        
        // Auto hide after 10 seconds
        setTimeout(() => {
            if (installButton.parentNode) {
                installButton.remove();
            }
        }, 10000);
    }
    
    setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Request permission
            this.requestNotificationPermission();
        }
    }
    
    async requestNotificationPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                showNotification('Đã bật thông báo! 🔔');
                this.scheduleNotifications();
            }
        } else if (Notification.permission === 'granted') {
            this.scheduleNotifications();
        }
    }
    
    scheduleNotifications() {
        // Schedule daily engagement notification
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        
        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showPushNotification(
                'Chào buổi sáng! 🌅',
                'Xem có gì mới trên PhucBook không nhỉ?',
                '/notifications'
            );
        }, timeUntilTomorrow);
    }
    
    showPushNotification(title, body, url) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png',
                tag: 'phucbook-daily',
                data: { url }
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
                if (url) {
                    window.location.href = url;
                }
            };
        }
    }
    
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Register for background sync
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('background-sync');
            }).catch(err => {
                console.log('Background Sync registration failed:', err);
            });
        }
    }
}

// Initialize PWA features
const pwaManager = new PWAManager();

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('phucbook-theme') || 'light';
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
        this.setupSystemThemeDetection();
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('phucbook-theme', theme);
    }
    
    createThemeToggle() {
        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = `
            <button class="theme-btn" title="Chuyển đổi chế độ tối/sáng">
                <i class="fas fa-moon"></i>
                <i class="fas fa-sun"></i>
            </button>
        `;
        
        const themeStyles = `
            .theme-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .theme-btn {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                border: none;
                background: #1877f2;
                color: white;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .theme-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
            }
            
            .theme-btn i {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 20px;
                transition: opacity 0.3s ease;
            }
            
            .theme-btn .fa-moon {
                opacity: ${this.currentTheme === 'light' ? 1 : 0};
            }
            
            .theme-btn .fa-sun {
                opacity: ${this.currentTheme === 'dark' ? 1 : 0};
            }
            
            [data-theme="dark"] .theme-btn .fa-moon {
                opacity: 0;
            }
            
            [data-theme="dark"] .theme-btn .fa-sun {
                opacity: 1;
            }
        `;
        
        if (!document.querySelector('#theme-toggle-styles')) {
            const style = document.createElement('style');
            style.id = 'theme-toggle-styles';
            style.textContent = themeStyles;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(themeToggle);
        
        themeToggle.querySelector('.theme-btn').addEventListener('click', () => {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
            this.updateThemeToggle();
            showNotification(`Đã chuyển sang chế độ ${newTheme === 'dark' ? 'tối' : 'sáng'}! ${newTheme === 'dark' ? '🌙' : '☀️'}`);
        });
    }
    
    updateThemeToggle() {
        const moonIcon = document.querySelector('.theme-btn .fa-moon');
        const sunIcon = document.querySelector('.theme-btn .fa-sun');
        
        if (this.currentTheme === 'dark') {
            moonIcon.style.opacity = '0';
            sunIcon.style.opacity = '1';
        } else {
            moonIcon.style.opacity = '1';
            sunIcon.style.opacity = '0';
        }
    }
    
    setupSystemThemeDetection() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addListener((e) => {
                if (!localStorage.getItem('phucbook-theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                    this.updateThemeToggle();
                }
            });
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Data Manager for local storage and sync
class DataManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupDataSync();
        this.setupLocalStorageManager();
        this.setupCacheManager();
    }
    
    setupDataSync() {
        // Sync user data when online
        window.addEventListener('online', () => {
            this.syncOfflineData();
        });
        
        // Save data when offline
        window.addEventListener('offline', () => {
            this.enableOfflineMode();
        });
    }
    
    syncOfflineData() {
        const offlineData = this.getOfflineData();
        if (offlineData.length > 0) {
            showNotification('Đang đồng bộ dữ liệu offline... 🔄');
            
            // Simulate API calls
            setTimeout(() => {
                offlineData.forEach(item => {
                    console.log('Syncing:', item);
                });
                this.clearOfflineData();
                showNotification('Đã đồng bộ xong dữ liệu! ✅');
            }, 2000);
        }
    }
    
    enableOfflineMode() {
        showNotification('Chế độ offline đã bật! Dữ liệu sẽ được lưu cục bộ. 📱');
    }
    
    saveOfflineData(type, data) {
        const existingData = this.getOfflineData();
        existingData.push({
            type,
            data,
            timestamp: Date.now()
        });
        localStorage.setItem('phucbook-offline-data', JSON.stringify(existingData));
    }
    
    getOfflineData() {
        const data = localStorage.getItem('phucbook-offline-data');
        return data ? JSON.parse(data) : [];
    }
    
    clearOfflineData() {
        localStorage.removeItem('phucbook-offline-data');
    }
    
    setupLocalStorageManager() {
        // Clear old data periodically
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000); // Daily cleanup
    }
    
    cleanupOldData() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // Clean up old drafts
        const drafts = JSON.parse(localStorage.getItem('phucbook-drafts') || '{}');
        Object.keys(drafts).forEach(key => {
            if (drafts[key].timestamp < oneWeekAgo) {
                delete drafts[key];
            }
        });
        localStorage.setItem('phucbook-drafts', JSON.stringify(drafts));
        
        console.log('🧹 Cleaned up old data');
    }
    
    setupCacheManager() {
        // Implement cache management for images and API responses
        this.imageCache = new Map();
        this.apiCache = new Map();
    }
    
    cacheImage(url, blob) {
        this.imageCache.set(url, {
            blob,
            timestamp: Date.now()
        });
        
        // Cleanup old cached images
        if (this.imageCache.size > 100) {
            const oldest = Array.from(this.imageCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
            this.imageCache.delete(oldest[0]);
        }
    }
    
    getCachedImage(url) {
        return this.imageCache.get(url)?.blob;
    }
}

// Initialize data manager
const dataManager = new DataManager();

console.log('🚀 PhucBook fully loaded with advanced features!');
console.log('📱 PWA features enabled');
console.log('🌙 Theme switching available');
console.log('💾 Data management active');
console.log('🔔 Push notifications ready');

// Export enhanced PhucBook object
window.PhucBook = {
    ...window.PhucBook,
    advanced: phucBookAdvanced,
    pwa: pwaManager,
    theme: themeManager,
    data: dataManager,
    version: '2.0.0'
};

// Final initialization
document.addEventListener('DOMContentLoaded', () => {
    // Show loading complete message
    setTimeout(() => {
        showNotification('PhucBook đã sẵn sàng! Chúc bạn có những trải nghiệm tuyệt vời! 🎉');
    }, 1000);
    
    // Initialize user activity tracking
    let lastActivity = Date.now();
    let isActive = true;
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
            if (!isActive) {
                isActive = true;
                console.log('👤 User became active');
            }
        }, true);
    });
    
    // Check for inactivity
    setInterval(() => {
        if (Date.now() - lastActivity > 60000 && isActive) { // 1 minute
            isActive = false;
            console.log('😴 User became inactive');
        }
    }, 10000);
});
