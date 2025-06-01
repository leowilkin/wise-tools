document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

    loadConfiguration();

    setupToggleListeners();

    browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const url = currentTab.url;

        if (url.includes('wise.com')) {
            statusText.textContent = 'Active on Wise';
            statusDiv.className = 'status active';
        } else {
            statusText.textContent = 'Not on a Wise page';
            statusDiv.className = 'status inactive';
        }
    });    function loadConfiguration() {
        browserAPI.storage.sync.get(['wiseToolsConfig'], function(result) {
            const config = result.wiseToolsConfig || {
                copyId: true,
                searchById: true,
                hcbSearch: false,
                airtable: false,
                airtableUrl: ''
            };

            document.getElementById('copyIdToggle').checked = config.copyId;
            document.getElementById('searchByIdToggle').checked = config.searchById;
            document.getElementById('hcbSearchToggle').checked = config.hcbSearch;
            document.getElementById('airtableToggle').checked = config.airtable;
            document.getElementById('airtableUrl').value = config.airtableUrl || '';
            
            // Show/hide Airtable config based on toggle state
            toggleAirtableConfig(config.airtable);
        });
    }    function setupToggleListeners() {
        const copyIdToggle = document.getElementById('copyIdToggle');
        const searchByIdToggle = document.getElementById('searchByIdToggle');
        const hcbSearchToggle = document.getElementById('hcbSearchToggle');
        const airtableToggle = document.getElementById('airtableToggle');
        const saveAirtableConfig = document.getElementById('saveAirtableConfig');

        copyIdToggle.addEventListener('change', function() {
            saveConfiguration();
            notifyContentScript();
        });

        searchByIdToggle.addEventListener('change', function() {
            saveConfiguration();
            notifyContentScript();
        });

        hcbSearchToggle.addEventListener('change', function() {
            saveConfiguration();
            notifyContentScript();
        });

        airtableToggle.addEventListener('change', function() {
            toggleAirtableConfig(this.checked);
            saveConfiguration();
            notifyContentScript();
        });

        saveAirtableConfig.addEventListener('click', function() {
            saveConfiguration();
            showSaveSuccess();
        });
    }    function saveConfiguration() {
        const config = {
            copyId: document.getElementById('copyIdToggle').checked,
            searchById: document.getElementById('searchByIdToggle').checked,
            hcbSearch: document.getElementById('hcbSearchToggle').checked,
            airtable: document.getElementById('airtableToggle').checked,
            airtableUrl: document.getElementById('airtableUrl').value
        };

        browserAPI.storage.sync.set({ wiseToolsConfig: config });
    }    function notifyContentScript() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('wise.com')) {
                browserAPI.tabs.sendMessage(tabs[0].id, {
                    action: 'configurationChanged'
                });
            }
        });
    }

    function toggleAirtableConfig(show) {
        const configDiv = document.getElementById('airtableConfig');
        if (show) {
            configDiv.classList.remove('hidden');
        } else {
            configDiv.classList.add('hidden');
        }
    }

    function showSaveSuccess() {
        const saveBtn = document.getElementById('saveAirtableConfig');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '#00b9ff';
        }, 2000);
    }
});
