
import { ToolDefinition } from '../types';

export const TOOLS: ToolDefinition[] = [
  // --- Strategy ---
  {
    id: 'strat-1',
    name: 'SWOT Analysis Generator',
    description: 'Create a comprehensive SWOT analysis for any business or project.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are a Strategic Consultant. Create a detailed SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis based on the user input. Use Markdown tables.',
    placeholder: 'Describe your business or project...'
  },
  {
    id: 'strat-2',
    name: 'Business Model Canvas',
    description: 'Draft a one-page business model canvas.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are a Business Architect. Generate a Business Model Canvas (Value Prop, Segments, Channels, Revenue, etc.) for the user. Use structured Markdown.',
    placeholder: 'What is your business idea?'
  },
  {
    id: 'strat-3',
    name: 'OKRs Drafter',
    description: 'Set clear Objectives and Key Results for your team.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are an Operations Manager. Draft 3-5 high-quality OKRs (Objectives and Key Results) based on the user\'s goal. Ensure results are measurable.',
    placeholder: 'What is your main goal for this quarter?'
  },
  {
    id: 'strat-4',
    name: 'Pitch Deck Outliner',
    description: 'Create a structure for a winning investor pitch deck.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are a Venture Capital Consultant. Outline a 10-slide pitch deck structure for the user\'s startup, including key talking points for each slide.',
    placeholder: 'Describe your startup briefly...'
  },
  {
    id: 'strat-5',
    name: 'Mission Statement Gen',
    description: 'Craft inspiring mission and vision statements.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are a Brand Strategist. Create 3 distinct Mission and Vision statement options for the company described. Vary the tone (Inspiring, Grounded, Bold).',
    placeholder: 'What does your company do and who do you serve?'
  },
  {
    id: 'strat-6',
    name: 'Competitive Advantage Finder',
    description: 'Identify your unfair advantage.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are a Business Strategist. Analyze the business description provided and identify 3 potential "Unfair Advantages" or moats (e.g., Network Effects, IP, Brand).',
    placeholder: 'Describe your business model...'
  },
  {
    id: 'strat-7',
    name: 'Pivot Strategy Advisor',
    description: 'Brainstorm new directions.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are a Startup Advisor. Based on the failed business premise described, suggest 3 "Pivot" strategies that leverage the existing assets.',
    placeholder: 'What is failing and what assets do you have?'
  },
  {
    id: 'strat-8',
    name: 'Blue Ocean Strategy',
    description: 'Find uncontested market space.',
    category: 'Strategy',
    icon: 'Briefcase',
    systemInstruction: 'You are a Strategy Consultant. Apply the Blue Ocean Strategy framework to the business described. Identify factors to Eliminate, Reduce, Raise, and Create.',
    placeholder: 'Industry and current offering...'
  },
  {
    id: 'strat-adv-1',
    name: 'PESTLE Analysis',
    description: 'Analyze external macro factors.',
    category: 'Strategy',
    icon: 'Globe',
    systemInstruction: 'You are a Strategic Analyst. Perform a PESTLE analysis (Political, Economic, Social, Technological, Legal, Environmental) for the industry or business described.',
    placeholder: 'Industry or Business...'
  },
  {
    id: 'strat-adv-2',
    name: 'Porter\'s 5 Forces',
    description: 'Analyze competitive intensity.',
    category: 'Strategy',
    icon: 'Shield',
    systemInstruction: 'You are a Market Analyst. Conduct a Porter\'s Five Forces analysis (Supplier Power, Buyer Power, Competitive Rivalry, Threat of Substitution, Threat of New Entry) for the industry described.',
    placeholder: 'Industry (e.g. Airline, Coffee Shop)...'
  },

  // --- Data Science (New) ---
  {
    id: 'data-1',
    name: 'SQL Optimization Advisor',
    description: 'Improve query performance.',
    category: 'Data Science',
    icon: 'Code',
    systemInstruction: 'You are a Database Administrator. Analyze the SQL query provided. Suggest optimizations to improve performance (indexes, rewrites, avoiding subqueries).',
    placeholder: 'Paste slow SQL query...'
  },
  {
    id: 'data-2',
    name: 'Python Pandas Helper',
    description: 'Data manipulation snippets.',
    category: 'Data Science',
    icon: 'Code',
    systemInstruction: 'You are a Data Scientist. Provide the Python/Pandas code snippet to perform the data manipulation described.',
    placeholder: 'e.g. "Group by date and sum revenue"...'
  },
  {
    id: 'data-3',
    name: 'Data Viz Suggester',
    description: 'Choose the right chart.',
    category: 'Data Science',
    icon: 'Chart',
    systemInstruction: 'You are a Data Visualization Expert. Recommend the best chart type (Bar, Line, Scatter, Heatmap, etc.) for the data description provided. Explain why.',
    placeholder: 'Describe your data variables...'
  },

  // --- Real Estate ---
  {
    id: 're-1',
    name: 'Property Listing Writer',
    description: 'Create captivating real estate listings.',
    category: 'Real Estate',
    icon: 'Briefcase',
    systemInstruction: 'You are a Luxury Real Estate Agent. Write a captivating property description for a listing. Highlight key features and the lifestyle.',
    placeholder: 'Bedrooms, bathrooms, location, and key features...'
  },
  {
    id: 're-2',
    name: 'Neighborhood Guide',
    description: 'Generate insights about a local area.',
    category: 'Real Estate',
    icon: 'Search',
    systemInstruction: 'You are a Local Guide. Write a summary of the neighborhood mentioned, highlighting amenities, schools, vibe, and pros/cons for residents.',
    placeholder: 'Neighborhood and City name...'
  },
  {
    id: 're-3',
    name: 'Lease Summarizer',
    description: 'Simplify complex lease agreements.',
    category: 'Real Estate',
    icon: 'Scale',
    systemInstruction: 'You are a Property Manager. Summarize the key terms of a lease agreement based on the text provided. Focus on rent, term, and restrictions.',
    placeholder: 'Paste lease text here...'
  },
  {
    id: 're-calc-1',
    name: 'Cap Rate Calculator',
    description: 'Evaluate rental property ROI.',
    category: 'Real Estate',
    icon: 'Money',
    systemInstruction: 'You are a Real Estate Investor. Calculate the Capitalization Rate (Cap Rate) based on the Net Operating Income (NOI) and Property Value provided. Explain if it is a good deal (general rule of thumb).',
    placeholder: 'NOI: $12,000, Price: $200,000...'
  },
  {
    id: 're-calc-2',
    name: 'Cash-on-Cash Return',
    description: 'Calculate return on cash invested.',
    category: 'Real Estate',
    icon: 'Money',
    systemInstruction: 'You are a Property Investor. Calculate the Cash-on-Cash Return based on Annual Pre-Tax Cash Flow and Total Cash Invested.',
    placeholder: 'Cash Flow: $5000, Total Cash Invested: $50,000...'
  },
  {
    id: 're-4',
    name: 'Open House Checklist',
    description: 'Prepare for a showing.',
    category: 'Real Estate',
    icon: 'Briefcase',
    systemInstruction: 'You are a Realtor. Create a checklist of tasks to prepare a home for an Open House (Cleaning, Staging, Marketing).',
    placeholder: 'Property type...'
  },
  {
    id: 're-5',
    name: 'Rent Increase Notice',
    description: 'Formal notice to tenants.',
    category: 'Real Estate',
    icon: 'DocumentText',
    systemInstruction: 'You are a Landlord. Write a formal, legally-sound (generic) notice of rent increase to a tenant. Check local laws reminder.',
    placeholder: 'Current rent, New rent, Effective date...'
  },
  {
    id: 're-6',
    name: 'Airbnb Listing Optimizer',
    description: 'Improve rental rankings.',
    category: 'Real Estate',
    icon: 'Briefcase',
    systemInstruction: 'You are a Superhost. Rewrite the Airbnb listing title and description to maximize click-through rate and bookings. Focus on unique selling points.',
    placeholder: 'Current title and description...'
  },
  {
    id: 're-7',
    name: 'House Flipping Calculator',
    description: 'Estimate potential profit.',
    category: 'Real Estate',
    icon: 'Money',
    systemInstruction: 'You are a Real Estate Investor. Estimate the potential profit for a flip based on Purchase Price, Renovation Costs, Holding Costs, and ARV (After Repair Value).',
    placeholder: 'Price: 150k, Reno: 40k, ARV: 250k...'
  },

  // --- Design & Visuals ---
  {
    id: 'des-1',
    name: 'Logo Concept Generator',
    description: 'Brainstorm logo ideas for your brand.',
    category: 'Design',
    icon: 'Photo',
    systemInstruction: 'You are a Creative Director. Describe 3 unique logo concepts for the brand described. Include details on iconography, layout, and style (e.g., Minimalist, Vintage).',
    placeholder: 'Brand name and industry...'
  },
  {
    id: 'des-2',
    name: 'Color Palette Generator',
    description: 'Create brand color schemes.',
    category: 'Design',
    icon: 'Photo',
    systemInstruction: 'You are a Brand Designer. Suggest a 5-color palette (with Hex codes) for the brand described. Explain the psychology behind the choices.',
    placeholder: 'Brand vibe and audience...'
  },
  {
    id: 'des-3',
    name: 'Font Pairing Advisor',
    description: 'Choose typography for your site.',
    category: 'Design',
    icon: 'Photo',
    systemInstruction: 'You are a Typographer. Suggest 3 professional font pairings (Heading + Body) for the project described. Use Google Fonts if possible.',
    placeholder: 'Project type and style...'
  },
  {
    id: 'des-4',
    name: 'Instagram Grid Planner',
    description: 'Plan a cohesive 9-grid layout.',
    category: 'Design',
    icon: 'Photo',
    systemInstruction: 'You are a Social Media Curator. Describe a 9-post grid sequence that tells a visual story for the brand. Describe the image for each post.',
    placeholder: 'Brand and campaign theme...'
  },

  // --- Social Media ---
  {
    id: 'soc-1',
    name: 'LinkedIn Commenter',
    description: 'Draft thoughtful replies to industry posts.',
    category: 'Social Media',
    icon: 'Megaphone',
    systemInstruction: 'You are a Networking Expert. Draft 3 thoughtful, value-adding comments to the LinkedIn post described. Avoid generic phrases like "Great post!".',
    placeholder: 'Post content and author...'
  },
  {
    id: 'soc-2',
    name: 'Twitter Bio Optimizer',
    description: 'Create a high-converting profile bio.',
    category: 'Social Media',
    icon: 'User',
    systemInstruction: 'You are a Personal Branding Coach. Write 3 variations of a Twitter/X bio (under 160 chars) that establishes authority and includes a call to action.',
    placeholder: 'Your role, achievements, and goal...'
  },
  {
    id: 'soc-3',
    name: 'YouTube Chapters',
    description: 'Generate timestamps for videos.',
    category: 'Social Media',
    icon: 'VideoCamera',
    systemInstruction: 'You are a YouTube SEO Specialist. Create a list of video chapters with timestamps (00:00 Intro...) based on the video transcript or outline provided.',
    placeholder: 'Video outline or transcript...'
  },
  {
    id: 'soc-4',
    name: 'Instagram Story Planner',
    description: 'Sequence of engaging stories.',
    category: 'Social Media',
    icon: 'Photo',
    systemInstruction: 'You are a Social Media Storyteller. Outline a 5-slide Instagram Story sequence to promote the offer or topic described. Include visual and text cues.',
    placeholder: 'Topic or promotion...'
  },
  {
    id: 'soc-5',
    name: 'LinkedIn Post Hook Gen',
    description: 'Stop the scroll with great hooks.',
    category: 'Social Media',
    icon: 'Megaphone',
    systemInstruction: 'You are a LinkedIn Ghostwriter. Write 5 attention-grabbing opening lines (hooks) for a LinkedIn post about the topic provided. Focus on curiosity and value.',
    placeholder: 'Post topic...'
  },
  
  // --- Social Media Management (New) ---
  {
    id: 'soc-mgmt-1',
    name: 'Multi-Platform Post Gen',
    description: 'Create optimized posts for LinkedIn, Twitter, and IG.',
    category: 'Social Media',
    icon: 'Megaphone',
    systemInstruction: 'You are a Social Media Manager. Create 3 distinct versions of a social media post based on the topic provided: 1. LinkedIn (Professional, Storytelling), 2. Twitter/X (Short, Punchy, Thread-starter), 3. Instagram (Visual description + Engaging Caption).',
    placeholder: 'Topic or link to share...'
  },
  {
    id: 'soc-mgmt-2',
    name: 'Smart Hashtag Generator',
    description: 'Find high-reach and niche tags.',
    category: 'Social Media',
    icon: 'Tag',
    systemInstruction: 'You are a Social Media Growth Expert. Generate 30 hashtags for the topic provided. Group them into: "High Volume" (Broad reach), "Niche Specific" (Targeted), and "Community" (Engagement).',
    placeholder: 'Post content or image description...'
  },
  {
    id: 'soc-mgmt-3',
    name: 'Influencer Outreach Script',
    description: 'DM scripts for collaborations.',
    category: 'Social Media',
    icon: 'Users',
    systemInstruction: 'You are a Brand Partnerships Manager. Write a personalized outreach DM or Email to an influencer proposing a collaboration. Focus on mutual value and authentic connection. Ask for their media kit.',
    placeholder: 'Influencer name, niche, and your offer...'
  },
  {
    id: 'soc-mgmt-4',
    name: 'Content Repurposing Tool',
    description: 'Turn blogs/videos into social posts.',
    category: 'Social Media',
    icon: 'Loop',
    systemInstruction: 'You are a Content Strategist. Repurpose the provided long-form content (text or summary) into: 1. A Twitter Thread (5 tweets), 2. A LinkedIn Carousel outline (5 slides), 3. An Instagram Reel Script.',
    placeholder: 'Paste blog post or video summary...'
  },
  {
    id: 'soc-mgmt-5',
    name: 'Social Media Audit',
    description: 'Analyze profile strengths/weaknesses.',
    category: 'Social Media',
    icon: 'Search',
    systemInstruction: 'You are a Social Media Consultant. Conduct a mini-audit based on the profile details provided. Identify 3 things working well and 3 specific opportunities for growth/optimization.',
    placeholder: 'Profile bio, content style, and engagement metrics...'
  },

  // --- Brainstorming ---
  {
    id: 'brain-1',
    name: 'Analogy Generator',
    description: 'Explain complex ideas simply.',
    category: 'Brainstorming',
    icon: 'Sparkles',
    systemInstruction: 'You are a Creative Teacher. Create 3 distinct analogies to explain the complex concept provided to a layperson.',
    placeholder: 'Concept (e.g. Blockchain, API)...'
  },
  {
    id: 'brain-2',
    name: 'SCAMPER Ideation',
    description: 'Innovate on existing products.',
    category: 'Brainstorming',
    icon: 'Sparkles',
    systemInstruction: 'You are an Innovation Consultant. Apply the SCAMPER method (Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse) to the product described.',
    placeholder: 'Product or service...'
  },
  {
    id: 'brain-3',
    name: 'Pre-Mortem Analysis',
    description: 'Predict and prevent failure.',
    category: 'Brainstorming',
    icon: 'Shield',
    systemInstruction: 'You are a Risk Analyst. Imagine the project described has failed 6 months from now. List 5 plausible reasons why it failed and how to prevent them today.',
    placeholder: 'Project plan...'
  },
  {
    id: 'brain-4',
    name: 'First Principles',
    description: 'Break problems down to basics.',
    category: 'Brainstorming',
    icon: 'Sparkles',
    systemInstruction: 'You are a First Principles Thinker. Deconstruct the problem provided into its fundamental truths and build a solution up from there.',
    placeholder: 'Problem or assumption...'
  },
  {
    id: 'brain-5',
    name: 'Five Whys',
    description: 'Find the root cause.',
    category: 'Brainstorming',
    icon: 'Search',
    systemInstruction: 'You are a Root Cause Analyst. Perform a "5 Whys" analysis on the problem described to find the underlying issue.',
    placeholder: 'Problem statement...'
  },

  // --- E-commerce Optimization ---
  {
    id: 'ecom-opt-1',
    name: 'A/B Test Ideas',
    description: 'Experiments to boost conversion.',
    category: 'E-commerce',
    icon: 'Chart',
    systemInstruction: 'You are a CRO Specialist. Suggest 3 A/B testing hypotheses for the page described (e.g. Checkout, Landing Page) to improve conversion rate.',
    placeholder: 'Page type and current performance...'
  },
  {
    id: 'ecom-opt-2',
    name: 'Review Responder',
    description: 'Professional replies to feedback.',
    category: 'E-commerce',
    icon: 'ChatBubble',
    systemInstruction: 'You are a Customer Success Manager. Write a professional, empathetic response to the customer review provided. If negative, offer a solution.',
    placeholder: 'Customer review text...'
  },
  {
    id: 'ecom-opt-3',
    name: 'Upsell Bundle Gen',
    description: 'Increase average order value.',
    category: 'E-commerce',
    icon: 'Money',
    systemInstruction: 'You are a Merchandiser. Suggest 3 creative product bundle ideas based on the main product to increase Average Order Value.',
    placeholder: 'Main product...'
  },
  {
    id: 'ecom-opt-4',
    name: 'Unboxing Experience',
    description: 'Make packaging shareable.',
    category: 'E-commerce',
    icon: 'Sparkles',
    systemInstruction: 'You are a Brand Experience Designer. Brainstorm 5 low-cost ways to improve the unboxing experience for this product to encourage social sharing.',
    placeholder: 'Product and brand vibe...'
  },

  // --- Career & Professional ---
  {
    id: 'car-1',
    name: 'Resume Bullet Polish',
    description: 'Quantify your achievements.',
    category: 'Career',
    icon: 'Briefcase',
    systemInstruction: 'You are a Resume Writer. Rewrite the provided resume bullet point to be action-oriented, quantified, and impactful (Google X-Y-Z formula).',
    placeholder: 'Draft bullet point...'
  },
  {
    id: 'car-2',
    name: 'Cover Letter Drafter',
    description: 'Personalized application letters.',
    category: 'Career',
    icon: 'DocumentText',
    systemInstruction: 'You are a Career Coach. Draft a compelling cover letter for the role and company described, highlighting the user\'s key skills.',
    placeholder: 'Role, Company, and your top 3 skills...'
  },
  {
    id: 'car-3',
    name: 'LinkedIn About Writer',
    description: 'Tell your professional story.',
    category: 'Career',
    icon: 'UserCircle',
    systemInstruction: 'You are a Personal Branding Expert. Write a first-person LinkedIn "About" section that is engaging, professional, and highlights the user\'s unique value.',
    placeholder: 'Your background, skills, and passion...'
  },
  {
    id: 'car-4',
    name: 'Salary Negotiation',
    description: 'Scripts to ask for more.',
    category: 'Career',
    icon: 'Money',
    systemInstruction: 'You are a Negotiation Coach. Write a script to negotiate a higher salary after receiving a job offer. Be professional, grateful, but firm.',
    placeholder: 'Offer details and target salary...'
  },
  {
    id: 'car-5',
    name: 'Networking Outreach',
    description: 'Coffee chat requests.',
    category: 'Career',
    icon: 'ChatBubble',
    systemInstruction: 'You are a Networker. Write a short, polite LinkedIn connection request or email to ask a stranger for a virtual coffee chat.',
    placeholder: 'Person\'s role and reason for connecting...'
  },
  {
    id: 'job-1',
    name: 'Resignation Letter',
    description: 'Leave on good terms.',
    category: 'Career',
    icon: 'DocumentText',
    systemInstruction: 'You are a Professional Coach. Write a professional resignation letter. Keep it positive, brief, and helpful regarding the transition.',
    placeholder: 'Role, Company, and Last Day...'
  },
  {
    id: 'job-2',
    name: 'LinkedIn Recommendation',
    description: 'Write a review for a colleague.',
    category: 'Career',
    icon: 'UserCircle',
    systemInstruction: 'You are a Professional. Write a glowing LinkedIn recommendation for a colleague, highlighting their specific strengths and a project you worked on together.',
    placeholder: 'Colleague name, relationship, and key skills...'
  },
  {
    id: 'job-3',
    name: 'Interview Thank You',
    description: 'Post-interview email.',
    category: 'Career',
    icon: 'ChatBubble',
    systemInstruction: 'You are a Candidate. Write a thoughtful thank-you email to an interviewer. Reference a specific topic discussed during the interview.',
    placeholder: 'Interviewer name and topic discussed...'
  },

  // --- Calculators & Utilities (Basic) ---
  {
    id: 'util-1',
    name: 'Text Case Converter',
    description: 'Convert text to UPPER, lower, Title Case, etc.',
    category: 'Utilities',
    icon: 'Code',
    systemInstruction: 'You are a Text Processing Tool. Convert the provided text into the following formats: Uppercase, Lowercase, Title Case, CamelCase, and Snake_Case. Output as a list.',
    placeholder: 'Paste text here...'
  },
  {
    id: 'util-2',
    name: 'Date Diff Calculator',
    description: 'Calculate days between dates.',
    category: 'Utilities',
    icon: 'Calendar',
    systemInstruction: 'You are a Date Calculator. Calculate the number of days, weeks, and months between the two dates provided.',
    placeholder: 'Start Date and End Date...'
  },
  {
    id: 'util-3',
    name: 'Random Number Gen',
    description: 'Generate random numbers.',
    category: 'Utilities',
    icon: 'Code',
    systemInstruction: 'You are a Random Number Generator. Generate the requested amount of random numbers within the specified range.',
    placeholder: 'e.g. 5 numbers between 1 and 100...'
  },
  {
    id: 'util-4',
    name: 'Word Counter',
    description: 'Count words and characters.',
    category: 'Utilities',
    icon: 'DocumentText',
    systemInstruction: 'You are a Text Analyzer. Count the number of Words, Characters (with spaces), and Characters (without spaces) in the text provided.',
    placeholder: 'Paste text...'
  },
  {
    id: 'util-5',
    name: 'Lorem Ipsum Gen',
    description: 'Generate placeholder text.',
    category: 'Utilities',
    icon: 'DocumentText',
    systemInstruction: 'You are a Placeholder Text Generator. Generate "Lorem Ipsum" style placeholder text for the number of paragraphs requested.',
    placeholder: 'Number of paragraphs...'
  },
  {
    id: 'util-6',
    name: 'Slug Generator',
    description: 'Make strings URL-friendly.',
    category: 'Utilities',
    icon: 'Code',
    systemInstruction: 'You are a Slug Generator. Convert the provided text into a clean, URL-friendly slug (lowercase, hyphens, no special chars).',
    placeholder: 'Text to slugify...'
  },
  {
    id: 'util-7',
    name: 'Markdown Table Builder',
    description: 'Convert CSV/List to Markdown Table.',
    category: 'Utilities',
    icon: 'Code',
    systemInstruction: 'You are a Markdown Helper. Convert the provided comma-separated data or list into a properly formatted Markdown table.',
    placeholder: 'Paste CSV or list data...'
  },

  // --- Developer Tools (Utilities) ---
  {
    id: 'dev-1',
    name: 'JSON Prettifier',
    description: 'Format and indent JSON.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a JSON Formatter. Take the input JSON string and output it properly indented with 2 spaces. If invalid, explain the error.',
    placeholder: 'Paste minified JSON...'
  },
  {
    id: 'dev-2',
    name: 'JSON to CSV',
    description: 'Convert JSON objects to CSV.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a Data Converter. Convert the provided JSON array of objects into a standard CSV format.',
    placeholder: 'Paste JSON array...'
  },
  {
    id: 'dev-3',
    name: 'Regex Generator',
    description: 'Create regular expressions.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a Regex Expert. Generate a Regular Expression for the pattern described. Explain the breakdown.',
    placeholder: 'What pattern do you need to match?'
  },
  {
    id: 'dev-4',
    name: 'Cron Expression Gen',
    description: 'Schedule cron jobs easily.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a DevOps Tool. Generate the standard Cron expression for the schedule described (e.g., "Every Monday at 9am").',
    placeholder: 'Describe the schedule...'
  },
  {
    id: 'dev-5',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode or decode strings.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are an Encoder Tool. If the input appears to be Base64, decode it to text. If it is text, encode it to Base64. Label the output.',
    placeholder: 'Text or Base64 string...'
  },
  {
    id: 'dev-6',
    name: 'SQL Formatter',
    description: 'Beautify SQL queries.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a SQL Formatter. Format the provided SQL query with proper indentation and line breaks for readability.',
    placeholder: 'Paste raw SQL...'
  },
  {
    id: 'dev-7',
    name: 'CSS Flexbox Helper',
    description: 'Generate Flexbox code.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a CSS Helper. Generate the CSS code for a Flexbox container based on the desired layout description (e.g., "Center items horizontally and vertically").',
    placeholder: 'Describe layout...'
  },
  {
    id: 'dev-8',
    name: 'Tailwind Class Finder',
    description: 'Find classes for styles.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a Tailwind CSS Expert. Suggest the best Tailwind utility classes to achieve the visual style described.',
    placeholder: 'Describe the style (e.g. dark card with shadow)...'
  },
  {
    id: 'dev-9',
    name: 'Git Ignore Generator',
    description: 'Create .gitignore files.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a Git Expert. Generate a standard .gitignore file for the programming language or framework specified.',
    placeholder: 'Language/Framework (e.g. Node.js, Python)...'
  },
  {
    id: 'dev-10',
    name: 'UUID Generator',
    description: 'Generate unique IDs.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a UUID Generator. Generate 5 random Version 4 UUIDs.',
    placeholder: 'Just click Run...'
  },
  {
    id: 'dev-adv-1',
    name: 'Dockerfile Generator',
    description: 'Containerize applications.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a DevOps Engineer. Generate a Dockerfile for the application stack described. Use best practices for image size and security.',
    placeholder: 'App stack (e.g. Node.js 18, Express, Mongodb)...'
  },
  {
    id: 'dev-adv-2',
    name: 'Kubernetes YAML',
    description: 'Deploy to K8s.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a Cloud Engineer. Generate a basic Kubernetes Deployment and Service YAML for the application described.',
    placeholder: 'App name, image, and port...'
  },
  {
    id: 'dev-adv-3',
    name: 'React Component Gen',
    description: 'Scaffold UI components.',
    category: 'Developer Tools',
    icon: 'Code',
    systemInstruction: 'You are a Frontend Developer. Generate a React functional component (TypeScript) based on the description. Include props interface and basic Tailwind styling.',
    placeholder: 'Component description (e.g. User Card with avatar)...'
  },

  // --- Web Development (New) ---
  {
    id: 'web-1',
    name: 'Website Audit Checklist',
    description: 'Check UX, SEO, and Performance.',
    category: 'Web Dev',
    icon: 'Code',
    systemInstruction: 'You are a Web Developer. Create a comprehensive checklist for auditing a website\'s health, covering UX/UI, SEO, Performance, and Accessibility (WCAG).',
    placeholder: 'Site type (e.g. E-commerce, Blog)...'
  },
  {
    id: 'web-2',
    name: 'Sitemap Generator',
    description: 'Create XML sitemap structure.',
    category: 'Web Dev',
    icon: 'Code',
    systemInstruction: 'You are an SEO Specialist. Generate a standard XML sitemap structure for the list of pages provided.',
    placeholder: 'List of page URLs...'
  },
  {
    id: 'web-3',
    name: 'Robots.txt Generator',
    description: 'Control bot access.',
    category: 'Web Dev',
    icon: 'Code',
    systemInstruction: 'You are a Webmaster. Generate a standard robots.txt file based on the user\'s requirements (allow/disallow paths).',
    placeholder: 'Allow/Disallow rules...'
  },
  {
    id: 'web-4',
    name: 'Meta Tag Generator',
    description: 'SEO-friendly head tags.',
    category: 'Web Dev',
    icon: 'Code',
    systemInstruction: 'You are an SEO Expert. Generate the HTML <head> meta tags (Title, Description, Viewport, Charset, OG Tags) for the page described.',
    placeholder: 'Page title and description...'
  },
  {
    id: 'web-5',
    name: 'Schema Markup Generator',
    description: 'Create JSON-LD structured data.',
    category: 'Web Dev',
    icon: 'Code',
    systemInstruction: 'You are a Schema.org Expert. Generate the JSON-LD structured data script for the specific content type described (e.g. Article, Product, Event).',
    placeholder: 'Content type and details...'
  },

  // --- Business Math ---
  {
    id: 'bmath-1',
    name: 'Discount Calculator',
    description: 'Calculate sale price.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are a Calculator. Calculate the final price and the amount saved given the Original Price and Discount Percentage.',
    placeholder: 'Original Price: $50, Discount: 20%...'
  },
  {
    id: 'bmath-2',
    name: 'Sales Tax Calculator',
    description: 'Calculate final total with tax.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are a Calculator. Calculate the Tax Amount and Final Total given the Subtotal and Tax Rate.',
    placeholder: 'Subtotal: $100, Tax Rate: 8.5%...'
  },
  {
    id: 'bmath-3',
    name: 'Commission Calculator',
    description: 'Calculate sales commission.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are a Calculator. Calculate the Commission Amount given the Total Sales and Commission Percentage.',
    placeholder: 'Sales: $10,000, Rate: 5%...'
  },
  {
    id: 'bmath-4',
    name: 'Margin vs Markup',
    description: 'Convert margin to markup.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are a Business Calculator. Explain the difference between Margin and Markup for the cost/price provided, and calculate both percentages.',
    placeholder: 'Cost: $10, Price: $15...'
  },
  {
    id: 'bmath-5',
    name: 'ROI Calculator',
    description: 'Return on Investment.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are a Financial Calculator. Calculate the ROI percentage given the Initial Investment and Final Value. Formula: (Final - Initial) / Initial * 100.',
    placeholder: 'Invested: $1000, Returned: $1500...'
  },
  {
    id: 'bmath-6',
    name: 'CAGR Calculator',
    description: 'Compound Annual Growth Rate.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are a Financial Analyst. Calculate the CAGR given the Start Value, End Value, and Number of Years.',
    placeholder: 'Start: $100, End: $200, Years: 5...'
  },
  {
    id: 'bmath-7',
    name: 'Salary Converter',
    description: 'Hourly to Yearly / Yearly to Hourly.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are a Salary Calculator. Convert the provided pay rate (Hourly or Yearly) into the other format, assuming 40 hours/week and 52 weeks/year.',
    placeholder: 'e.g. $50/hour or $100,000/year...'
  },
  {
    id: 'bmath-8',
    name: 'Inflation Adjuster',
    description: 'Estimate buying power.',
    category: 'Business Math',
    icon: 'Money',
    systemInstruction: 'You are an Economist. Estimate the future value of money or past value based on an average inflation rate (e.g. 3%). This is an estimation.',
    placeholder: 'Amount: $1000, Years: 10...'
  },

  // --- Office Utilities ---
  {
    id: 'off-1',
    name: 'Email Signature Gen',
    description: 'Create professional signatures.',
    category: 'Office Utils',
    icon: 'Briefcase',
    systemInstruction: 'You are a Designer. Create a text-based (or HTML compatible) email signature template based on the user\'s details.',
    placeholder: 'Name, Title, Company, Contact info...'
  },
  {
    id: 'off-2',
    name: 'Meeting Minutes Tmpl',
    description: 'Standard notes format.',
    category: 'Office Utils',
    icon: 'Briefcase',
    systemInstruction: 'You are an Admin Assistant. Generate a Meeting Minutes template structure including Attendees, Agenda, Discussion, Action Items, and Next Meeting.',
    placeholder: 'Meeting type...'
  },
  {
    id: 'off-3',
    name: 'Timesheet Template',
    description: 'Weekly hours tracker.',
    category: 'Office Utils',
    icon: 'Briefcase',
    systemInstruction: 'You are an Office Manager. Create a Markdown table template for a Weekly Timesheet including Day, Start Time, End Time, Break, and Total Hours.',
    placeholder: 'Just click Run...'
  },
  {
    id: 'off-4',
    name: 'PTO Request Email',
    description: 'Ask for time off.',
    category: 'Office Utils',
    icon: 'Briefcase',
    systemInstruction: 'You are an Employee. Write a polite and professional email requesting Paid Time Off (PTO) for the dates specified.',
    placeholder: 'Dates and reason (optional)...'
  },
  {
    id: 'off-5',
    name: 'Out of Office Reply',
    description: 'Auto-responder message.',
    category: 'Office Utils',
    icon: 'Briefcase',
    systemInstruction: 'You are a Professional. Write an Out of Office (OOO) auto-reply email. Include dates of absence and who to contact in emergencies.',
    placeholder: 'Dates and backup contact...'
  },
  {
    id: 'off-6',
    name: 'Memo Format',
    description: 'Internal business memo.',
    category: 'Office Utils',
    icon: 'Briefcase',
    systemInstruction: 'You are a Manager. Format the provided text into a standard Business Memo format (To, From, Date, Subject).',
    placeholder: 'Subject and message...'
  },

  // --- Calculators (Business) ---
  {
    id: 'calc-1',
    name: 'Break-Even Calculator',
    description: 'Calculate when you will become profitable.',
    category: 'Calculators',
    icon: 'Money',
    systemInstruction: 'You are a strict Business Calculator. Do not explain concepts. Take the Fixed Costs, Variable Costs, and Price provided by the user and calculate the Break-Even Point (Units and Revenue). Show the formula used.',
    placeholder: 'Fixed Costs: $1000, Variable: $5, Price: $20...'
  },
  {
    id: 'calc-2',
    name: 'Gross Margin Calculator',
    description: 'Calculate your profit margins.',
    category: 'Calculators',
    icon: 'Money',
    systemInstruction: 'You are a strict Business Calculator. Calculate the Gross Margin Percentage and Dollar Amount based on the Cost of Goods Sold (COGS) and Revenue provided.',
    placeholder: 'Revenue: $50, COGS: $30...'
  },
  {
    id: 'calc-3',
    name: 'CAC / LTV Calculator',
    description: 'Analyze customer unit economics.',
    category: 'Calculators',
    icon: 'Money',
    systemInstruction: 'You are a Business Analyst. Calculate the Customer Acquisition Cost (CAC) and Lifetime Value (LTV) ratio based on the marketing spend, new customers, and avg revenue per user provided.',
    placeholder: 'Spend: $5000, Customers: 100, ARPU: $500...'
  },
  {
    id: 'calc-4',
    name: 'Burn Rate Estimator',
    description: 'Calculate runway months.',
    category: 'Calculators',
    icon: 'Money',
    systemInstruction: 'You are a Financial Controller. Calculate the monthly Burn Rate and Runway (in months) based on the cash balance and monthly expenses provided.',
    placeholder: 'Cash in bank: $100k, Monthly expenses: $12k...'
  },
  {
    id: 'calc-5',
    name: 'Email Subject Line Tester',
    description: 'Score your subject lines.',
    category: 'Utilities',
    icon: 'Megaphone',
    systemInstruction: 'You are an Email Marketing Algorithm. Rate the provided email subject line from 0-100 based on open-rate potential. Explain why in 1 sentence.',
    placeholder: 'Paste subject line...'
  },
  {
    id: 'calc-6',
    name: 'Meeting Cost Calculator',
    description: 'How much does this meeting cost?',
    category: 'Calculators',
    icon: 'Money',
    systemInstruction: 'You are a Productivity Calculator. Estimate the total cost of a meeting based on the number of attendees, avg hourly rate, and duration.',
    placeholder: '5 people, $50/hr avg, 1 hour...'
  },
  {
    id: 'calc-7',
    name: 'Salary Tax Estimator',
    description: 'Rough take-home pay calc.',
    category: 'Calculators',
    icon: 'Money',
    systemInstruction: 'You are a Tax Estimator. Provide a *rough estimate* of annual take-home pay for the salary and location provided, assuming standard tax brackets. Disclaimer: Not financial advice.',
    placeholder: 'Salary: $80,000, Location: California...'
  },
  {
    id: 'calc-8',
    name: 'CPM Calculator',
    description: 'Cost per Mille for ads.',
    category: 'Calculators',
    icon: 'Money',
    systemInstruction: 'You are an Ad Tech Calculator. Calculate the CPM (Cost Per Mille) given the total ad spend and total impressions.',
    placeholder: 'Spend: $500, Impressions: 20000...'
  },

  // --- Architecture & Design ---
  {
    id: 'arch-1',
    name: 'Design Concept Generator',
    description: 'Generate interior design concepts.',
    category: 'Architecture',
    icon: 'Grid',
    systemInstruction: 'You are an Interior Designer. Create a design concept (Color Palette, Materials, Vibe, Key Furniture) for the room and style described.',
    placeholder: 'Room type and preferred style (e.g. Modern Living Room)...'
  },
  {
    id: 'arch-2',
    name: 'Space Planning Calc',
    description: 'Estimate room capacity.',
    category: 'Architecture',
    icon: 'Grid',
    systemInstruction: 'You are an Architect. Calculate the maximum safe occupancy for a room based on the dimensions and usage (Office, Dining, Standing) provided.',
    placeholder: 'Room dimensions and usage...'
  },
  {
    id: 'arch-3',
    name: 'Renovation ROI Estimator',
    description: 'Value add of renovations.',
    category: 'Architecture',
    icon: 'Money',
    systemInstruction: 'You are a Real Estate Appraiser. Estimate the potential Return on Investment (ROI) level (High/Med/Low) for the home renovation described.',
    placeholder: 'Renovation type (e.g. Kitchen remodel) and budget...'
  },

  // --- Game Development ---
  {
    id: 'game-1',
    name: 'Game Mechanic Ideator',
    description: 'Brainstorm gameplay mechanics.',
    category: 'Game Dev',
    icon: 'Code',
    systemInstruction: 'You are a Game Designer. Brainstorm 3 unique gameplay mechanics for the game genre described.',
    placeholder: 'Genre (e.g. RPG, FPS) and theme...'
  },
  {
    id: 'game-2',
    name: 'NPC Dialogue Generator',
    description: 'Write character lines.',
    category: 'Game Dev',
    icon: 'Code',
    systemInstruction: 'You are a Narrative Designer. Write 3 lines of dialogue (Greeting, Quest give, Goodbye) for the NPC described.',
    placeholder: 'NPC name, role, and personality...'
  },
  {
    id: 'game-3',
    name: 'Item Rarity System',
    description: 'Balance game items.',
    category: 'Game Dev',
    icon: 'Code',
    systemInstruction: 'You are a Game Balancer. Create an item rarity system (Common, Rare, Epic, Legendary) with drop rate percentages and stat multipliers for the game type.',
    placeholder: 'Game type (e.g. Fantasy RPG)...'
  },

  // --- Insurance ---
  {
    id: 'ins-1',
    name: 'Policy Review Helper',
    description: 'Understand insurance policies.',
    category: 'Insurance',
    icon: 'Shield',
    systemInstruction: 'You are an Insurance Agent. Summarize the coverage, exclusions, and deductibles of the policy text provided in simple terms.',
    placeholder: 'Paste policy text...'
  },
  {
    id: 'ins-2',
    name: 'Claim Documentation',
    description: 'Checklist for claims.',
    category: 'Insurance',
    icon: 'Shield',
    systemInstruction: 'You are a Claims Adjuster. Create a checklist of evidence and documents needed to file a claim for the specific incident described.',
    placeholder: 'Incident type (e.g. Car accident, Water damage)...'
  },

  // --- Import/Export ---
  {
    id: 'trade-1',
    name: 'Incoterms Advisor',
    description: 'Choose the right shipping terms.',
    category: 'Trade',
    icon: 'Truck',
    systemInstruction: 'You are a Logistics Expert. Recommend the best Incoterm (e.g. FOB, CIF, DDP) for the shipping scenario described and explain responsibilities.',
    placeholder: 'Shipping scenario (Buyer/Seller location, goods)...'
  },
  {
    id: 'trade-2',
    name: 'HS Code Estimator',
    description: 'Find commodity codes.',
    category: 'Trade',
    icon: 'Truck',
    systemInstruction: 'You are a Customs Broker. Suggest the most likely HS Code (Harmonized System) for the product described. Include a disclaimer.',
    placeholder: 'Product description...'
  },

  // --- Film & Video ---
  {
    id: 'film-1',
    name: 'Shot List Generator',
    description: 'Plan video shoots.',
    category: 'Film',
    icon: 'VideoCamera',
    systemInstruction: 'You are a Director of Photography. Create a shot list (Wide, Close-up, POV) for the scene described.',
    placeholder: 'Scene description...'
  },
  {
    id: 'film-2',
    name: 'Call Sheet Builder',
    description: 'Schedule for cast & crew.',
    category: 'Film',
    icon: 'VideoCamera',
    systemInstruction: 'You are a Producer. Draft a simple Call Sheet template including Call Time, Location, Cast list, and Schedule.',
    placeholder: 'Shoot date and location...'
  },
  {
    id: 'film-3',
    name: 'Script Breakdown',
    description: 'Identify props and cast.',
    category: 'Film',
    icon: 'VideoCamera',
    systemInstruction: 'You are a Line Producer. Breakdown the script scene provided into lists of Props, Characters, Costumes, and Locations needed.',
    placeholder: 'Paste scene text...'
  },

  // --- Remote Work ---
  {
    id: 'rem-1',
    name: 'Remote Onboarding Plan',
    description: 'Welcome new hires virtually.',
    category: 'Remote Work',
    icon: 'Globe',
    systemInstruction: 'You are an HR Specialist. Create a 2-week remote onboarding schedule. Include virtual coffees, tech setup, and asynchronous training tasks.',
    placeholder: 'Role and team details...'
  },
  {
    id: 'rem-2',
    name: 'Async Comm Guide',
    description: 'Rules for asynchronous work.',
    category: 'Remote Work',
    icon: 'Globe',
    systemInstruction: 'You are a Remote Work Consultant. Draft a team agreement or guide for Asynchronous Communication (when to email vs slack vs call).',
    placeholder: 'Team size and timezones...'
  },
  {
    id: 'rem-3',
    name: 'Virtual Team Bond',
    description: 'Fun remote activities.',
    category: 'Remote Work',
    icon: 'Globe',
    systemInstruction: 'You are a Team Building Facilitator. Suggest 5 engaging virtual team building activities that take less than 30 minutes via Zoom/Meet.',
    placeholder: 'Team size and vibe...'
  },

  // --- Crisis Management ---
  {
    id: 'crisis-1',
    name: 'Crisis Press Release',
    description: 'Handle PR emergencies.',
    category: 'Crisis',
    icon: 'Shield',
    systemInstruction: 'You are a PR Crisis Manager. Draft a formal press statement addressing the crisis situation described. Be transparent, empathetic, and action-oriented.',
    placeholder: 'Describe the crisis...'
  },
  {
    id: 'crisis-2',
    name: 'Internal Crisis Memo',
    description: 'Update staff during emergencies.',
    category: 'Crisis',
    icon: 'Shield',
    systemInstruction: 'You are a CEO. Write an internal memo to employees regarding the emergency situation. Reassure them and provide clear next steps.',
    placeholder: 'Situation details...'
  },
  {
    id: 'crisis-3',
    name: 'Apology Letter Writer',
    description: 'Sincere apologies to customers.',
    category: 'Crisis',
    icon: 'Shield',
    systemInstruction: 'You are a Customer Experience Director. Write a sincere apology letter to a customer who had a bad experience. Focus on rectification.',
    placeholder: 'What went wrong?'
  },

  // --- Startup & VC ---
  {
    id: 'start-1',
    name: 'Term Sheet Summarizer',
    description: 'Simplify complex investor term sheets.',
    category: 'Startup',
    icon: 'Money',
    systemInstruction: 'You are a Venture Capital Lawyer. Summarize the key terms of the investment term sheet provided. Highlight valuation, liquidation preference, and control rights.',
    placeholder: 'Paste term sheet text...'
  },
  {
    id: 'start-2',
    name: 'Investor Update Email',
    description: 'Write professional monthly updates.',
    category: 'Startup',
    icon: 'Megaphone',
    systemInstruction: 'You are a Startup Founder. Write a transparent and professional monthly investor update email covering Highlights, Lowlights, KPIs, and Asks.',
    placeholder: 'Key achievements and challenges this month...'
  },
  {
    id: 'start-3',
    name: 'Co-Founder Equity Split',
    description: 'Advice on splitting equity fairly.',
    category: 'Startup',
    icon: 'Scale',
    systemInstruction: 'You are a Startup Advisor. Provide a framework and key questions to help co-founders decide on a fair equity split based on their contributions (time, money, IP).',
    placeholder: 'Describe the co-founders\' contributions...'
  },
  {
    id: 'start-4',
    name: 'Startup Validator',
    description: 'Roast my startup idea.',
    category: 'Startup',
    icon: 'Sparkles',
    systemInstruction: 'You are a cynical Venture Capitalist. Critically analyze the startup idea provided. Point out potential failure modes, market risks, and competition.',
    placeholder: 'What is your startup idea?'
  },
  {
    id: 'start-5',
    name: 'Cap Table Builder',
    description: 'Structure a basic cap table.',
    category: 'Startup',
    icon: 'Chart',
    systemInstruction: 'You are a CFO. Create a basic Capitalization Table structure (Founders, Option Pool, Seed Investors) based on the inputs provided.',
    placeholder: 'Shares breakdown...'
  },

  // --- Marketing ---
  {
    id: 'mkt-1',
    name: 'SEO Keyword Planner',
    description: 'Generate high-value SEO keywords and content clusters.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are an SEO Specialist. Suggest a list of high-potential keywords (short-tail and long-tail) and content topic clusters for the user\'s niche.',
    placeholder: 'What is your niche or website topic?'
  },
  {
    id: 'mkt-2',
    name: 'Social Media Calendar',
    description: 'Plan a week of engaging social media posts.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are a Social Media Manager. Create a 7-day content calendar including post ideas, captions, and suggested hashtags.',
    placeholder: 'What is your brand and target audience?'
  },
  {
    id: 'mkt-3',
    name: 'Ad Copy Generator',
    description: 'Write compelling headlines and body copy for ads.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are a Copywriter. Write 3 variations of Google/Facebook ad copy (Headline + Primary Text) for the product described. Focus on CTR.',
    placeholder: 'Describe your product and offer...'
  },
  {
    id: 'mkt-4',
    name: 'Viral Hooks Generator',
    description: 'Create catchy hooks for short-form video scripts.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are a Content Strategist. Generate 10 viral hooks for TikTok/Reels/Shorts based on the topic. They should be attention-grabbing and short.',
    placeholder: 'What is the video topic?'
  },
  {
    id: 'mkt-5',
    name: 'Press Release Writer',
    description: 'Generate professional PR announcements.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are a PR Specialist. Write a formal press release for the event or news provided. Include placeholders for contact info.',
    placeholder: 'What news are you announcing?'
  },
  {
    id: 'mkt-6',
    name: 'Influencer Outreach',
    description: 'Draft DMs for influencer collaboration.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are an Influencer Marketing Manager. Write a polite and persuasive DM or email to pitch a collaboration to an influencer.',
    placeholder: 'Campaign details and influencer niche...'
  },
  {
    id: 'mkt-7',
    name: 'Newsletter Generator',
    description: 'Create engaging newsletter content.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are a Newsletter Editor. Draft a newsletter introduction and outline based on the topics provided. Keep it engaging and personal.',
    placeholder: 'Topics for this week\'s issue...'
  },
  {
    id: 'mkt-8',
    name: 'UTM Builder Guide',
    description: 'How to tag links.',
    category: 'Marketing',
    icon: 'Code',
    systemInstruction: 'You are a Marketing Tech Specialist. Explain how to construct a standard UTM parameter string for the campaign described. Provide an example URL.',
    placeholder: 'Campaign source, medium, and name...'
  },
  {
    id: 'mkt-9',
    name: 'Hashtag Generator',
    description: 'Find trending tags.',
    category: 'Marketing',
    icon: 'Tag',
    systemInstruction: 'You are a Social Media Expert. List 30 relevant hashtags for Instagram/LinkedIn based on the post topic. Mix broad and niche tags.',
    placeholder: 'Topic or image description...'
  },
  {
    id: 'mkt-10',
    name: 'Podcast Ad Script',
    description: 'Write ads for audio.',
    category: 'Marketing',
    icon: 'Mic',
    systemInstruction: 'You are a Copywriter. Write a 30-second host-read ad script for a podcast. Include a hook, key benefits, and a call to action.',
    placeholder: 'Product and offer...'
  },
  {
    id: 'mkt-11',
    name: 'Targeted SEO Clusters',
    description: 'Generate keywords and clusters for specific audiences.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are an SEO Strategist. Generate a structured list of SEO keywords and Content Clusters tailored to the specific niche and target audience provided. Focus on high-intent topics.',
    placeholder: 'Niche and Target Audience...'
  },
  {
    id: 'mkt-adv-1',
    name: 'Lead Magnet Ideas',
    description: 'Incentives to capture emails.',
    category: 'Marketing',
    icon: 'Megaphone',
    systemInstruction: 'You are a Growth Marketer. Brainstorm 5 high-value lead magnet ideas (e.g. Checklist, Ebook) to capture email addresses for the target audience.',
    placeholder: 'Target audience and problem solved...'
  },

  // --- Sales ---
  {
    id: 'sales-1',
    name: 'Cold Email Architect',
    description: 'Write personalized cold outreach emails that convert.',
    category: 'Sales',
    icon: 'Megaphone',
    systemInstruction: 'You are a Sales Development Representative. Write a cold email sequence (Subject line + Body) that is personalized, concise, and persuasive. Focus on user pain points.',
    placeholder: 'Who is the prospect and what is the value proposition?'
  },
  {
    id: 'sales-2',
    name: 'Objection Handler',
    description: 'Generate responses to common sales objections.',
    category: 'Sales',
    icon: 'Megaphone',
    systemInstruction: 'You are a Sales Closer. Provide 3 proven rebuttal scripts for the specific sales objection provided by the user. Maintain a consultative tone.',
    placeholder: 'What objection did the client give? (e.g. "It\'s too expensive")'
  },
  {
    id: 'sales-3',
    name: 'Discovery Question Generator',
    description: 'List questions to uncover client needs.',
    category: 'Sales',
    icon: 'Megaphone',
    systemInstruction: 'You are a Sales Consultant. List 10 deep discovery questions to ask a prospect to uncover their pain points and budget for the solution described.',
    placeholder: 'What solution are you selling?'
  },
  {
    id: 'sales-4',
    name: 'Value Prop Refiner',
    description: 'Sharpen your unique selling proposition.',
    category: 'Sales',
    icon: 'Megaphone',
    systemInstruction: 'You are a Sales Strategist. Rewrite the user\'s value proposition to be more punchy, benefit-focused, and unique.',
    placeholder: 'Current value prop or product description...'
  },
  {
    id: 'sales-5',
    name: 'Follow-Up Email Gen',
    description: 'Nudge prospects politely.',
    category: 'Sales',
    icon: 'Megaphone',
    systemInstruction: 'You are a Sales Rep. Write a polite but firm follow-up email to a prospect who hasn\'t responded in 3 days. Add value.',
    placeholder: 'Context of previous conversation...'
  },
  {
    id: 'sales-ops-1',
    name: 'Sales Script Builder',
    description: 'Cold call scripts.',
    category: 'Sales',
    icon: 'Mic',
    systemInstruction: 'You are a Sales Trainer. Write a cold call script including Opening, Value Prop, Qualification, and Ask for meeting.',
    placeholder: 'Product and target persona...'
  },

  // --- E-commerce ---
  {
    id: 'ecom-1',
    name: 'Product Description Gen',
    description: 'Write SEO-friendly product descriptions.',
    category: 'E-commerce',
    icon: 'Money',
    systemInstruction: 'You are an E-commerce Copywriter. Write a compelling, SEO-friendly product description that highlights features and benefits. Include a list of bullet points.',
    placeholder: 'Product name and key details...'
  },
  {
    id: 'ecom-2',
    name: 'Cart Abandonment Email',
    description: 'Recover lost sales with persuasive emails.',
    category: 'E-commerce',
    icon: 'Money',
    systemInstruction: 'You are an Email Marketer. Write a 3-email sequence to recover abandoned shopping carts. Use humor or urgency where appropriate.',
    placeholder: 'What product was left in the cart?'
  },
  {
    id: 'ecom-3',
    name: 'Return Policy Generator',
    description: 'Draft clear and fair return policies.',
    category: 'E-commerce',
    icon: 'Scale',
    systemInstruction: 'You are an Operations Manager. Draft a standard E-commerce Return & Refund Policy based on the constraints provided.',
    placeholder: 'Return window (days), condition requirements, etc...'
  },
  {
    id: 'ecom-4',
    name: 'Amazon Listing Optimizer',
    description: 'Create title and bullets for Amazon.',
    category: 'E-commerce',
    icon: 'Money',
    systemInstruction: 'You are an Amazon FBA Expert. Write an optimized Product Title (200 chars max) and 5 bullet points full of keywords and benefits.',
    placeholder: 'Product details and target keywords...'
  },

  // --- Cybersecurity ---
  {
    id: 'cyber-1',
    name: 'Incident Response Plan',
    description: 'Draft a plan for security breaches.',
    category: 'Security',
    icon: 'Shield',
    systemInstruction: 'You are a CISO. Outline a standard Incident Response Plan for a small-to-medium business, covering Identification, Containment, Eradication, and Recovery.',
    placeholder: 'Company size and industry...'
  },
  {
    id: 'cyber-2',
    name: 'Phishing Sim Email',
    description: 'Create test emails for employee training.',
    category: 'Security',
    icon: 'Shield',
    systemInstruction: 'You are a Security Trainer. Write a realistic-looking phishing email template to test employee awareness (for educational purposes only).',
    placeholder: 'What scenario? (e.g. Password reset, Urgent invoice)'
  },
  {
    id: 'cyber-3',
    name: 'Password Policy Gen',
    description: 'Create secure password guidelines.',
    category: 'Security',
    icon: 'Shield',
    systemInstruction: 'You are a Security Consultant. Draft a comprehensive Password and Access Policy for employees.',
    placeholder: 'Strictness level (Medium, High, Gov)...'
  },

  // --- HR ---
  {
    id: 'hr-1',
    name: 'Job Description Writer',
    description: 'Create professional JDs for any role.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are an HR Specialist. Write a detailed Job Description including Responsibilities, Requirements, and Benefits for the role specified.',
    placeholder: 'Job Title and Company details...'
  },
  {
    id: 'hr-2',
    name: 'Interview Question Gen',
    description: 'Generate role-specific interview questions.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are a Recruiter. List 10 interview questions (behavioral, technical, situational) for the specific role.',
    placeholder: 'What role are you hiring for?'
  },
  {
    id: 'hr-3',
    name: 'Performance Review Helper',
    description: 'Draft constructive performance feedback.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are a Team Lead. Draft a balanced performance review covering strengths and areas for improvement based on the notes provided.',
    placeholder: 'Enter employee notes and achievements...'
  },
  {
    id: 'hr-4',
    name: 'Onboarding Checklist',
    description: 'Create a first-week plan for new hires.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are an HR Manager. Create a comprehensive Day 1 to Day 5 onboarding checklist for a new hire in the specified department.',
    placeholder: 'Which department? (e.g. Engineering, Sales)'
  },
  {
    id: 'hr-5',
    name: 'Rejection Letter Writer',
    description: 'Write polite candidate rejection emails.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are a Recruiter. Write a polite, professional, and empathetic rejection letter to a job candidate. Keep it concise.',
    placeholder: 'Candidate name and role...'
  },
  {
    id: 'hr-6',
    name: 'Team Building Ideas',
    description: 'Fun remote or in-person activities.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are an HR Coordinator. Suggest 5 unique team-building activities suitable for the team size and setting provided.',
    placeholder: 'Team size and location (Remote/Office)...'
  },
  {
    id: 'hr-7',
    name: 'Employee Handbook Index',
    description: 'Structure a company handbook.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are an HR Director. Outline the Table of Contents for a standard Employee Handbook for a [Industry] company.',
    placeholder: 'Industry and company size...'
  },
  {
    id: 'hr-8',
    name: 'Return to Work Plan',
    description: 'Reintegration after leave.',
    category: 'HR',
    icon: 'Users',
    systemInstruction: 'You are an HR Manager. Create a re-integration plan for an employee returning from long-term leave.',
    placeholder: 'Leave type and duration...'
  },

  // --- Legal ---
  {
    id: 'leg-1',
    name: 'Contract Clause Drafter',
    description: 'Draft specific legal clauses for agreements.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a standard legal clause (e.g., NDA, Non-compete, Termination) based on the user\'s requirements. Include a disclaimer that you are an AI.',
    placeholder: 'What type of clause do you need?'
  },
  {
    id: 'leg-2',
    name: 'Privacy Policy Generator',
    description: 'Create a basic privacy policy for a website.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Compliance Officer. Draft a generic Privacy Policy structure for a website/app. Remind the user to consult a lawyer.',
    placeholder: 'Describe your website/app and data usage...'
  },
  {
    id: 'leg-3',
    name: 'NDA Generator',
    description: 'Draft a standard Non-Disclosure Agreement.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a standard mutual Non-Disclosure Agreement (NDA) template. Include a placeholder for parties and dates.',
    placeholder: 'Any specific terms?'
  },
  {
    id: 'leg-4',
    name: 'IP Assignment Template',
    description: 'Assign intellectual property rights.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a generic Intellectual Property (IP) Assignment Agreement template for a contractor or employee.',
    placeholder: 'Context (Contractor vs Employee)...'
  },
  {
    id: 'leg-5',
    name: 'Cease & Desist Drafter',
    description: 'Formal warning letter.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a formal Cease and Desist letter regarding copyright infringement or harassment. Keep it stern but professional.',
    placeholder: 'Reason for the letter...'
  },
  {
    id: 'leg-6',
    name: 'Independent Contractor Agmt',
    description: 'Draft a freelance contract.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a simple Independent Contractor Agreement template covering Scope, Payment, and Termination.',
    placeholder: 'Role and payment terms...'
  },
  {
    id: 'leg-7',
    name: 'GDPR Checklist',
    description: 'Ensure data compliance.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Compliance Officer. Create a GDPR compliance checklist for a standard web application handling user data.',
    placeholder: 'Type of data collected...'
  },
  {
    id: 'leg-8',
    name: 'Terms of Service Gen',
    description: 'Website terms.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Outline the key sections needed for a SaaS Terms of Service agreement.',
    placeholder: 'Service type...'
  },
  {
    id: 'leg-9',
    name: 'Affiliate Agreement',
    description: 'Partnership terms.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Lawyer. Draft a simple Affiliate Marketing Agreement template defining commission rates and promotional rules.',
    placeholder: 'Commission structure...'
  },
  {
    id: 'leg-10',
    name: 'Cookie Policy Generator',
    description: 'Draft a standard cookie policy.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Compliance Officer. Draft a standard Cookie Policy explanation for a website, categorizing Essential, Analytics, and Marketing cookies.',
    placeholder: 'Website details...'
  },
  {
    id: 'leg-11',
    name: 'EULA Generator',
    description: 'End User License Agreement.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a generic End User License Agreement (EULA) template for a software application.',
    placeholder: 'Software name and type...'
  },
  {
    id: 'leg-12',
    name: 'Photography Release',
    description: 'Permission to use photos.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a standard Model Release Form for photography purposes.',
    placeholder: 'Context of photo use...'
  },
  {
    id: 'leg-adv-1',
    name: 'MOU Template',
    description: 'Memorandum of Understanding.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Assistant. Draft a standard Memorandum of Understanding (MOU) between two parties for a preliminary partnership.',
    placeholder: 'Partnership details...'
  },
  {
    id: 'leg-adv-2',
    name: 'Board Resolution',
    description: 'Formalize board decisions.',
    category: 'Legal',
    icon: 'Scale',
    systemInstruction: 'You are a Corporate Secretary. Draft a Board Resolution document to formally record a decision made by the Board of Directors.',
    placeholder: 'Decision made...'
  },

  // --- Engineering ---
  {
    id: 'tech-1',
    name: 'Code Refactoring Assistant',
    description: 'Improve code quality and readability.',
    category: 'Engineering',
    icon: 'Code',
    systemInstruction: 'You are a Senior Engineer. Review the provided code snippet. Suggest refactoring for performance, readability, and clean code principles.',
    placeholder: 'Paste your code here...'
  },
  {
    id: 'tech-2',
    name: 'SQL Query Generator',
    description: 'Turn natural language into SQL.',
    category: 'Engineering',
    icon: 'Code',
    systemInstruction: 'You are a Database Admin. Convert the user\'s natural language request into a valid SQL query.',
    placeholder: 'e.g. "Get top 5 users by spend in 2024"'
  },
  {
    id: 'tech-3',
    name: 'Regex Generator',
    description: 'Create complex Regular Expressions.',
    category: 'Engineering',
    icon: 'Code',
    systemInstruction: 'You are a Developer. Generate a Regular Expression (Regex) for the specific pattern described. Explain how it works.',
    placeholder: 'What should the Regex match? (e.g. email addresses)'
  },
  {
    id: 'tech-4',
    name: 'Git Command Helper',
    description: 'Find the right Git command for the job.',
    category: 'Engineering',
    icon: 'Code',
    systemInstruction: 'You are a DevOps Engineer. Provide the exact Git commands to achieve the user\'s goal.',
    placeholder: 'What do you want to do in Git?'
  },
  {
    id: 'tech-5',
    name: 'Unit Test Writer',
    description: 'Generate unit tests for code snippets.',
    category: 'Engineering',
    icon: 'Code',
    systemInstruction: 'You are a QA Engineer. Write unit tests (using Jest or PyTest) for the provided code function. Cover edge cases.',
    placeholder: 'Paste code to test...'
  },
  {
    id: 'tech-6',
    name: 'Readme Generator',
    description: 'Create professional README.md files.',
    category: 'Engineering',
    icon: 'Code',
    systemInstruction: 'You are a Developer. Create a structured README.md file including Installation, Usage, and License sections based on the project description.',
    placeholder: 'Project name and functionality...'
  },
  
  // --- Finance ---
  {
    id: 'fin-1',
    name: 'Financial Ratio Explainer',
    description: 'Analyze and explain financial ratios.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are a Financial Analyst. Explain the implications of the provided financial ratios or data points for a business owner.',
    placeholder: 'Enter ratios (e.g., Current Ratio: 1.5)...'
  },
  {
    id: 'fin-2',
    name: 'Startup Budget Planner',
    description: 'Outline a preliminary budget for a startup.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are a CFO. Outline a typical budget structure and estimated expense categories for the type of startup described.',
    placeholder: 'What type of startup are you launching?'
  },
  {
    id: 'fin-3',
    name: 'Invoice Generator',
    description: 'Create a professional invoice template.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are an Accountant. Generate a markdown invoice template populated with the user\'s details. Include calculations.',
    placeholder: 'Client name, items, and rates...'
  },
  {
    id: 'fin-4',
    name: 'Excel Formula Helper',
    description: 'Generate complex Excel formulas.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are an Excel Expert. Create the specific Excel/Google Sheets formula to achieve the user\'s goal. Explain the logic.',
    placeholder: 'What do you want to calculate?'
  },
  {
    id: 'fin-5',
    name: 'Loan Amortization',
    description: 'Generate a payment schedule.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are a Financial Calculator. Create a monthly loan amortization schedule table (Month, Payment, Principal, Interest, Balance) based on the loan details provided.',
    placeholder: 'Loan Amount, Rate, and Term...'
  },
  {
    id: 'fin-6',
    name: 'DCF Valuation Model',
    description: 'Discounted Cash Flow method.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are a Valuation Analyst. Explain the steps to perform a Discounted Cash Flow (DCF) analysis for the company described, listing required inputs.',
    placeholder: 'Company details...'
  },
  {
    id: 'fin-7',
    name: 'NPV Calculator',
    description: 'Net Present Value.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are a Financial Analyst. Calculate the Net Present Value (NPV) given the discount rate and a series of cash flows.',
    placeholder: 'Rate: 10%, Flows: -1000, 200, 300...'
  },
  {
    id: 'fin-adv-1',
    name: 'EBITDA Calculator',
    description: 'Earnings before interest/tax.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are a Financial Analyst. Calculate EBITDA based on Net Income, Interest, Taxes, Depreciation, and Amortization provided.',
    placeholder: 'Values...'
  },
  {
    id: 'fin-adv-2',
    name: 'DSCR Calculator',
    description: 'Debt Service Coverage Ratio.',
    category: 'Finance',
    icon: 'Money',
    systemInstruction: 'You are a Bank Underwriter. Calculate the Debt Service Coverage Ratio (DSCR) based on Net Operating Income and Total Debt Service.',
    placeholder: 'NOI and Debt Service...'
  },

  // --- Product ---
  {
    id: 'prod-1',
    name: 'User Persona Creator',
    description: 'Generate detailed user personas.',
    category: 'Product',
    icon: 'Briefcase',
    systemInstruction: 'You are a Product Manager. Create a detailed User Persona (Name, Age, Job, Pain Points, Goals, Bio) for the product described.',
    placeholder: 'Describe your product/app...'
  },
  {
    id: 'prod-2',
    name: 'Feature Prioritizer (RICE)',
    description: 'Score features using the RICE framework.',
    category: 'Product',
    icon: 'Briefcase',
    systemInstruction: 'You are a Product Owner. Help the user prioritize features using the RICE (Reach, Impact, Confidence, Effort) framework. Explain the scoring for each item listed.',
    placeholder: 'List the features you want to prioritize...'
  },
  {
    id: 'prod-3',
    name: 'User Story Writer',
    description: 'Convert requirements into User Stories.',
    category: 'Product',
    icon: 'Briefcase',
    systemInstruction: 'You are an Agile Coach. Convert the requirement provided into standard User Stories (As a... I want to... So that...) with Acceptance Criteria.',
    placeholder: 'What feature needs to be built?'
  },
  {
    id: 'prod-4',
    name: 'Product Launch Checklist',
    description: 'Go-to-market plan essentials.',
    category: 'Product',
    icon: 'Megaphone',
    systemInstruction: 'You are a Product Marketing Manager. Create a comprehensive product launch checklist covering Product, Marketing, Sales, and Support tasks.',
    placeholder: 'What product are you launching?'
  },
  {
    id: 'prod-7',
    name: 'Deep Work Scheduler',
    description: 'Plan focus blocks.',
    category: 'Productivity',
    icon: 'Clock',
    systemInstruction: 'You are a Productivity Coach. Create a daily schedule optimized for "Deep Work" based on the user\'s peak hours and task list.',
    placeholder: 'Tasks and peak energy times...'
  },
  {
    id: 'prod-8',
    name: 'Weekly Review Template',
    description: 'Reflect on progress.',
    category: 'Productivity',
    icon: 'CheckCircle',
    systemInstruction: 'You are a Coach. Create a template for a "Weekly Review" to help the user assess wins, losses, and plan for next week.',
    placeholder: 'Just click Run...'
  },
  
  // --- Operations ---
  {
    id: 'ops-1',
    name: 'SOP Generator',
    description: 'Standard Operating Procedures writer.',
    category: 'Operations',
    icon: 'Briefcase',
    systemInstruction: 'You are an Operations Manager. Write a step-by-step Standard Operating Procedure (SOP) for the task described. Use clear numbering.',
    placeholder: 'What process needs an SOP?'
  },
  {
    id: 'ops-2',
    name: 'Meeting Agenda Builder',
    description: 'Create efficient agendas for meetings.',
    category: 'Operations',
    icon: 'Briefcase',
    systemInstruction: 'You are an Executive Assistant. Create a structured meeting agenda with time allocations for the meeting topic provided.',
    placeholder: 'Meeting topic and duration...'
  },
  {
    id: 'ops-3',
    name: 'Email Summarizer',
    description: 'Summarize long email threads.',
    category: 'Operations',
    icon: 'Briefcase',
    systemInstruction: 'You are an Executive Assistant. Summarize the provided email text into bullet points with key takeaways and action items.',
    placeholder: 'Paste email text...'
  },
  {
    id: 'ops-4',
    name: 'Shift Schedule Template',
    description: 'Roster for employees.',
    category: 'Operations',
    icon: 'Briefcase',
    systemInstruction: 'You are a Store Manager. Create a tabular weekly shift schedule template for the number of employees provided.',
    placeholder: 'Number of employees and shifts...'
  },
  {
    id: 'ops-5',
    name: 'Inventory Tracker',
    description: 'Simple stock tracking sheet.',
    category: 'Operations',
    icon: 'Briefcase',
    systemInstruction: 'You are an Operations Assistant. Create a Markdown table structure for tracking inventory (Item, SKU, Quantity, Reorder Level, Cost).',
    placeholder: 'Type of inventory...'
  },

  // --- Event Planning ---
  {
    id: 'event-1',
    name: 'Event Run of Show',
    description: 'Minute-by-minute event schedule.',
    category: 'Events',
    icon: 'Briefcase',
    systemInstruction: 'You are an Event Planner. Create a detailed Run of Show (timeline) for the event described. Include setup, main event, and breakdown.',
    placeholder: 'Event type, duration, and key segments...'
  },
  {
    id: 'event-2',
    name: 'Venue Selection Criteria',
    description: 'Checklist for choosing a venue.',
    category: 'Events',
    icon: 'Briefcase',
    systemInstruction: 'You are an Event Coordinator. List the key criteria and questions to ask when selecting a venue for the specific event type.',
    placeholder: 'Event type (Wedding, Conference, Party)...'
  },
  {
    id: 'event-3',
    name: 'Event Budget Estimator',
    description: 'Estimate costs for an event.',
    category: 'Events',
    icon: 'Money',
    systemInstruction: 'You are an Event Planner. Outline a budget with estimated percentage allocations for a typical event of this type (e.g. Venue 30%, F&B 40%).',
    placeholder: 'Event type and total budget...'
  },
  {
    id: 'event-4',
    name: 'Wedding Budget Allocator',
    description: 'Split wedding costs.',
    category: 'Events',
    icon: 'Money',
    systemInstruction: 'You are a Wedding Planner. Provide a detailed budget breakdown for a wedding based on the total budget provided.',
    placeholder: 'Total budget and guest count...'
  },
  {
    id: 'wed-1',
    name: 'Best Man Speech',
    description: 'Write a memorable toast.',
    category: 'Wedding',
    icon: 'Mic',
    systemInstruction: 'You are a Speechwriter. Write a Best Man speech. Balance humor with sentimentality. Include a toast at the end.',
    placeholder: 'Groom/Bride names and key memories...'
  },
  {
    id: 'wed-2',
    name: 'Maid of Honor Speech',
    description: 'Write a touching toast.',
    category: 'Wedding',
    icon: 'Mic',
    systemInstruction: 'You are a Speechwriter. Write a Maid of Honor speech. Focus on friendship, love, and well wishes.',
    placeholder: 'Bride/Groom names and key memories...'
  },
  {
    id: 'wed-3',
    name: 'Wedding Vow Writer',
    description: 'Personalized vows.',
    category: 'Wedding',
    icon: 'Heart',
    systemInstruction: 'You are a Romantic Writer. Write personalized wedding vows based on the tone and relationship details provided.',
    placeholder: 'Partner name and things you love about them...'
  },

  // --- Support ---
  {
    id: 'sup-1',
    name: 'Customer Service Reply',
    description: 'Draft empathetic support responses.',
    category: 'Support',
    icon: 'Users',
    systemInstruction: 'You are a Customer Success Agent. Draft an empathetic, professional, and helpful response to the customer inquiry provided.',
    placeholder: 'Paste the customer email/ticket here...'
  },
  {
    id: 'sup-2',
    name: 'FAQ Generator',
    description: 'Create FAQs from product details.',
    category: 'Support',
    icon: 'Users',
    systemInstruction: 'You are a Technical Writer. Generate a list of 5-10 Frequently Asked Questions (and answers) based on the product description.',
    placeholder: 'Product details...'
  },

  // --- Non-Profit ---
  {
    id: 'npo-1',
    name: 'Grant Proposal Writer',
    description: 'Draft sections of a grant proposal.',
    category: 'Non-Profit',
    icon: 'Heart',
    systemInstruction: 'You are a Grant Writer. Write a compelling "Needs Statement" and "Project Description" for a grant proposal based on the info provided.',
    placeholder: 'Describe your non-profit and the project...'
  },
  {
    id: 'npo-2',
    name: 'Donor Thank You Letter',
    description: 'Personalized donation acknowledgments.',
    category: 'Non-Profit',
    icon: 'Heart',
    systemInstruction: 'You are a Fundraising Coordinator. Write a heartfelt thank you letter to a donor. Reference their specific impact.',
    placeholder: 'Donor details and donation amount...'
  },
  {
    id: 'npo-3',
    name: 'Volunteer Recruitment',
    description: 'Ad copy to attract volunteers.',
    category: 'Non-Profit',
    icon: 'Users',
    systemInstruction: 'You are a Volunteer Coordinator. Write an engaging social media post or email to recruit volunteers for an upcoming cause.',
    placeholder: 'Cause and volunteer roles needed...'
  },

  // --- Travel ---
  {
    id: 'trv-1',
    name: 'Business Trip Itinerary',
    description: 'Optimize your business travel schedule.',
    category: 'Travel',
    icon: 'Globe',
    systemInstruction: 'You are a Travel Agent. Create a logical travel itinerary for a business trip, balancing meetings with rest and transit time.',
    placeholder: 'Destination, dates, and meeting constraints...'
  },
  {
    id: 'trv-2',
    name: 'Cultural Etiquette Guide',
    description: 'Dos and Don\'ts for international travel.',
    category: 'Travel',
    icon: 'Globe',
    systemInstruction: 'You are a Cultural Consultant. List key business etiquette Dos and Don\'ts for the country specified to help the user avoid faux pas.',
    placeholder: 'Country or Region...'
  },
  {
    id: 'trv-3',
    name: 'Travel Packing List',
    description: 'Never forget an item.',
    category: 'Travel',
    icon: 'Briefcase',
    systemInstruction: 'You are a Travel Pro. Create a packing checklist for the destination and weather described.',
    placeholder: 'Destination and weather...'
  },

  // --- Education / L&D ---
  {
    id: 'edu-1',
    name: 'Lesson Plan Creator',
    description: 'Structure a training session or lesson.',
    category: 'Education',
    icon: 'Briefcase',
    systemInstruction: 'You are an Instructional Designer. Create a detailed lesson plan with learning objectives, activities, and timing for the topic provided.',
    placeholder: 'Topic and target audience...'
  },
  {
    id: 'edu-2',
    name: 'Quiz Generator',
    description: 'Create multiple-choice questions.',
    category: 'Education',
    icon: 'Briefcase',
    systemInstruction: 'You are a Teacher. Generate 5 multiple-choice questions (with answer key) based on the text or topic provided.',
    placeholder: 'Topic or content to test...'
  },
  {
    id: 'edu-3',
    name: 'Complex Concept Simplifier',
    description: 'Explain hard topics like I\'m 5.',
    category: 'Education',
    icon: 'Sparkles',
    systemInstruction: 'You are a Science Communicator. Explain the complex concept provided in simple, easy-to-understand terms (ELI5).',
    placeholder: 'Concept to explain...'
  },
  {
    id: 'edu-4',
    name: 'Syllabus Builder',
    description: 'Structure a course curriculum.',
    category: 'Education',
    icon: 'Briefcase',
    systemInstruction: 'You are a Professor. Create a course syllabus including weekly topics, reading lists, and grading criteria.',
    placeholder: 'Course subject...'
  },
  {
    id: 'teach-1',
    name: 'Report Card Comments',
    description: 'Draft student feedback.',
    category: 'Education',
    icon: 'Pen',
    systemInstruction: 'You are a Teacher. Write 3 report card comment options (Positive, Constructive, Neutral) for the student described.',
    placeholder: 'Student strengths and weaknesses...'
  },
  {
    id: 'teach-2',
    name: 'Class Ice Breaker',
    description: 'Fun activities for students.',
    category: 'Education',
    icon: 'Users',
    systemInstruction: 'You are a Teacher. Suggest 3 fun, age-appropriate ice breaker activities for the first day of class.',
    placeholder: 'Student age group...'
  },

  // --- Personal Growth & Finance ---
  {
    id: 'pers-1',
    name: 'Daily Productivity Planner',
    description: 'Structure your day for maximum output.',
    category: 'Personal',
    icon: 'Briefcase',
    systemInstruction: 'You are a Productivity Coach. Create a daily schedule block based on the tasks provided, using the Pomodoro or Time-blocking technique.',
    placeholder: 'List your tasks for today...'
  },
  {
    id: 'pers-2',
    name: 'Meal Prep Assistant',
    description: 'Generate healthy meal ideas.',
    category: 'Personal',
    icon: 'Sparkles',
    systemInstruction: 'You are a Nutritionist. Suggest a healthy meal plan (Breakfast, Lunch, Dinner) based on the dietary preferences provided.',
    placeholder: 'Preferences (e.g. Keto, Vegetarian)...'
  },
  {
    id: 'pers-3',
    name: 'Workout Generator',
    description: 'Custom exercise routines.',
    category: 'Personal',
    icon: 'Sparkles',
    systemInstruction: 'You are a Personal Trainer. Create a workout routine based on the available equipment and time constraints.',
    placeholder: 'Equipment available and time...'
  },
  {
    id: 'pers-4',
    name: 'Personal Budget Template',
    description: 'Organize your finances.',
    category: 'Personal Finance',
    icon: 'Money',
    systemInstruction: 'You are a Financial Planner. Create a Markdown table for a personal monthly budget, including categories for Fixed Needs, Variable Wants, and Savings.',
    placeholder: 'Income and main expenses...'
  },
  {
    id: 'pers-5',
    name: 'Debt Payoff Plan',
    description: 'Strategies to clear debt.',
    category: 'Personal Finance',
    icon: 'Money',
    systemInstruction: 'You are a Debt Counselor. Explain the Snowball vs Avalanche methods and suggest a plan for the debts listed.',
    placeholder: 'List debts and interest rates...'
  },
  {
    id: 'pers-6',
    name: 'Habit Tracker Template',
    description: 'Track daily habits.',
    category: 'Personal',
    icon: 'CheckCircle',
    systemInstruction: 'You are a Coach. Create a weekly habit tracker structure for the habits listed.',
    placeholder: 'Habits to track...'
  },
  {
    id: 'prod-sys-1',
    name: 'Eisenhower Matrix',
    description: 'Sort tasks by urgency/importance.',
    category: 'Personal',
    icon: 'CheckCircle',
    systemInstruction: 'You are a Productivity Expert. Categorize the user\'s task list into the Eisenhower Matrix quadrants: Do First, Schedule, Delegate, Don\'t Do.',
    placeholder: 'List your tasks...'
  },

  // --- Creative Writing ---
  {
    id: 'write-1',
    name: 'Story Plot Generator',
    description: 'Brainstorm fiction story ideas.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Novelist. Generate 3 unique story plot ideas based on the genre provided. Include a twist.',
    placeholder: 'Genre (e.g. Sci-fi, Mystery)...'
  },
  {
    id: 'write-2',
    name: 'Grammar Polisher',
    description: 'Fix grammar and improve flow.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are an Editor. Correct the grammar and improve the flow of the text provided without changing the meaning.',
    placeholder: 'Paste text to polish...'
  },
  {
    id: 'write-3',
    name: 'Poem Generator',
    description: 'Write poetry in any style.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Poet. Write a poem in the style requested about the topic provided.',
    placeholder: 'Topic and style (e.g. Haiku about coding)...'
  },
  {
    id: 'write-4',
    name: 'Headline Analyzer',
    description: 'Evaluate title impact.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Copy Editor. Analyze the headline provided for emotional impact, clarity, and click-through potential. Suggest improvements.',
    placeholder: 'Headline...'
  },
  {
    id: 'write-5',
    name: 'Passive Voice Detector',
    description: 'Improve writing directness.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Writing Coach. Identify passive voice usage in the text and rewrite sentences to be in active voice.',
    placeholder: 'Text to analyze...'
  },
  {
    id: 'write-6',
    name: 'Cliché Finder',
    description: 'Remove overused phrases.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Writing Coach. Identify clichés in the text and suggest fresher, more original alternatives.',
    placeholder: 'Text to analyze...'
  },
  {
    id: 'write-7',
    name: 'Book Blurb Generator',
    description: 'Write a compelling back cover.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Book Editor. Write a compelling back cover blurb for the book described. Focus on the hook and conflict.',
    placeholder: 'Plot summary and genre...'
  },
  {
    id: 'write-8',
    name: 'Character Name Generator',
    description: 'Unique names for fiction.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Novelist. Generate 10 unique character names suitable for the genre and setting described.',
    placeholder: 'Genre and setting...'
  },
  {
    id: 'write-adv-1',
    name: 'Book Outline Generator',
    description: 'Structure a non-fiction book.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are an Editor. Create a comprehensive chapter outline for a non-fiction book on the topic provided.',
    placeholder: 'Book topic...'
  },
  {
    id: 'write-adv-2',
    name: 'Character Profile Builder',
    description: 'Deepen fictional characters.',
    category: 'Writing',
    icon: 'Pen',
    systemInstruction: 'You are a Novelist. Create a deep character profile (Goals, Fears, Secrets, Flaws) for a character in the story described.',
    placeholder: 'Story context and character role...'
  },

  // --- Hospitality ---
  {
    id: 'hosp-1',
    name: 'Menu Engineer',
    description: 'Optimize menu descriptions.',
    category: 'Hospitality',
    icon: 'Utensils',
    systemInstruction: 'You are a Head Chef. Rewrite the menu item descriptions to be more appetizing and descriptive using sensory words.',
    placeholder: 'Dish names and ingredients...'
  },
  {
    id: 'hosp-2',
    name: 'Guest Response Writer',
    description: 'Reply to hotel/restaurant reviews.',
    category: 'Hospitality',
    icon: 'Utensils',
    systemInstruction: 'You are a Hotel Manager. Write a professional and polite response to the guest review provided (Positive or Negative).',
    placeholder: 'Paste guest review...'
  },
  {
    id: 'hosp-3',
    name: 'Staff Shift Scheduler',
    description: 'Create fair shift schedules.',
    category: 'Hospitality',
    icon: 'Utensils',
    systemInstruction: 'You are a Restaurant Manager. Create a basic weekly shift schedule structure for the roles provided, ensuring coverage.',
    placeholder: 'Roles needed and operating hours...'
  },

  // --- Retail ---
  {
    id: 'ret-1',
    name: 'Visual Merchandising Guide',
    description: 'Ideas for store displays.',
    category: 'Retail',
    icon: 'Tag',
    systemInstruction: 'You are a Visual Merchandiser. Suggest 3 creative window display themes for the current season and store type.',
    placeholder: 'Store type and season...'
  },
  {
    id: 'ret-2',
    name: 'Seasonal Promo Planner',
    description: 'Plan retail sales events.',
    category: 'Retail',
    icon: 'Tag',
    systemInstruction: 'You are a Retail Strategist. Plan a promotional calendar for the upcoming holiday season for the specified store niche.',
    placeholder: 'Niche (e.g. Clothing, Toys)...'
  },
  {
    id: 'ret-3',
    name: 'Inventory Forecasting',
    description: 'Estimate stock needs.',
    category: 'Retail',
    icon: 'Tag',
    systemInstruction: 'You are a Supply Chain Analyst. Explain how to calculate Safety Stock and Reorder Points for the product described.',
    placeholder: 'Product sales velocity and lead time...'
  },

  // --- Construction ---
  {
    id: 'const-1',
    name: 'Project Cost Estimator',
    description: 'Rough estimate for renovation.',
    category: 'Construction',
    icon: 'Hammer',
    systemInstruction: 'You are a Contractor. Provide a rough order-of-magnitude cost breakdown for the renovation project described (Materials, Labor, Contingency).',
    placeholder: 'Project scope (e.g. Kitchen remodel)...'
  },
  {
    id: 'const-2',
    name: 'Safety Checklist Gen',
    description: 'Site safety requirements.',
    category: 'Construction',
    icon: 'Hammer',
    systemInstruction: 'You are a Site Safety Officer. Create a daily safety inspection checklist for the specific construction site type.',
    placeholder: 'Site type (e.g. High-rise, Residential)...'
  },
  {
    id: 'const-3',
    name: 'Material Quantity Calc',
    description: 'Calculate materials needed.',
    category: 'Construction',
    icon: 'Hammer',
    systemInstruction: 'You are a Quantity Surveyor. Help the user calculate the amount of material needed (e.g. paint, concrete, tiles) based on dimensions.',
    placeholder: 'Dimensions and material...'
  },

  // --- Agriculture ---
  {
    id: 'agri-1',
    name: 'Crop Rotation Planner',
    description: 'Plan sustainable planting.',
    category: 'Agriculture',
    icon: 'Leaf',
    systemInstruction: 'You are an Agronomist. Suggest a 3-year crop rotation plan for the specific region and soil type to maximize yield and soil health.',
    placeholder: 'Region and main crop...'
  },
  {
    id: 'agri-2',
    name: 'Pest Control Advisor',
    description: 'Identify and treat pests.',
    category: 'Agriculture',
    icon: 'Leaf',
    systemInstruction: 'You are a Pest Control Expert. Suggest organic and chemical treatment options for the specific pest or symptom described.',
    placeholder: 'Describe the pest or plant damage...'
  },

  // --- Entertainment ---
  {
    id: 'ent-1',
    name: 'Setlist Creator',
    description: 'Build the perfect gig setlist.',
    category: 'Entertainment',
    icon: 'MusicNote',
    systemInstruction: 'You are a Music Director. Create a balanced setlist for a live performance, mixing upbeat and slow tempo tracks based on the genre.',
    placeholder: 'Genre and show duration...'
  },
  {
    id: 'ent-2',
    name: 'Band Contract Drafter',
    description: 'Simple performance agreement.',
    category: 'Entertainment',
    icon: 'MusicNote',
    systemInstruction: 'You are an Entertainment Lawyer. Draft a simple Performance Agreement between an Artist and a Venue.',
    placeholder: 'Artist name, venue, and fee...'
  },

  // --- Manufacturing ---
  {
    id: 'mfg-1',
    name: 'Production Bottleneck Finder',
    description: 'Identify process inefficiencies.',
    category: 'Manufacturing',
    icon: 'Wrench',
    systemInstruction: 'You are a Lean Manufacturing Expert. Analyze the production flow description provided and identify potential bottlenecks or wastes (Muda).',
    placeholder: 'Describe your production line flow...'
  },
  {
    id: 'mfg-2',
    name: 'Maintenance Scheduler',
    description: 'Preventative maintenance plans.',
    category: 'Manufacturing',
    icon: 'Wrench',
    systemInstruction: 'You are a Maintenance Manager. Create a preventative maintenance schedule for the equipment list provided.',
    placeholder: 'List of machinery and usage frequency...'
  },
  {
    id: 'mfg-3',
    name: 'Quality Control Checklist',
    description: 'Ensure product standards.',
    category: 'Manufacturing',
    icon: 'Wrench',
    systemInstruction: 'You are a QA Manager. Create a step-by-step Quality Control (QC) inspection checklist for the product described.',
    placeholder: 'Product specifications and key risks...'
  },

  // --- Logistics ---
  {
    id: 'log-1',
    name: 'Route Optimizer',
    description: 'Efficient delivery planning.',
    category: 'Logistics',
    icon: 'Truck',
    systemInstruction: 'You are a Logistics Coordinator. Suggest the most efficient routing order for the list of stops provided, considering traffic/distance generally.',
    placeholder: 'List of addresses or zones...'
  },
  {
    id: 'log-2',
    name: 'Warehouse Layout Plan',
    description: 'Optimize storage space.',
    category: 'Logistics',
    icon: 'Truck',
    systemInstruction: 'You are a Warehouse Manager. Suggest a warehouse layout strategy (e.g. ABC analysis) for the inventory types described.',
    placeholder: 'Types of products (size, turnover rate)...'
  },
  {
    id: 'log-3',
    name: 'Shipping Policy Gen',
    description: 'Draft shipping terms.',
    category: 'Logistics',
    icon: 'Truck',
    systemInstruction: 'You are an Operations Manager. Draft a clear Shipping & Delivery Policy for a business, including processing times and international rules.',
    placeholder: 'Carriers used and standard timeframes...'
  },

  // --- Healthcare ---
  {
    id: 'hlth-1',
    name: 'Patient Intake Form',
    description: 'Standard medical history form.',
    category: 'Healthcare',
    icon: 'Activity',
    systemInstruction: 'You are a Medical Administrator. Draft a comprehensive New Patient Intake Form structure, covering demographics, history, and consent.',
    placeholder: 'Clinic specialty (e.g. Dental, GP)...'
  },
  {
    id: 'hlth-2',
    name: 'Discharge Instructions',
    description: 'Clear post-visit guidance.',
    category: 'Healthcare',
    icon: 'Activity',
    systemInstruction: 'You are a Nurse Practitioner. Write clear, non-technical discharge instructions for a patient recovering from the condition specified.',
    placeholder: 'Condition or procedure...'
  },
  {
    id: 'hlth-3',
    name: 'HIPAA Compliance Check',
    description: 'Privacy rule reminders.',
    category: 'Healthcare',
    icon: 'Activity',
    systemInstruction: 'You are a Compliance Officer. List key HIPAA privacy/security reminders for staff handling the specific type of data or scenario described.',
    placeholder: 'Scenario (e.g. Emailing patient records)...'
  },

  // --- Fitness ---
  {
    id: 'fit-1',
    name: 'Client Assessment',
    description: 'Initial fitness evaluation.',
    category: 'Fitness',
    icon: 'Activity',
    systemInstruction: 'You are a Personal Trainer. Create an initial fitness assessment form to evaluate a new client\'s goals, history, and physical baseline.',
    placeholder: 'Client goals (e.g. Weight loss, Muscle)...'
  },
  {
    id: 'fit-2',
    name: 'Nutrition Plan Outline',
    description: 'General dietary guidelines.',
    category: 'Fitness',
    icon: 'Activity',
    systemInstruction: 'You are a Nutrition Coach. Create a high-level nutrition strategy (macros, hydration, meal timing) for the client profile described.',
    placeholder: 'Client weight, activity level, and goal...'
  },
  {
    id: 'fit-3',
    name: 'Gym Equipment ROI',
    description: 'Evaluate new gear purchases.',
    category: 'Fitness',
    icon: 'Activity',
    systemInstruction: 'You are a Gym Owner. Analyze the pros and cons and potential ROI of purchasing the specific equipment piece mentioned.',
    placeholder: 'Equipment name and cost...'
  },

  // --- Fashion ---
  {
    id: 'fash-1',
    name: 'Trend Forecast Report',
    description: 'Predict upcoming styles.',
    category: 'Fashion',
    icon: 'Scissors',
    systemInstruction: 'You are a Fashion Forecaster. Predict 3 key trends (Color, Fabric, Silhouette) for the upcoming season based on current street style signals.',
    placeholder: 'Season and target demographic...'
  },
  {
    id: 'fash-2',
    name: 'Tech Pack Generator',
    description: 'Specifications for manufacturing.',
    category: 'Fashion',
    icon: 'Scissors',
    systemInstruction: 'You are a Technical Designer. Outline the key sections and details needed for a Tech Pack for the garment described.',
    placeholder: 'Garment type (e.g. Hoodie, Dress)...'
  },
  {
    id: 'fash-3',
    name: 'Collection Theme Ideation',
    description: 'Brainstorm cohesive lines.',
    category: 'Fashion',
    icon: 'Scissors',
    systemInstruction: 'You are a Creative Director. Brainstorm 3 distinct theme concepts for a new fashion collection, including mood, colors, and key pieces.',
    placeholder: 'Brand vibe and season...'
  },

  // --- Wellness ---
  {
    id: 'well-1',
    name: 'Meditation Script',
    description: 'Guided relaxation text.',
    category: 'Wellness',
    icon: 'Sun',
    systemInstruction: 'You are a Meditation Teacher. Write a soothing 5-minute guided meditation script focused on the specific goal provided.',
    placeholder: 'Goal (e.g. Sleep, Anxiety relief)...'
  },
  {
    id: 'well-2',
    name: 'Spa Menu Creator',
    description: 'Luxurious treatment descriptions.',
    category: 'Wellness',
    icon: 'Sun',
    systemInstruction: 'You are a Spa Director. Write alluring descriptions for a new spa treatment menu. Focus on sensory details and benefits.',
    placeholder: 'Treatments (e.g. Massage, Facial)...'
  },

  // --- Creator Economy ---
  {
    id: 'creator-1',
    name: 'YouTube Script Writer',
    description: 'Engaging video scripts.',
    category: 'Creator',
    icon: 'VideoCamera',
    systemInstruction: 'You are a YouTube Strategist. Write a script for a YouTube video, including an engaging Hook, Intro, Content Body, and CTA.',
    placeholder: 'Video topic and style...'
  },
  {
    id: 'creator-2',
    name: 'Sponsorship Pitch Deck',
    description: 'Pitch brands for deals.',
    category: 'Creator',
    icon: 'VideoCamera',
    systemInstruction: 'You are a Brand Partnerships Manager. Outline a pitch deck to send to brands for sponsorship, highlighting audience demographics and engagement.',
    placeholder: 'Your niche and audience size...'
  },
  {
    id: 'creator-3',
    name: 'Podcast Interview Prep',
    description: 'Questions for guests.',
    category: 'Creator',
    icon: 'Mic',
    systemInstruction: 'You are a Podcast Host. Generate 10 unique and deep interview questions for the guest described to create a compelling episode.',
    placeholder: 'Guest name and expertise...'
  },
  {
    id: 'creator-4',
    name: 'Thumbnail Idea Gen',
    description: 'Click-worthy concepts.',
    category: 'Creator',
    icon: 'VideoCamera',
    systemInstruction: 'You are a YouTube Expert. Describe 3 high-CTR thumbnail concepts (visuals + text overlay) for the video topic provided.',
    placeholder: 'Video title/topic...'
  },
  {
    id: 'creator-5',
    name: 'TikTok Trend Adapter',
    description: 'Adapt trends to your niche.',
    category: 'Creator',
    icon: 'VideoCamera',
    systemInstruction: 'You are a Social Media Strategist. Explain how to adapt the described viral trend to the user\'s specific niche.',
    placeholder: 'Trend description and your niche...'
  },
  {
    id: 'creator-adv-1',
    name: 'Podcast Name Generator',
    description: 'Creative show titles.',
    category: 'Creator',
    icon: 'Mic',
    systemInstruction: 'You are a Creative Brand Specialist. Suggest 10 catchy, memorable, and SEO-friendly names for a podcast about the topic provided.',
    placeholder: 'Podcast topic and vibe...'
  },
  {
    id: 'creator-adv-2',
    name: 'Patreon Tier Architect',
    description: 'Structure membership perks.',
    category: 'Creator',
    icon: 'Money',
    systemInstruction: 'You are a Membership Strategist. Suggest 3 Patreon membership tiers (Low, Mid, High) with specific perks for the creator type described.',
    placeholder: 'Creator type (e.g. Artist, Educator)...'
  },

  // --- Web3 & Tech ---
  {
    id: 'web3-1',
    name: 'Smart Contract Specs',
    description: 'Define logic for contracts.',
    category: 'Web3',
    icon: 'Chip',
    systemInstruction: 'You are a Blockchain Developer. Outline the logical requirements and functions needed for a Solidity smart contract for the use case described.',
    placeholder: 'Use case (e.g. NFT Marketplace, Token)...'
  },
  {
    id: 'web3-2',
    name: 'Whitepaper Outliner',
    description: 'Structure a crypto whitepaper.',
    category: 'Web3',
    icon: 'Chip',
    systemInstruction: 'You are a Technical Writer. Create a standard Whitepaper structure for a new crypto project, including Problem, Solution, Tokenomics, and Roadmap.',
    placeholder: 'Project name and concept...'
  },
  {
    id: 'web3-3',
    name: 'Tokenomics Designer',
    description: 'Plan token distribution.',
    category: 'Web3',
    icon: 'Chip',
    systemInstruction: 'You are a Tokenomics Expert. Suggest a token distribution model (allocations, vesting schedules) for a new project to ensure long-term sustainability.',
    placeholder: 'Project type (e.g. DeFi, GameFi)...'
  },

  // --- Sustainability ---
  {
    id: 'sus-1',
    name: 'Carbon Reduction Plan',
    description: 'Ways to lower emissions.',
    category: 'Sustainability',
    icon: 'Leaf',
    systemInstruction: 'You are a Sustainability Consultant. List 5 actionable ways for the business described to reduce its carbon footprint.',
    placeholder: 'Business type and operations...'
  },
  {
    id: 'sus-2',
    name: 'ESG Report Structure',
    description: 'Reporting framework.',
    category: 'Sustainability',
    icon: 'Leaf',
    systemInstruction: 'You are an ESG Analyst. Outline the key sections for an Environmental, Social, and Governance (ESG) report for the company.',
    placeholder: 'Industry and company size...'
  },

  // --- Project Management ---
  {
    id: 'pm-1',
    name: 'RACI Matrix Builder',
    description: 'Define roles and responsibilities.',
    category: 'Management',
    icon: 'Briefcase',
    systemInstruction: 'You are a Project Manager. Create a RACI Matrix (Responsible, Accountable, Consulted, Informed) for the project stakeholders and tasks described.',
    placeholder: 'List of tasks and stakeholders...'
  },
  {
    id: 'pm-2',
    name: 'Risk Register Creator',
    description: 'Identify and mitigate risks.',
    category: 'Management',
    icon: 'Shield',
    systemInstruction: 'You are a Risk Manager. Create a Risk Register for the project, identifying potential risks, impact, probability, and mitigation strategies.',
    placeholder: 'Project description...'
  },
  {
    id: 'pm-3',
    name: 'Post-Mortem Template',
    description: 'Review completed projects.',
    category: 'Management',
    icon: 'Briefcase',
    systemInstruction: 'You are an Agile Coach. specific Create a blameless Post-Mortem / Retrospective template to analyze what went well and what didn\'t.',
    placeholder: 'Project outcome...'
  },
  {
    id: 'pm-4',
    name: 'Gantt Chart Outliner',
    description: 'Timeline of project phases.',
    category: 'Management',
    icon: 'Chart',
    systemInstruction: 'You are a Project Planner. Outline a text-based Gantt chart schedule for the project phases and duration provided.',
    placeholder: 'Project phases and total time...'
  },

  // --- Customer Success ---
  {
    id: 'cs-1',
    name: 'QBR Deck Outline',
    description: 'Quarterly Business Review.',
    category: 'Customer Success',
    icon: 'Presentation',
    systemInstruction: 'You are a Customer Success Manager. Outline a Quarterly Business Review (QBR) presentation to demonstrate value to a client.',
    placeholder: 'Client goals and achievements...'
  },
  {
    id: 'cs-2',
    name: 'Churn Risk Analyzer',
    description: 'Identify at-risk clients.',
    category: 'Customer Success',
    icon: 'Presentation',
    systemInstruction: 'You are a Retention Specialist. Analyze the customer behavior described and identify warning signs of churn. Suggest retention plays.',
    placeholder: 'Customer usage patterns and feedback...'
  },
  {
    id: 'cs-3',
    name: 'Success Plan Builder',
    description: 'Roadmap for client goals.',
    category: 'Customer Success',
    icon: 'Presentation',
    systemInstruction: 'You are a CSM. Draft a Customer Success Plan outlining the client\'s objectives, success criteria, and a timeline for value realization.',
    placeholder: 'Client objective...'
  },

  // --- Consulting ---
  {
    id: 'cons-1',
    name: 'Framework Matcher',
    description: 'Find the right mental model.',
    category: 'Consulting',
    icon: 'Presentation',
    systemInstruction: 'You are a Management Consultant. Suggest the best strategic frameworks (e.g. Porter\'s 5 Forces, Ansoff Matrix) to solve the business problem described.',
    placeholder: 'Business problem...'
  },
  {
    id: 'cons-2',
    name: 'Change Management Plan',
    description: 'Guide organizational change.',
    category: 'Consulting',
    icon: 'Presentation',
    systemInstruction: 'You are a Change Manager. Outline a standard Change Management strategy (using ADKAR or Kotter) for the organizational shift described.',
    placeholder: 'Describe the change (e.g. New software rollout)...'
  },
  {
    id: 'cons-3',
    name: 'Gap Analysis Tool',
    description: 'Bridge current and future state.',
    category: 'Consulting',
    icon: 'Presentation',
    systemInstruction: 'You are a Business Analyst. Perform a high-level Gap Analysis between the Current State and Desired Future State described.',
    placeholder: 'Current state vs Future state...'
  },
  {
    id: 'cons-4',
    name: 'Proposal Generator',
    description: 'Draft consulting proposals.',
    category: 'Consulting',
    icon: 'Briefcase',
    systemInstruction: 'You are a Consultant. Write the Executive Summary and Scope of Work sections for a consulting proposal based on the project requirements.',
    placeholder: 'Client needs and your services...'
  },

  // --- Franchise ---
  {
    id: 'fran-1',
    name: 'Franchise Ops Manual',
    description: 'Standardize operations.',
    category: 'Franchise',
    icon: 'Briefcase',
    systemInstruction: 'You are a Franchise Consultant. Outline the key chapters needed for a Franchise Operations Manual.',
    placeholder: 'Franchise type...'
  },
  {
    id: 'fran-2',
    name: 'Location Scout Scorecard',
    description: 'Evaluate new sites.',
    category: 'Franchise',
    icon: 'Search',
    systemInstruction: 'You are a Location Analyst. Create a scorecard criteria list for evaluating potential new franchise locations.',
    placeholder: 'Business type...'
  },

  // --- Public Relations ---
  {
    id: 'pr-1',
    name: 'Media Kit Creator',
    description: 'Press assets for your brand.',
    category: 'PR',
    icon: 'Megaphone',
    systemInstruction: 'You are a Publicist. Outline the essential components and text for a company Media Kit.',
    placeholder: 'Company details...'
  },
  {
    id: 'pr-2',
    name: 'Interview Prep',
    description: 'Prepare for media Q&A.',
    category: 'PR',
    icon: 'Mic',
    systemInstruction: 'You are a Media Trainer. Generate 5 tough questions a journalist might ask about the news provided, and suggest talking points.',
    placeholder: 'News or announcement...'
  },

  // --- Academic ---
  {
    id: 'acad-1',
    name: 'Abstract Summarizer',
    description: 'Summarize complex papers.',
    category: 'Academic',
    icon: 'Briefcase',
    systemInstruction: 'You are a Researcher. Summarize the provided academic abstract into 3 simple bullet points.',
    placeholder: 'Paste abstract...'
  },
  {
    id: 'acad-2',
    name: 'Citation Generator',
    description: 'Format references.',
    category: 'Academic',
    icon: 'Briefcase',
    systemInstruction: 'You are a Librarian. Format the provided book/article info into APA, MLA, and Chicago citation styles.',
    placeholder: 'Title, Author, Year, Publisher...'
  },
  
  // --- Coaching ---
  {
    id: 'coach-1',
    name: 'GROW Model Worksheet',
    description: 'Structure coaching sessions.',
    category: 'Coaching',
    icon: 'Users',
    systemInstruction: 'You are a Professional Coach. Create a GROW Model (Goal, Reality, Options, Will) worksheet based on the client\'s initial goal.',
    placeholder: 'Client Goal...'
  },
  {
    id: 'coach-2',
    name: 'Coaching Agreement',
    description: 'Contract for coaching.',
    category: 'Coaching',
    icon: 'Users',
    systemInstruction: 'You are a Coach. Draft a professional Coaching Agreement covering confidentiality, frequency, and cancellation policies.',
    placeholder: 'Client name and fee...'
  },

  // --- Automotive ---
  {
    id: 'auto-1',
    name: 'Vehicle Maint Log',
    description: 'Track car service.',
    category: 'Automotive',
    icon: 'Wrench',
    systemInstruction: 'You are a Mechanic. Create a Maintenance Log structure for the specific vehicle make and model.',
    placeholder: 'Car Year, Make, Model...'
  },
  {
    id: 'auto-2',
    name: 'Bill of Sale',
    description: 'Sell a vehicle.',
    category: 'Automotive',
    icon: 'Wrench',
    systemInstruction: 'You are a DMV Clerk. Draft a standard Vehicle Bill of Sale.',
    placeholder: 'Buyer/Seller names and Car details...'
  },

  // --- Music Business ---
  {
    id: 'music-1',
    name: 'Song Lyric Assistant',
    description: 'Draft lyrics based on a theme.',
    category: 'Music',
    icon: 'MusicNote',
    systemInstruction: 'You are a Songwriter. Write lyrics for a song (Verse-Chorus structure) based on the theme and mood provided.',
    placeholder: 'Theme (e.g. Heartbreak) and Genre...'
  },
  {
    id: 'music-2',
    name: 'Gig Technical Rider',
    description: 'Stage and tech requirements.',
    category: 'Music',
    icon: 'MusicNote',
    systemInstruction: 'You are a Tour Manager. Create a standard Technical Rider for a band, listing required stage gear, audio inputs, and lighting needs.',
    placeholder: 'Band setup (e.g. 4 piece, drums, 2 guitars)...'
  },
  {
    id: 'music-3',
    name: 'Press Release (Music)',
    description: 'Announce a new single or album.',
    category: 'Music',
    icon: 'Megaphone',
    systemInstruction: 'You are a Music Publicist. Write a press release for a new music release. Include quotes and streaming links placeholders.',
    placeholder: 'Artist and Song/Album details...'
  },

  // --- Freelancing ---
  {
    id: 'free-1',
    name: 'Hourly Rate Calculator',
    description: 'Calculate your target rate.',
    category: 'Freelance',
    icon: 'Money',
    systemInstruction: 'You are a Freelance Coach. Help the user calculate their ideal hourly rate based on desired annual income and billable hours.',
    placeholder: 'Desired Income: $80k, Billable hours/week: 25...'
  },
  {
    id: 'free-2',
    name: 'Scope Creep Email',
    description: 'Address extra work requests.',
    category: 'Freelance',
    icon: 'Briefcase',
    systemInstruction: 'You are a Professional Freelancer. Write a polite but firm email to a client explaining that a new request is out of scope and requires a budget adjustment.',
    placeholder: 'New request details...'
  },
  {
    id: 'free-3',
    name: 'Client Onboarding Form',
    description: 'Gather project info.',
    category: 'Freelance',
    icon: 'Briefcase',
    systemInstruction: 'You are a Project Manager. Create a list of questions for a new client onboarding form to understand their project needs and style.',
    placeholder: 'Service type (e.g. Web Design)...'
  },

  // --- Language & Translation ---
  {
    id: 'lang-1',
    name: 'Vocab Drill Generator',
    description: 'Learn new words.',
    category: 'Language',
    icon: 'Globe',
    systemInstruction: 'You are a Language Teacher. Generate a list of 10 useful vocabulary words/phrases for the topic provided in the target language, with translations.',
    placeholder: 'Language and Topic (e.g. Spanish - Restaurant)...'
  },
  {
    id: 'lang-2',
    name: 'Email Translator (Professional)',
    description: 'Translate emails for business.',
    category: 'Language',
    icon: 'Globe',
    systemInstruction: 'You are a Professional Translator. Translate the provided email text into the target language, maintaining a formal business tone.',
    placeholder: 'Target Language and Text...'
  },

  // --- Home & Lifestyle ---
  {
    id: 'home-1',
    name: 'Cleaning Schedule',
    description: 'Keep your space tidy.',
    category: 'Lifestyle',
    icon: 'CheckCircle',
    systemInstruction: 'You are a Home Organizer. Create a weekly cleaning schedule broken down by day and room.',
    placeholder: 'Home size/rooms...'
  },
  {
    id: 'home-2',
    name: 'Garden Planner',
    description: 'What to plant and when.',
    category: 'Lifestyle',
    icon: 'Leaf',
    systemInstruction: 'You are a Master Gardener. Suggest a planting schedule for the season and region provided.',
    placeholder: 'Region/Zone and Season...'
  },
  {
    id: 'home-3',
    name: 'DIY Project Plan',
    description: 'Steps for home improvement.',
    category: 'Lifestyle',
    icon: 'Hammer',
    systemInstruction: 'You are a Contractor. Outline the steps, tools, and materials needed for the DIY project described.',
    placeholder: 'Project (e.g. Build a bookshelf)...'
  },
  {
    id: 'pet-1',
    name: 'Pet Sitter Instructions',
    description: 'Care guide for sitters.',
    category: 'Lifestyle',
    icon: 'Heart',
    systemInstruction: 'You are a Pet Owner. Create a detailed instruction sheet for a pet sitter, including feeding schedule, walk times, and vet contact.',
    placeholder: 'Pet details and routine...'
  },
  {
    id: 'pet-2',
    name: 'Dog Training Plan',
    description: 'Weekly training schedule.',
    category: 'Lifestyle',
    icon: 'CheckCircle',
    systemInstruction: 'You are a Dog Trainer. Create a weekly training schedule for a dog to learn specific commands or modify behavior.',
    placeholder: 'Dog age and goals...'
  },

  // --- Compliance (Advanced) ---
  {
    id: 'comp-1',
    name: 'ISO 9001 Checklist',
    description: 'Audit quality management.',
    category: 'Compliance',
    icon: 'Shield',
    systemInstruction: 'You are a Quality Auditor. Create a high-level checklist for an internal ISO 9001 audit focusing on the process described.',
    placeholder: 'Process or department...'
  },
  {
    id: 'comp-2',
    name: 'OSHA Audit Form',
    description: 'Workplace safety check.',
    category: 'Compliance',
    icon: 'Shield',
    systemInstruction: 'You are a Safety Inspector. Generate an OSHA compliance inspection checklist for the specific workplace environment described.',
    placeholder: 'Workplace type (e.g. Warehouse, Office)...'
  },
  {
    id: 'comp-3',
    name: 'Data Processing Agreement',
    description: 'GDPR DPA template.',
    category: 'Compliance',
    icon: 'Scale',
    systemInstruction: 'You are a Legal Compliance Officer. Draft a standard Data Processing Agreement (DPA) structure for a vendor processing personal data.',
    placeholder: 'Vendor role and data types...'
  },
  {
    id: 'comp-4',
    name: 'Accessibility Audit (WCAG)',
    description: 'Check web accessibility.',
    category: 'Compliance',
    icon: 'Code',
    systemInstruction: 'You are an Accessibility Expert. Create a checklist based on WCAG 2.1 Level AA standards for auditing the described web page component.',
    placeholder: 'Component (e.g. Navigation Menu)...'
  },
  {
    id: 'comp-5',
    name: 'Vendor Due Diligence',
    description: 'Vet new suppliers.',
    category: 'Compliance',
    icon: 'Search',
    systemInstruction: 'You are a Procurement Manager. Create a due diligence questionnaire for onboarding a new critical vendor.',
    placeholder: 'Vendor type...'
  },

  // --- Beauty & Wellness (Niche) ---
  {
    id: 'beauty-1',
    name: 'Salon Service Menu',
    description: 'Write service descriptions.',
    category: 'Beauty',
    icon: 'Scissors',
    systemInstruction: 'You are a Salon Manager. Write attractive descriptions for a salon service menu. Focus on the experience and result.',
    placeholder: 'List of services (e.g. Balayage, Gel Mani)...'
  },
  {
    id: 'beauty-2',
    name: 'Client Consultation Form',
    description: 'Intake for new clients.',
    category: 'Beauty',
    icon: 'Users',
    systemInstruction: 'You are an Esthetician. Create a client consultation form to assess skin type, allergies, and goals before treatment.',
    placeholder: 'Treatment type...'
  },
  {
    id: 'beauty-3',
    name: 'Skincare Routine Gen',
    description: 'Personalized regimens.',
    category: 'Beauty',
    icon: 'Sparkles',
    systemInstruction: 'You are a Dermatologist Assistant. Create a Morning and Evening skincare routine based on the skin type and concerns provided.',
    placeholder: 'Skin type and concerns...'
  },
  {
    id: 'beauty-4',
    name: 'Yoga Sequence Builder',
    description: 'Plan a yoga class.',
    category: 'Beauty',
    icon: 'Sun',
    systemInstruction: 'You are a Yoga Instructor. Create a 60-minute yoga flow sequence focused on the theme provided.',
    placeholder: 'Theme (e.g. Hip Openers, Core)...'
  },
  {
    id: 'beauty-5',
    name: 'Salon Policy Sign',
    description: 'Cancellation/Late rules.',
    category: 'Beauty',
    icon: 'Shield',
    systemInstruction: 'You are a Business Owner. Write a polite but firm salon policy text regarding cancellations, late arrivals, and no-shows.',
    placeholder: 'Your specific rules...'
  },

  // --- Food & Beverage (Niche) ---
  {
    id: 'fnb-1',
    name: 'Recipe Costing Card',
    description: 'Calculate plate cost.',
    category: 'Food & Bev',
    icon: 'Utensils',
    systemInstruction: 'You are a Chef. Create a table template for costing a recipe, including Ingredient, Purchase Cost, Unit Cost, Usage, and Total Cost.',
    placeholder: 'Dish name...'
  },
  {
    id: 'fnb-2',
    name: 'Food Safety Log',
    description: 'Temp and cleaning logs.',
    category: 'Food & Bev',
    icon: 'Shield',
    systemInstruction: 'You are a Health Inspector. Create a daily food safety log structure for tracking refrigerator temperatures and cleaning schedules.',
    placeholder: 'Kitchen type...'
  },
  {
    id: 'fnb-3',
    name: 'Catering Proposal',
    description: 'Pitch for events.',
    category: 'Food & Bev',
    icon: 'Briefcase',
    systemInstruction: 'You are a Catering Manager. Write a professional catering proposal introduction and menu overview for the event described.',
    placeholder: 'Event type and guest count...'
  },
  {
    id: 'fnb-4',
    name: 'Bar Inventory Sheet',
    description: 'Track liquor stock.',
    category: 'Food & Bev',
    icon: 'Utensils',
    systemInstruction: 'You are a Bar Manager. Create a bottle inventory sheet structure organized by Spirit type (Vodka, Gin, etc.).',
    placeholder: 'Bar size...'
  },
  {
    id: 'fnb-5',
    name: 'Daily Special Generator',
    description: 'Ideas for today\'s menu.',
    category: 'Food & Bev',
    icon: 'Sparkles',
    systemInstruction: 'You are a Creative Chef. Suggest 3 "Daily Special" dish ideas based on the surplus ingredient provided.',
    placeholder: 'Surplus ingredient (e.g. Tomatoes)...'
  },

  // --- Mental Models (Decision Making) ---
  {
    id: 'model-1',
    name: 'Second-Order Thinking',
    description: 'Analyze long-term consequences.',
    category: 'Mental Models',
    icon: 'Sparkles',
    systemInstruction: 'You are a Strategic Thinker. Apply Second-Order Thinking to the decision provided. What are the immediate consequences? What are the consequences of those consequences?',
    placeholder: 'Decision to be made...'
  },
  {
    id: 'model-2',
    name: 'Inversion Principle',
    description: 'Solve by avoiding failure.',
    category: 'Mental Models',
    icon: 'Sparkles',
    systemInstruction: 'You are a Problem Solver. Apply the Inversion Principle. Instead of asking how to achieve success in the goal described, list how to guarantee failure, then flip it.',
    placeholder: 'Goal...'
  },
  {
    id: 'model-3',
    name: 'Pareto Analysis (80/20)',
    description: 'Find the vital few.',
    category: 'Mental Models',
    icon: 'Chart',
    systemInstruction: 'You are an Efficiency Expert. Help the user apply the Pareto Principle (80/20 Rule) to the list of inputs provided. Identify the likely top 20% drivers.',
    placeholder: 'List of tasks/problems/customers...'
  },
  {
    id: 'model-4',
    name: 'Regret Minimization',
    description: 'Project forward to old age.',
    category: 'Mental Models',
    icon: 'Sparkles',
    systemInstruction: 'You are a Life Coach. Apply the Regret Minimization Framework. Ask the user to project themselves to age 80 and view the decision from that perspective.',
    placeholder: 'Big life decision...'
  },
  {
    id: 'model-5',
    name: 'Six Thinking Hats',
    description: 'View from multiple angles.',
    category: 'Mental Models',
    icon: 'Users',
    systemInstruction: 'You are a Facilitator. Analyze the problem using De Bono\'s Six Thinking Hats (White, Red, Black, Yellow, Green, Blue). Summarize the view from each hat.',
    placeholder: 'Problem or proposal...'
  },

  // --- Event Management (Advanced) ---
  {
    id: 'evt-adv-1',
    name: 'Seating Chart Planner',
    description: 'Organize guests strategically.',
    category: 'Events',
    icon: 'Users',
    systemInstruction: 'You are a Wedding Planner. Provide advice and a logical grouping strategy for creating a seating chart for the guests described.',
    placeholder: 'Guest count and table size...'
  },
  {
    id: 'evt-adv-2',
    name: 'Vendor Contact List',
    description: 'Track event suppliers.',
    category: 'Events',
    icon: 'Briefcase',
    systemInstruction: 'You are an Event Producer. Create a template for a Master Vendor Contact List including category, contact name, phone, arrival time, and notes.',
    placeholder: 'Event type...'
  },
  {
    id: 'evt-adv-3',
    name: 'Conference Badge Strategy',
    description: 'Categorize attendees.',
    category: 'Events',
    icon: 'Tag',
    systemInstruction: 'You are a Conference Organizer. Suggest a color-coding or categorization strategy for attendee badges to facilitate networking.',
    placeholder: 'Attendee types (e.g. VIP, Speaker, Student)...'
  },
  {
    id: 'evt-adv-4',
    name: 'Post-Event Survey',
    description: 'Gather attendee feedback.',
    category: 'Events',
    icon: 'ChatBubble',
    systemInstruction: 'You are a Marketing Manager. Draft 5 key questions for a post-event feedback survey to measure satisfaction and NPS.',
    placeholder: 'Event goals...'
  },
  {
    id: 'evt-adv-5',
    name: 'Sponsorship Tiers',
    description: 'Packages for event sponsors.',
    category: 'Events',
    icon: 'Money',
    systemInstruction: 'You are a Sponsorship Director. Outline Gold, Silver, and Bronze sponsorship packages for the event described, with specific benefits.',
    placeholder: 'Event description and audience...'
  }
];
