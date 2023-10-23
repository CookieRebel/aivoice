import debug from "debug";
import { useEffect, useState } from "react";

const log = debug("app:component:components.content.useRelevanceAI");

const useRelevanceAI: (apiKey: string) => {
  startAgentConversation: () => void;
  sendToAgent: (userInput: string) => void;
  pollAgentResponse: () => void;
  agentResponse: string;
  isAgentConnected: boolean;
} = (apiKey) => {
  const [jobId, setJobId] = useState("");
  const [studioId, setStudioId] = useState("");
  const [conversation_id, setConversationId] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const startAgentConversation: () => Promise<void> = async () => {
    log("startAgentConversation");
    const fullUrl =
      "https://api-f1db6c.stack.tryrelevance.com/latest/agents/trigger";
    const body = {
      action: "send",
      message: {
        role: "user",
        content: "Hello who are you?",
        importance_level: "normal",
      },
      agent_id: "0ab7d523-e0b2-46d8-a6be-b3e80a087308",
    };

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=UTF-8",
        Authorization: apiKey,
      },
      body: body ? JSON.stringify(body) : null,
    });
    // log(`Response status ${response.status}`);
    if (!response.ok) {
      log("Response not ok");
    } else {
      const responseObject = await response.json();
      const conversation_id = responseObject.conversation_id;
      setConversationId(conversation_id);
      const job_info = responseObject.job_info;
      setJobId(job_info.job_id);
      setStudioId(job_info.studio_id);
    }
  };

  const sendToAgent: (userInput: string) => Promise<void> = async (
    userInput: string
  ) => {
    log("sendToAgent");
    const fullUrl =
      "https://api-f1db6c.stack.tryrelevance.com/latest/agents/trigger";
    const body = {
      action: "send",
      message: {
        role: "user",
        content: userInput,
        importance_level: "normal",
      },
      agent_id: "0ab7d523-e0b2-46d8-a6be-b3e80a087308",
    };
    if (conversation_id !== "") {
      // @ts-ignore
      body["conversation_id"] = conversation_id;
    }

    log("body", body);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=UTF-8",
        Authorization: apiKey,
      },
      body: body ? JSON.stringify(body) : null,
    });
    // log(`Response status ${response.status}`);
    if (!response.ok) {
      log("Response not ok");
    } else {
      const responseObject = await response.json();
      const job_info = responseObject.job_info;
      setJobId(job_info.job_id);
      setStudioId(job_info.studio_id);
    }
  };

  const pollAgentResponse: () => Promise<void> = async () => {
    log("pollAgentResponse");
    const pollingUrl = `https://api-f1db6c.stack.tryrelevance.com/latest/studios/${studioId}/async_poll/${jobId}`;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      log(".");
      const response = await fetch(pollingUrl, {
        method: "GET",
        headers: {
          "Content-type": "application/json;charset=UTF-8",
          Authorization: apiKey,
        },
      });
      if (response.ok) {
        // log("Response ok");
        const data = await response.json();
        if (data && data.type === "complete") {
          // log("complete");
          // log("data", data);
          const updates = data.updates;
          // Find the update with type "step-success"
          const stepSuccess = updates.find(
            (update: any) => update.type === "step-success"
          );
          // log("stepSuccess", stepSuccess);
          log(
            "stepSuccess.state.output.answer",
            stepSuccess.state.output.answer
          );
          // Break answer into sentences
          const answer = stepSuccess.state.output.answer;
          setAgentResponse(answer);
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5 seconds delay before next poll
    }
  };

  useEffect(() => {
    if (jobId && studioId) {
      pollAgentResponse();
    }
  }, [jobId, studioId, pollAgentResponse]);

  const isAgentConnected =
    conversation_id !== "" && jobId !== "" && studioId !== "";
  return {
    startAgentConversation,
    sendToAgent,
    pollAgentResponse,
    agentResponse,
    isAgentConnected,
  };
};

export default useRelevanceAI;
