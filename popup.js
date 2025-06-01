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
                hcbSearch: false
            };

            document.getElementById('copyIdToggle').checked = config.copyId;
            document.getElementById('searchByIdToggle').checked = config.searchById;
            document.getElementById('hcbSearchToggle').checked = config.hcbSearch;
        });
    }

    function setupToggleListeners() {
        const copyIdToggle = document.getElementById('copyIdToggle');
        const searchByIdToggle = document.getElementById('searchByIdToggle');
        const hcbSearchToggle = document.getElementById('hcbSearchToggle');

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
    }

    function saveConfiguration() {
        const config = {
            copyId: document.getElementById('copyIdToggle').checked,
            searchById: document.getElementById('searchByIdToggle').checked,
            hcbSearch: document.getElementById('hcbSearchToggle').checked
        };

        browserAPI.storage.sync.set({ wiseToolsConfig: config });
    }

    function notifyContentScript() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('wise.com')) {
                browserAPI.tabs.sendMessage(tabs[0].id, {
                    action: 'configurationChanged'
                });
            }
        });
    }
});
