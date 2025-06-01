(function() {
    'use strict';

    let config = {
        copyId: true,
        searchById: true,
        hcbSearch: false,
        airtable: false,
        airtableUrl: ''
    };

    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

    function loadConfiguration() {
        browserAPI.storage.sync.get(['wiseToolsConfig'], function(result) {
            config = result.wiseToolsConfig || {
                copyId: true,
                searchById: true,
                hcbSearch: false,
                airtable: false,
                airtableUrl: ''
            };
            removeExistingButtons();
            initializeTools();
        });
    }

    browserAPI.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'configurationChanged') {
            loadConfiguration();
        }
    });

    loadConfiguration();

    function removeExistingButtons() {
        const existingCopyButton = document.querySelector('.wise-copy-id-btn');
        const existingSearchButton = document.querySelector('.wise-search-by-id-btn');
        const existingHcbButton = document.querySelector('.wise-hcb-search-btn');
        const existingAirtableButton = document.querySelector('.wise-airtable-btn');
        
        if (existingCopyButton) {
            existingCopyButton.remove();
        }
        if (existingSearchButton) {
            existingSearchButton.remove();
        }
        if (existingHcbButton) {
            existingHcbButton.remove();
        }
        if (existingAirtableButton) {
            existingAirtableButton.remove();
        }
    }

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
        if (!config.copyId) {
            return;
        }

        const sendButton = document.querySelector('a[href*="send"][href*="contact="]');
        if (!sendButton) {
            return;
        }

        const buttonContainer = sendButton.parentElement;
        if (!buttonContainer || !buttonContainer.classList.contains('m-b-3')) {
            return;
        }

        if (buttonContainer.querySelector('.wise-copy-id-btn')) {
            return;
        }

        const contactId = getContactId();
        if (!contactId) {
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
        });

        const deleteButton = buttonContainer.querySelector('button.btn-negative');
        if (deleteButton) {
            buttonContainer.insertBefore(copyButton, deleteButton);
        } else {
            buttonContainer.appendChild(copyButton);
        }
    }

    function addSearchByIdButton() {
        if (!config.searchById) {
            return;
        }

        if (!window.location.href.includes('/recipients') || window.location.href.includes('/recipients/')) {
            return;
        }

        const addRecipientButton = document.querySelector('button.Dashboard_addContact__khCen');
        if (!addRecipientButton) {
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
    }

    function getTransactionAmountInCents() {
        const nextDataScript = document.querySelector('#__NEXT_DATA__');
        if (nextDataScript) {
            try {
                const data = JSON.parse(nextDataScript.textContent);
                
                let secondaryAmount = null;
                
                if (data.props?.componentInitialProps?.activityData?.activities?.[0]?.secondaryAmount) {
                    secondaryAmount = data.props.componentInitialProps.activityData.activities[0].secondaryAmount;
                }
                
                if (!secondaryAmount && data.props?.pageProps?.activityDetails?.secondaryAmount) {
                    secondaryAmount = data.props.pageProps.activityDetails.secondaryAmount;
                }
                
                if (secondaryAmount && typeof secondaryAmount === 'string') {
                    const match = secondaryAmount.match(/^(\d+\.\d+)\s+USD$/);
                    if (match) {
                        const dollarAmount = parseFloat(match[1]);
                        const amountInCents = Math.round(dollarAmount * 100);
                        return amountInCents;
                    }
                }
            } catch (e) {
            }
        }
        return null;
    }

    function addHcbSearchButton() {
        if (!config.hcbSearch) {
            return;
        }

        if (!window.location.href.includes('/transactions/activities/by-resource/TRANSFER/')) {
            return;
        }

        if (document.querySelector('.wise-hcb-search-btn')) {
            return;
        }

        let categoryDropdownContainer = document.querySelector('.CategoryDropdown_styledCategorySelect__SR5LN');
        
        if (!categoryDropdownContainer) {
            categoryDropdownContainer = document.querySelector('[class*="CategoryDropdown_styledCategorySelect"]');
        }
        
        if (!categoryDropdownContainer) {
            const fieldset = document.querySelector('fieldset.np-input-group');
            if (fieldset && fieldset.parentElement && fieldset.parentElement.className.includes('CategoryDropdown')) {
                categoryDropdownContainer = fieldset.parentElement;
            }
        }
        
        if (!categoryDropdownContainer) {
            const generalButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('General') && btn.getAttribute('role') === 'combobox'
            );
            if (generalButton) {
                let parent = generalButton.parentElement;
                while (parent && !parent.className.includes('CategoryDropdown')) {
                    parent = parent.parentElement;
                }
                if (parent) {
                    categoryDropdownContainer = parent;
                }
            }
        }

        if (!categoryDropdownContainer) {
            return;
        }

        const amountInCents = getTransactionAmountInCents();

        const hcbButton = document.createElement('button');
        hcbButton.className = 'btn btn-sm np-btn np-btn-sm btn-accent btn-priority-3 p-x-5 m-r-2 wise-hcb-search-btn';
        hcbButton.textContent = 'Search on HCB';
        hcbButton.setAttribute('aria-disabled', 'false');
        hcbButton.setAttribute('type', 'button');
        hcbButton.setAttribute('aria-live', 'off');
        hcbButton.setAttribute('aria-busy', 'false');
        hcbButton.setAttribute('title', amountInCents ? `Search HCB ledger for amount: ${amountInCents} cents` : 'Search HCB ledger');
        hcbButton.setAttribute('data-extension', 'wise-hcb-search');
        hcbButton.style.cursor = 'pointer';

        hcbButton.addEventListener('click', function(e) {
            e.preventDefault();
            const hcbUrl = amountInCents 
                ? `https://hcb.hackclub.com/admin/ledger?amount=${amountInCents}&mapped_by_human=1&unmapped=0`
                : 'https://hcb.hackclub.com/admin/ledger';
            window.open(hcbUrl, '_blank');
        });

        categoryDropdownContainer.parentElement.insertBefore(hcbButton, categoryDropdownContainer);
    }    function addAirtableButton() {
        if (!config.airtable || !config.airtableUrl) {
            return;
        }

        if (document.querySelector('.wise-airtable-btn')) {
            return;
        }

        let sidebarNav = null;
        
        const navElements = document.querySelectorAll('nav');
        for (const nav of navElements) {
            const navLinks = nav.querySelectorAll('a');
            const hasMultipleMainNavItems = navLinks.length >= 3 && (
                nav.querySelector('a[href*="/recipients"]') || 
                nav.querySelector('a[href*="/transactions"]') ||
                nav.querySelector('a[href="/"]') || 
                nav.querySelector('a[href*="/cards"]')
            );
            
            const navRect = nav.getBoundingClientRect();
            const isLeftSidebar = navRect && navRect.left < window.innerWidth / 3;
            
            if (hasMultipleMainNavItems && isLeftSidebar) {
                sidebarNav = nav;
                break;
            }
        }
        
        if (!sidebarNav) {
            sidebarNav = document.querySelector('.Navigation_container__6qB8j');
        }
        
        if (!sidebarNav) {
            const possibleSidebars = document.querySelectorAll('[class*="sidebar"], [class*="Navigation"]');
            for (const sidebar of possibleSidebars) {
                if (sidebar.querySelector('a[href*="/recipients"]') || sidebar.querySelector('a[href*="/transactions"]')) {
                    sidebarNav = sidebar;
                    break;
                }
            }
        }

        if (!sidebarNav) {
            return;
        }const airtableButton = document.createElement('a');
        airtableButton.className = 'wise-airtable-btn';
        airtableButton.href = config.airtableUrl;
        airtableButton.target = '_blank';
        airtableButton.rel = 'noopener noreferrer';
        airtableButton.innerHTML = '<svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M6 6a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m2 1h13V5H8zm0 6h13v-2H8zm13 6H8v-2h13zM6 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m-1.5 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3" clip-rule="evenodd"></path></svg><span>Airtable</span>';        airtableButton.setAttribute('title', 'Open Airtable');
        airtableButton.setAttribute('data-extension', 'wise-airtable');
        airtableButton.style.cursor = 'pointer';

        const navList = sidebarNav.querySelector('ul, .nav-list, [role="list"]');
        if (navList) {
            const listItem = document.createElement('li');
            listItem.appendChild(airtableButton);
            navList.appendChild(listItem);
        } else {
            sidebarNav.appendChild(airtableButton);
        }
    }

    function initializeTools() {
        addCopyIdButton();
        addSearchByIdButton();
        addAirtableButton();
        setTimeout(addHcbSearchButton, 1000);
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initializeTools();
            });
        } else {
            initializeTools();
        }

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    if (config.copyId && 
                        window.location.href.includes('/recipients/') && 
                        document.querySelector('a[href*="send"][href*="contact="]') && 
                        !document.querySelector('.wise-copy-id-btn')) {
                        setTimeout(addCopyIdButton, 500);
                    }
                    
                    if (config.searchById &&
                        window.location.href.includes('/recipients') && 
                        !window.location.href.includes('/recipients/') &&
                        document.querySelector('button.Dashboard_addContact__khCen') &&
                        !document.querySelector('.wise-search-by-id-btn')) {
                        setTimeout(addSearchByIdButton, 500);
                    }

                    if (config.hcbSearch &&
                        window.location.href.includes('/transactions/activities/by-resource/TRANSFER/') && 
                        (document.querySelector('.CategoryDropdown_styledCategorySelect__SR5LN') || 
                         document.querySelector('[class*="CategoryDropdown_styledCategorySelect"]') ||
                         Array.from(document.querySelectorAll('button')).find(btn => 
                            btn.textContent.includes('General') && btn.getAttribute('role') === 'combobox'
                         )) &&
                        !document.querySelector('.wise-hcb-search-btn')) {
                        setTimeout(addHcbSearchButton, 1000);
                    }                    if (config.airtable && config.airtableUrl) {
                        // Check for left sidebar navigation more specifically
                        const navElements = document.querySelectorAll('nav');
                        let hasMainSidebar = false;
                        
                        for (const nav of navElements) {
                            const navLinks = nav.querySelectorAll('a');
                            const hasMultipleMainNavItems = navLinks.length >= 3 && (
                                nav.querySelector('a[href*="/recipients"]') || 
                                nav.querySelector('a[href*="/transactions"]') ||
                                nav.querySelector('a[href="/"]') || 
                                nav.querySelector('a[href*="/cards"]')
                            );
                            
                            const navRect = nav.getBoundingClientRect();
                            const isLeftSidebar = navRect && navRect.left < window.innerWidth / 3;
                            
                            if (hasMultipleMainNavItems && isLeftSidebar) {
                                hasMainSidebar = true;
                                break;
                            }
                        }
                        
                        if ((hasMainSidebar || document.querySelector('.Navigation_container__6qB8j')) &&
                            !document.querySelector('.wise-airtable-btn')) {
                            setTimeout(addAirtableButton, 500);
                        }
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
