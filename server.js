const express = require('express');
const path = require('path');
const { SessionsClient } = require('@google-cloud/dialogflow');

const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_ID = 'canteenbot-9iv9';
const KEY_FILE = path.join(__dirname, 'credentials', 'dialogflow-key.json');

let sessionClient;
try {
  sessionClient = new SessionsClient({ keyFilename: KEY_FILE });
  console.log('Dialogflow client initialized successfully.');
} catch (err) {
  console.error('Failed to initialize Dialogflow client:', err.message);
  process.exit(1);
}

app.use(express.static(__dirname));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Missing message or sessionId' });
  }

  try {
    const sessionPath = sessionClient.projectAgentSessionPath(PROJECT_ID, sessionId);

    const [response] = await sessionClient.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en-US'
        }
      }
    });

    const result = response.queryResult;
    const reply = result.fulfillmentText;
    const intent = result.intent ? result.intent.displayName : 'UNKNOWN';

    console.log('[Dialogflow]');
    console.log('  User:   ' + message);
    console.log('  Intent: ' + intent);
    console.log('  Reply:  ' + reply);

    res.json({ reply, intent });
  } catch (err) {
    console.error('[Dialogflow Error]', err.message);
    res.status(500).json({ error: 'Failed to get response from assistant' });
  }
});

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
