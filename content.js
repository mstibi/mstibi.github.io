// Edit portfolio copy here. Empty email / CV values stay visibly unavailable.
window.PORTFOLIO = {
  name: 'Mateo', nickname: 'Stibi', location: 'Osijek, Croatia',
  headline: 'A little room.\nA lot to build.',
  intro: 'Computer Engineering student exploring backend systems and AI. Welcome to my corner of the internet.',
  github: 'https://github.com/mstibi', email: 'mateo.stibi@gmail.com', cv: 'Mateo_Stibi_CV.pdf',
  about: 'I’m Mateo. I study Computer Engineering at FERIT in Osijek, Croatia. I like understanding how things work, then building something of my own.',
  focus: 'Python, C++, backend development and AI.',
  experience: [
    {role:'Software Development & QA Assistant',company:'eCheckin',period:'Mar 2026 – Oct 2026',description:'Tested the Android app across devices and releases, reported reproducible bugs, fixed issues with the development team, and checked fixes and new features before release.'},
    {role:'Server',company:'Wychmere Beach Club · Harwich Port, MA, USA',period:'Jun 2026 – Sep 2026',description:''},
    {role:'Call Center Agent',company:'T-Mobile',period:'Jun 2025 – Oct 2025',description:''},
  ],
  interests: ['Gym & health', 'Outdoors', 'Travel'],
  projects: [
    { name: 'Order Processing System', type: 'BACKEND PROJECT', description: 'An order API that never charges twice and never sells more than it has in stock, even under 1000 concurrent buyers and crashing servers. In a race test the naive version sold 1000 of 100 items; atomic UPDATE and SELECT FOR UPDATE sold exactly 100. Idempotency keys, a flaky fake payment provider and a reconciler keep duplicate charges at 0 across chaos runs with the API killed mid-flight.', tags: ['FastAPI', 'PostgreSQL', 'Docker', 'k6', 'pytest', 'GitHub Actions'], url: 'https://github.com/mstibi/order-processing-system', linkLabel: 'View on GitHub', note: '' },
    { name: 'lora-workflow', type: 'AI / ML PROJECT', description: 'A config-driven LoRA / QLoRA fine-tuning pipeline that runs the same on a CPU laptop, a free Kaggle T4 and Docker GPUs. It teaches Qwen2.5-1.5B to turn messy Croatian gym-log notes into JSON: exact match rose from 14% to 96% on 200 held-out synthetic examples, with peak VRAM cut to 2.6 GB using 4-bit QLoRA. Tests prove the same seed gives the same run and a killed run resumes.', tags: ['PyTorch', 'Transformers', 'PEFT', 'TRL', 'bitsandbytes', 'Docker'], url: 'https://github.com/mstibi/lora-workflow', linkLabel: 'View on GitHub', note: '' },
    { name: 'Twitter Sentiment Classifier', type: 'ML PROJECT', description: 'A Streamlit app that labels a tweet, comment or review as positive, negative or neutral, with a confidence score. Six models trained and compared; the best, a linear SVM, reaches 94.2% validation accuracy and 0.94 macro F1.', tags: ['scikit-learn', 'pandas', 'LightGBM', 'Streamlit'], url: 'https://github.com/mstibi/twitter-sentiment-classifier', linkLabel: 'View on GitHub', note: '' },
  ],
  contact: 'I’m looking for a junior or student developer role. Want to talk about a project or an opportunity? Email me or find me on GitHub.',
};
