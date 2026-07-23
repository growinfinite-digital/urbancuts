/* =========================================================
   URBAN CUTS — SITE SCRIPTS
   Vanilla JS. No dependencies. No build step required.
========================================================= */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initMobileNav();
        initFaqAccordion();
        initActiveNavHighlight();
        initHeaderScrollState();
        initFooterYear();
        initScrollReveal();
        initCompareSliders();
        initPreloader();
    }

    /* -----------------------------------------
       1. Mobile Navigation Toggle
    ----------------------------------------- */
    function initMobileNav() {
        var toggle = document.querySelector('.nav-toggle');
        var menu = document.getElementById('primary-menu');

        if (!toggle || !menu) return;

        function closeMenu() {
            menu.classList.remove('nav-menu--open');
            toggle.classList.remove('nav-toggle--active');
            toggle.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            menu.classList.add('nav-menu--open');
            toggle.classList.add('nav-toggle--active');
            toggle.setAttribute('aria-expanded', 'true');
        }

        function toggleMenu() {
            var isOpen = menu.classList.contains('nav-menu--open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        toggle.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleMenu();
        });

        menu.addEventListener('click', function (event) {
            if (event.target.tagName === 'A') {
                closeMenu();
            }
        });

        document.addEventListener('click', function (event) {
            var isClickInsideMenu = menu.contains(event.target);
            var isClickOnToggle = toggle.contains(event.target);
            if (!isClickInsideMenu && !isClickOnToggle) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMenu();
                toggle.focus();
            }
        });

        var desktopQuery = window.matchMedia('(min-width: 900px)');
        function handleBreakpointChange(query) {
            if (query.matches) {
                closeMenu();
            }
        }
        if (desktopQuery.addEventListener) {
            desktopQuery.addEventListener('change', handleBreakpointChange);
        } else if (desktopQuery.addListener) {
            desktopQuery.addListener(handleBreakpointChange);
        }
    }

    /* -----------------------------------------
       2. FAQ Accordion — one open at a time
    ----------------------------------------- */
    function initFaqAccordion() {
        var faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(function (item) {
            item.addEventListener('toggle', function () {
                if (item.open) {
                    faqItems.forEach(function (other) {
                        if (other !== item) {
                            other.open = false;
                        }
                    });
                }
            });
        });
    }

    /* -----------------------------------------
       3. Active Nav Link Highlighting on Scroll
    ----------------------------------------- */
    function initActiveNavHighlight() {
        var navLinks = document.querySelectorAll('#primary-menu a[href^="#"]');
        if (!navLinks.length || !('IntersectionObserver' in window)) return;

        var sections = [];
        navLinks.forEach(function (link) {
            var id = link.getAttribute('href').slice(1);
            var section = document.getElementById(id);
            if (section) {
                sections.push({ link: link, section: section });
            }
        });

        if (!sections.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    var match = sections.find(function (item) {
                        return item.section === entry.target;
                    });
                    if (!match) return;

                    if (entry.isIntersecting) {
                        navLinks.forEach(function (link) {
                            link.removeAttribute('aria-current');
                        });
                        match.link.setAttribute('aria-current', 'true');
                    }
                });
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        );

        sections.forEach(function (item) {
            observer.observe(item.section);
        });
    }

    /* -----------------------------------------
       4. Header Scroll State
    ----------------------------------------- */
    function initHeaderScrollState() {
        var header = document.querySelector('.site-header');
        if (!header) return;

        var scrollThreshold = 12;
        var ticking = false;

        function updateHeaderState() {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('site-header--scrolled');
            } else {
                header.classList.remove('site-header--scrolled');
            }
            ticking = false;
        }

        window.addEventListener(
            'scroll',
            function () {
                if (!ticking) {
                    window.requestAnimationFrame(updateHeaderState);
                    ticking = true;
                }
            },
            { passive: true }
        );

        updateHeaderState();
    }

    /* -----------------------------------------
       5. Footer Year
    ----------------------------------------- */
    function initFooterYear() {
        var yearEl = document.getElementById('year');
        if (!yearEl) return;
        yearEl.textContent = new Date().getFullYear();
    }

    /* -----------------------------------------
       6. Scroll Reveal
       Fades/slides [data-reveal] elements into
       place the first time they enter view.
    ----------------------------------------- */
    function initScrollReveal() {
        var items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
        );

        items.forEach(function (el, index) {
            // Small stagger within each card grid for a more premium feel.
            el.style.transitionDelay = (index % 5) * 60 + 'ms';
            observer.observe(el);
        });
    }

    /* -----------------------------------------
       7. Before / After Drag-to-Compare Sliders
       - Dragging the handle LEFT reveals more
         of the "after" image (it occupies the
         area to the right of the handle).
       - Dragging the handle RIGHT reveals more
         of the "before" image (underneath, to
         the left of the handle).
       - Works with mouse, touch and keyboard
         (the underlying <input type="range">
         handles keyboard arrow keys natively).
    ----------------------------------------- */
    // function initCompareSliders() {
    //     var sliders = document.querySelectorAll('[data-compare-slider]');
    //     if (!sliders.length) return;

    //     sliders.forEach(setupSlider);

    //     function setupSlider(root) {
    //         var range = root.querySelector('.compare-slider__range');
    //         if (!range) return;

    //         var dragging = false;

    //         function setPosition(percent) {
    //             var clamped = Math.min(100, Math.max(0, percent));
    //             root.style.setProperty('--pos', clamped + '%');
    //             range.value = clamped;
    //         }

    //         function percentFromClientX(clientX) {
    //             var rect = root.getBoundingClientRect();
    //             var relativeX = clientX - rect.left;
    //             return (relativeX / rect.width) * 100;
    //         }

    //         function startDrag(clientX) {
    //             dragging = true;
    //             root.classList.add('is-dragging');
    //             setPosition(percentFromClientX(clientX));
    //         }

    //         function moveDrag(clientX) {
    //             if (!dragging) return;
    //             setPosition(percentFromClientX(clientX));
    //         }

    //         function endDrag() {
    //             dragging = false;
    //             root.classList.remove('is-dragging');
    //         }

            // Pointer Events cover mouse, touch and pen in one API.
//             if (window.PointerEvent) {
//                 root.addEventListener('pointerdown', function (event) {
//                     root.setPointerCapture(event.pointerId);
//                     startDrag(event.clientX);
//                 });
//                 root.addEventListener('pointermove', function (event) {
//                     moveDrag(event.clientX);
//                 });
//                 root.addEventListener('pointerup', endDrag);
//                 root.addEventListener('pointercancel', endDrag);
//             } else {
//                 // Fallback for older browsers without Pointer Events.
//                 root.addEventListener('mousedown', function (event) {
//                     startDrag(event.clientX);
//                     function onMouseMove(e) {
//                         moveDrag(e.clientX);
//                     }
//                     function onMouseUp() {
//                         endDrag();
//                         document.removeEventListener('mousemove', onMouseMove);
//                         document.removeEventListener('mouseup', onMouseUp);
//                     }
//                     document.addEventListener('mousemove', onMouseMove);
//                     document.addEventListener('mouseup', onMouseUp);
//                 });

//                 root.addEventListener('touchstart', function (event) {
//                     startDrag(event.touches[0].clientX);
//                 }, { passive: true });
//                 root.addEventListener('touchmove', function (event) {
//                     moveDrag(event.touches[0].clientX);
//                 }, { passive: true });
//                 root.addEventListener('touchend', endDrag);
//             }

//             // Keyboard / native range interaction (accessible fallback).
//             range.addEventListener('input', function () {
//                 setPosition(parseFloat(range.value));
//             });

//             // Initialize from the range's starting value.
//             setPosition(parseFloat(range.value) || 50);
//         }
//     }

function initCompareSliders() {
    const sliders = document.querySelectorAll("[data-compare-slider]");

    sliders.forEach(slider => {
        const range = slider.querySelector(".compare-slider__range");

        function updateSlider() {
            slider.style.setProperty("--pos", range.value + "%");
        }

        range.addEventListener("input", updateSlider);

        updateSlider();
    });
}

function initPreloader(){

    const loader = document.getElementById("preloader");

    if(!loader) return;

    window.addEventListener("load",()=>{

        setTimeout(()=>{

            loader.classList.add("hide");

            loader.addEventListener("transitionend",()=>{

                loader.remove();

            },{once:true});

        },2300);

    });

}

})();
