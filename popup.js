document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('statusText');

    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

    browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const url = currentTab.url;

        if (url.includes('wise.com/recipients/')) {
            statusText.textContent = 'Active on this Wise recipient page';
            statusDiv.className = 'status active';
        } else if (url.includes('wise.com')) {
            statusText.textContent = 'On Wise, but not a recipient page';
            statusDiv.className = 'status inactive';
        } else {
            statusText.textContent = 'Not on a Wise page';
            statusDiv.className = 'status inactive';
        }
    });
});
