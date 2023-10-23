import debug from "debug";
import React, { FC, useEffect, useState } from "react";
import { Mic } from "react-feather";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button, Col, Container, Input, Row } from "reactstrap";
import AudioStream from "./AudioStream";
import useRelevanceAI from "./useRelevanceAI";

const log = debug("aivoice");

const AIVoice: FC = () => {
  // Communicate with RelevanceAI Agent using voice.
  // The user speaks, the agent responds, and the conversation is displayed on the screen.
  // The agent is a chatbot that helps you switch Electricity providers.
  // The agent is powered by RelevanceAI
  // The speech recognition is a hook that relies on the browser-native speech recognition.
  // The audio playback is done using ElevenLabs API.
  // Note: There is a Start button that needs to be pressed to start the conversation.
  // This is because the auto-playback of the audio is blocked by Chrome otherwise.
  // To speak, press the microphone button. Once you are finished, press the microphone button again.
  //
  // Note: Add RelevanceAI API key.
  const RELEVANCEAI_API_KEY = "YOUR_API_KEY_HERE";
  // Add ElevenLabs API key here, you can get one for free on their website.
  const ELEVENLABS_API_KEY = "YOUR_API_KEY_HERE";

  const [userInput, setUserInput] = useState("");
  const [fullConversation, setFullConversation] = useState("");
  // Using a hook that relies on borwser speech recognition
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  // Encapsulate communication with the RelevanceAI agent
  const {
    sendToAgent,
    startAgentConversation,
    agentResponse,
    isAgentConnected,
  } = useRelevanceAI();

  const setTransscript = () => {
    setUserInput(transcript);
  };
  useEffect(setTransscript, [transcript]);

  const sendToAgentBackendIfReady = () => {
    if (!listening) {
      // We just stopped listening
      if (userInput !== "") {
        // log("userInput", userInput);
        sendToAgent(userInput);
        setFullConversation((prev) => prev + userInput + "\n");
        setUserInput("");
        resetTranscript();
      }
    }
  };
  useEffect(sendToAgentBackendIfReady, [listening]);
  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true });

  useEffect(() => {
    // Add egent reponse to the conversation
    if (agentResponse !== "") {
      setFullConversation((prev) => prev + agentResponse + "\n");
    }
  }, [agentResponse]);

  return (
    <div className="mt-4">
      <AudioStream text={agentResponse} apiKey={ELEVENLABS_API_KEY} />
      <Container>
        <Row>
          <Col className="d-flex mb-4">
            <Input
              aria-label="Search"
              type="text"
              onChange={(e) => setUserInput(e.currentTarget.value)}
              value={userInput}
              className="form-control-no-border align-self-stretch"
            />
            <Button
              color={listening ? "primary" : "secondary"}
              disabled={!isAgentConnected}
              className="ms-1"
              onClick={() => {
                if (!listening) {
                  log("startListening");
                  resetTranscript();
                  startListening();
                } else {
                  log("stopListening");
                  SpeechRecognition.stopListening();
                }
              }}
            >
              <Mic />
            </Button>

            <Button
              color={"primary"}
              className="ms-1"
              disabled={isAgentConnected}
              onClick={() => {
                startAgentConversation();
              }}
            >
              Start
            </Button>
          </Col>
        </Row>
        <div className={"h-100 conversation"}>
          <pre className={"preline"}>{fullConversation}</pre>
        </div>
      </Container>
    </div>
  );
};

export default AIVoice;
