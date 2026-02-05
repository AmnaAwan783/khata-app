/**
 * Contact Browser - Offline Customer Database Browser
 * Browses customers from the app's own database (IndexedDB)
 * Works completely offline - no device Contact Picker API needed
 * 
 * This replaces the device Contact Picker API with an offline browser
 * that uses the app's customer database stored in IndexedDB
 */

/**
 * Check if Contact Picker API is supported
 * @returns {object} Object with support info and boolean
 */
function supportsContactPicker() {
    // Check step by step for better debugging
    const hasNavigatorContacts = 'contacts' in navigator;
    const hasSelect = hasNavigatorContacts && typeof navigator.contacts.select === 'function';
    
    // Check for secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
    
    // Additional checks
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edge|Opera|OPR/i.test(navigator.userAgent);
    const isEdge = /Edg/i.test(navigator.userAgent); // Edge uses "Edg" in user agent
    
    // Contact Picker API only works on:
    // - Chrome 80+ on Android
    // - Edge 80+ on Android
    // - Requires HTTPS or localhost (secure context)
    // NOT on desktop, NOT on iOS, NOT on other browsers
    
    const apiSupported = hasNavigatorContacts && hasSelect;
    const browserSupported = isAndroid && (isChrome || isEdge);
    const isSupported = apiSupported && browserSupported && isSecureContext;
    
    const info = {
        'contacts in navigator': hasNavigatorContacts,
        'select function exists': hasSelect,
        'isSecureContext': isSecureContext,
        'protocol': window.location.protocol,
        'hostname': window.location.hostname,
        'isAndroid': isAndroid,
        'isMobile': isMobile,
        'isChrome': isChrome,
        'isEdge': isEdge,
        'browserSupported': browserSupported,
        'API Supported': apiSupported,
        'Final Supported': isSupported,
        'User Agent': navigator.userAgent
    };
    
    console.log('Contact Picker API Check:', info);
    
    // Return both the boolean and the info for detailed error messages
    return {
        supported: isSupported,
        info: info
    };
}

/**
 * Open contact picker and fill form fields
 * @param {string} nameFieldId - ID of the name input field
 * @param {string} phoneFieldId - ID of the phone input field
 * @param {Function} onSuccess - Optional callback on success
 * @param {Function} onError - Optional callback on error
 */
async function pickContactFromPhone(nameFieldId, phoneFieldId, onSuccess, onError) {
    // Check if Contact Picker API is supported
    const supportCheck = supportsContactPicker();
    if (!supportCheck.supported) {
        // Try to call it anyway - sometimes the check is wrong but API works
        const hasAPI = 'contacts' in navigator && typeof navigator.contacts.select === 'function';
        if (!hasAPI) {
            // If API doesn't exist, we can't proceed
            const errorMsg = 'Contact picker not supported on this device. Please enter manually.';
            console.log(errorMsg, supportCheck.info);
            
            if (onError) {
                onError(new Error(errorMsg));
            } else {
                alert(errorMsg);
            }
            return;
        }
        // If API exists but check failed, try calling it anyway - will catch error if it fails
        console.warn('Contact picker check failed but API exists, trying anyway...', supportCheck.info);
    }

    try {
        // Request contact properties we need
        // 'name' and 'tel' are the properties we want
        const props = ['name', 'tel'];
        const options = { multiple: false }; // Single contact selection only
        
        console.log('Calling navigator.contacts.select with:', { props, options });
        console.log('navigator.contacts:', navigator.contacts);
        
        // Open contact picker - requires user interaction (button click)
        // This shows the native contact list on mobile devices
        const contacts = await navigator.contacts.select(props, options);
        
        console.log('Contact picker returned:', contacts);
        
        if (!contacts || contacts.length === 0) {
            // User cancelled or no contact selected
            console.log('No contact selected');
            return;
        }
        
        // Get the first (and only) selected contact
        const contact = contacts[0];
        
        // Extract name
        let contactName = '';
        if (contact.name && contact.name.length > 0) {
            // Name can be an array, get first name
            contactName = Array.isArray(contact.name) ? contact.name[0] : contact.name;
        }
        
        // Extract phone number
        let contactPhone = '';
        if (contact.tel && contact.tel.length > 0) {
            // Phone can be an array, get first phone number
            // Phone numbers may include formatting, clean them
            const phoneValue = Array.isArray(contact.tel) ? contact.tel[0] : contact.tel;
            // Remove common formatting characters, keep only digits and +
            contactPhone = phoneValue.replace(/[^\d+]/g, '');
        }
        
        // Fill form fields
        const nameField = document.getElementById(nameFieldId);
        const phoneField = document.getElementById(phoneFieldId);
        
        if (nameField && contactName) {
            nameField.value = contactName;
            // Trigger input event for any validation listeners
            nameField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (phoneField && contactPhone) {
            phoneField.value = contactPhone;
            // Trigger input event for any validation listeners
            phoneField.dispatchEvent(new Event('input', { bubbles: true }));
            // Focus on phone field for easy editing
            phoneField.focus();
        }
        
        // Call success callback if provided
        if (onSuccess) {
            onSuccess({
                name: contactName,
                phone: contactPhone,
                contact: contact
            });
        }
        
    } catch (error) {
        console.error('Error picking contact:', error);
        
        // Handle different error types
        let errorMessage = 'Failed to pick contact.';
        
        if (error.name === 'AbortError' || error.name === 'NotSupportedError') {
            errorMessage = 'Contact picker not available. Please enter manually.';
        } else if (error.name === 'SecurityError') {
            errorMessage = 'Permission denied. Please allow contact access.';
        } else {
            errorMessage = `Error: ${error.message || error}`;
        }
        
        if (onError) {
            onError(new Error(errorMessage));
        } else {
            alert(errorMessage);
        }
    }
}

/**
 * Initialize contact browser button (offline - uses app's customer database)
 * @param {string} buttonId - ID of the contact browser button
 * @param {string} nameFieldId - ID of the name input field
 * @param {string} phoneFieldId - ID of the phone input field
 */
function initContactPickerButton(buttonId, nameFieldId, phoneFieldId) {
    const button = document.getElementById(buttonId);
    
    if (!button) {
        console.warn(`Contact browser button not found: ${buttonId}`);
        return;
    }
    
    // Always show button
    button.style.display = 'block';
    button.style.visibility = 'visible';
    button.title = 'Pick a contact from your phone contact list';

    // If the template didn't already set a good label, set one here
    if (!button.textContent || button.textContent.toLowerCase().includes('browse')) {
        button.textContent = '📱 Pick from Contacts';
    }
    
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Contact picker button clicked');
        console.log('Button ID:', buttonId);
        console.log('Name field ID:', nameFieldId);
        console.log('Phone field ID:', phoneFieldId);
        
        // Check support first (but try calling API anyway if it exists)
        const supportCheck = supportsContactPicker();
        const hasAPI = 'contacts' in navigator && typeof navigator.contacts.select === 'function';
        
        // If API doesn't exist at all, show error
        if (!hasAPI && !supportCheck.supported) {
            const info = supportCheck.info;
            let message = '📱 Contact picker is not available.\n\n';
            
            if (!info.isSecureContext) {
                message += '🔒 **SECURE CONTEXT REQUIRED**\n';
                message += 'Contact Picker API requires HTTPS (secure connection).\n\n';
                message += 'Current URL: ' + window.location.protocol + '//' + window.location.host + '\n\n';
                message += '💡 Solutions:\n';
                message += '• Use HTTPS instead of HTTP\n';
                message += '• Access via localhost (secure)\n';
                message += '• Set up SSL certificate for your server\n\n';
            } else if (!info.isMobile) {
                message += '❌ Contact Picker only works on mobile devices.\n';
                message += '💡 Use Chrome or Edge on an Android phone/tablet.\n\n';
            } else if (!info.isAndroid) {
                message += '❌ Contact Picker only works on Android devices.\n';
                message += '💡 Use Chrome or Edge browser on Android.\n\n';
            } else if (!info.isChrome && !info.isEdge) {
                message += '❌ Contact Picker only works in Chrome or Edge browsers.\n';
                message += '💡 Please use Chrome or Edge on Android.\n\n';
            } else {
                message += '❌ Contact Picker is not available.\n';
                message += '💡 Make sure you have Chrome 80+ or Edge 80+ on Android.\n\n';
            }
            
            message += '✅ You can still enter the contact details manually in the form fields above.';
            
            console.warn('Contact Picker not supported. Details:', info);
            
            alert(message);
            return;
        }
        
        // If we get here, API might exist - we'll try calling it and catch errors
        
        // Disable button during operation
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = '⏳ Loading...';
        
        try {
            // Use device Contact Picker API (native phone contact list)
            await pickContactFromPhone(
                nameFieldId,
                phoneFieldId,
                () => {
                    button.textContent = originalText;
                    button.disabled = false;
                },
                (err) => {
                    console.warn('Contact picker error:', err);
                    button.textContent = originalText;
                    button.disabled = false;
                }
            );
        } catch (error) {
            console.error('Error picking contact:', error);
            alert('Could not open phone contacts: ' + (error.message || error) + '\n\nPlease enter manually.');
            button.textContent = originalText;
            button.disabled = false;
        }
    });
}

/**
 * Auto-initialize contact picker buttons on page load
 * Looks for buttons with data-contact-picker attribute
 */
function autoInitContactPickers() {
    // Find all buttons with contact picker data attributes
    const buttons = document.querySelectorAll('[data-contact-picker]');
    
    buttons.forEach(button => {
        const nameFieldId = button.getAttribute('data-name-field');
        const phoneFieldId = button.getAttribute('data-phone-field');
        
        if (nameFieldId && phoneFieldId) {
            initContactPickerButton(button.id, nameFieldId, phoneFieldId);
        } else {
            console.warn('Contact picker button missing data attributes:', button);
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitContactPickers);
} else {
    autoInitContactPickers();
}

// Export functions for global use
window.pickContactFromPhone = pickContactFromPhone;
window.initContactPickerButton = initContactPickerButton;
window.supportsContactPicker = supportsContactPicker;

