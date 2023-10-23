# AIVOICE 
Sample app that allows using voice to talk to a RelevanceAI Agent.

This is the code used to build SwitchAI for the SXSW AI Hackathon 2023.

It uses the browser's spech-to-text and Elevenlabs text-to-speech

# NOTES
First press the Start button to initiate the conversation. The agent will introduce himself.

Then press the microphone to speak, and press again when you are done

The Start button is necessary because Chrome doesn't allow audio autoplay when the user hasn't interacted with the page. (https://developer.chrome.com/blog/autoplay/)

# RUNNING
You need to configure two API Keys:

Relevance AI API Key - This is the Key to the Relevance AI Agent

ElevenLabs API Key - This is used for the text-to-voice. You can obtain a free key from Elevenlabs
