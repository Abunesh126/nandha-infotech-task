// Enhanced Instagram Forum JavaScript
class InstagramForum {
    constructor() {
        this.posts = new Map();
        this.currentUser = '@user_demo';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePosts();
        this.setupIntersectionObserver();
    }

    setupEventListeners() {
        // Heart button interactions
        document.querySelectorAll('.heart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLike(e));
        });

        // Comment button interactions
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCommentToggle(e));
        });

        // Share button interactions
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleShare(e));
        });

        // Bookmark button interactions
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBookmark(e));
        });

        // Comment input interactions
        document.querySelectorAll('.comment-input').forEach(input => {
            const postCard = input.closest('.post-card');
            const postBtn = postCard.querySelector('.post-comment-btn');

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    this.addComment(postCard, input.value.trim());
                    input.value = '';
                }
            });

            postBtn.addEventListener('click', () => {
                if (input.value.trim()) {
                    this.addComment(postCard, input.value.trim());
                    input.value = '';
                }
            });
        });

        // Modal interactions
        this.setupModalListeners();

        // Story interactions
        document.querySelectorAll('.story').forEach(story => {
            story.addEventListener('click', () => this.handleStoryClick(story));
        });

        // View comments interactions
        document.querySelectorAll('.view-comments-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadMoreComments(e));
        });

        // Options button
        document.querySelectorAll('.options-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showPostOptions(e));
        });
    }

    setupModalListeners() {
        // Image modal
        const imageModal = document.getElementById('imageModal');
        const shareModal = document.getElementById('shareModal');

        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                imageModal.style.display = 'none';
                shareModal.style.display = 'none';
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === imageModal) imageModal.style.display = 'none';
            if (e.target === shareModal) shareModal.style.display = 'none';
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImage();
        });

        // Share options
        document.querySelectorAll('.share-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareToPlatform(platform);
            });
        });
    }

    initializePosts() {
        document.querySelectorAll('.post-card').forEach(post => {
            const postId = post.dataset.postId;
            this.posts.set(postId, {
                id: postId,
                liked: false,
                bookmarked: false,
                likes: parseInt(post.querySelector('.likes-count').textContent),
                comments: []
            });
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }

    handleLike(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const postCard = btn.closest('.post-card');
        const postId = postCard.dataset.postId;
        const post = this.posts.get(postId);
        const icon = btn.querySelector('i');
        const likesElement = postCard.querySelector('.likes-count');

        // Toggle like state
        post.liked = !post.liked;

        if (post.liked) {
            icon.className = 'fas fa-heart';
            btn.classList.add('liked');
            post.likes++;
            this.animateHeart(btn);
            this.showToast('Post liked!', 'success');
        } else {
            icon.className = 'far fa-heart';
            btn.classList.remove('liked');
            post.likes--;
            this.showToast('Post unliked', 'info');
        }

        // Update likes count
        likesElement.textContent = `${post.likes} likes`;

        // Add animation
        btn.classList.add('animate-pulse');
        setTimeout(() => btn.classList.remove('animate-pulse'), 300);
    }

    handleCommentToggle(e) {
        e.preventDefault();
        const postCard = e.currentTarget.closest('.post-card');
        const commentInput = postCard.querySelector('.comment-input');

        // Focus on comment input
        commentInput.focus();
        commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    handleShare(e) {
        e.preventDefault();
        const postCard = e.currentTarget.closest('.post-card');
        const postId = postCard.dataset.postId;

        // Store current post for sharing
        this.currentSharingPost = postId;

        // Show share modal
        document.getElementById('shareModal').style.display = 'flex';
    }

    handleBookmark(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const postCard = btn.closest('.post-card');
        const postId = postCard.dataset.postId;
        const post = this.posts.get(postId);
        const icon = btn.querySelector('i');

        // Toggle bookmark state
        post.bookmarked = !post.bookmarked;

        if (post.bookmarked) {
            icon.className = 'fas fa-bookmark';
            btn.classList.add('bookmarked');
            this.showToast('Post saved!', 'success');
        } else {
            icon.className = 'far fa-bookmark';
            btn.classList.remove('bookmarked');
            this.showToast('Post unsaved', 'info');
        }

        // Add animation
        btn.classList.add('animate-pulse');
        setTimeout(() => btn.classList.remove('animate-pulse'), 300);
    }

    addComment(postCard, commentText) {
        const postId = postCard.dataset.postId;
        const post = this.posts.get(postId);
        const commentsContainer = postCard.querySelector('.recent-comments');

        // Create new comment
        const newComment = {
            id: Date.now(),
            user: this.currentUser,
            text: commentText,
            timestamp: new Date()
        };

        post.comments.push(newComment);

        // Create comment element
        const commentElement = document.createElement('div');
        commentElement.className = 'comment new-comment';
        commentElement.innerHTML = `
            <span class="comment-user">${newComment.user}</span>
            <span class="comment-text">${newComment.text}</span>
        `;

        // Add to DOM
        commentsContainer.appendChild(commentElement);

        // Animate new comment
        setTimeout(() => commentElement.classList.add('visible'), 100);

        this.showToast('Comment added!', 'success');

        // Scroll to new comment
        commentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    loadMoreComments(e) {
        const btn = e.currentTarget;
        const postCard = btn.closest('.post-card');

        // Simulate loading more comments
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        setTimeout(() => {
            btn.textContent = 'View all comments';
            this.showToast('All comments loaded!', 'info');
        }, 1000);
    }

    handleStoryClick(story) {
        const storyId = story.dataset.storyId;
        const ring = story.querySelector('.story-ring');

        // Mark story as viewed
        ring.classList.add('viewed');

        // Simulate story viewing
        this.showToast('Story viewed!', 'info');

        // In a real app, this would open a story viewer
        console.log(`Viewing story ${storyId}`);
    }

    showPostOptions(e) {
        e.preventDefault();
        const options = ['Report Post', 'Hide Post', 'Copy Link', 'Cancel'];

        // Simple options simulation
        const choice = options[Math.floor(Math.random() * options.length)];
        this.showToast(`Option selected: ${choice}`, 'info');
    }

    animateHeart(btn) {
        // Create floating heart animation
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '<i class="fas fa-heart"></i>';

        const rect = btn.getBoundingClientRect();
        heart.style.left = rect.left + rect.width / 2 + 'px';
        heart.style.top = rect.top + rect.height / 2 + 'px';

        document.body.appendChild(heart);

        // Remove after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 1000);
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('i');

        // Set message and icon based on type
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;

        switch (type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'fas fa-exclamation-circle';
                break;
            case 'info':
            default:
                toastIcon.className = 'fas fa-info-circle';
                break;
        }

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    shareToplatform(platform) {
        const postCard = document.querySelector(`[data-post-id="${this.currentSharingPost}"]`);
        const username = postCard.querySelector('.username').textContent;
        const caption = postCard.querySelector('.caption-text').textContent;
        const shareText = `Check out this post by ${username}: ${caption}`;

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
                break;
            case 'copy':
                navigator.clipboard.writeText(window.location.href + `#post-${this.currentSharingPost}`);
                this.showToast('Link copied to clipboard!', 'success');
                break;
        }

        // Close share modal
        document.getElementById('shareModal').style.display = 'none';

        if (platform !== 'copy') {
            this.showToast(`Shared to ${platform}!`, 'success');
        }
    }

    downloadImage() {
        const modalImage = document.getElementById('modalImage');
        const link = document.createElement('a');
        link.href = modalImage.src;
        link.download = 'instagram-image.jpg';
        link.click();

        this.showToast('Image downloaded!', 'success');
    }

    // Utility method to format time
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    }
}

// Global function for opening image modal (called from HTML)
function openImageModal(btn) {
    const img = btn.closest('.post-image').querySelector('img');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');

    modalImg.src = img.src;
    modal.style.display = 'flex';
}

// Initialize the Instagram Forum when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InstagramForum();

    // Add some CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-pulse {
            animation: pulse 0.3s ease-in-out;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .floating-heart {
            position: fixed;
            pointer-events: none;
            z-index: 1000;
            animation: floatHeart 1s ease-out forwards;
            color: #e91e63;
            font-size: 20px;
        }
        
        @keyframes floatHeart {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px) scale(1.5);
            }
        }
        
        .new-comment {
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        }
        
        .new-comment.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});
