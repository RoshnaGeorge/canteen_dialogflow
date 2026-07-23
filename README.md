# College Canteen Chatbot

A custom chat interface connected to a real **Dialogflow ES** agent via a Node.js + Express backend. Replaces the deprecated Dialogflow Web Demo iframe with a secure server-side integration.

---

## Architecture

```
User
  ↓
College Canteen Website (index.html / style.css / script.js)
  ↓
POST /api/chat
  ↓
Node.js + Express Backend (server.js)
  ↓
@google-cloud/dialogflow SDK
  ↓
Dialogflow ES Detect Intent API → CanteenBot Agent
  ↓
Response returned to frontend
```

All NLP and intent recognition is handled by Dialogflow. No hardcoded responses, no intent matching in JavaScript.

---

## Project Structure

```
college-canteen-chatbot/
├── credentials/
│   └── dialogflow-key.json   ← YOUR service account key (not committed)
├── node_modules/
├── index.html                ← Frontend page (navbar, hero, menu, chat, footer)
├── style.css                 ← All styling
├── script.js                 ← Frontend logic (nav toggle, scroll reveal, chat UI)
├── server.js                 ← Express + Dialogflow backend
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## Setup

### Prerequisites

- Node.js (v18 or later)
- A Dialogflow ES agent named **CanteenBot** with the following intents:
  - `Default Welcome Intent` (training: "Hi", "Hello", "Hey")
  - `View_Menu` (training: "Show me the menu", "What is available today?")
  - `Order_Food` (training: "I want 2 dosas", with parameters: `number` + `food_item`)
  - `Confirm_Order` (training: "Yes", "Confirm", "Place my order")
- Custom entity `@food_item` with values: dosa, idli, fried_rice, sandwich, tea, coffee
- Google Cloud Project ID: **canteenbot-9iv9**
- Dialogflow API enabled on the project
- A service account with **Dialogflow API Client** role and a JSON key downloaded

### 1. Place the service account key

Create the `credentials/` folder (if it doesn't exist) and place your downloaded JSON key there:

```
credentials/dialogflow-key.json
```

**Never commit this file to GitHub.** The `.gitignore` already excludes the `credentials/` directory.

### 2. Install dependencies

```
npm install
```

(You may have already run this; re-running is harmless.)

### 3. Start the server

```
npm start
```

You should see:

```
Dialogflow client initialized successfully.
Server running at http://localhost:3000
```

### 4. Open the application

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing the chatbot

| You type             | Expected behaviour                                            |
|----------------------|---------------------------------------------------------------|
| `Hi`                 | Dialogflow detects `Default Welcome Intent`; welcome message  |
| `Show me the menu`   | Dialogflow detects `View_Menu`; menu with prices returned     |
| `I want 2 dosas`     | Dialogflow detects `Order_Food`; order summary shown          |
| `Yes`                | Dialogflow detects `Confirm_Order`; order confirmed           |

All responses come from your real Dialogflow ES agent — nothing is hardcoded in the frontend or backend.

---

## API Endpoint

### `POST /api/chat`

**Request:**
```json
{
  "message": "I want 2 dosas",
  "sessionId": "unique-session-id"
}
```

**Response (200):**
```json
{
  "reply": "You have selected 2 dosa. Would you like to confirm your order?",
  "intent": "Order_Food"
}
```

**Response (400 — missing fields):**
```json
{
  "error": "Missing message or sessionId"
}
```

**Response (500 — Dialogflow error):**
```json
{
  "error": "Failed to get response from assistant"
}
```

---

## Troubleshooting

### 403 PERMISSION_DENIED
The service account does not have the **Dialogflow API Client** role.
- Go to **IAM & Admin → IAM** in Google Cloud Console
- Find `canteen-chatbot-backend` service account
- Assign role: **Dialogflow API Client**
- Wait a few minutes for permissions to propagate

### 401 UNAUTHENTICATED
The service account key file is invalid, expired, or the wrong file.
- Verify `credentials/dialogflow-key.json` exists and is the correct key
- Re-download the key from Google Cloud Console if needed

### ENOENT for dialogflow-key.json
```
Error: ENOENT: no such file or directory, open '...credentials/dialogflow-key.json'
```
- Ensure the file exists at `credentials/dialogflow-key.json`
- The folder and file must be present in the project root

### Cannot find module @google-cloud/dialogflow
```
Error: Cannot find module '@google-cloud/dialogflow'
```
Run:
```
npm install
```

### HTTP 500 from /api/chat
Check the server terminal for the full error message. Common causes:
- Dialogflow API not enabled
- Wrong project ID
- Service account lacks permissions
- Network issues reaching Google APIs

### Dialogflow Default Fallback Intent
Your input didn't match any intent. Add more training phrases to your intents in the Dialogflow console.

### Cannot GET /
The Express server is not running or is on a different port. Verify:
```
npm start
```
Then open `http://localhost:3000`.

### Empty fulfillmentText
The matched intent has no response configured. Add a **Text Response** in the Dialogflow console for that intent.

### fetch /api/chat failure
- Ensure the server is running (`npm start`)
- Open the browser DevTools (F12) → Network tab to see the exact error
- If using a different port, the frontend will not reach the backend (CORS is not configured because both run on the same origin)

### npm start failure
```
node server.js
```
Check for syntax errors or missing modules. Run `npm install` first.
