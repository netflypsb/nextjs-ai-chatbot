# Solaris Web Phase 3 Ideas and Instructions

## Test
I tested the app, asking it to find cases on leukemia with concurrent thalasemia and to create an interactive dashboard. it succeeded in doing the research and partially succeeded in creating the dashboard. Following are issues to fix and places to improve:

## Issues:
1. After the initial success, messages are not going through. even simple messages are not going through. what happened!? The app worked fine just before this in my test. when i sent consecutive messages, the app retuned a message to wait for the model to complete its response but in my openrouter account, there is no logged activity. 
Please analyse the terminal and console then find, explain and fix this issue. 
2. Dashboard was only partially successful. it created several versions of the dashboard and it knew that one version had placeholder content and ATTEMPTED to recreate it with the real search results. However the final dashboard had no content at all! but the agent reported that it had completed the task. How about we create a quality check task which MUST always be created as the last step of the plan document. the agent must check the artifacts that are meant as the final output for the task and ensure completion and quality. 
* On further testing, could it be that the agent did create the content BUT it could not be displayed? is there a way around this? perhaps HTML rendering is blocked by webapps to prevent attacks? when i downloaded the HTML, there was content, but pdf and png were empty and the rendering was epty even though the agent repeatedly said that the content is there.
3. after several minutes, the agent response succeeded. is this an issue with the app, with vercel or with openrouter? does the terminal show? is there a timeout or something? 
4. download error. when trying to download a dashboard as .png, got the console error in C:\Users\netfl\TRIAL\nextjs-ai-chatbot\phase3\console.md

## Improvements:

1. Dropdown. review the app, there is a dropdown at the top for seelcting 'private' and 'public'. please change the icon and the dropdown options to 'Artifacts' and 'Plan'. Artifacts will open a separate tab that displays the different artifacts that were created in the CURRENT CHAT THREAD - is this possible? the Plan button opens the plan artifact in the canvas. in the artifacts tab, users can select the artifacts and if selected, the artifact is opened in the canvas. also, enable users to delete artifacts from the artifacts tab. 

2. OpenRouter. in the openrouter code, we can send the app name to openrouter, and also website link. for the name, make it 'Solaris-Web'. for the website make it solaris-app.com. 

3. review the UI rendering we are currently using and find out if we are optimising the capabilities of vercel, research this: https://ai-sdk.dev/cookbook/next/render-visual-interface-in-chat and consider if this can be applied for better UI/UX. 

4. When the canvas is opened, the chat is pushed to the left and part of it is outside the border of the browser and cannot be seen, please improve this. 

5. add this to enable better visualisation of agent thought: https://elements.ai-sdk.dev/components/chain-of-thought, https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces

6. Review the implementation of checkpoint, state management, state persistence. are we doing it correctly? is state management being implemented according to vercel AI SDK guides? is checkpoints being created correctly? refer: https://elements.ai-sdk.dev/components/checkpoint, https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence, https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams
make sure that we are doing it correctly: state is managed and is persistent, checkpoints are created after 50000 tokens, a new AI call is made when the checkpoint is reached, resumption of task after the checkpoint with state, original task, plan, instruction to continue and to use tools to analyse relevant artifacts or chat history for context, agent is thus able to continue from where it left off with only the relevant context. 

# Please review the necessary code files, perform the relevant research, then create a phase by phase plan for the fixes and improvements, create the files in C:\Users\netfl\TRIAL\nextjs-ai-chatbot\phase3 and proceed to implement. 
 