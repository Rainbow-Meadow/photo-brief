
# Per-Connector Setup Steps

## What changes

### 1. `integrationDefinitions.ts` — Add `setupSteps` to every connector

Add a new `SetupStep` interface and a `setupSteps: SetupStep[]` field to `IntegrationDefinition`. Each connector gets 4-6 ordered, connector-specific steps. Examples:

| Connector | Steps summary |
|-----------|--------------|
| **Hosted Website Intake** | Go to Intake settings → Copy hosted URL → Add to site CTA → Configure routing |
| **Site Badge** | Copy script → Replace YOUR_TOKEN → Paste into site HTML → Verify |
| **Webhook Bridge** | Click Connect → Copy webhook URL → Paste into form tool → Map fields → Test |
| **WordPress** | Install forms plugin → Create Webhook Bridge → Add webhook action → Map fields → Or embed badge |
| **Webflow** | Create form → Create Webhook Bridge → Open Webflow Logic → Add HTTP action → Map fields → Publish & test |
| **Wix** | Add CTA button with intake URL → Or use Wix Automations → HTTP POST to webhook → Map fields → Native app coming |
| **Shopify** | (Planned) Install from App Store → Authenticate store → Map order events → Demand-driven |
| **Gmail** | Click Connect → Grant Google permissions → Return to PhotoBrief → Send via Gmail |
| **Manual SMS** | Create request → Copy text → Open messaging app → Send & mark sent |
| **Twilio** | Create Twilio account → Get credentials → Open SMS settings → Enter credentials → Test → Opt-out handling |
| **Telegram** | (Planned) Create bot via BotFather → Enter token → Choose chat → Receive alerts |
| **Zapier** | Set up webhook subscription → Create Zap → Trigger: Catch Hook → Register URL → Add actions → Or POST into PhotoBrief |
| **Make** | Create Scenario → Add Webhooks module → Register URL → Define data structure → Add downstream modules → Or POST into PhotoBrief |
| **Slack** | (Planned) Install app → Choose channel → Customize rules → Interim: use Zapier/Make |
| **Airtable** | (Planned) Choose base → OAuth → Map fields → Interim: use Zapier/Make |
| **HubSpot** | Click Connect → Grant HubSpot permissions → Return → Link contacts → Sync results |
| **Salesforce** | (Planned) OAuth → Map objects → Auto sync → Demand-driven |
| **Google Sheets** | (Planned) OAuth → Choose sheet → Auto row appends → Interim: use Zapier/Make |
| **Jobber** | (Planned) OAuth → Map clients → Attach briefs → Demand-driven |
| **ServiceTitan** | (Planned) OAuth → Map jobs → Attach submissions → Demand-driven |

### 2. `IntegrationsPage.tsx` — Expandable setup steps in ConnectorRow

Add a chevron/expand toggle to each `ConnectorRow`. When expanded, show a numbered list of setup steps below the connector info:

- Each step shows a circled step number, bold title, and detail text
- Collapsed by default; clicking the row or a "Setup guide" button expands it
- Planned connectors show steps prefixed with "Not yet available — here's how it will work"
- Consistent with the existing card styling (`surface-card`, semantic tokens)

### Technical details

- New `SetupStep` type: `{ title: string; detail: string }`
- `setupSteps` added to `IntegrationDefinition` interface
- `ConnectorRow` gets an `expanded` state toggled by clicking the chevron or row
- Steps rendered as an `<ol>` inside a collapsible `<div>` with smooth height transition
- No new dependencies needed
