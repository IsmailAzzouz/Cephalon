# Agent roles

Ordis is the conversation role’s default profile. Name, voice and style may
change without changing the responsibilities below. The role lives in
`agents/companion/`; profiles are described in `presets/`.

These roles describe the target; no model-connected agent is delivered yet.

| Agent | Responsibility | Expected output |
| --- | --- | --- |
| Conversation agent | Welcome, clarify, converse, relay requests and present results | An understandable exchange with the Operator |
| Brain | Plan, choose capabilities, delegate, verify and synthesize | An evidenced result and accurate work status |
| Computer use | Conduct a mission through a computer interface | Actions, observations, limitations and result |
| Research | Find, cross-check and attribute information | A response with sources and uncertainty |
| Coding | Inspect, change and verify a project within the assigned scope | Changes, validation and limitations |

The conversation agent and brain are the two principal roles in a session. This
does not require two permanently running LLM loops. Specialists are called as needed.

The conversation agent talks to the Operator; its crystal is a rendering component.
The brain owns work state. The companion may talk and request clarification during
a mission without resetting that work.

A delegation includes an objective, useful context, allowed capabilities,
constraints, a completion criterion and a reference to its parent task. A
specialist returns its result, supporting evidence and any blockers. The brain
decides what happens next and relays human questions through the conversation agent.

Role instructions will live beside their implementation in `agents/<role>/`.
Shared mechanisms belong in `packages/agent-runtime/`, tools in `packages/tools/`
and provider adapters in `packages/integrations/`.
