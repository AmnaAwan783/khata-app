/**
 * Invoice Share with Screenshot
 * Handles capturing invoice screenshot and sharing via WhatsApp
 * Uses Web Share API on mobile, fallback to download + WhatsApp link on desktop
 */

// Configuration
const INVOICE_SHARE_CONFIG = {
    screenshotScale: 2, // High resolution (2x)
    screenshotFormat: 'image/png',
    screenshotQuality: 1.0,
    hideClass: 'hide-for-screenshot' // Class to hide elements during capture
};

/**
 * Check if browser supports Web Share API with files
 * This is the ONLY way to share image + text together in WhatsApp
 */
function supportsWebShareWithFiles() {
    // Check basic Web Share API support
    if (!navigator.share) {
        console.log('navigator.share not available');
        return false;
    }
    
    // Check if canShare exists (some browsers have share but not canShare)
    if (!navigator.canShare) {
        console.log('navigator.canShare not available, but share is - will try anyway');
        // Some browsers support share with files but don't have canShare
        // We'll try to share anyway and catch errors
        return true;
    }
    
    // Create a test file to check if files can be shared
    try {
        const testFile = new File(['test'], 'test.png', { type: 'image/png' });
        const canShare = navigator.canShare({ files: [testFile] });
        console.log('Web Share with files support:', canShare);
        return canShare;
    } catch (error) {
        // If File constructor fails or canShare fails, try anyway
        console.log('canShare check failed, but will try to share:', error);
        // Some browsers support it but canShare check fails
        // Return true to attempt sharing
        return true;
    }
}

/**
 * Check if user is online
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Hide elements that shouldn't appear in screenshot
 */
function hideElementsForScreenshot() {
    const elementsToHide = document.querySelectorAll('.no-print, .btn, nav, .offline-indicator');
    elementsToHide.forEach(el => {
        el.classList.add(INVOICE_SHARE_CONFIG.hideClass);
        el.style.display = 'none';
    });
}

/**
 * Show elements after screenshot
 */
function showElementsAfterScreenshot() {
    const hiddenElements = document.querySelectorAll('.' + INVOICE_SHARE_CONFIG.hideClass);
    hiddenElements.forEach(el => {
        el.classList.remove(INVOICE_SHARE_CONFIG.hideClass);
        el.style.display = '';
    });
}

/**
 * Capture invoice screenshot using html2canvas
 * @returns {Promise<Blob>} Screenshot as PNG blob
 */
async function captureInvoiceScreenshot() {
    const invoiceContainer = document.getElementById('invoice-container');
    
    if (!invoiceContainer) {
        throw new Error('Invoice container not found');
    }

    // Check if html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas library not loaded');
    }

    // Hide buttons and navigation during capture
    hideElementsForScreenshot();

    try {
        // Capture screenshot with high resolution
        const canvas = await html2canvas(invoiceContainer, {
            scale: INVOICE_SHARE_CONFIG.screenshotScale,
            backgroundColor: '#ffffff', // White background
            logging: false, // Disable console logging
            useCORS: true, // Allow cross-origin images
            allowTaint: false, // Prevent canvas tainting
            width: invoiceContainer.scrollWidth,
            height: invoiceContainer.scrollHeight
        });

        // Convert canvas to blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert canvas to blob'));
                    }
                },
                INVOICE_SHARE_CONFIG.screenshotFormat,
                INVOICE_SHARE_CONFIG.screenshotQuality
            );
        });
    } finally {
        // Always show elements again, even if capture failed
        showElementsAfterScreenshot();
    }
}

/**
 * Get invoice message text
 * @returns {string} Invoice message
 */
function getInvoiceMessage() {
    const messageElement = document.getElementById('invoiceMessage');
    if (messageElement) {
        return messageElement.value;
    }
    
    // Fallback: generate message if element not found
    if (typeof generateInvoiceMessage === 'function') {
        return generateInvoiceMessage();
    }
    
    return 'Invoice attached.';
}

/**
 * Share invoice via Web Share API (mobile)
 * This is the CORRECT way to share image + text together
 * WhatsApp will receive both image and text when user selects it from share sheet
 * 
 * @param {Blob} imageBlob - Screenshot image blob
 * @param {string} text - Invoice message text
 * @returns {Promise<boolean>} True if shared successfully, false if cancelled
 */
async function shareViaWebShareAPI(imageBlob, text) {
    if (!supportsWebShareWithFiles()) {
        throw new Error('Web Share API with files not supported');
    }

    // Create File object from blob
    // File name with timestamp to avoid conflicts
    const fileName = `invoice-${Date.now()}.png`;
    const file = new File([imageBlob], fileName, {
        type: INVOICE_SHARE_CONFIG.screenshotFormat,
        lastModified: Date.now()
    });

    // Prepare share data - BOTH image and text together
    // This ensures WhatsApp receives both when user selects it
    const shareData = {
        title: 'Invoice',
        text: text,  // Invoice message text
        files: [file]  // Invoice screenshot image
    };

    // Verify we can share this data before attempting
    // Check if canShare is available and supports this data
    if (navigator.canShare) {
        try {
            if (!navigator.canShare(shareData)) {
                throw new Error('Cannot share this data. File may be too large or format not supported.');
            }
        } catch (checkError) {
            console.warn('canShare check failed:', checkError);
            // Continue anyway - some browsers don't support canShare properly
        }
    }

    try {
        // Share via native share sheet
        // User will see WhatsApp in the list of apps
        // When selected, WhatsApp receives BOTH image and text
        await navigator.share(shareData);
        console.log('Successfully shared invoice via Web Share API');
        return true;
    } catch (error) {
        // User cancelled share (AbortError is normal)
        if (error.name === 'AbortError') {
            console.log('User cancelled share');
            return false;
        }
        // Other errors should be thrown
        throw error;
    }
}

/**
 * Download invoice image (desktop fallback)
 * @param {Blob} imageBlob - Screenshot image blob
 * @returns {string} Downloaded file name
 */
function downloadInvoiceImage(imageBlob) {
    const fileName = `invoice-${Date.now()}.png`;
    const url = URL.createObjectURL(imageBlob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL after a delay
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
    
    return fileName;
}

/**
 * Open WhatsApp with pre-filled message (desktop fallback)
 * @param {string} phone - Customer phone number
 * @param {string} message - Invoice message
 */
function openWhatsAppWithMessage(phone, message) {
    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // Encode message
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp click-to-chat URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
}

/**
 * Show user feedback message
 * @param {string} message - Message to show
 * @param {string} type - Message type (success, error, info)
 */
function showFeedback(message, type = 'info') {
    // Try to use StoreApp notification if available
    if (window.StoreApp && window.StoreApp.showNotification) {
        window.StoreApp.showNotification(message, type);
        return;
    }
    
    // Fallback to alert
    alert(message);
}

/**
 * Main function to capture and share invoice
 * Uses Web Share API as primary method (ensures image + text together)
 * Falls back to download + WhatsApp link for desktop/unsupported browsers
 * 
 * @param {string} customerPhone - Customer phone number (for fallback only)
 */
async function shareInvoiceOnWhatsApp(customerPhone) {
    // Check if online
    if (!isOnline()) {
        showFeedback('Internet connection required to send invoice', 'error');
        return;
    }

    // Single button for sharing invoice
    const shareButton = document.getElementById('shareInvoiceBtn');
    const shareButtonText = document.getElementById('shareInvoiceBtnText');
    
    // Update button state
    if (shareButton) {
        shareButton.disabled = true;
        if (shareButtonText) {
            shareButtonText.textContent = '⏳ Capturing...';
        }
    }

    try {
        // Step 1: Capture screenshot
        const imageBlob = await captureInvoiceScreenshot();
        
        // Step 2: Get invoice message
        const invoiceMessage = getInvoiceMessage();
        
        // Step 3: Try Web Share API (mobile)
        if (supportsWebShareWithFiles()) {
            if (shareButtonText) {
                shareButtonText.textContent = '📤 Sharing...';
            }
            
            try {
                const shared = await shareViaWebShareAPI(imageBlob, invoiceMessage);
                if (shared) {
                    showFeedback('Invoice shared successfully!', 'success');
                    if (shareButtonText) {
                        shareButtonText.textContent = '✓ Shared!';
                    }
                    return;
                }
            } catch (error) {
                console.log('Web Share API failed, using fallback:', error);
                // Fall through to fallback
            }
        }
        
        // Step 4: Fallback for desktop/unsupported browsers
        if (shareButtonText) {
            shareButtonText.textContent = '💾 Downloading...';
        }
        
        // Download image
        const fileName = downloadInvoiceImage(imageBlob);
        
        // Open WhatsApp with message
        openWhatsAppWithMessage(customerPhone, invoiceMessage);
        
        // Show instructions
        showFeedback(
            `Invoice image downloaded as "${fileName}".\n\n` +
            `WhatsApp opened with message. Please attach the downloaded image.`,
            'info'
        );
        
        if (shareButtonText) {
            shareButtonText.textContent = '✓ Image Downloaded';
        }
        
    } catch (error) {
        console.error('Error sharing invoice:', error);
        showFeedback(
            'Error sharing invoice: ' + error.message + '\n\nPlease try again.',
            'error'
        );
        
        if (shareButtonText) {
            shareButtonText.textContent = '❌ Error - Try Again';
        }
    } finally {
        // Re-enable button after a delay
        setTimeout(() => {
            if (shareButton) {
                shareButton.disabled = false;
                if (shareButtonText) {
                    shareButtonText.textContent = '📱 Share Invoice on WhatsApp';
                }
            }
        }, 3000);
    }
}

/**
 * Initialize invoice sharing functionality
 */
function initInvoiceSharing() {
    // Check if html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas not loaded. Invoice screenshot feature will not work.');
        
        // Disable share button if it exists
        const shareButton = document.getElementById('shareWhatsAppBtn');
        if (shareButton) {
            shareButton.disabled = true;
            shareButton.title = 'html2canvas library required';
        }
        return;
    }
    
    // Check online status and update button
    const shareButton = document.getElementById('shareInvoiceBtn');
    if (shareButton) {
        if (!isOnline()) {
            shareButton.disabled = true;
            shareButton.title = 'Internet connection required';
        }
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            shareButton.disabled = false;
            shareButton.title = '';
        });
        
        window.addEventListener('offline', () => {
            shareButton.disabled = true;
            shareButton.title = 'Internet connection required';
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInvoiceSharing);
} else {
    initInvoiceSharing();
}

// Export function for global use
window.shareInvoiceOnWhatsApp = shareInvoiceOnWhatsApp;
window.captureAndShareInvoice = shareInvoiceOnWhatsApp; // Backward compatibility

