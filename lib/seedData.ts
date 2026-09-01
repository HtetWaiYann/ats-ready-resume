import type { ResumeData } from "@/types/resume";

export const SEED_RESUME: ResumeData = {
  sections: [
    {
      id: "sec-contact",
      type: "contact",
      title: "Contact",
      visible: true,
      column: "main",
      data: {
        fullName: "John Doe",
        headline: "Senior Software Engineer",
        email: "john.doe@example.com",
        phone: "+1 415 555 0182",
        location: "San Francisco, California",
        linkedin: "https://www.linkedin.com/in/johndoe",
        portfolio: "https://johndoe.dev",
        otherLinks: [],
      },
    },
    {
      id: "sec-summary",
      type: "summary",
      title: "Summary",
      visible: true,
      column: "sidebar",
      data: {
        content:
          "Senior software engineer with 7+ years of experience designing and building high-performance web platforms. Strong background in TypeScript, React, Python, and distributed systems, with a focus on developer experience, system reliability, and maintainable architecture. Experienced in taking products from early prototypes through large-scale production environments.",
      },
    },
    {
      id: "sec-experience",
      type: "experience",
      title: "Experience",
      visible: true,
      column: "main",
      entries: [
        {
          id: "exp-1",
          company: "CloudPeak Systems",
          role: "Senior Software Engineer",
          startDate: "2022",
          endDate: "",
          isCurrent: true,
          content: [
            "- Led the development of a multi-tenant analytics platform used by enterprise customers across North America and Europe.",
            "- Designed reusable React and TypeScript components that reduced feature development time across multiple product teams.",
            "- Built event-driven backend services with Python, FastAPI, PostgreSQL, and Redis.",
            "- Introduced automated testing and deployment workflows that reduced production release time by more than 40%.",
            "- Worked with engineering leadership to define technical standards, architecture guidelines, and development practices.",
            "- Mentored junior engineers through code reviews, technical workshops, and pair programming.",
          ].join("\n"),
        },
        {
          id: "exp-2",
          company: "Harbor Labs",
          role: "Software Engineer",
          startDate: "2020",
          endDate: "2022",
          isCurrent: false,
          content: [
            "- Built customer-facing dashboards and internal tools for a logistics management platform.",
            "- Developed REST and GraphQL APIs using Node.js and TypeScript.",
            "- Improved application performance by identifying inefficient database queries and optimizing frequently accessed endpoints.",
            "- Implemented role-based access control across administrative and customer applications.",
            "- Worked closely with product designers to turn Figma prototypes into responsive production interfaces.",
            "- Added automated integration and end-to-end tests to critical application workflows.",
          ].join("\n"),
        },
        {
          id: "exp-3",
          company: "PixelForge Studio",
          role: "Frontend Developer",
          startDate: "2018",
          endDate: "2020",
          isCurrent: false,
          content: [
            "- Developed responsive websites and web applications for startups and small businesses.",
            "- Converted design mockups into accessible, mobile-friendly interfaces.",
            "- Built reusable UI components using React and JavaScript.",
            "- Integrated third-party APIs for payments, maps, authentication, and analytics.",
            "- Worked directly with clients to troubleshoot production issues and deliver new features.",
          ].join("\n"),
        },
      ],
    },
    {
      id: "sec-education",
      type: "education",
      title: "Education",
      visible: true,
      column: "main",
      entries: [
        {
          id: "edu-1",
          school: "University of California, Berkeley",
          degree: "B.S. in Electrical Engineering and Computer Sciences",
          location: "Berkeley, California",
          startDate: "2014",
          endDate: "2018",
          isCurrent: false,
          content: "",
        },
      ],
    },
    {
      id: "sec-projects",
      type: "projects",
      title: "Projects",
      visible: true,
      column: "main",
      entries: [
        {
          id: "proj-1",
          name: "FocusBoard",
          url: "https://focusboard.example.com",
          content: [
            "A lightweight project management application designed for small engineering teams.",
            "",
            "- Kanban boards with drag-and-drop task management.",
            "- Real-time updates using WebSockets.",
            "- Team activity history and project analytics.",
            "- Offline-first task editing with automatic synchronization.",
          ].join("\n"),
        },
        {
          id: "proj-2",
          name: "OpenWeather Dashboard",
          url: "https://weather-dashboard.example.com",
          content: [
            "A responsive weather dashboard that combines multiple public weather APIs into a single interface.",
            "",
            "- Location-based forecasts.",
            "- Interactive hourly and weekly charts.",
            "- Saved locations with local browser storage.",
            "- Optimized API caching to reduce unnecessary requests.",
          ].join("\n"),
        },
        {
          id: "proj-3",
          name: "TinyDB",
          url: "https://github.com/johndoe/tinydb",
          content:
            "A lightweight embedded database written in Go as a learning project, featuring basic indexing, persistence, and a simple query interface.",
        },
      ],
    },
    {
      id: "sec-certifications",
      type: "certifications",
      title: "Certifications",
      visible: true,
      column: "sidebar",
      entries: [
        {
          id: "cert-1",
          name: "AWS Certified Solutions Architect – Associate",
          issuer: "Amazon Web Services",
        },
        {
          id: "cert-2",
          name: "Professional Scrum Master I",
          issuer: "Scrum.org",
        },
      ],
    },
    {
      id: "sec-languages",
      type: "languages",
      title: "Languages",
      visible: true,
      column: "sidebar",
      entries: [
        {
          id: "lang-1",
          language: "English",
          proficiency: "Native",
        },
        {
          id: "lang-2",
          language: "French",
          proficiency: "Conversational",
        },
        {
          id: "lang-3",
          language: "Japanese",
          proficiency: "Basic",
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: "Skills",
      visible: true,
      column: "sidebar",
      displayStyle: "grouped",
      groups: [
        {
          id: "sg-1",
          category: "Frontend",
          skills: ["React", "TypeScript", "Next.js", "HTML", "CSS", "Tailwind CSS"],
        },
        {
          id: "sg-2",
          category: "Backend",
          skills: ["Node.js", "Python", "FastAPI", "GraphQL", "REST APIs"],
        },
        {
          id: "sg-3",
          category: "Infrastructure",
          skills: ["AWS", "Docker", "Terraform", "GitHub Actions", "Linux"],
        },
        {
          id: "sg-4",
          category: "Data",
          skills: ["PostgreSQL", "Redis", "Elasticsearch", "MongoDB"],
        },
        {
          id: "sg-5",
          category: "Engineering",
          skills: ["System Design", "Testing", "CI/CD", "Code Review", "Agile"],
        },
      ],
    },
  ],
};