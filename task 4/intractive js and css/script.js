/**
 * PhotoVault - Professional Photo Gallery Application
 * Modern, secure, and feature-rich photo gallery with authentication
 */

class PhotoVaultApp {
    constructor() {
        this.state = {
            isLoggedIn: false,
            currentUser: null,
            currentImageIndex: 0,
            isFullscreen: false,
            zoomLevel: 1,
            rotation: 0,
            slideshowInterval: null,
            loginAttempts: 0,
            viewMode: 'single', // 'single' or 'grid'
            favorites: new Set(),
            uploadProgress: 0
        };

        this.config = {
            maxLoginAttempts: 5,
            slideshowDelay: 4000,
            animationDuration: 300,
            toastDuration: 3000,
            validCredentials: [
                { username: 'admin', password: 'password' },
                { username: 'user@demo.com', password: 'demo123' },
                { username: 'photographer', password: 'gallery2025' }
            ],
            images: [
                {
                    id: 1,
                    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
                    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
                    alt: 'Mountain landscape at sunset',
                    title: 'Mountain Sunset',
                    uploadDate: '2025-09-01',
                    format: 'JPEG',
                    size: '1920 x 1080',
                    views: 247
                },
                {
                    id: 2,
                    src: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop',
                    thumb: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=150&h=150&fit=crop',
                    alt: 'Ocean waves crashing on rocks',
                    title: 'Ocean Waves',
                    uploadDate: '2025-09-02',
                    format: 'JPEG',
                    size: '1920 x 1280',
                    views: 189
                },
                {
                    id: 3,
                    src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop',
                    thumb: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=150&h=150&fit=crop',
                    alt: 'Forest path with sunlight',
                    title: 'Forest Path',
                    uploadDate: '2025-09-03',
                    format: 'JPEG',
                    size: '1600 x 1200',
                    views: 156
                },
                {
                    id: 4,
                    src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop',
                    thumb: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop',
                    alt: 'Desert landscape with dunes',
                    title: 'Desert Dunes',
                    uploadDate: '2025-08-30',
                    format: 'JPEG',
                    size: '2048 x 1365',
                    views: 203
                },
                {
                    id: 5,
                    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop',
                    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&h=150&fit=crop',
                    alt: 'Tropical beach paradise',
                    title: 'Tropical Beach',
                    uploadDate: '2025-08-28',
                    format: 'JPEG',
                    size: '1920 x 1080',
                    views: 312
                }
            ]
        };

        this.elements = {};
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            await this.waitForDOM();
            this.cacheElements();
            this.bindEvents();
            this.checkStoredCredentials();
            this.initializeAnimations();
            this.preloadImages();

            console.log('PhotoVault initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PhotoVault:', error);
            this.showError('Application failed to initialize. Please refresh the page.');
        }
    }

    /**
     * Wait for DOM to be fully loaded
     */
    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        const selectors = {
            // Login elements
            loginSection: '#loginSection',
            loginForm: '#loginForm',
            username: '#username',
            password: '#password',
            rememberMe: '#rememberMe',
            passwordToggle: '#passwordToggle',
            loginBtn: '#loginBtn',
            errorMessage: '#errorMessage',
            errorText: '#errorText',

            // Photo section elements
            photoSection: '#photoSection',
            userDisplayName: '#userDisplayName',
            logoutBtn: '#logoutBtn',
            uploadBtn: '#uploadBtn',

            // Gallery elements
            mainPhoto: '#mainPhoto',
            prevBtn: '#prevBtn',
            nextBtn: '#nextBtn',
            viewModeBtn: '#viewModeBtn',
            slideshowBtn: '#slideshowBtn',
            downloadBtn: '#downloadBtn',
            infoBtn: '#infoBtn',

            // Image info elements
            uploadDate: '#uploadDate',
            imageFormat: '#imageFormat',
            imageSize: '#imageSize',
            viewCount: '#viewCount',

            // Fullscreen elements
            fullscreenModal: '#fullscreenModal',
            fullscreenImage: '#fullscreenImage',
            fullscreenClose: '#fullscreenClose',
            zoomInBtn: '#zoomInBtn',
            zoomOutBtn: '#zoomOutBtn',
            rotateBtn: '#rotateBtn',
            downloadFullBtn: '#downloadFullBtn',

            // Toast and loading
            toast: '#toast',
            loadingOverlay: '#loadingOverlay',

            // Upload modal
            uploadModal: '#uploadModal',
            closeUpload: '#closeUpload',
            uploadZone: '#uploadZone',
            fileInput: '#fileInput',
            uploadProgress: '#uploadProgress'
        };

        Object.entries(selectors).forEach(([key, selector]) => {
            this.elements[key] = document.querySelector(selector);
        });

        // Cache thumbnail elements
        this.elements.thumbnails = document.querySelectorAll('.thumbnail');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Login events
        this.elements.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.passwordToggle?.addEventListener('click', () => this.togglePasswordVisibility());

        // Main navigation events
        this.elements.logoutBtn?.addEventListener('click', () => this.handleLogout());
        this.elements.uploadBtn?.addEventListener('click', () => this.openUploadModal());

        // Gallery navigation events
        this.elements.prevBtn?.addEventListener('click', () => this.navigateImage(-1));
        this.elements.nextBtn?.addEventListener('click', () => this.navigateImage(1));

        // Gallery control events
        this.elements.viewModeBtn?.addEventListener('click', () => this.toggleViewMode());
        this.elements.slideshowBtn?.addEventListener('click', () => this.toggleSlideshow());
        this.elements.downloadBtn?.addEventListener('click', () => this.downloadCurrentImage());
        this.elements.infoBtn?.addEventListener('click', () => this.showImageInfo());

        // Fullscreen events
        this.elements.fullscreenModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.fullscreenModal) {
                this.closeFullscreen();
            }
        });
        this.elements.fullscreenClose?.addEventListener('click', () => this.closeFullscreen());
        this.elements.zoomInBtn?.addEventListener('click', () => this.zoomIn());
        this.elements.zoomOutBtn?.addEventListener('click', () => this.zoomOut());
        this.elements.rotateBtn?.addEventListener('click', () => this.rotateImage());
        this.elements.downloadFullBtn?.addEventListener('click', () => this.downloadCurrentImage());

        // Thumbnail events
        this.elements.thumbnails?.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => this.selectImage(index));
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Upload modal events
        this.elements.closeUpload?.addEventListener('click', () => this.closeUploadModal());
        this.elements.uploadZone?.addEventListener('click', () => this.elements.fileInput?.click());
        this.elements.uploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.uploadZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.elements.uploadZone?.addEventListener('drop', (e) => this.handleDrop(e));
        this.elements.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

        // Fullscreen button in image overlay
        this.elements.mainPhoto?.parentElement?.querySelector('.fullscreen-btn')?.addEventListener('click', () => this.openFullscreen());

        // Favorite button
        this.elements.mainPhoto?.parentElement?.querySelector('.favorite-btn')?.addEventListener('click', () => this.toggleFavorite());

        // Window resize event
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Check for stored credentials and auto-login
     */
    checkStoredCredentials() {
        try {
            const rememberMe = localStorage.getItem('photoVault_rememberMe');
            const savedUser = localStorage.getItem('photoVault_user');

            if (rememberMe === 'true' && savedUser) {
                const userData = JSON.parse(savedUser);
                this.state.currentUser = userData;
                this.state.isLoggedIn = true;
                this.showPhotoSection();
            }
        } catch (error) {
            console.error('Failed to check stored credentials:', error);
            this.clearStoredCredentials();
        }
    }

    /**
     * Initialize animations and effects
     */
    initializeAnimations() {
        // Add entrance animations
        if (this.elements.loginSection) {
            this.elements.loginSection.classList.add('animate-entrance');
        }

        // Initialize intersection observer for lazy loading
        this.initLazyLoading();
    }

    /**
     * Initialize lazy loading for images
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Preload gallery images for better performance
     */
    async preloadImages() {
        try {
            const imagePromises = this.config.images.map(image => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error(`Failed to load ${image.src}`));
                    img.src = image.src;
                });
            });

            await Promise.allSettled(imagePromises);
            console.log('Images preloaded successfully');
        } catch (error) {
            console.warn('Some images failed to preload:', error);
        }
    }

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();

        const username = this.elements.username?.value?.trim();
        const password = this.elements.password?.value;
        const rememberMe = this.elements.rememberMe?.checked;

        // Validate inputs
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        // Check login attempts
        if (this.state.loginAttempts >= this.config.maxLoginAttempts) {
            this.showError('Too many failed attempts. Please try again later.');
            return;
        }

        // Show loading state
        this.setLoginLoading(true);

        try {
            // Simulate API delay
            await this.delay(1000);

            // Validate credentials
            const validUser = this.config.validCredentials.find(
                cred => (cred.username === username || cred.email === username) && cred.password === password
            );

            if (validUser) {
                // Successful login
                this.state.currentUser = {
                    username: validUser.username,
                    displayName: validUser.username.split('@')[0] || validUser.username,
                    loginTime: new Date().toISOString()
                };
                this.state.isLoggedIn = true;
                this.state.loginAttempts = 0;

                // Store credentials if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('photoVault_rememberMe', 'true');
                    localStorage.setItem('photoVault_user', JSON.stringify(this.state.currentUser));
                }

                this.showSuccess('Login successful! Welcome to PhotoVault');
                await this.delay(500);
                this.showPhotoSection();
            } else {
                // Failed login
                this.state.loginAttempts++;
                const remainingAttempts = this.config.maxLoginAttempts - this.state.loginAttempts;
                this.showError(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
                this.elements.loginForm?.classList.add('shake');
                setTimeout(() => this.elements.loginForm?.classList.remove('shake'), 600);
            }
        } catch (error) {
            this.showError('Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            this.setLoginLoading(false);
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.state.isLoggedIn = false;
            this.state.currentUser = null;
            this.clearStoredCredentials();
            this.stopSlideshow();
            this.closeFullscreen();
            this.showLoginSection();
            this.showSuccess('Logged out successfully');
        }
    }

    /**
     * Toggle password visibility
     */
    togglePasswordVisibility() {
        const passwordInput = this.elements.password;
        const toggleIcon = this.elements.passwordToggle?.querySelector('i');

        if (passwordInput && toggleIcon) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleIcon.className = isPassword ? 'far fa-eye-slash' : 'far fa-eye';
        }
    }

    /**
     * Navigate through images
     */
    navigateImage(direction) {
        const newIndex = this.state.currentImageIndex + direction;

        if (newIndex >= 0 && newIndex < this.config.images.length) {
            this.selectImage(newIndex);
        }
    }

    /**
     * Select specific image by index
     */
    selectImage(index) {
        if (index >= 0 && index < this.config.images.length) {
            this.state.currentImageIndex = index;
            this.updateMainImage();
            this.updateThumbnails();
            this.updateImageInfo();
            this.incrementViewCount(index);
        }
    }

    /**
     * Update main image display
     */
    updateMainImage() {
        const currentImage = this.config.images[this.state.currentImageIndex];
        if (this.elements.mainPhoto && currentImage) {
            this.elements.mainPhoto.src = currentImage.src;
            this.elements.mainPhoto.alt = currentImage.alt;
            this.elements.mainPhoto.style.opacity = '0';

            setTimeout(() => {
                this.elements.mainPhoto.style.opacity = '1';
            }, 150);
        }
    }

    /**
     * Update thumbnail selection
     */
    updateThumbnails() {
        this.elements.thumbnails?.forEach((thumbnail, index) => {
            thumbnail.classList.toggle('active', index === this.state.currentImageIndex);
        });
    }

    /**
     * Update image information display
     */
    updateImageInfo() {
        const currentImage = this.config.images[this.state.currentImageIndex];
        if (currentImage) {
            if (this.elements.uploadDate) this.elements.uploadDate.textContent = currentImage.uploadDate;
            if (this.elements.imageFormat) this.elements.imageFormat.textContent = currentImage.format;
            if (this.elements.imageSize) this.elements.imageSize.textContent = currentImage.size;
            if (this.elements.viewCount) this.elements.viewCount.textContent = currentImage.views.toString();
        }
    }

    /**
     * Increment view count
     */
    incrementViewCount(index) {
        if (this.config.images[index]) {
            this.config.images[index].views++;
            this.updateImageInfo();
        }
    }

    /**
     * Toggle slideshow
     */
    toggleSlideshow() {
        if (this.state.slideshowInterval) {
            this.stopSlideshow();
        } else {
            this.startSlideshow();
        }
    }

    /**
     * Start slideshow
     */
    startSlideshow() {
        this.state.slideshowInterval = setInterval(() => {
            const nextIndex = (this.state.currentImageIndex + 1) % this.config.images.length;
            this.selectImage(nextIndex);
        }, this.config.slideshowDelay);

        const slideshowBtn = this.elements.slideshowBtn?.querySelector('i');
        if (slideshowBtn) {
            slideshowBtn.className = 'fas fa-pause';
        }
        this.showInfo('Slideshow started');
    }

    /**
     * Stop slideshow
     */
    stopSlideshow() {
        if (this.state.slideshowInterval) {
            clearInterval(this.state.slideshowInterval);
            this.state.slideshowInterval = null;

            const slideshowBtn = this.elements.slideshowBtn?.querySelector('i');
            if (slideshowBtn) {
                slideshowBtn.className = 'fas fa-play';
            }
            this.showInfo('Slideshow stopped');
        }
    }

    /**
     * Toggle view mode (single/grid)
     */
    toggleViewMode() {
        this.state.viewMode = this.state.viewMode === 'single' ? 'grid' : 'single';
        // Implementation for grid view would go here
        this.showInfo(`Switched to ${this.state.viewMode} view`);
    }

    /**
     * Download current image
     */
    async downloadCurrentImage() {
        try {
            const currentImage = this.config.images[this.state.currentImageIndex];
            if (!currentImage) return;

            this.showInfo('Preparing download...');

            const response = await fetch(currentImage.src);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentImage.title.replace(/\s+/g, '_')}.jpg`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
            this.showSuccess('Image downloaded successfully');
        } catch (error) {
            this.showError('Failed to download image');
            console.error('Download error:', error);
        }
    }

    /**
     * Show image information modal
     */
    showImageInfo() {
        const currentImage = this.config.images[this.state.currentImageIndex];
        if (currentImage) {
            const infoText = `
                Title: ${currentImage.title}
                Upload Date: ${currentImage.uploadDate}
                Format: ${currentImage.format}
                Size: ${currentImage.size}
                Views: ${currentImage.views}
            `;
            alert(infoText); // In a real app, this would be a proper modal
        }
    }

    /**
     * Open fullscreen view
     */
    openFullscreen() {
        const currentImage = this.config.images[this.state.currentImageIndex];
        if (currentImage && this.elements.fullscreenModal) {
            this.elements.fullscreenImage.src = currentImage.src;
            this.elements.fullscreenImage.alt = currentImage.alt;
            this.elements.fullscreenModal.classList.remove('hidden');
            this.state.isFullscreen = true;
            this.state.zoomLevel = 1;
            this.state.rotation = 0;
            this.updateFullscreenImage();
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close fullscreen view
     */
    closeFullscreen() {
        if (this.elements.fullscreenModal) {
            this.elements.fullscreenModal.classList.add('hidden');
            this.state.isFullscreen = false;
            this.state.zoomLevel = 1;
            this.state.rotation = 0;
            document.body.style.overflow = '';
        }
    }

    /**
     * Zoom in fullscreen image
     */
    zoomIn() {
        if (this.state.isFullscreen) {
            this.state.zoomLevel = Math.min(this.state.zoomLevel * 1.25, 5);
            this.updateFullscreenImage();
        }
    }

    /**
     * Zoom out fullscreen image
     */
    zoomOut() {
        if (this.state.isFullscreen) {
            this.state.zoomLevel = Math.max(this.state.zoomLevel / 1.25, 0.25);
            this.updateFullscreenImage();
        }
    }

    /**
     * Rotate fullscreen image
     */
    rotateImage() {
        if (this.state.isFullscreen) {
            this.state.rotation = (this.state.rotation + 90) % 360;
            this.updateFullscreenImage();
        }
    }

    /**
     * Update fullscreen image transform
     */
    updateFullscreenImage() {
        if (this.elements.fullscreenImage) {
            this.elements.fullscreenImage.style.transform =
                `scale(${this.state.zoomLevel}) rotate(${this.state.rotation}deg)`;
        }
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite() {
        const currentId = this.config.images[this.state.currentImageIndex]?.id;
        if (currentId) {
            if (this.state.favorites.has(currentId)) {
                this.state.favorites.delete(currentId);
                this.showInfo('Removed from favorites');
            } else {
                this.state.favorites.add(currentId);
                this.showInfo('Added to favorites');
            }
            this.updateFavoriteButton();
        }
    }

    /**
     * Update favorite button appearance
     */
    updateFavoriteButton() {
        const favoriteBtn = this.elements.mainPhoto?.parentElement?.querySelector('.favorite-btn i');
        const currentId = this.config.images[this.state.currentImageIndex]?.id;

        if (favoriteBtn && currentId) {
            favoriteBtn.className = this.state.favorites.has(currentId) ? 'fas fa-heart' : 'far fa-heart';
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(event) {
        if (!this.state.isLoggedIn) return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.navigateImage(-1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.navigateImage(1);
                break;
            case 'Escape':
                if (this.state.isFullscreen) {
                    this.closeFullscreen();
                }
                break;
            case ' ':
                if (this.state.isFullscreen) {
                    event.preventDefault();
                    this.toggleSlideshow();
                }
                break;
            case 'f':
            case 'F':
                if (!this.state.isFullscreen) {
                    this.openFullscreen();
                }
                break;
        }
    }

    /**
     * Handle file upload modal
     */
    openUploadModal() {
        if (this.elements.uploadModal) {
            this.elements.uploadModal.classList.remove('hidden');
        }
    }

    closeUploadModal() {
        if (this.elements.uploadModal) {
            this.elements.uploadModal.classList.add('hidden');
            this.resetUploadForm();
        }
    }

    /**
     * Handle drag and drop
     */
    handleDragOver(event) {
        event.preventDefault();
        this.elements.uploadZone?.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.elements.uploadZone?.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.elements.uploadZone?.classList.remove('dragover');

        const files = Array.from(event.dataTransfer.files);
        this.handleFiles(files);
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.handleFiles(files);
    }

    /**
     * Handle file processing
     */
    async handleFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            this.showError('Please select valid image files');
            return;
        }

        this.showUploadProgress();

        for (let i = 0; i < imageFiles.length; i++) {
            try {
                await this.processFile(imageFiles[i]);
                this.updateUploadProgress((i + 1) / imageFiles.length * 100);
            } catch (error) {
                console.error('File processing error:', error);
            }
        }

        this.showSuccess(`${imageFiles.length} image(s) uploaded successfully`);
        this.closeUploadModal();
    }

    async processFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // In a real application, this would upload to a server
                // For demo purposes, we'll just add to the gallery
                const newImage = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    thumb: e.target.result,
                    alt: file.name,
                    title: file.name.split('.')[0],
                    uploadDate: new Date().toLocaleDateString(),
                    format: file.type.split('/')[1].toUpperCase(),
                    size: `${Math.round(file.size / 1024)} KB`,
                    views: 0
                };

                this.config.images.push(newImage);
                this.updateGallery();
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Update gallery display after new uploads
     */
    updateGallery() {
        // In a real application, this would refresh the thumbnail grid
        console.log('Gallery updated with new images');
    }

    showUploadProgress() {
        if (this.elements.uploadProgress) {
            this.elements.uploadProgress.classList.remove('hidden');
        }
    }

    updateUploadProgress(percentage) {
        const progressFill = this.elements.uploadProgress?.querySelector('.progress-fill');
        const progressText = this.elements.uploadProgress?.querySelector('#progressPercent');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
    }

    resetUploadForm() {
        if (this.elements.fileInput) this.elements.fileInput.value = '';
        if (this.elements.uploadProgress) this.elements.uploadProgress.classList.add('hidden');
        this.updateUploadProgress(0);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Adjust layout for mobile devices
        if (window.innerWidth < 768) {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        // Implementation for mobile menu closure
    }

    /**
     * Show login section
     */
    showLoginSection() {
        this.elements.loginSection?.classList.remove('hidden');
        this.elements.photoSection?.classList.add('hidden');
        this.clearForm();
    }

    /**
     * Show photo gallery section
     */
    showPhotoSection() {
        this.elements.loginSection?.classList.add('hidden');
        this.elements.photoSection?.classList.remove('hidden');

        if (this.elements.userDisplayName && this.state.currentUser) {
            this.elements.userDisplayName.textContent = this.state.currentUser.displayName;
        }

        this.selectImage(0);
        this.hideLoading();
    }

    /**
     * Clear login form
     */
    clearForm() {
        if (this.elements.username) this.elements.username.value = '';
        if (this.elements.password) this.elements.password.value = '';
        if (this.elements.rememberMe) this.elements.rememberMe.checked = false;
    }

    /**
     * Set login loading state
     */
    setLoginLoading(isLoading) {
        const btn = this.elements.loginBtn;
        const btnText = btn?.querySelector('.btn-text');
        const btnLoader = btn?.querySelector('.btn-loader');

        if (btn) {
            btn.disabled = isLoading;
            if (btnText) btnText.style.display = isLoading ? 'none' : 'block';
            if (btnLoader) btnLoader.classList.toggle('hidden', !isLoading);
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        if (this.elements.loadingOverlay) {
            const loadingText = this.elements.loadingOverlay.querySelector('p');
            if (loadingText) loadingText.textContent = message;
            this.elements.loadingOverlay.classList.remove('hidden');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('hidden');
        }
    }

    /**
     * Clear stored credentials
     */
    clearStoredCredentials() {
        localStorage.removeItem('photoVault_rememberMe');
        localStorage.removeItem('photoVault_user');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showMessage(message, 'error');
        if (this.elements.errorMessage) {
            if (this.elements.errorText) this.elements.errorText.textContent = message;
            this.elements.errorMessage.classList.remove('hidden');
            setTimeout(() => this.hideError(), 5000);
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.classList.add('hidden');
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show info message
     */
    showInfo(message) {
        this.showMessage(message, 'info');
    }

    /**
     * Show toast message
     */
    showMessage(message, type = 'info') {
        if (!this.elements.toast) return;

        const toast = this.elements.toast;
        const messageElement = toast.querySelector('.toast-message');

        if (messageElement) messageElement.textContent = message;

        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, this.config.toastDuration);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for HTML event handlers
function hideError() {
    window.photoVaultApp?.hideError();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.photoVaultApp = new PhotoVaultApp();
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}