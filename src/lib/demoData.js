export const demoRoles = [
  {
    id: "role_1",
    roleName: "Full Stack Developer",
    description: "Master the art of building complete web applications using modern technologies like Next.js, React, and MongoDB.",
    requiredSkills: ["JavaScript", "React", "Node.js", "Database Design", "API Development"],
    modules: [
      {
        id: "mod_1_1",
        topicTitle: "Introduction to Next.js 14",
        videoUrl: "https://www.youtube.com/embed/843nec-IvW0", // Placeholder
        contentDescription: "Learn the basics of the App Router, Server Components, and the new data fetching model.",
        estimatedTime: "45 mins"
      },
      {
        id: "mod_1_2",
        topicTitle: "Building APIs with Route Handlers",
        videoUrl: "https://www.youtube.com/embed/g7T23Xchtkw", // Placeholder
        contentDescription: "Create robust backend APIs directly within your Next.js application.",
        estimatedTime: "60 mins"
      },
      {
        id: "mod_1_3",
        topicTitle: "Database Integration with MongoDB",
        videoUrl: "https://www.youtube.com/embed/M988_fsOSWo", // Placeholder
        contentDescription: "Connect your application to MongoDB using Mongoose for data persistence.",
        estimatedTime: "55 mins"
      }
    ],
    assignmentQuestions: [
      {
        id: "q_1_1",
        question: "What is the primary benefit of Server Components in Next.js?",
        options: ["Reduced bundle size", "Better animations", "Easier styling", "None of the above"],
        correctAnswer: "Reduced bundle size"
      },
      {
        id: "q_1_2",
        question: "Which file is used to define a route handler in the App Router?",
        options: ["api.js", "route.js", "handler.js", "server.js"],
        correctAnswer: "route.js"
      }
    ]
  },
  {
    id: "role_2",
    roleName: "Product Manager",
    description: "Learn to lead product teams, define strategy, and deliver products that users love.",
    requiredSkills: ["Product Strategy", "User Research", "Agile Methodology", "Data Analysis", "Communication"],
    modules: [
      {
        id: "mod_2_1",
        topicTitle: "Product Lifecycle Management",
        videoUrl: "https://www.youtube.com/embed/75d_29QWELk", // Placeholder
        contentDescription: "Understand the stages of a product from conception to retirement.",
        estimatedTime: "40 mins"
      },
      {
        id: "mod_2_2",
        topicTitle: "User Research Basics",
        videoUrl: "https://www.youtube.com/embed/bL0jK6aQk_s", // Placeholder
        contentDescription: "Techniques for gathering and analyzing user feedback.",
        estimatedTime: "50 mins"
      }
    ],
    assignmentQuestions: [
      {
        id: "q_2_1",
        question: "What does MVP stand for in product management?",
        options: ["Most Valuable Player", "Minimum Viable Product", "Maximum Viable Product", "Minimum Valuable Process"],
        correctAnswer: "Minimum Viable Product"
      }
    ]
  },
  {
    id: "role_3",
    roleName: "Data Scientist",
    description: "Extract insights from data using statistical methods, machine learning, and visualization.",
    requiredSkills: ["Python", "SQL", "Machine Learning", "Statistics", "Data Visualization"],
    modules: [
      {
        id: "mod_3_1",
        topicTitle: "Python for Data Science",
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", // Placeholder
        contentDescription: "Essential Python libraries: Pandas, NumPy, and Matplotlib.",
        estimatedTime: "60 mins"
      },
      {
        id: "mod_3_2",
        topicTitle: "Introduction to Machine Learning",
        videoUrl: "https://www.youtube.com/embed/Gv9_4yMHFhI", // Placeholder
        contentDescription: "Supervised vs. Unsupervised learning concepts.",
        estimatedTime: "75 mins"
      }
    ],
    assignmentQuestions: [
      {
        id: "q_3_1",
        question: "Which library is primarily used for data manipulation in Python?",
        options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
        correctAnswer: "Pandas"
      }
    ]
  }
];
