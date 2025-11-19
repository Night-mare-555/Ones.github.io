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
        // If it's a card, use card color. If text/section, use background color (to look like emerging from void)
        const computedStyle = window.getComputedStyle(target);
        const bgColor = computedStyle.backgroundColor;
        
        // Default to dark background if element is transparent (like text containers)
        // But for cards, we want the blocks to match the card so they dissolve *away* revealing the card?
        // Actually, if we want "emerging", the blocks should be the void color initially?
        // Let's try: Blocks are same color as Page Background (#020617)
        // This makes it look like the object is being carved out of the darkness.
        // EXCEPT for cards which have a lighter background.
        
        let blockColor = '#020617'; // var(--bg-dark)
        
        // If target has a specific background (not transparent/rgba(0,0,0,0)), maybe use that?
        // For a cool effect, let's make blocks slightly lighter/accented to show "construction"
        // blockColor = 'rgba(79, 70, 229, 0.2)'; // Holographic blue
        
        // Better: "Hiding" blocks should match the background BEHIND the element.
        // Since the body is dark, we use dark blocks.
        
        const blocks = [];
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('div');
            block.classList.add('voxel-block');
            
            // Randomize initial color slightly for "texture"
            // block.style.background = Math.random() > 0.9 ? '#0f172a' : '#020617';
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
    const modalImg = modal.querySelector('.modal-image-placeholder');

    // Open Modal
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.card-title').innerText;
            const category = card.getAttribute('data-category');
            
            // Set content
            modalTitle.innerText = title;
            modalCat.innerText = category;
            
            // Simulate image color from card placeholder to modal
            const cardImg = card.querySelector('.card-image');
            const computedStyle = window.getComputedStyle(cardImg);
            modalImg.style.background = computedStyle.background;

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
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
