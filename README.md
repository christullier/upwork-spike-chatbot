# Summit Assist: AI business chatbot demo

A working chat widget on a sample site for "Summit Home Services" (HVAC and plumbing, Rocklin CA). It covers three business functions:

- **Lead generation**: guided capture of name, email, phone, ZIP and need, with validation and a service-area check.
- **Quoting**: price range computed from a visible rate table (service, home size, urgency).
- **Customer support**: FAQ answers through in-browser intent matching (fuse.js), with a handoff to a human when unsure.
- **Admin dashboard** (`#/admin`): KPIs, leads table, intent breakdown, unanswered questions, transcripts and a CRM webhook JSON preview.

Everything runs in the browser (data in `localStorage`). No server, no API keys. A production version would swap the local matching for an LLM plus your knowledge base and connect to your CRM.

```
npm install
npm run dev     # local
npm test        # quote, intent and flow checks
npm run build   # writes dist/
```
