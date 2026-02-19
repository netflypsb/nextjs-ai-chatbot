# Solari Web Phase 2 - UI enhancement and document type and code optimisation

## Goal
Phase 2 aims to research the capabilities of the app in its current stage as well as research the capabilities of vercel AI SDK and vercel AI SDK UI to optimise its existing capabilities for enhacing the UI/UX and for content creation. 

## Idea:
1. Rendering of plan in the UI with real time updates and smooth transitions and 'working' animation.
2. Stream tool calls to the UI using the full capability of vercel AI SDK UI with real time progress indicators and real time status updates.
3. Optimise the code capability WITHOUT USING E2B.
4. Create new document types for slides, Banners/Posters, Infographics, Interactive dashboards. Document types are created using the relevant text/code for example: Slides: Markdown with slide separators (---) Word: Markdown or structured text Excel: CSV or tab-delimited text PDF: HTML/CSS (can be converted later) Visual: SVG or data URLs. 
5. Client side rendering of the different artifact types. 
6. User can prompt the Agent to refine an existing artifact. 
7. Artifacts can be downloaded to users machine in the relevant format for example ppt/pptx for slides, .doc/.docx for word, .xlsx for excel, .pdf for pdf, .png/.jpg for infographics, .html for interactive dashboards.

* Must keep in mind that this app will be hosted on vercel as a web app, so all features must be compliant. 
* The aim is to enable Solaris Web to create powerpoint, excel, word, pdf, infographics, banners/posters, interactive dashboards (if successful, we will expand the list of visual formats to include more) in a way where the AI agent has the best fine grained control of creativity so that the output is of the highest quality and can be finely managed. 
* Also, i want to optimise the capabilities of the code document type without depending on e2b, or perhaps just the capability to create and run typescript code - is this even possible? refer https://chat.qwen.ai/ which can create interactive web apps using typescript. 

## References:
1. https://ai-sdk.dev/docs/ai-sdk-ui
2. https://chat.qwen.ai/

