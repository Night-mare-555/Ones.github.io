/* 
========================================
   ONES - PREMIUM PORTFOLIO
   Main JavaScript
========================================
*/

document.addEventListener('DOMContentLoaded', () => {
    
    /* --- NAVIGATION --- */
    const navbar = document.querySelector('.navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Sticky Navbar Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(2, 6, 23, 0.95)';
            navbar.style.padding = '15px 0';
        } else {
            navbar.style.background = 'rgba(2, 6, 23, 0.8)';
            navbar.style.padding = '20px 0';
        }
    });

    // Mobile Menu Toggle
    mobileBtn.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'var(--bg-card)';
                navLinks.style.flexDirection = 'column';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid var(--glass-border)';
            }
        }
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });

    /* --- VOXEL DISSOLVE REVEAL ANIMATION --- */
    const revealElements = document.querySelectorAll('.section, .project-card, .service-card, .hero-content, .about-image-container, .stats-wrapper, .contact-content, .contact-form-wrapper');
    
    // Helper: Generate Voxel Grid
    function createVoxelGrid(target) {
        const rect = target.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Determine block size (smaller for small elements, larger for big ones)
        let blockSize = 50; 
        if (width < 400 || height < 400) blockSize = 25;
        if (width > 1000 && height > 800) blockSize = 80; // Optimization for large sections
        
        const cols = Math.ceil(width / blockSize);
        const rows = Math.ceil(height / blockSize);
        const totalBlocks = cols * rows;
        
        const overlay = document.createElement('div');
        overlay.classList.add('voxel-overlay');
        overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // Determine color based on target type
        const computedStyle = window.getComputedStyle(target);
        let blockColor = '#020617'; // var(--bg-dark)
        
        const blocks = [];
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('div');
            block.classList.add('voxel-block');
            block.style.background = '#020617'; // Solid masking
            
            // Optional: Accent blocks
            if (Math.random() > 0.95) {
                block.style.background = 'var(--accent-indigo)';
                block.style.opacity = '0.5';
            }
            
            fragment.appendChild(block);
            blocks.push(block);
        }
        
        overlay.appendChild(fragment);
        
        // Ensure target has relative positioning for overlay
        if (computedStyle.position === 'static') {
            target.style.position = 'relative';
        }
        
        target.appendChild(overlay);
        
        return { overlay, blocks };
    }
    
    function animateVoxels(blocks, overlay) {
        // Shuffle blocks array for random dissolve order
        const shuffledBlocks = [...blocks].sort(() => Math.random() - 0.5);
        
        shuffledBlocks.forEach((block, index) => {
            // Stagger delay
            const delay = index * 1.5; // Fast dissolve
            
            setTimeout(() => {
                block.style.transform = 'scale(0)';
                block.style.opacity = '0';
            }, delay);
        });
        
        // Remove overlay after all blocks are gone
        const totalDuration = shuffledBlocks.length * 1.5 + 500;
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, totalDuration);
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Prepare target
                target.style.opacity = '1'; // Make content visible immediately (behind overlay)
                
                // Create and animate overlay
                // Check if already animated to avoid double triggers
                if (!target.classList.contains('voxel-animated')) {
                    const { overlay, blocks } = createVoxelGrid(target);
                    
                    // Small delay to ensure overlay is rendered before dissolving
                    requestAnimationFrame(() => {
                        animateVoxels(blocks, overlay);
                    });
                    
                    target.classList.add('voxel-animated');
                }
                
                revealObserver.unobserve(target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.style.opacity = '0'; // Initial state hidden
        revealObserver.observe(el);
    });

    /* --- MODAL LOGIC --- */
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.close-modal');
    const projectCards = document.querySelectorAll('.project-card');
    
    const modalTitle = modal.querySelector('.modal-title');
    const modalCat = modal.querySelector('.modal-category');
    const modalDesc = modal.querySelector('.modal-desc');
    const modalImg = modal.querySelector('.modal-image');
    const modalImgPlaceholder = modal.querySelector('.modal-image-placeholder');
    const modalVideoGallery = modal.querySelector('.modal-video-gallery');
    
    // Slider Elements
    const prevBtn = modal.querySelector('.prev-btn');
    const nextBtn = modal.querySelector('.next-btn');
    const dotsContainer = modal.querySelector('.slider-dots');
    
    let currentImageIndex = 0;
    let currentImages = [];

    // Project Data
    const projectData = {
        'andien-concert': {
            title: 'Visuals for Andien Concert 2025',
            category: 'Motion Graphics & 3D Animation',
            description: `I had the opportunity to create the stage visuals for Andien’s concert yesterday, combining Cinema 4D and After Effects to build a modern, elegant look that supported the performance on stage.

For this project, I was responsible for:
• Building the 3D layout, lighting, and materials based on the creative direction
• Animating and compositing the visuals in After Effects
• Aligning colors, rhythm, and mood to match the concept provided
• Preparing final exports for the LED screen setup`,
            // Array of images for slider
            images: [
                'img/Copy of Copy of PORTFOLIO.png',
                'img/ANDIEN/Andien-Suarasmara-Concert-CK 3-NOT FINAL-469.jpg',
                'img/ANDIEN/DSC08719.jpg',
                'img/ANDIEN/DSC08726.jpg',
                'img/ANDIEN/DSC08774.jpg',
                'img/ANDIEN/DSC08882.jpg',
                'img/ANDIEN/DSC09044.jpg'
            ],
            videos: [
                'https://www.youtube.com/embed/_BE5yZP34H0',
                'https://www.youtube.com/embed/7FMdP8X9Us4',
                'https://www.youtube.com/embed/Mm9e61v8e7A'
            ]
        }
    };
    
    function updateSlider(index) {
        if (currentImages.length === 0) return;
        
        // Wrap around logic
        if (index < 0) index = currentImages.length - 1;
        if (index >= currentImages.length) index = 0;
        
        currentImageIndex = index;
        
        // Update Image
        modalImg.style.opacity = '0';
        setTimeout(() => {
            modalImg.src = currentImages[currentImageIndex];
            modalImg.style.opacity = '1';
        }, 200);
        
        // Update Dots
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => {
            if (i === currentImageIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    
    function initSlider(images) {
        currentImages = images;
        currentImageIndex = 0;
        
        // Reset UI
        prevBtn.style.display = images.length > 1 ? 'block' : 'none';
        nextBtn.style.display = images.length > 1 ? 'block' : 'none';
        dotsContainer.style.display = images.length > 1 ? 'flex' : 'none';
        dotsContainer.innerHTML = '';
        
        if (images.length > 0) {
            modalImg.src = images[0];
            modalImg.style.display = 'block';
            modalImgPlaceholder.style.display = 'none';
            
            // Create dots
            if (images.length > 1) {
                images.forEach((_, i) => {
                    const dot = document.createElement('div');
                    dot.classList.add('slider-dot');
                    if (i === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => updateSlider(i));
                    dotsContainer.appendChild(dot);
                });
            }
        } else {
             modalImg.style.display = 'none';
             modalImgPlaceholder.style.display = 'block';
        }
    }

    // Open Modal
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-id');
            const data = projectData[projectId];
            
            // Default content from card if no specific data
            const defaultTitle = card.querySelector('.card-title').innerText;
            const defaultCategory = card.getAttribute('data-category');
            
            if (data) {
                modalTitle.innerText = data.title;
                modalCat.innerText = data.category;
                modalDesc.innerText = data.description;
                
                // Initialize Slider with array of images
                // If data.images exists use it, else fall back to single data.image in array
                let images = [];
                if (data.images && data.images.length > 0) {
                    images = data.images;
                } else if (data.image) {
                    images = [data.image];
                }
                
                initSlider(images);

                // Handle Videos
                if (data.videos && data.videos.length > 0) {
                    modalVideoGallery.innerHTML = '';
                    modalVideoGallery.style.display = 'flex';
                    data.videos.forEach(videoUrl => {
                        const videoItem = document.createElement('div');
                        videoItem.classList.add('modal-video-item');
                        videoItem.innerHTML = `<iframe src="${videoUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
                        modalVideoGallery.appendChild(videoItem);
                    });
                } else {
                    modalVideoGallery.style.display = 'none';
                }

            } else {
                // Fallback for cards without data-id
                modalTitle.innerText = defaultTitle;
                modalCat.innerText = defaultCategory;
                modalDesc.innerText = "Project description details pending update.";
                
                initSlider([]); // No images
                
                // Fallback placeholder color
                const cardImg = card.querySelector('.card-image');
                if (cardImg) {
                    const computedStyle = window.getComputedStyle(cardImg);
                    modalImgPlaceholder.style.background = computedStyle.background;
                }
                modalImgPlaceholder.style.display = 'block';
                
                modalVideoGallery.style.display = 'none';
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });
    
    // Slider Controls Events
    prevBtn.addEventListener('click', () => updateSlider(currentImageIndex - 1));
    nextBtn.addEventListener('click', () => updateSlider(currentImageIndex + 1));

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Stop videos
        modalVideoGallery.innerHTML = ''; 
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modalVideoGallery.innerHTML = '';
        }
    });

    /* --- VOXEL INTERACTION (Subtle Parallax) --- */
    const hero = document.querySelector('.hero');
    const voxelCluster = document.querySelector('.voxel-cluster');
    
    if (hero && voxelCluster) {
        hero.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.clientX) / 25;
            const y = (window.innerHeight / 2 - e.clientY) / 25;
            
            voxelCluster.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        });
        
        // Reset on mouse leave
        hero.addEventListener('mouseleave', () => {
            voxelCluster.style.transform = ''; // Reverts to CSS animation
        });
    }
});
