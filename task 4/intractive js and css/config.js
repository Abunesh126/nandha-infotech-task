/**
 * PhotoVault Configuration
 * Customize your gallery settings here
 */

const PHOTOVAULT_CONFIG = {
    // Application Settings
    app: {
        name: 'PhotoVault',
        version: '1.0.0',
        description: 'Professional Photo Gallery Application'
    },

    // Authentication Settings
    auth: {
        maxLoginAttempts: 5,
        sessionTimeout: 3600000, // 1 hour in milliseconds
        rememberMeDuration: 2592000000, // 30 days in milliseconds

        // Demo users (in production, this would be handled by a backend)
        validCredentials: [
            {
                username: 'admin',
                password: 'password',
                displayName: 'Administrator',
                role: 'admin'
            },
            {
                username: 'user@demo.com',
                password: 'demo123',
                displayName: 'Demo User',
                role: 'user'
            },
            {
                username: 'photographer',
                password: 'gallery2025',
                displayName: 'Photographer',
                role: 'photographer'
            }
        ]
    },

    // Gallery Settings
    gallery: {
        slideshowDelay: 4000, // milliseconds
        maxZoomLevel: 5,
        minZoomLevel: 0.25,
        imageQuality: 'high', // 'low', 'medium', 'high'

        // Supported file types for upload
        supportedFileTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ],

        maxFileSize: 10485760, // 10MB in bytes
        maxFiles: 50 // Maximum files per upload
    },

    // UI Settings
    ui: {
        animationDuration: 300,
        toastDuration: 3000,
        theme: 'default', // 'default', 'dark', 'light'

        // Keyboard shortcuts
        shortcuts: {
            nextImage: ['ArrowRight', 'KeyD'],
            prevImage: ['ArrowLeft', 'KeyA'],
            fullscreen: ['KeyF', 'F11'],
            slideshow: ['Space'],
            escape: ['Escape'],
            zoomIn: ['Equal', 'NumpadAdd'],
            zoomOut: ['Minus', 'NumpadSubtract']
        }
    },

    // Performance Settings
    performance: {
        lazyLoading: true,
        imagePreloading: true,
        cacheImages: true,
        maxCachedImages: 20
    },

    // PWA Settings
    pwa: {
        enableServiceWorker: true,
        enablePushNotifications: false,
        cacheStrategy: 'networkFirst', // 'cacheFirst', 'networkFirst', 'staleWhileRevalidate'
        offlineMode: true
    },

    // Sample Images (replace with your own)
    sampleImages: [
        {
            id: 1,
            src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
            thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
            alt: 'Mountain landscape at sunset',
            title: 'Mountain Sunset',
            uploadDate: '2025-09-01',
            format: 'JPEG',
            size: '1920 x 1080',
            views: 247,
            tags: ['nature', 'mountain', 'sunset'],
            location: 'Rocky Mountains',
            photographer: 'Nature Photographer'
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
            views: 189,
            tags: ['ocean', 'waves', 'rocks'],
            location: 'Pacific Coast',
            photographer: 'Ocean Explorer'
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
            views: 156,
            tags: ['forest', 'path', 'sunlight'],
            location: 'Amazon Rainforest',
            photographer: 'Forest Walker'
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
            views: 203,
            tags: ['desert', 'dunes', 'sand'],
            location: 'Sahara Desert',
            photographer: 'Desert Wanderer'
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
            views: 312,
            tags: ['beach', 'tropical', 'paradise'],
            location: 'Maldives',
            photographer: 'Beach Lover'
        }
    ],

    // API Endpoints (for future backend integration)
    api: {
        baseUrl: 'https://api.photovault.example.com',
        endpoints: {
            login: '/auth/login',
            logout: '/auth/logout',
            upload: '/gallery/upload',
            images: '/gallery/images',
            favorites: '/user/favorites'
        }
    },

    // Analytics (optional)
    analytics: {
        enabled: false,
        trackingId: 'GA_MEASUREMENT_ID',
        events: {
            login: 'user_login',
            imageView: 'image_view',
            upload: 'image_upload',
            favorite: 'image_favorite'
        }
    }
};

// Export for use in modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PHOTOVAULT_CONFIG;
}
