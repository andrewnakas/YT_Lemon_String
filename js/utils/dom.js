/* ========================================
   DOM Manipulation Utilities
   ======================================== */

/**
 * Query selector shorthand
 */
function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Query selector all shorthand
 */
function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

/**
 * Create element with attributes and children
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });

    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
}

/**
 * Show element
 */
function show(element) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.style.display = '';
        element.classList.remove('hidden');
    }
}

/**
 * Hide element
 */
function hide(element) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Toggle element visibility
 */
function toggle(element) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        if (element.style.display === 'none') {
            show(element);
        } else {
            hide(element);
        }
    }
}

/**
 * Add class to element
 */
function addClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.add(...className.split(' '));
    }
}

/**
 * Remove class from element
 */
function removeClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.remove(...className.split(' '));
    }
}

/**
 * Toggle class on element
 */
function toggleClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * Check if element has class
 */
function hasClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    return element ? element.classList.contains(className) : false;
}

/**
 * Set multiple attributes
 */
function setAttributes(element, attributes) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
}

/**
 * Remove all children from element
 */
function clearChildren(element) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

/**
 * Insert element after reference element
 */
function insertAfter(newElement, referenceElement) {
    referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
}

/**
 * Insert element before reference element
 */
function insertBefore(newElement, referenceElement) {
    referenceElement.parentNode.insertBefore(newElement, referenceElement);
}

/**
 * Get element position relative to viewport
 */
function getPosition(element) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (!element) return { top: 0, left: 0, width: 0, height: 0 };
    return element.getBoundingClientRect();
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, options = {}) {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            ...options
        });
    }
}

/**
 * Delegate event listener
 */
function delegate(parent, selector, event, handler) {
    if (typeof parent === 'string') {
        parent = $(parent);
    }
    if (parent) {
        parent.addEventListener(event, e => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    }
}

/**
 * Wait for element to exist in DOM
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = $(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = $(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Create and show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = createElement('div', {
        className: `toast toast-${type}`,
        'aria-live': 'polite',
        'aria-atomic': 'true'
    }, [message]);

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => addClass(toast, 'toast-show'), 10);

    // Remove toast
    setTimeout(() => {
        removeClass(toast, 'toast-show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show loading overlay
 */
function showLoading(text = 'Loading...') {
    const overlay = $('#loadingOverlay');
    const loadingText = $('#loadingText');

    if (overlay) {
        if (loadingText) {
            loadingText.textContent = text;
        }
        addClass(overlay, 'active');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = $('#loadingOverlay');
    if (overlay) {
        removeClass(overlay, 'active');
    }
}

/**
 * Show modal
 */
function showModal(modalId) {
    const modal = $(modalId);
    if (modal) {
        addClass(modal, 'active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = $(modalId);
    if (modal) {
        removeClass(modal, 'active');
        document.body.style.overflow = '';
    }
}
