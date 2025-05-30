(function() {
    'use strict';
    function getContactId() {
        const urlMatch = window.location.href.match(/\/recipients\/([a-f0-9-]+)/);
        if (urlMatch && urlMatch[1]) {
            return urlMatch[1];
        }

        const sendButton = document.querySelector('a[href*="contact="]');
        if (sendButton) {
            const hrefMatch = sendButton.href.match(/contact=([a-f0-9-]+)/);
            if (hrefMatch && hrefMatch[1]) {
                return hrefMatch[1];
            }
            const testMatch = sendButton.href.match(/contact=([a-zA-Z0-9-]+)/);
            if (testMatch && testMatch[1]) {
                return testMatch[1];
            }
        }

        const nextDataScript = document.querySelector('#__NEXT_DATA__');
        if (nextDataScript) {
            try {
                const data = JSON.parse(nextDataScript.textContent);
                if (data.props?.pageProps?.contactDetails?.contact?.id) {
                    return data.props.pageProps.contactDetails.contact.id;
                }
                if (data.query?.contactId?.[0]) {
                    return data.query.contactId[0];
                }
            } catch (e) {
                console.log('Could not parse Next.js data:', e);
            }
        }

        return null;
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackErr) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    function showFeedback(button, success) {
        const originalText = button.textContent;
        button.textContent = success ? 'Copied!' : 'Failed!';
        button.style.backgroundColor = success ? '#28a745' : '#dc3545';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 2000);
    }
    function addCopyIdButton() {
        const sendButton = document.querySelector('a[href*="send"][href*="contact="]');
        if (!sendButton) {
            console.log('Send button not found');
            return;
        }

        const buttonContainer = sendButton.parentElement;
        if (!buttonContainer || !buttonContainer.classList.contains('m-b-3')) {
            console.log('Button container with m-b-3 class not found');
            return;
        }

        if (buttonContainer.querySelector('.wise-copy-id-btn')) {
            return;
        }

        const contactId = getContactId();
        if (!contactId) {
            console.log('Contact ID not found');
            return;
        }

        const copyButton = document.createElement('a');
        copyButton.className = 'btn btn-sm np-btn np-btn-sm btn-accent btn-priority-3 p-x-5 m-r-2 m-b-2 wise-copy-id-btn';
        copyButton.textContent = 'Copy ID';
        copyButton.setAttribute('aria-disabled', 'false');
        copyButton.setAttribute('aria-live', 'off');
        copyButton.setAttribute('aria-busy', 'false');
        copyButton.setAttribute('title', `Copy contact ID: ${contactId}`);
        copyButton.setAttribute('data-extension', 'wise-copy-id');
        copyButton.style.cursor = 'pointer';
        copyButton.href = '#';

        copyButton.addEventListener('click', async function(e) {
            e.preventDefault();
            const success = await copyToClipboard(contactId);
            showFeedback(copyButton, success);
            
            console.log(success ? `Copied contact ID: ${contactId}` : 'Failed to copy contact ID');
        });

        const deleteButton = buttonContainer.querySelector('button.btn-negative');
        if (deleteButton) {
            buttonContainer.insertBefore(copyButton, deleteButton);
        } else {
            buttonContainer.appendChild(copyButton);
        }

        console.log('Copy ID button added successfully for contact:', contactId);
    }

    function addSearchByIdButton() {
        if (!window.location.href.includes('/recipients') || window.location.href.includes('/recipients/')) {
            return;
        }

        const addRecipientButton = document.querySelector('button.Dashboard_addContact__khCen');
        if (!addRecipientButton) {
            console.log('Add recipient button not found');
            return;
        }

        if (document.querySelector('.wise-search-by-id-btn')) {
            return;
        }

        const searchByIdButton = document.createElement('button');
        searchByIdButton.className = 'btn btn-md np-btn np-btn-md btn-accent btn-priority-2 m-l-1 wise-search-by-id-btn';
        searchByIdButton.textContent = 'Search by ID';
        searchByIdButton.setAttribute('aria-disabled', 'false');
        searchByIdButton.setAttribute('type', 'button');
        searchByIdButton.setAttribute('aria-live', 'off');
        searchByIdButton.setAttribute('aria-busy', 'false');
        searchByIdButton.setAttribute('title', 'Search for a recipient by their ID');
        searchByIdButton.setAttribute('data-extension', 'wise-search-by-id');
        searchByIdButton.style.cursor = 'pointer';

        searchByIdButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const searchInput = document.querySelector('.SearchInput_tw-contact-search input[type="search"]');
            if (!searchInput || !searchInput.value.trim()) {
                alert('Please enter a recipient ID in the search field first');
                if (searchInput) {
                    searchInput.focus();
                }
                return;
            }

            const recipientId = searchInput.value.trim();
            
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(recipientId)) {
                alert('Please enter a valid recipient ID (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
                searchInput.focus();
                return;
            }

            const recipientUrl = `https://wise.com/recipients/${recipientId}`;
            window.location.href = recipientUrl;
        });

        addRecipientButton.parentElement.insertBefore(searchByIdButton, addRecipientButton.nextSibling);

        console.log('Search by ID button added successfully');
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                addCopyIdButton();
                addSearchByIdButton();
            });
        } else {
            addCopyIdButton();
            addSearchByIdButton();
        }
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    if (window.location.href.includes('/recipients/') && 
                        document.querySelector('a[href*="send"][href*="contact="]') && 
                        !document.querySelector('.wise-copy-id-btn')) {
                        setTimeout(addCopyIdButton, 500);
                    }
                    
                    if (window.location.href.includes('/recipients') && 
                        !window.location.href.includes('/recipients/') &&
                        document.querySelector('button.Dashboard_addContact__khCen') &&
                        !document.querySelector('.wise-search-by-id-btn')) {
                        setTimeout(addSearchByIdButton, 500);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    init();

})();
