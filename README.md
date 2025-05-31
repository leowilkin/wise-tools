# Wise Tools

A collection of tools to modify and enhance Wise (wise.com) for faster use at HCB Operations.

Current tools include:

- Copying a Recipient ID from the Recipient page
- Searching for a recipient by ID from the Recipients page

<img alt="screenshot of Wise dashboard with copy ID feature" src="/assets/demo.png">

## Installation

The latest version will be published to Mozilla Firefox Addons [here](https://addons.mozilla.org/en-GB/firefox/addon/wise-tools/).

Alternatively, download the binary from Releases, and install via about:addons.

## How to Use

### Copy Recipient ID

1. **Open a recipient page:** Click on any recipient to view their details on wise.com
2. **Find the Copy ID button:** Look for the orange "Copy ID" button in between the to the Send and Delete buttons
3. **Copy the ID:** Click the button to copy the recipient ID to your clipboard

### Search by Recipient ID

1. **Open the Recipients page:** Go to https://wise.com/recipients
2. **Enter recipient ID:** Type or paste a recipient ID into the search field
3. **Click Search by ID:** Click the "Search by ID" button next to the "Add recipient" button
4. **Navigate to recipient:** The page will redirect you directly to that recipient's page

## Contributing

Find something that looks awesome and could be automated via extensions? PR it! I might find a way to do multi-modality for features, so you can toggle your faves and banish the ones that aren't useful. Might happen, might not.

## Technical Deets

Will only run on:

- active tab, AND only on:
- `*://wise.com/recipients/*` - To run on Wise recipient pages
- `*://*.wise.com/recipients/*` - To run on all Wise subdomains

Grabs ID from the Send button next to it which has the ID within it. If it doesn't find it there, it has a sneak around `NEXT_PUBLIC`.

## Security

This extension doesn't do anything with the ID, apart from copy it to clipboard. No network calls are made. Your sh\*t is your sh\*t, seriously.

Somehow find a vulnerability? You're either bugging, or something's gone really _really_ wrong! Drop an issue, or send me an email at leo [at] wilkin [dot] xyz.
