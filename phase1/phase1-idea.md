# Solaris Web

## Phase 1
Following are the instructions for Phase 1 of the project. 

1. Delete the 'Deploy with vercel' button in top right corner of the app and replace it with 'Solaris Web'.

2. Implement user login. Users MUST login to use the chatbot. delete the guest login. Use Clerk for login, use google and email login. C:\Users\netfl\TRIAL\nextjs-ai-chatbot\.env.local already has the clerk credentials. 


3. Review how the current app stores artifacts. I think that it stores artifacts as 'Documents', where documents are all stored as text files with different 'types', currently it has text, code, sheet, image. Is this correct? Analyse the code base to get a complete understanding how documents are stored, retrieved, displayed, if there are separate helper functions to manage the creation and displaying of the different document types.

4. create a new 'type' called 'plan'. this is a unique document type that will be crucial to making the agent into a 'deepagent' that is capable of working on complex long horizon tasks. plan will be the plannig document that will guide the agent on performing tasks so that it does not lose context of what it must do. create it in the same way that other document types are created and enable it to be streamed to the frontend similar to how other document types can be streamed to the frontend. research 'planning' and 'planning tool' as a requirement for 'deepagents' and also how planning is implemented in frontier AI applications like claude cowork, langgraph deepagents, use these as a guide to create the plan document type, its structure and how it should be streamed to the frontend. 

5. create new tools for:
a.  Search document:  tool to search existing documents by title/content/type/date created/date modified/chat id in which the document was created
b.  List documents:  tool to list user's documents
c. Read document:  tool to read document content by ID
these tools will be used to finely manage the text, code, sheet, image artefacts. 

6. perhaps placing a wraper around the create, update, search, list, read document tools, create tools specifically for managing the 'plan' type document. 

7. Review the implementation of the agent. it is created using vercel ai sdk. research vercel ai sdk: https://ai-sdk.dev/docs/introduction. the agent has tool access and can repeatedly use tools until a maximum number, by default i think it is set to 20. modify the default maximum to 1000. 

8. make it so that the agent works in a ReACT loop. refer https://github.com/langchain-ai/react-agent to understand react agent loop. To ensure that the ReACT loop, plan document creation, update are implemented, use the MOST APPROPRIATE workflow and loop to orchestrate the agents behavior, vercel supports workflow and loop, research: https://ai-sdk.dev/docs/agents/workflows, https://ai-sdk.dev/docs/agents/loop-control

9. ensure this behavior: the agent must always start by creating a Plan using the planning tool. then it will implement the plan step by step, using ReACT loop - reason on the task and context, then act on it, observe, then once done, it MUST always update the plan file. 

10. in order for the agent to be able to maintain context over very long tasks that exceeds its cotext window, we need to implement memory. vercel provides this using custom memory tools, refer: https://ai-sdk.dev/docs/agents/memory#custom-tool and https://ai-sdk.dev/cookbook/guides/custom-memory-tool
for memory, can we create state management and checkpointing for context management? what i am referring to is the issue of an AI models context limit. in the current implementation, i think that all messages, tool calls, tool call results are always fitted into the models context window is this correct? can we make it so that after 50000 tokens, a checkpoint is created and a new AI model call is initiated. the new AI instance will be provided with the state as context so it knows what it has to do. state saves and passes the most important information needed for the agent to work and includes: 1. original user request, 2. plan document, 3. documents that have been created in the current task run, 4. generic instruction to use the file access tools to find and read relevant files for context and to continue the plan. research: https://docs.langchain.com/oss/python/langgraph/graph-api, 


## Success criteria
 What i want to enable is that this agent 'Solaris Web' becomes a 'deepagent' as defined by langchain team: https://blog.langchain.com/deep-agents/ which is capable of performing comple long horizon tasks AND is suitable for cloud hosting on vercel. most deepagent systems require real file system access to create plan document and for context management. however enabling real file system access is challenging in a cloud hosted app. so i want to use the existing document system which already works and use the existing document system, tools and database storage as the file system. create plan as a document type that the agent creates and updates, and use vercel memory to manage context by creating a state management/checkpoint/continue from checkpoint similar to what is done in most agentic apps, . 

## Instruction
Using this document as a guide, use MCP tools to do a comprehensive research on the mentioned things, write phase by phase plan in separate files in C:\Users\netfl\TRIAL\nextjs-ai-chatbot\phase1 for implementing these improvements to the current app, include relevant research material/guidelines from sources to guide the development. 
Then implement the plan.