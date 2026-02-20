# Phase 4 - Improving tools and considering multi-agent 

## Overview
As of phase 4 development, Solaris web is at BASIC functionality. It is deployed on vercel and all basic functions are working. However there are major issues and improvements to be made. 
Thinking models are not able to use tools which is a big issue, most web search tools are failure prone leading to wasted time and tokens.  

## Improvements:
1. Enable thinking models access to tools. Currently, only non-thinking models can access tools, models with thinking are bocked from tool access. MODIFY this so that ALL models have access to tools. 
2. Add agent-browser as a tool. as there are multiple web browser tools, create a setting page where users can select which tool to use. Users can select one or more web browser tools. Refer: https://github.com/vercel-labs/agent-browser. Only tools that are selected are exposed to the agent and can be seen and used by the agent. tools that are un-selected should not be exposed to the agent.
3. Create 'Projects'. A project is a collection of threads and artifacts. Users can create projects and organize their work within projects. Review the current database structure, it may need to be restructured to place threads and artifacts under projects. artifacts management tools must also be confined to the currently active project so document management tools can only manage, see, access documents within the active project only.
4. Artifact button not showing all artifacts. In a thread, i asked the agent to create a slide presentation. It created multiple presentations as it improved on it but only the initial version was seen in the artifacts button. The subsequent versions were not shown. Display all artifacts in the CURRENT ACTIVE PROJECT in the artifacts button. 
