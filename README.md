![Wise Tools Banner](https://github.com/user-attachments/assets/62b5186f-6e07-4016-b7e4-20d431d7fee4)

A collection of tools to modify and enhance [Wise](https://wise.com) for faster use at [HCB Operations](https://hackclub.com/fiscal-sponsorship).

Current tools include:

- Copying a Recipient ID from the Recipient page
- Searching for a recipient by ID from the Recipients page
- Searching for a transaction on the [HCB](https://github.com/hackclub/hcb) ledger page

<img alt="screenshot of Wise dashboard with copy ID feature" src="/assets/demo.png">

## Installation

The latest version will be published to Mozilla Firefox Addons [here](https://addons.mozilla.org/en-GB/firefox/addon/wise-tools/). <-- _psst, it's under review!_

Alternatively, download the binary from [Releases](https://github.com/leowilkin/wise-tools/releases/latest), and install via [about:debugging](about:debugging#/runtime/this-firefox), unpack the ZIP, and load it as a temporary add-on.

## Features

### Copy Recipient ID

1. **Open a recipient page:** Click on any recipient to view their details on wise.com
2. **Find the Copy ID button:** Look for the orange "Copy ID" button in between the to the Send and Delete buttons
3. **Copy the ID:** Click the button to copy the recipient ID to your clipboard

### Search by Recipient ID

1. **Open the Recipients page:** Go to https://wise.com/recipients
2. **Enter recipient ID:** Type or paste a recipient ID into the search field
3. **Click Search by ID:** Click the "Search by ID" button next to the "Add recipient" button
4. **Navigate to recipient:** The page will redirect you directly to that recipient's page

### Search on HCB by Transaction

1. **Open a transaction detail page:** Go to a transaction via [All transactions](https://wise.com/all-transactions)
2. **Click the `Search on HCB` button:** You will see a new button which allows you to search by exact charged amount on the HCB ledger.

## Contributing

Find something that looks awesome and could be automated via extensions? PR it! I might find a way to do multi-modality for features, so you can toggle your faves and banish the ones that aren't useful. Might happen, might not.

## Technical Deets

Will only run on:

- active tab, AND only on:
- `*://wise.com/recipients/*` - To run on Wise recipient pages
- `*://*.wise.com/recipients/*` - To run on all Wise subdomains

Grabs ID from the Send button next to it which has the ID within it.

## Security

This extension doesn't do anything with the ID, apart from copy it to clipboard. No network calls are made. Your sh\*t is your sh\*t, seriously.

Somehow find a vulnerability? You're either bugging, or something's gone really _really_ wrong! Drop an issue, or send me an email at leo [at] wilkin [dot] xyz.
