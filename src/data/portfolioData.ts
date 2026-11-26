import {
  AssetSlotSpec,
  AwardItem,
  CapabilityGroup,
  CharacterMode,
  EducationItem,
  LeadershipRole,
  ProjectItem,
  TimelineEntry,
} from '../types/portfolio';

export const PROFILE = {
  name: 'KRISH CHAKRABORTY',
  shortName: 'KRISH',
  identity: 'Brand Strategist · Creative Marketer · Growth & Communications',
  location: 'BENGALURU, INDIA',
  currentRoleLabel: 'CURRENTLY AT ALT DRX',
  email: 'krishchakraborty10@gmail.com',
  linkedin: 'https://linkedin.com/in/krishchakraborty10',
  linkedinDisplay: 'linkedin.com/in/krishchakraborty10',
  year: '2026',
  heroHeadline: ['THINK', 'BEYOND', 'THE BRIEF.'],
  heroHook:
    "Hey, I'm Krish. Strategy, storytelling, and getting things shipped without a 40-slide deck.",
  heroFullBio:
    'A marketer who likes getting involved in the whole process. From figuring out what a brand stands for to creating the campaign that gets people talking, I work across strategy, storytelling, and execution.',
};

export const CHARACTER_MODES: {
  id: CharacterMode;
  label: string;
  hatTag: string;
  lines: string[];
}[] = [
  {
    id: 'strategist',
    label: 'Brand Strategy',
    hatTag: 'THE DECK WRITER',
    lines: [
      'Translating "make it go viral" into an actual positioning statement.',
      'Yes, we still need to know who the customer is before picking a font.',
      'Step 1: Delete 18 buzzwords. Step 2: Say what the brand actually does.',
    ],
  },
  {
    id: 'creative',
    label: 'Creative Direction',
    hatTag: 'THE TASTE FILTER',
    lines: [
      'Politely explaining why the logo does not need to be 40% bigger.',
      'Yes, white space is doing work. Please do not fill it with bullet points.',
      'Good taste is mostly knowing which 9 ideas to throw out before lunch.',
    ],
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    hatTag: 'THE CONDUCTOR',
    lines: [
      'Getting TV, billboards, reels, and the sales team to tell the same story.',
      'Brief says "urgent". Launch was yesterday. Still looks effortless.',
      'One lonely banner ad never changed anyone’s mind. Build the whole world.',
    ],
  },
  {
    id: 'founder',
    label: 'Founder (Adbabu)',
    hatTag: 'ALL HATS AT ONCE',
    lines: [
      '30% creative direction, 70% gently following up on client feedback.',
      'Wrote the pitch, ran the sprint, and sent the invoice before dinner.',
      'Turns out "quick logo" always turns into a full go-to-market strategy.',
    ],
  },
];

export const ARCADE_REACTIONS = [
  'Floral shirt approved. Brief still questionable.',
  'Thumbs up is locked in. Even on a Monday morning brief.',
  '360 spin complete. Glasses stayed on, strategy intact.',
  'Mood check: fueled by filter coffee and clean briefs.',
  'Look Ma, zero 42-slide corporate decks!',
];

export const ACTION_REACTIONS = {
  greet: [
    'Hey! Thanks for stopping by. Move around and check out the work below.',
    'Hello from Bengaluru. Good briefs and filter coffee always welcome.',
    'Hey there! Drag to spin, switch my role prop, or open any case study.',
  ],
  thumbsup: [
    'Two thumbs way up when the client approves V1 without edits.',
    'Thumbs-up locked. Now let us turn this positioning into a real campaign.',
    'Officially signed off. Go ship the good stuff.',
  ],
  wave: [
    'Hey! Spotted someone reading past the headline.',
    'Waving at every stakeholder who read the brief before the meeting.',
    'Hi from Bengaluru. Coffee first, campaign brainstorm second.',
  ],
  jumpspin: [
    'Boing! Jumping straight over a "make the logo bigger" revision.',
    '360-degree spin, just like an ATL plus digital launch.',
    'Mid-air check: floral shirt crisp, glasses steady.',
  ],
  groove: [
    'Doing the victory groove because the Meta ad CPA finally dropped.',
    'Vibing between brand storytelling and performance growth.',
    'Proof a strategist can stay on beat without a 10-tab spreadsheet.',
  ],
};

export const ABOUT_COPY = {
  heading: 'THE STORY SO FAR.',
  shortHook:
    'Started with food blogging in 2019, founded a 6-person branding agency, earned an MBA, and now build integrated growth at Alt DRX.',
  paragraphs: [
    'My relationship with marketing started with curiosity (and taking way too many photos of food in 2019).',
    'Over time, that curiosity grew into brand storytelling, consumer behaviour, creative strategy, and the business logic underneath good creative.',
    "I've founded a creative venture, advised early-stage startups, led creative teams, built campaigns across digital and traditional media, and sharpened the business thinking with an MBA.",
    'I enjoy connecting the dots between what a brand wants to say, what an audience wants to hear, and what a business needs to achieve.',
  ],
};

export const CAREER_TIMELINE: TimelineEntry[] = [
  {
    period: '2019',
    title: 'Started food blogging and content',
    organization: 'Independent Creator',
    summary:
      'Picked up a camera, documented food and stories, and learned early on why some hooks stop the scroll.',
    tag: 'Origin',
  },
  {
    period: '2023 to 2024',
    title: 'Founder & Lead Brand Strategist',
    organization: 'Adbabu Branding Solutions',
    summary:
      'Built and led a 6-member creative and strategy agency, advising 8+ early-stage B2B and B2C startups.',
    tag: 'Agency Founder',
  },
  {
    period: '2024 to 2026',
    title: 'PGDM, Marketing & Business',
    organization: 'JAGSoM',
    summary:
      'AACSB-accredited MBA sharpening the strategic and commercial thinking behind the creative instinct.',
    tag: 'MBA',
  },
  {
    period: '2025 to Present',
    title: 'Assistant Manager, Growth',
    organization: 'Alt DRX',
    summary:
      'Leading brand communications, social direction, ATL/BTL campaigns, influencer partnerships, and cross-functional growth.',
    tag: 'Current Role',
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'alt-drx',
    number: '01',
    slug: 'alt-drx',
    name: 'ALT DRX',
    category: 'Brand Building / Integrated Marketing / Growth',
    filterGroup: 'Brand & Growth',
    title: 'BUILDING A BRAND BEYOND THE SCREEN.',
    role: 'Assistant Manager, Growth',
    period: 'Dec 2025 to Present',
    summary:
      'At Alt DRX, my role goes beyond running digital campaigns. I work across brand communications, creative direction, social media, integrated ATL/BTL campaigns, and cross-functional marketing to build one consistent brand experience.',
    wittyNote: 'Turns out "just post a reel" usually involves four teams, two agencies, and a billboard.',
    testimonial: {
      author: 'Manisheel Gautam',
      role: 'Director of Growth at Wakefit | Ex-CMO, Alt DRX | Ex-Ola | IIM Ahmedabad | IIT Bombay',
      shortQuote:
        "I managed Krish directly at Alt DRX, where he owned our social media marketing across Instagram, LinkedIn, and YouTube, and he consistently delivered beyond what I expected from someone at his level. Any team looking for someone who blends creativity with accountability, Krish is your person. I'd hire him again without a second thought.",
      fullParagraphs: [
        'I managed Krish directly at Alt DRX, where he owned our social media marketing across Instagram, LinkedIn, and YouTube, and he consistently delivered beyond what I expected from someone at his level.',
        "Krish has a natural knack for marketing and creatives that's genuinely rare. He produced content that was catchy, on-brand, and thoughtfully crafted, the kind of stuff that stops the scroll and actually drives engagement. But what set him apart wasn't just the creative quality; it was the ownership. He took briefs end-to-end, from ideation to execution, brought fresh ideas unprompted, and never needed to be chased.",
        "He's sharp, self-driven, and has a marketer's instinct that I believe will only get stronger with time. Any team looking for someone who blends creativity with accountability, Krish is your person. I'd hire him again without a second thought.",
      ],
    },
    coverSlot: {
      slotId: 'altdrx-cover',
      title: 'Alt DRX',
      subtitle: 'Upload hero TVC still, billboard, or integrated campaign frame',
      aspect: '16:9',
      section: 'Project 01: Alt DRX',
      mediumTag: 'Brand & Growth',
    },
    responsibilities: [
      'Social media strategy and content direction.',
      'Managing a four-member team.',
      'ATL/BTL campaigns across print, national television, and billboards.',
      'End-to-end paid campaign execution.',
      'Influencer and creator partnerships.',
      'Creative agency and freelancer management.',
      'Brand and internal communications.',
      'Cross-functional collaboration with Sales, Product, and Performance Marketing.',
      'Play Store reviews campaign to strengthen brand trust.',
    ],
    digitalVsTraditional: {
      traditional: [
        {
          label: 'National Television',
          items: ['TVC storytelling', 'Mass brand recall', 'Broadcast presence'],
          slot: {
            slotId: 'altdrx-tv',
            title: 'National TV Campaign Still',
            subtitle: 'Upload TV commercial frame or broadcast creative',
            aspect: '16:9',
            section: 'Project 01: Alt DRX',
            mediumTag: 'ATL · Television',
          },
        },
        {
          label: 'Billboards & Print',
          items: ['OOH hoardings', 'Print advertisements', 'BTL brand visibility'],
          slot: {
            slotId: 'altdrx-billboard',
            title: 'Billboard & Print Creative',
            subtitle: 'Upload OOH hoarding or print ad visual',
            aspect: '4:3',
            section: 'Project 01: Alt DRX',
            mediumTag: 'ATL / BTL · OOH & Print',
          },
        },
      ],
      digital: [
        {
          label: 'Social & Creator Ecosystem',
          items: ['Social content direction', 'Influencer partnerships', 'End-to-end paid ads'],
          slot: {
            slotId: 'altdrx-social',
            title: 'Social & Creator Assets',
            subtitle: 'Upload social grid, creator collab, or paid ad visual',
            aspect: '4:3',
            section: 'Project 01: Alt DRX',
            mediumTag: 'Digital · Social & Paid',
          },
        },
        {
          label: 'Events',
          items: ['Play Store reviews drive', 'Product & Sales campaigns', 'Brand comms'],
          slot: {
            slotId: 'altdrx-product',
            title: 'Product & Trust Campaign',
            subtitle: 'Upload product launch or trust campaign creative',
            aspect: '16:9',
            section: 'Project 01: Alt DRX',
            mediumTag: 'Product & Trust',
          },
        },
      ],
    },
    gallerySlots: [],
  },
  {
    id: 'adbabu-branding-solutions',
    number: '02',
    slug: 'adbabu-branding-solutions',
    name: 'ADBABU BRANDING SOLUTIONS',
    category: 'Entrepreneurship / Brand Strategy',
    filterGroup: 'Entrepreneurship',
    title: 'BUILDING SOMETHING OF MY OWN.',
    role: 'Founder & Lead Brand Strategist',
    period: 'Jul 2023 to Jun 2024',
    summary:
      'Adbabu was my attempt to turn an interest in branding into something tangible. I founded and led a 6-member creative and strategy team advising 8+ early-stage B2B and B2C startups on positioning, identity systems, and go-to-market.',
    wittyNote: 'Where I learned "we just need a quick logo" always means "we need a whole brand strategy."',
    testimonial: {
      author: 'Sayandeep Bakshi',
      role: 'Proprietor, Bakshi & Co. Jewellers',
      shortQuote:
        'When he started helping us with our social media through Adbabu, things really started changing for Bakshi & Co. He understood our business and found ways to make a traditional jewellery brand more interesting and relatable online. Today, a large part of our new clientele comes through Instagram.',
      fullParagraphs: [
        "I've known Krish personally for quite some time, and I've seen the kind of work he can do. When he started helping us with our social media through Adbabu, things really started changing for Bakshi & Co. He understood our business and found ways to make a traditional jewellery brand more interesting and relatable online. Our Instagram presence grew, but more importantly, it started bringing in actual customers. Today, a large part of our new clientele comes through Instagram. It's been great seeing what a difference his work has made for our business.",
      ],
    },
    verifiedHighlights: [
      '8+ early-stage B2B and B2C startups advised.',
      '6-member creative and strategy team led.',
    ],
    pillars: [
      'Brand positioning',
      'Naming and identity',
      'Visual identity systems',
      'Go-to-market strategy',
      'Launch campaigns',
      'Client communication',
    ],
    agencyTimeline: [
      {
        phase: 'JUL to SEP 2023',
        title: 'Zero to One: Starting Adbabu',
        summary:
          'Set up the agency positioning, pitched early-stage founders, and built brand strategy frameworks from scratch.',
        realityCheck: 'Pitching clients while figuring out contracts at midnight.',
      },
      {
        phase: 'OCT to DEC 2023',
        title: 'Building the 6-Member Team',
        summary:
          'Assembled designers, copywriters, and strategists into a tight studio workflow capable of shipping full brand systems.',
        realityCheck: 'Learning to direct creative taste without micromanaging every pixel.',
      },
      {
        phase: 'JAN to MAR 2024',
        title: 'Advising 8+ B2B & B2C Startups',
        summary:
          'Led naming workshops, positioning sprints, visual identities, and GTM launch playbooks across diverse startup categories.',
        realityCheck: 'Translating founder passion into language real buyers understand.',
      },
      {
        phase: 'APR to JUN 2024',
        title: 'Graduation & Founder Lessons',
        summary:
          'Wrapped up operations ahead of JAGSoM MBA, carrying sharper commercial instincts and team leadership forward.',
        realityCheck: 'Nothing teaches business faster than owning both the pitch and the delivery.',
      },
    ],
    teamWorkflow: [
      {
        step: '01',
        role: 'Lead Brand Strategist (Krish)',
        detail: 'Founder discovery, category audit, positioning thesis, and naming direction.',
      },
      {
        step: '02',
        role: 'Verbal & Copy Team',
        detail: 'Brand voice, taglines, messaging pillars, and launch copy architecture.',
      },
      {
        step: '03',
        role: 'Visual Identity Designers',
        detail: 'Logo marks, typography, colour systems, packaging, and digital touchpoints.',
      },
      {
        step: '04',
        role: 'Launch & GTM Squad',
        detail: 'Go-to-market rollout kits, social launch assets, and founder handover.',
      },
    ],
    coverSlot: {
      slotId: 'adbabu-cover',
      title: 'Adbabu Studio Showcase',
      subtitle: 'Upload Adbabu agency showcase or flagship startup identity collage',
      aspect: '16:9',
      section: 'Project 02: Adbabu Branding Solutions',
      mediumTag: 'Agency · Founder',
    },
    gallerySlots: [
      {
        slotId: 'adbabu-case-1',
        title: 'Startup Identity System 01',
        subtitle: 'Upload logo system, typography, or packaging sheet',
        aspect: '4:3',
        section: 'Project 02: Adbabu Branding Solutions',
        mediumTag: 'Visual Identity',
      },
      {
        slotId: 'adbabu-case-2',
        title: 'Positioning & Naming Case 02',
        subtitle: 'Upload naming deck or brand strategy framework',
        aspect: '4:3',
        section: 'Project 02: Adbabu Branding Solutions',
        mediumTag: 'Brand Positioning',
      },
      {
        slotId: 'adbabu-case-3',
        title: 'Go-To-Market Launch Kit 03',
        subtitle: 'Upload startup launch campaign visuals',
        aspect: '4:3',
        section: 'Project 02: Adbabu Branding Solutions',
        mediumTag: 'GTM & Launch',
      },
      {
        slotId: 'adbabu-case-4',
        title: 'Startup Brand Collateral 04',
        subtitle: 'Upload social kit, pitch deck, or web direction',
        aspect: '4:3',
        section: 'Project 02: Adbabu Branding Solutions',
        mediumTag: 'Brand Collateral',
      },
      {
        slotId: 'adbabu-team',
        title: '6-Member Team Sprint Moments',
        subtitle: 'Upload Adbabu team working session photo',
        aspect: '16:9',
        section: 'Project 02: Adbabu Branding Solutions',
        mediumTag: 'Team Workflow',
      },
    ],
  },
  {
    id: 'integrated-campaigns',
    number: '03',
    slug: 'integrated-campaigns',
    name: 'OTHER PROJECTS',
    category: 'Freelance / College / Creative Projects',
    filterGroup: 'Other Projects',
    title: 'FREELANCE, COLLEGE & EVERYTHING IN BETWEEN.',
    role: 'Freelancer, Student Lead & Collaborator',
    period: 'Freelance · College',
    summary:
      'Selected freelance client briefs, college fest campaigns, B-school case competitions, and collaborative side projects across branding, social storytelling, and campus events.',
    wittyNote: 'From college fest nights and case comps to freelance client decks before Monday morning.',
    coverSlot: {
      slotId: 'campaigns-cover',
      title: 'Other Projects (Freelance, College & Side Briefs)',
      subtitle: 'Upload freelance client decks, college fest visuals, or collaborative project stills',
      aspect: '16:9',
      section: 'Project 03: Other Projects',
      mediumTag: 'Freelance · College',
    },
    pillars: [
      'Freelance branding & social',
      'College fests & campus clubs',
      'Case competitions',
      'Event & media direction',
      'Creative collaborations',
    ],
    gallerySlots: [],
  },
  {
    id: 'content-storytelling',
    number: '04',
    slug: 'content-storytelling',
    name: 'CONTENT & STORYTELLING',
    category: 'Content / Personal Experiments',
    filterGroup: 'Content & Experiments',
    title: 'IT STARTED WITH A CAMERA AND AN IDEA.',
    role: 'Creator & Storyteller',
    period: '2019 to Present',
    summary:
      "Before marketing was a job title, making things was just fun. From 2019 food blogging to Kathaa.club and AI-assisted experiments, I've always cared about how stories find their audience.",
    wittyNote: 'Proof that taking photos of biryani in 2019 can spiral into a whole career.',
    pillars: [
      'Food blogging journey starting in 2019',
      'Social media experiments',
      'Creative content & video storytelling',
      'Personal storytelling experiments, including Kathaa.club',
      'AI-assisted creative explorations',
    ],
    coverSlot: {
      slotId: 'content-cover',
      title: 'Camera, Food & Story Lab',
      subtitle: 'Upload flagship photography, reel still, or Kathaa.club feature visual',
      aspect: '16:9',
      section: 'Project 04: Content & Storytelling',
      mediumTag: 'Personal Lab · 2019+',
    },
    gallerySlots: [
      {
        slotId: 'content-food-2019',
        title: 'Food Blogging Archive (2019)',
        subtitle: 'Upload early food photography & editorial shots',
        aspect: '3:4',
        section: 'Project 04: Content & Storytelling',
        mediumTag: '2019 Origin',
      },
      {
        slotId: 'content-kathaa',
        title: 'Kathaa.club Experiment',
        subtitle: 'Upload Kathaa.club layout, zine, or narrative visual',
        aspect: '4:3',
        section: 'Project 04: Content & Storytelling',
        mediumTag: 'Kathaa.club',
      },
      {
        slotId: 'content-video',
        title: 'Video Storytelling & Reels',
        subtitle: 'Upload video frame / behind-the-camera still',
        aspect: '4:3',
        section: 'Project 04: Content & Storytelling',
        mediumTag: 'Video Direction',
      },
      {
        slotId: 'content-ai',
        title: 'AI Creative Explorations',
        subtitle: 'Upload generative visual experiment',
        aspect: '1:1',
        section: 'Project 04: Content & Storytelling',
        mediumTag: 'Generative Lab',
      },
    ],
  },
];

export const LEADERSHIP_ROLES: LeadershipRole[] = [
  {
    id: 'jagsom-alumni',
    role: 'Digital Head, Alumni Relations',
    organization: 'JAGSoM',
    focus: 'Alumni storytelling and digital community presence.',
    slot: {
      slotId: 'lead-jagsom',
      title: 'JAGSoM Alumni Relations',
      subtitle: 'Team photo / campaign visual',
      aspect: '4:3',
      section: 'Leadership',
      mediumTag: 'JAGSoM',
    },
  },
  {
    id: 'kanyathon',
    role: 'Creative Head, Digital Marketing',
    organization: 'Kanyathon',
    focus: 'Creative direction, social momentum, and event outreach.',
    slot: {
      slotId: 'lead-kanyathon',
      title: 'Kanyathon Digital Campaign',
      subtitle: 'Event visuals / creative still',
      aspect: '4:3',
      section: 'Leadership',
      mediumTag: 'Kanyathon',
    },
  },
  {
    id: 'rotaract',
    role: 'VP & International Service Director',
    organization: 'Rotaract Club of Calcutta Acropolis',
    focus: 'International partnerships and community initiatives.',
    slot: {
      slotId: 'lead-rotaract',
      title: 'Rotaract Calcutta Acropolis',
      subtitle: 'Behind-the-scenes / team moment',
      aspect: '4:3',
      section: 'Leadership',
      mediumTag: 'Rotaract',
    },
  },
  {
    id: 'nshm',
    role: 'Head, E-Promotions',
    organization: 'NSHM Kolkata',
    focus: 'Student promotional campaigns and digital buzz.',
    slot: {
      slotId: 'lead-nshm',
      title: 'NSHM Kolkata E-Promotions',
      subtitle: 'Campaign creative / team photo',
      aspect: '4:3',
      section: 'Leadership',
      mediumTag: 'NSHM',
    },
  },
];

export const AWARDS: AwardItem[] = [
  {
    id: 'award-adtract',
    rank: '3rd Rank',
    event: 'Adtract',
    institution: 'IMT Hyderabad',
    scope: 'National',
    note: 'National advertising and brand strategy competition.',
    slot: {
      slotId: 'award-adtract',
      title: 'Adtract Certificate / Entry',
      subtitle: 'Upload certificate, trophy photo, or competition deck frame',
      aspect: '4:3',
      section: 'Awards & Recognition',
      mediumTag: 'National · 3rd Rank',
    },
  },
  {
    id: 'award-marksman',
    rank: '1st Runner-Up',
    event: 'Marksman',
    institution: 'KJ Somaiya',
    note: 'Marketing strategy and campaign case competition.',
    slot: {
      slotId: 'award-marksman',
      title: 'Marksman (KJ Somaiya)',
      subtitle: 'Upload certificate, team frame, or winning deck preview',
      aspect: '4:3',
      section: 'Awards & Recognition',
      mediumTag: '1st Runner-Up',
    },
  },
  {
    id: 'award-markshetra',
    rank: 'Runner-Up',
    event: 'Markshetra',
    institution: 'Welingkar',
    note: 'Integrated marketing and consumer insight challenge.',
    slot: {
      slotId: 'award-markshetra',
      title: 'Markshetra (Welingkar)',
      subtitle: 'Upload certificate or campaign presentation visual',
      aspect: '4:3',
      section: 'Awards & Recognition',
      mediumTag: 'Runner-Up',
    },
  },
  {
    id: 'award-medgala',
    rank: 'Winner',
    event: 'MedGala 22',
    institution: 'Jadavpur University',
    note: 'First place in creative advertising and branding showcase.',
    slot: {
      slotId: 'award-medgala',
      title: 'MedGala 22 (Jadavpur Univ.)',
      subtitle: 'Upload winning entry visual or certificate',
      aspect: '4:3',
      section: 'Awards & Recognition',
      mediumTag: 'Winner',
    },
  },
  {
    id: 'award-adspoof',
    rank: 'Winner',
    event: 'Ad Spoof',
    institution: 'DisCon 2020',
    note: 'First place for comedic creative direction and ad spoof.',
    slot: {
      slotId: 'award-adspoof',
      title: 'Ad Spoof (DisCon 2020)',
      subtitle: 'Upload spoof video frame or award certificate',
      aspect: '4:3',
      section: 'Awards & Recognition',
      mediumTag: 'Winner',
    },
  },
];

export const EDUCATION: EducationItem[] = [
  {
    institution: 'Jagdish Sheth School of Management (JAGSoM)',
    degree: 'PGDM, Marketing & Business',
    period: '2024 to 2026',
    detail: 'AACSB Accredited',
  },
  {
    institution: 'NSHM College of Management and Technology',
    degree: 'BBA (Hons.)',
    period: '2020 to 2023',
    detail: 'CGPA 8.37',
  },
  {
    institution: "St. Mary's Day School",
    degree: 'CISCE',
    period: '2018 to 2020',
    detail: 'First Division',
  },
];

export const CERTIFICATIONS: string[] = [
  'Google Ads Display',
  'Meta Ads Fundamentals (IIDE)',
  'Design Thinking for Innovation (UVA Darden, Coursera)',
  'Branding with Differential Advantage (Kennesaw State, Coursera)',
];

export const CAPABILITIES: CapabilityGroup[] = [
  {
    title: 'BRAND & CONTENT',
    items: [
      'Brand Strategy',
      'Content Strategy',
      'Brand Storytelling',
      'Campaign Management',
      'Product Launches',
      'ATL/BTL',
      'Media Planning',
    ],
  },
  {
    title: 'SOCIAL & CREATIVE',
    items: [
      'Social Media Strategy',
      'Creative Direction',
      'Content Creator & Designer Management',
      'Influencer Marketing',
      'Agency Management',
      'Podcasts',
    ],
  },
  {
    title: 'CROSS-FUNCTIONAL',
    items: [
      'Internal Communications',
      'Sales Collaboration',
      'Product Collaboration',
      'Performance Marketing Collaboration',
    ],
  },
];

export const PERSONAL_COPY = {
  heading: 'THE PERSON BEHIND THE PRESENTATION.',
  shortHook: 'Art, music, sports, travel, Kathaa.club, and generative AI experiments.',
  body: "Not everything needs a brief (thankfully). Outside work, I enjoy art, music, sports, travelling, and messing around with generative AI: documenting life and making things simply because they're interesting.",
};

export const PERSONAL_COLLAGE_SLOTS: AssetSlotSpec[] = [
  {
    slotId: 'personal-art',
    title: 'Art & Visual Studies',
    subtitle: 'Sketches, visual explorations, or colour studies',
    aspect: '3:4',
    section: 'Personal & Experiments',
    mediumTag: 'Art',
  },
  {
    slotId: 'personal-travel',
    title: 'Travelling & Field Notes',
    subtitle: 'Frames captured on the move',
    aspect: '4:3',
    section: 'Personal & Experiments',
    mediumTag: 'Travel',
  },
  {
    slotId: 'personal-genai',
    title: 'Generative AI Lab',
    subtitle: 'Prompt craft & speculative concepts',
    aspect: '1:1',
    section: 'Personal & Experiments',
    mediumTag: 'Gen AI',
  },
  {
    slotId: 'personal-music',
    title: 'Music & Rhythm',
    subtitle: 'Playlists, sound culture, or concert frames',
    aspect: '4:3',
    section: 'Personal & Experiments',
    mediumTag: 'Music',
  },
  {
    slotId: 'personal-sports',
    title: 'Sports & Competitive Drive',
    subtitle: 'Field moments & athletic energy',
    aspect: '3:4',
    section: 'Personal & Experiments',
    mediumTag: 'Sports',
  },
  {
    slotId: 'personal-kathaa',
    title: 'Kathaa.club & Storytelling',
    subtitle: 'Independent narrative experiments',
    aspect: '4:3',
    section: 'Personal & Experiments',
    mediumTag: 'Kathaa.club',
  },
];

export const ALL_ASSET_SLOTS: AssetSlotSpec[] = [
  ...PROJECTS.flatMap((p) => [
    p.coverSlot,
    ...(p.digitalVsTraditional
      ? [
          ...p.digitalVsTraditional.traditional.map((t) => t.slot),
          ...p.digitalVsTraditional.digital.map((d) => d.slot),
        ]
      : []),
    ...(p.campaignTracks ? p.campaignTracks.map((c) => c.slot) : []),
    ...p.gallerySlots,
  ]),
  ...LEADERSHIP_ROLES.map((l) => l.slot),
  ...AWARDS.map((a) => a.slot),
  ...PERSONAL_COLLAGE_SLOTS,
];
