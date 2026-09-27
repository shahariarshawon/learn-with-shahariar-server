import mongoose from 'mongoose';
import { connectDB } from './connect.js';
import Course from '../modules/courses/course.model.js';
import User from '../modules/users/user.model.js';
import { slugify } from '../utils/slugify.js';

const DEMO_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

interface SeedCourseDef {
  title: string;
  category: 'Programming' | 'Data Science' | 'AI & Machine Learning' | 'Cyber Security' | 'Cloud Computing' | 'DevOps' | 'UI/UX Design' | 'Business';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  price: number;
  discount: number;
  thumbnail: string;
  description: string;
  learningObjectives: string[];
  prerequisites: string[];
  status?: 'published' | 'draft';
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  modules: {
    title: string;
    description: string;
    lessons: {
      title: string;
      description: string;
      duration: number;
      videoUrl: string;
      isPreview: boolean;
      resources?: { title: string; url: string }[];
    }[];
  }[];
}

const COURSES_DATA: SeedCourseDef[] = [
  {
    title: 'Full Stack Web Development Bootcamp',
    category: 'Programming',
    level: 'Beginner',
    duration: '48 hours',
    price: 99.99,
    discount: 25,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    description: 'Master full-stack engineering from fundamentals to production-grade deployments. You will learn HTML5, CSS3, modern TypeScript, React, Next.js, Node.js, Express, MongoDB, and secure API architecture.',
    learningObjectives: [
      'Build responsive, production-ready web applications using modern React and Next.js.',
      'Design clean RESTful and GraphQL APIs with Node.js, Express, and TypeScript.',
      'Model complex data schemas, indexes, and transactions in MongoDB Atlas.',
      'Deploy full-stack applications with automated CI/CD pipelines to AWS and Vercel.',
    ],
    prerequisites: [
      'Basic familiarity with computer operating systems and code editors like VS Code.',
      'A passion to learn modern software engineering and build real-world products.',
    ],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Modern Frontend Foundations & React Architecture',
        description: 'Explore the modern JavaScript ecosystem, React component lifecycle, state management, and hooks.',
        lessons: [
          {
            title: 'Welcome & Full Stack Environment Setup',
            description: 'Setup Node.js LTS, Git, VS Code extensions, and inspect project architecture.',
            duration: 18,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
            resources: [{ title: 'Developer Setup Guide', url: 'https://github.com' }],
          },
          {
            title: 'Modern JavaScript & TypeScript for Enterprise Frontend',
            description: 'Deep dive into ES modules, async/await, closures, interfaces, and generics.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: true,
            resources: [{ title: 'TypeScript Cheat Sheet', url: 'https://typescriptlang.org' }],
          },
        ],
      },
      {
        title: 'Backend Engineering & Database Modeling',
        description: 'Design robust backend services, secure authentication, and scalable database schemas.',
        lessons: [
          {
            title: 'Express.js Architecture & Clean Controller Layer',
            description: 'Structuring controllers, middleware, error handling, and input validation.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
          {
            title: 'MongoDB Schema Optimization & Aggregation Pipelines',
            description: 'Indexing strategies, document relationships, and performance tuning.',
            duration: 35,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Advanced React and Next.js Masterclass',
    category: 'Programming',
    level: 'Advanced',
    duration: '38 hours',
    price: 89.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    description: 'Deep-dive into Next.js 15 App Router, React Server Components (RSC), server actions, streaming SSR, dynamic caching, and micro-frontend architectures.',
    learningObjectives: [
      'Master React Server Components, Streaming SSR, and Suspense boundaries.',
      'Implement optimistic UI mutations and server action validations with Zod.',
      'Optimize Web Vitals (LCP, INP, CLS) for top-tier Google search engine rankings.',
      'Architect resilient microfrontends and design systems for enterprise scale.',
    ],
    prerequisites: [
      'Strong proficiency in JavaScript (ES6+) and fundamental React concepts.',
      'Prior experience with npm or pnpm package management.',
    ],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'React Server Components & Next.js App Router Internals',
        description: 'Understand how the Next.js compilation pipeline handles server vs client execution.',
        lessons: [
          {
            title: 'Deconstructing React Server Components',
            description: 'Why RSC changes performance economics and how the wire format streams to the client.',
            duration: 24,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: true,
          },
          {
            title: 'Dynamic Route Handlers & Parallel Routing',
            description: 'Implement complex dashboards using Next.js parallel slots and intercepting routes.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: false,
          },
        ],
      },
      {
        title: 'State Management, Caching, and Server Actions',
        description: 'Leverage Next.js data cache, tag revalidation, and secure server action invocations.',
        lessons: [
          {
            title: 'Building Type-Safe Server Actions with Zod Validation',
            description: 'Handle form submissions, error states, and optimistic UI transitions cleanly.',
            duration: 30,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
          {
            title: 'Advanced Performance Profiling & Core Web Vitals',
            description: 'Diagnose bundle sizes, tree-shaking, and lazy loading strategies.',
            duration: 25,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Node.js Backend Engineering',
    category: 'Programming',
    level: 'Intermediate',
    duration: '40 hours',
    price: 84.99,
    discount: 15,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    description: 'Learn enterprise Node.js system architecture. Topics include event loops, streams, worker threads, clustering, microservices, gRPC, and Redis pub/sub.',
    learningObjectives: [
      'Understand Node.js runtime mechanics: libuv, event loop phases, and memory management.',
      'Process high-throughput datasets using Node.js duplex streams and backpressure.',
      'Design modular microservices communicating via Redis queues and event brokers.',
      'Implement industry-standard security headers, rate limiting, and RBAC guards.',
    ],
    prerequisites: ['Proficiency in modern JavaScript and asynchronous programming.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Event Loop, Streams, and Memory Architecture',
        description: 'Unlock maximum server throughput by understanding non-blocking I/O deeply.',
        lessons: [
          {
            title: 'Deep Dive into Libuv and Event Loop Execution Phases',
            description: 'Timers, pending callbacks, poll, check, and close phases visual walkthrough.',
            duration: 22,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Handling Large File Uploads with High-Watermark Streams',
            description: 'Prevent memory overflow with pipeline utility and backpressure management.',
            duration: 31,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Microservices & Event-Driven Architecture',
        description: 'Decouple monolithic backends into scalable microservices.',
        lessons: [
          {
            title: 'Message Queues and Asynchronous Jobs with BullMQ & Redis',
            description: 'Offload heavy computation and email sending to background worker pools.',
            duration: 29,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Graceful Shutdowns, Clustering, and Containerization',
            description: 'Deploy zero-downtime Node.js processes in production container clusters.',
            duration: 27,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Python Data Science Complete Course',
    category: 'Data Science',
    level: 'Beginner',
    duration: '52 hours',
    price: 79.99,
    discount: 30,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    description: 'Transform raw data into strategic business insights using Python, NumPy, Pandas, Matplotlib, Seaborn, and Scikit-Learn. Real-world financial and marketing datasets included.',
    learningObjectives: [
      'Clean, transform, and wrangle complex multi-dimensional datasets with Pandas.',
      'Perform exploratory data analysis (EDA) and detect statistical anomalies.',
      'Create publication-quality statistical visualizations and dashboards.',
      'Train supervised and unsupervised machine learning algorithms on real data.',
    ],
    prerequisites: ['Basic math understanding. No prior programming experience required.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Data Wrangling with NumPy and Pandas',
        description: 'Foundations of numerical computing, vectorization, and dataframes.',
        lessons: [
          {
            title: 'NumPy Vectorized Arrays vs Python Lists',
            description: 'Broadcast operations, memory locality, and multidimensional indexing.',
            duration: 25,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: true,
          },
          {
            title: 'Data Cleaning: Handling Missing Values & Outliers',
            description: 'Imputation techniques, categorical encoding, and feature scaling.',
            duration: 34,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Statistical Modeling & Hypothesis Testing',
        description: 'Validate findings using rigorous statistical methodologies.',
        lessons: [
          {
            title: 'Exploratory Data Analysis (EDA) on Real Financial Data',
            description: 'Correlation matrices, distribution skewness, and pattern discovery.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
          {
            title: 'Linear & Logistic Regression for Business Forecasting',
            description: 'Model fitting, loss functions, gradient descent, and cross-validation.',
            duration: 36,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Machine Learning Fundamentals',
    category: 'AI & Machine Learning',
    level: 'Intermediate',
    duration: '44 hours',
    price: 94.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
    description: 'Build robust machine learning models from scratch. Understand mathematical intuition behind regression, decision trees, random forests, SVMs, clustering, and ensemble methods.',
    learningObjectives: [
      'Derive and code core ML algorithms without relying blindly on black-box libraries.',
      'Perform rigorous cross-validation, hyperparameter tuning, and metric evaluation.',
      'Mitigate overfitting and underfitting using regularization (L1/L2) techniques.',
      'Deploy trained ML models as production REST endpoints with FastAPI.',
    ],
    prerequisites: ['Basic Python programming and high-school linear algebra.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Supervised Learning Algorithms',
        description: 'Predict continuous and categorical targets with high statistical precision.',
        lessons: [
          {
            title: 'Cost Functions and Gradient Descent Optimization',
            description: 'Mathematical intuition and Python implementation of learning rates and convergence.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Decision Trees, Bagging, and Random Forest Ensembles',
            description: 'Information gain, Gini impurity, tree pruning, and feature importance.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Unsupervised Learning and Model Deployment',
        description: 'Discover hidden clusters in unlabeled datasets and serve models via API.',
        lessons: [
          {
            title: 'K-Means Clustering and Principal Component Analysis (PCA)',
            description: 'Dimensionality reduction, variance preservation, and customer segmentation.',
            duration: 30,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Packaging and Serving Models via FastAPI & Docker',
            description: 'Containerize machine learning pipelines with automated health checks.',
            duration: 27,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Generative AI Engineering with LLM',
    category: 'AI & Machine Learning',
    level: 'Advanced',
    duration: '46 hours',
    price: 119.99,
    discount: 15,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    description: 'Build enterprise-grade GenAI applications. Master Retrieval-Augmented Generation (RAG), vector embeddings, LangChain, LlamaIndex, fine-tuning with LoRA/QLoRA, and agentic workflows.',
    learningObjectives: [
      'Design hybrid search RAG pipelines combining dense vector embeddings and BM25.',
      'Fine-tune open-weight models (Llama 3, Mistral) using PEFT/LoRA on custom domain datasets.',
      'Build autonomous AI agents with tools, memory systems, and multi-step reasoning.',
      'Implement guardrails, toxicity filtering, and prompt injection defense mechanisms.',
    ],
    prerequisites: ['Strong Python skills and basic familiarity with neural network concepts.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Vector Databases & Advanced RAG Architecture',
        description: 'Eliminate LLM hallucinations by integrating grounded enterprise context.',
        lessons: [
          {
            title: 'Embedding Spaces, Cosine Similarity, and Chunking Strategies',
            description: 'Semantic chunking, recursive splitters, and metadata preservation.',
            duration: 29,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Building a Production RAG Pipeline with Pinecone & LangChain',
            description: 'Reranking with Cohere, contextual compression, and citation grounding.',
            duration: 38,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Agentic Workflows and Model Fine-Tuning',
        description: 'Empower models with self-correction, tool execution, and domain adaptation.',
        lessons: [
          {
            title: 'Autonomous Multi-Agent Systems with LangGraph',
            description: 'State machines, human-in-the-loop approvals, and cyclical agent graphs.',
            duration: 35,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Parameter-Efficient Fine-Tuning (PEFT) with QLoRA',
            description: 'Quantization, LoRA adapters, dataset curation, and evaluation benchmarks.',
            duration: 40,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Deep Learning with PyTorch',
    category: 'AI & Machine Learning',
    level: 'Advanced',
    duration: '50 hours',
    price: 99.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80',
    description: 'A comprehensive journey into modern deep learning. Construct Convolutional Neural Networks (CNNs), Recurrent Networks (RNN/LSTM), and Transformers using PyTorch from scratch.',
    learningObjectives: [
      'Master PyTorch tensors, autograd engine, and computational graph dynamics.',
      'Train CNN architectures (ResNet, EfficientNet) for image classification and segmentation.',
      'Implement multi-head self-attention mechanisms and transformer blocks.',
      'Accelerate training across multi-GPU setups using PyTorch Distributed Data Parallel (DDP).',
    ],
    prerequisites: ['Python proficiency and foundational multivariable calculus.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'PyTorch Tensors, Autograd, and Custom Layers',
        description: 'Build foundational neural network building blocks from linear algebra.',
        lessons: [
          {
            title: 'Computational Graphs and Autograd Backpropagation',
            description: 'How PyTorch dynamically constructs backward passes during execution.',
            duration: 25,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Convolutional Neural Networks for Computer Vision',
            description: 'Kernel filters, pooling layers, feature maps, and transfer learning with ResNet.',
            duration: 33,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Transformers & Large-Scale Model Training',
        description: 'Understand the architecture powering state-of-the-art vision and language models.',
        lessons: [
          {
            title: 'Writing Self-Attention and Scaled Dot-Product from Scratch',
            description: 'Queries, Keys, Values, position encodings, and residual normalization.',
            duration: 37,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
          {
            title: 'Multi-GPU Training with PyTorch Lightning and DDP',
            description: 'Mixed precision training, gradient accumulation, and memory profiling.',
            duration: 30,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Cyber Security Fundamentals',
    category: 'Cyber Security',
    level: 'Beginner',
    duration: '35 hours',
    price: 74.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    description: 'Learn modern defensive and offensive cybersecurity principles. Covers network defense, cryptography, OWASP Top 10 vulnerabilities, penetration testing, and incident response.',
    learningObjectives: [
      'Identify and remediate critical OWASP Top 10 web vulnerabilities (SQLi, XSS, CSRF, SSRF).',
      'Understand cryptographic foundations: asymmetric encryption, digital signatures, and TLS 1.3.',
      'Perform network reconnaissance and traffic analysis using Wireshark and Nmap.',
      'Configure enterprise firewall policies and security information/event management (SIEM).',
    ],
    prerequisites: ['Basic understanding of internet networking (TCP/IP, HTTP/S).'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Network Security & Packet Inspection',
        description: 'Understand protocol weaknesses and inspect network communication streams.',
        lessons: [
          {
            title: 'TCP/IP Handshake Analysis with Wireshark',
            description: 'Detecting SYN flood attacks, port scanning, and unencrypted credentials.',
            duration: 24,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'TLS 1.3 Handshake and Certificate Validation',
            description: 'Public Key Infrastructure (PKI), root Certificate Authorities, and cipher suites.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Application Security & Penetration Testing',
        description: 'Harden web applications against real-world intrusion techniques.',
        lessons: [
          {
            title: 'Exploiting and Remedying SQL Injection & Blind Injection',
            description: 'Prepared statements, parameterized queries, and ORM security practices.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
          {
            title: 'Zero Trust Architecture & Security Posture Assessment',
            description: 'Identity-first defense, continuous authentication, and micro-segmentation.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Cloud Computing with AWS',
    category: 'Cloud Computing',
    level: 'Intermediate',
    duration: '45 hours',
    price: 89.99,
    discount: 25,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    description: 'Design highly available, fault-tolerant cloud architectures on Amazon Web Services. Covers VPCs, EC2 auto-scaling, S3, RDS, Lambda serverless, CloudFront, and IAM security.',
    learningObjectives: [
      'Architect multi-AZ Virtual Private Clouds (VPC) with public/private subnets and NAT gateways.',
      'Deploy auto-scaling compute fleets behind Application Load Balancers (ALB).',
      'Build event-driven serverless backends using AWS Lambda, API Gateway, and DynamoDB.',
      'Automate infrastructure provisioning using Infrastructure as Code (Terraform & AWS CDK).',
    ],
    prerequisites: ['Basic Linux terminal familiarity and cloud computing concepts.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Core AWS Networking & Compute Infrastructure',
        description: 'Design the bedrock networking layer for mission-critical applications.',
        lessons: [
          {
            title: 'Designing Enterprise Multi-AZ Virtual Private Clouds',
            description: 'CIDR blocks, route tables, internet gateways, and security groups.',
            duration: 27,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Auto Scaling EC2 Fleets Behind Application Load Balancers',
            description: 'Health checks, target groups, launch templates, and dynamic scaling policies.',
            duration: 34,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Serverless Architecture & Cloud Security',
        description: 'Eliminate server maintenance overhead while ensuring strict least-privilege access.',
        lessons: [
          {
            title: 'Event-Driven Serverless with AWS Lambda & SQS',
            description: 'Decoupled asynchronous processing and dead-letter queue management.',
            duration: 29,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'IAM Policies, CloudWatch Metrics, and Cost Optimization',
            description: 'Fine-grained policy documents, billing alarms, and reserved instance savings.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Docker and Kubernetes',
    category: 'DevOps',
    level: 'Intermediate',
    duration: '42 hours',
    price: 84.99,
    discount: 15,
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
    description: 'From containerization fundamentals to production Kubernetes orchestration. Master multi-stage Docker builds, Pods, Deployments, Services, Ingress, Helm, and cluster monitoring.',
    learningObjectives: [
      'Write hardened, multi-stage Dockerfiles that minimize attack surface and image size.',
      'Deploy self-healing container workloads on Kubernetes with rolling updates and rollbacks.',
      'Configure cluster networking: ClusterIP, NodePort, LoadBalancer, and Ingress controllers.',
      'Package and distribute microservices using Helm charts and GitOps workflows.',
    ],
    prerequisites: ['Basic Linux command-line skills and client-server concepts.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Containerization Mastery with Docker',
        description: 'Container runtimes, union filesystems, and multi-stage build optimization.',
        lessons: [
          {
            title: 'Understanding Linux Namespaces, Cgroups, and Container Runtimes',
            description: 'How Docker creates process isolation on host kernels.',
            duration: 23,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Optimizing Multi-Stage Dockerfiles for Node & Go Services',
            description: 'Layer caching, non-root users, distroless images, and vulnerability scanning.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Production Kubernetes Cluster Management',
        description: 'Orchestrate distributed systems with declarative manifest files.',
        lessons: [
          {
            title: 'Deployments, ReplicaSets, and Zero-Downtime Rolling Updates',
            description: 'Readiness probes, liveness probes, and graceful termination hooks.',
            duration: 35,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
          {
            title: 'Ingress Controllers, TLS Certificates, and Helm Charts',
            description: 'Route external traffic with cert-manager automated HTTPS renewals.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'UI/UX Design Masterclass',
    category: 'UI/UX Design',
    level: 'Beginner',
    duration: '36 hours',
    price: 69.99,
    discount: 30,
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    description: 'Design world-class digital products. Learn human-centered UX research, wireframing, high-fidelity Figma prototyping, typography, design systems, and developer handoff workflows.',
    learningObjectives: [
      'Conduct user interviews, journey mapping, and empathy-driven UX research.',
      'Design cohesive, accessible color palettes and typography hierarchies (WCAG 2.1 AAA).',
      'Build scalable Figma component libraries using Auto Layout, variants, and design tokens.',
      'Deliver interactive, animated micro-interaction prototypes for user testing.',
    ],
    prerequisites: ['No design software experience needed. Creativity and curiosity required.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Design Foundations & UX Research',
        description: 'Uncover user problems and translate insights into architectural wireframes.',
        lessons: [
          {
            title: 'UX Research Methodologies and User Journey Mapping',
            description: 'Identifying friction points and formulating testable hypotheses.',
            duration: 21,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Information Architecture and Low-Fidelity Wireframing',
            description: 'Creating intuitive navigation paths and structural wireframe screens.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Figma Mastery & Production Design Systems',
        description: 'Build components that seamlessly mirror frontend code libraries.',
        lessons: [
          {
            title: 'Mastering Figma Auto Layout, Variables, and Component Sets',
            description: 'Responsive card layouts, dynamic slot components, and mode switching.',
            duration: 33,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Interactive Prototyping & Developer Handoff Specs',
            description: 'Micro-interactions, smart animate transitions, and token exports.',
            duration: 29,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Database Engineering',
    category: 'Programming',
    level: 'Advanced',
    duration: '44 hours',
    price: 89.99,
    discount: 15,
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    description: 'Understand the internals of relational and distributed databases. Deep-dive into B-Trees, LSM-Trees, Write-Ahead Logs (WAL), concurrency control (ACID vs BASE), and sharding.',
    learningObjectives: [
      'Understand on-disk storage engines: page layout, B+ Trees, and Log-Structured Merge Trees.',
      'Analyze transaction isolation levels and prevent anomalies like dirty reads and write skew.',
      'Implement horizontal database sharding, replication topologies, and failover automation.',
      'Optimize query execution plans and database buffer pool hit rates.',
    ],
    prerequisites: ['Proficiency in backend engineering and basic relational database usage.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Storage Engine Mechanics & Indexing Structures',
        description: 'How databases persist, retrieve, and cache pages on disk and memory.',
        lessons: [
          {
            title: 'Inside the Storage Engine: B+ Trees and Write-Ahead Logging',
            description: 'Page splitting, buffer managers, dirty pages, and crash recovery.',
            duration: 30,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'LSM Trees and Columnar Stores for Big Data',
            description: 'MemTables, SSTables, Bloom filters, and compaction strategies.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Distributed Databases, Consensus, and Sharding',
        description: 'Scale beyond single-server memory and compute limitations.',
        lessons: [
          {
            title: 'Horizontal Sharding Keys and Distributed Query Coordination',
            description: 'Consistent hashing, range partitioning, and cross-shard joins.',
            duration: 34,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Raft Consensus Protocol and Multi-Leader Replication',
            description: 'Leader election, log replication, split-brain scenarios, and quorum math.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'SQL Advanced Development',
    category: 'Data Science',
    level: 'Intermediate',
    duration: '32 hours',
    price: 64.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    description: 'Level up your database querying skills. Master window functions, Common Table Expressions (CTEs), recursive queries, indexing optimization, and stored procedures.',
    learningObjectives: [
      'Write sophisticated analytical queries using window functions (RANK, LEAD, LAG, NTILE).',
      'Traverse hierarchical graph data using recursive Common Table Expressions.',
      'Interpret EXPLAIN ANALYZE query plans and eliminate costly sequential scans.',
      'Design idempotent database migration scripts and transactional data pipelines.',
    ],
    prerequisites: ['Basic SQL querying (SELECT, INSERT, simple joins).'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Analytical Window Functions & CTEs',
        description: 'Compute running totals, moving averages, and ranks across partitions.',
        lessons: [
          {
            title: 'Mastering Window Functions: OVER, PARTITION BY, and ORDER BY',
            description: 'Cumulative calculations, lag/lead comparisons, and rank dense values.',
            duration: 24,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Recursive Common Table Expressions for Hierarchical Data',
            description: 'Querying organizational trees, category hierarchies, and path breadcrumbs.',
            duration: 27,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Query Optimization & Performance Tuning',
        description: 'Diagnose slow-running queries and optimize database execution plans.',
        lessons: [
          {
            title: 'Demystifying EXPLAIN ANALYZE: Scans, Filters, and Hash Joins',
            description: 'Identify unindexed foreign keys and costly temporary table spooling.',
            duration: 29,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Composite, Partial, and Expression Indexes in PostgreSQL',
            description: 'Right-sized indexing strategies that do not degrade write throughput.',
            duration: 25,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'JavaScript Professional Course',
    category: 'Programming',
    level: 'Beginner',
    duration: '42 hours',
    price: 59.99,
    discount: 25,
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
    description: 'Gain true mastery of JavaScript. Understand scopes, closures, prototypes, asynchronous execution, memory management, DOM events, and modern ES2024 features.',
    learningObjectives: [
      'Understand lexical scoping, closures, execution contexts, and the V8 engine.',
      'Master the prototype chain, prototypal inheritance, and ES classes.',
      'Write rock-solid asynchronous code using Promises, async/await, and abort controllers.',
      'Create performant vanilla JS web applications without framework dependencies.',
    ],
    prerequisites: ['Basic computer literacy. Enthusiasm to master web programming.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Execution Context, Scope, and Closures',
        description: 'How JavaScript executes under the hood in modern browser engines.',
        lessons: [
          {
            title: 'Execution Contexts, Hoisting, and the Call Stack',
            description: 'Memory allocation phase, execution phase, and stack traces.',
            duration: 22,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Practical Power of Closures in Modern Architecture',
            description: 'Encapsulation, module patterns, memoization, and currying.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Asynchronous JavaScript & Web APIs',
        description: 'Harness non-blocking asynchronous programming patterns.',
        lessons: [
          {
            title: 'Promises, Async/Await, and Microtask Queue Mechanics',
            description: 'Promise.allSettled, error bubbling, and race condition prevention.',
            duration: 31,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
          {
            title: 'Event Bubbling, Capturing, and High-Performance Delegation',
            description: 'Optimize DOM manipulation and listener memory footprint.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'TypeScript Complete Guide',
    category: 'Programming',
    level: 'Intermediate',
    duration: '36 hours',
    price: 74.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc03a6774c8?auto=format&fit=crop&w=800&q=80',
    description: 'Build enterprise-grade applications with confidence. Master generics, conditional types, mapped types, template literal types, utility types, and strict tsconfig settings.',
    learningObjectives: [
      'Write expressive, type-safe code eliminating runtime null and undefined errors.',
      'Master advanced TypeScript generics, constraints, and conditional infer types.',
      'Construct custom utility types with mapped types and template literal types.',
      'Integrate TypeScript seamlessly into modern React, Next.js, and Node.js codebases.',
    ],
    prerequisites: ['Good understanding of modern JavaScript (ES6+).'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Advanced Types & Generics',
        description: 'Move beyond basic interfaces to dynamic, parameterized type systems.',
        lessons: [
          {
            title: 'Mastering Generics and Type Constraints',
            description: 'Generic functions, generic classes, and generic default parameters.',
            duration: 25,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Conditional Types and the Infer Keyword',
            description: 'Extracting return types, unwrapping promises, and recursive types.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Enterprise Architecture & Declaration Files',
        description: 'Maintain large monorepos with strict type boundaries and tsconfig tuning.',
        lessons: [
          {
            title: 'Mapped Types and Template Literal Type Magic',
            description: 'Building type-safe event emitters and API query schemas.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Strict Compiler Options and Performance Optimization',
            description: 'Project references, incremental builds, and type declaration packaging.',
            duration: 24,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'System Design for Developers',
    category: 'Programming',
    level: 'Advanced',
    duration: '45 hours',
    price: 99.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
    description: 'Ace technical system design interviews and architect systems serving millions of daily active users. Covers load balancers, caching, sharding, rate limiting, and CAP theorem.',
    learningObjectives: [
      'Estimate capacity, storage, and throughput for massive-scale distributed platforms.',
      'Architect resilient systems considering latency, availability, and consistency tradeoffs.',
      'Design real-world architectures: URL Shorteners, Collaborative Documents, and Video Streaming.',
      'Implement distributed locks, leader election, and idempotency keys.',
    ],
    prerequisites: ['Experience with backend web development and database concepts.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Distributed System Building Blocks',
        description: 'Core architectural primitives utilized by top-tier tech companies.',
        lessons: [
          {
            title: 'Load Balancing Algorithms and Reverse Proxies',
            description: 'Consistent hashing, round-robin, least connections, and health checking.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Distributed Caching Strategies: Cache-Aside vs Write-Through',
            description: 'Cache stampede, cache eviction policies (LRU/LFU), and Redis clusters.',
            duration: 31,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Real-World System Design Walkthroughs',
        description: 'End-to-end blueprint designs of industry-scale architectures.',
        lessons: [
          {
            title: 'Designing YouTube / Netflix Video Streaming Architecture',
            description: 'Transcoding pipelines, CDN edge caching, and chunked adaptive bitrate streaming.',
            duration: 38,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Designing a Scalable Real-Time Chat App with WebSockets & Kafka',
            description: 'Connection state management, message persistence, and presence tracking.',
            duration: 34,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Mobile App Development',
    category: 'Programming',
    level: 'Intermediate',
    duration: '38 hours',
    price: 79.99,
    discount: 25,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    description: 'Build native iOS and Android apps using React Native and Expo. Learn cross-platform animations, push notifications, offline SQLite storage, camera access, and App Store publishing.',
    learningObjectives: [
      'Build native iOS and Android applications from a single TypeScript codebase.',
      'Implement fluid 60fps animations with React Native Reanimated and Gesture Handler.',
      'Integrate native device sensors: Camera, Biometrics, Geolocation, and Push Notifications.',
      'Package and release apps to Apple App Store and Google Play Store via EAS.',
    ],
    prerequisites: ['Proficiency in React and modern JavaScript.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'React Native & Expo Architecture',
        description: 'Understand the native bridge, JSI, and modern new architecture.',
        lessons: [
          {
            title: 'Expo Workflow Setup & Cross-Platform Fundamentals',
            description: 'Styling, flexbox differences, and native component equivalents.',
            duration: 24,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'High-Performance 60 FPS Animations with Reanimated 3',
            description: 'Worklets, shared values, and gestures on the native UI thread.',
            duration: 30,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Native Device APIs & Production Deployment',
        description: 'Connect with mobile hardware and deploy to app storefronts.',
        lessons: [
          {
            title: 'Offline-First Storage with SQLite & WatermelonDB',
            description: 'Syncing local mobile databases with remote cloud APIs.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Automated App Store & Play Store Submissions with EAS',
            description: 'Credentials management, testflight distribution, and production builds.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'DevOps CI/CD Pipeline',
    category: 'DevOps',
    level: 'Intermediate',
    duration: '34 hours',
    price: 74.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=800&q=80',
    description: 'Automate software delivery from commit to production. Master GitHub Actions, GitLab CI, automated testing, semantic versioning, container security, and GitOps deployments.',
    learningObjectives: [
      'Construct automated multi-stage GitHub Actions workflows with secrets management.',
      'Implement branch protection rules, automated unit tests, and code coverage checks.',
      'Publish vulnerability-free container images to Amazon ECR and Docker Hub.',
      'Deploy applications automatically using ArgoCD and declarative GitOps pipelines.',
    ],
    prerequisites: ['Basic familiarity with Git, terminal commands, and Docker.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Continuous Integration with GitHub Actions',
        description: 'Automate linting, testing, and security scanning on every pull request.',
        lessons: [
          {
            title: 'Designing Robust GitHub Actions Workflows and Custom Actions',
            description: 'Triggers, matrices, caching dependencies, and composite actions.',
            duration: 23,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Automated Container Security Scanning with Trivy',
            description: 'Failing builds on critical CVE vulnerabilities and license audits.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Continuous Deployment & GitOps',
        description: 'Deploy updates to production with zero manual intervention.',
        lessons: [
          {
            title: 'GitOps Continuous Delivery with ArgoCD',
            description: 'Declarative state synchronization, automated rollbacks, and health checks.',
            duration: 31,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Blue/Green and Canary Deployment Strategies',
            description: 'Traffic splitting with service mesh to minimize release risks.',
            duration: 27,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Data Visualization',
    category: 'Data Science',
    level: 'Beginner',
    duration: '30 hours',
    price: 59.99,
    discount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    description: 'Tell compelling stories with data. Learn visual perception principles, dashboard design, D3.js, Chart.js, Recharts, and interactive web visualization techniques.',
    learningObjectives: [
      'Apply human visual perception principles to choose the most informative charts.',
      'Build custom, responsive data visualizations using D3.js and SVG coordinate systems.',
      'Construct interactive executive analytics dashboards in React using Recharts.',
      'Transform complex tabular data into intuitive geospatial maps and choropleths.',
    ],
    prerequisites: ['Basic HTML, CSS, and fundamental JavaScript knowledge.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Visual Perception & Chart Fundamentals',
        description: 'The science behind how human brains process visual metrics.',
        lessons: [
          {
            title: 'Gestalt Principles and Preattentive Visual Attributes',
            description: 'Using color, position, and size to guide viewer comprehension.',
            duration: 20,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Building Interactive Charts with Recharts and Tailwind',
            description: 'Area charts, tooltips, responsive containers, and custom ticks.',
            duration: 25,
            videoUrl: DEMO_VIDEOS[3],
            isPreview: false,
          },
        ],
      },
      {
        title: 'D3.js Custom Data Visualizations',
        description: 'Harness the full power of mathematical coordinate transformations.',
        lessons: [
          {
            title: 'D3 Scales, Axes, and SVG Path Generators',
            description: 'Mapping domain data to screen range pixels with mathematical precision.',
            duration: 29,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Animated Transitions and Geospatial Projections in D3',
            description: 'GeoJSON, topojson, zoom behaviors, and interactive choropleth maps.',
            duration: 32,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: 'Career Preparation for Software Engineers',
    category: 'Business',
    level: 'All Levels',
    duration: '28 hours',
    price: 49.99,
    discount: 30,
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'Supercharge your tech career. Learn how to land high-paying software engineering jobs: resume optimization, portfolio showcase, behavioral interviews, salary negotiation, and remote work strategies.',
    learningObjectives: [
      'Write an ATS-optimized software engineering resume highlighting business impact.',
      'Build a portfolio that attracts international recruiters and remote engineering leads.',
      'Master the STAR method for behavioral and leadership interview questions.',
      'Negotiate base salary, equity, and remote benefits with confidence.',
    ],
    prerequisites: ['Basic coding knowledge and ambition to advance your engineering career.'],
    status: 'published',
    approvalStatus: 'approved',
    modules: [
      {
        title: 'Resume Engineering & Portfolio Strategy',
        description: 'Position your experience so top companies reach out to you first.',
        lessons: [
          {
            title: 'Crafting High-Impact ATS-Beating Engineering Resumes',
            description: 'Action verbs, quantifiable business metrics, and structure guidelines.',
            duration: 21,
            videoUrl: DEMO_VIDEOS[0],
            isPreview: true,
          },
          {
            title: 'Architecting a Portfolio that Proves Engineering Seniority',
            description: 'Case study breakdowns, architectural diagrams, and live demo polish.',
            duration: 26,
            videoUrl: DEMO_VIDEOS[4],
            isPreview: false,
          },
        ],
      },
      {
        title: 'Interview Mastery & Salary Negotiation',
        description: 'Navigate technical rounds and negotiate top-tier compensation packages.',
        lessons: [
          {
            title: 'Nailing Behavioral and Engineering Culture Interviews (STAR Method)',
            description: 'Structuring stories about conflict resolution, leadership, and system failures.',
            duration: 28,
            videoUrl: DEMO_VIDEOS[1],
            isPreview: false,
          },
          {
            title: 'Strategic Compensation Negotiation for Remote Roles',
            description: 'Total compensation breakdown: base, signing bonus, RSUs, and equity vesting.',
            duration: 30,
            videoUrl: DEMO_VIDEOS[2],
            isPreview: false,
          },
        ],
      },
    ],
  },
];

export async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  // Find or create primary educator / instructor
  let educator = await User.findOne({ role: 'admin' });
  if (!educator) {
    educator = await User.findOne();
  }

  const educatorId = educator ? educator._id.toString() : 'user_shahariar_lead';
  console.log(`[Seed] Using educator ID: ${educatorId} (${educator?.name || 'Lead Instructor'})`);

  console.log('[Seed] Seeding 20 realistic LMS courses...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const cData of COURSES_DATA) {
    const slug = slugify(cData.title);

    const modules = cData.modules.map((mod, mIdx) => ({
      moduleId: `mod_${mIdx + 1}_${slug.slice(0, 10)}`,
      moduleTitle: mod.title,
      title: mod.title,
      moduleOrder: mIdx + 1,
      order: mIdx + 1,
      description: mod.description,
      lessons: mod.lessons.map((les, lIdx) => ({
        lessonId: `les_${mIdx + 1}_${lIdx + 1}_${slug.slice(0, 10)}`,
        title: les.title,
        description: les.description,
        duration: les.duration,
        videoUrl: les.videoUrl,
        order: lIdx + 1,
        isPreview: les.isPreview,
        resources: les.resources || [],
        lectureId: `les_${mIdx + 1}_${lIdx + 1}_${slug.slice(0, 10)}`,
        lectureTitle: les.title,
        lectureDuration: les.duration,
        lectureUrl: les.videoUrl,
        isPreviewFree: les.isPreview,
        lectureOrder: lIdx + 1,
      })),
    }));

    const roadmap = [
      { order: 1, title: 'Prerequisites & Foundations', description: 'Core tools and fundamental architecture setups' },
      { order: 2, title: 'Deep Implementation', description: 'Hands-on architectural patterns and production code' },
      { order: 3, title: 'Testing & Optimization', description: 'Automated test suites, security checks, and latency benchmarking' },
      { order: 4, title: 'Capstone & Deployment', description: 'Production release, monitoring, and certification milestone' },
    ];

    const courseDoc = {
      courseTitle: cData.title,
      title: cData.title,
      slug,
      courseDescription: cData.description,
      description: cData.description,
      courseThumbnail: cData.thumbnail,
      thumbnail: cData.thumbnail,
      category: cData.category,
      level: cData.level,
      language: 'English',
      coursePrice: cData.price,
      price: cData.price,
      discount: cData.discount,
      duration: cData.duration,
      status: cData.status || 'published',
      approvalStatus: cData.approvalStatus || 'approved',
      isPublished: (cData.status || 'published') === 'published',
      educator: educatorId,
      learningObjectives: cData.learningObjectives,
      prerequisites: cData.prerequisites,
      skills: [cData.category, cData.level, ...cData.title.split(' ')].filter((s) => s.length > 2),
      roadmap,
      modules,
      courseRatings: [
        { userId: 'rev_1', rating: 5 },
        { userId: 'rev_2', rating: 5 },
        { userId: 'rev_3', rating: 4 },
      ],
      enrolledStudents: educator ? [educator._id.toString()] : [],
    };

    const existing = await Course.findOne({ slug });
    if (existing) {
      await Course.findByIdAndUpdate(existing._id, { $set: courseDoc });
      updatedCount++;
    } else {
      await Course.create(courseDoc);
      createdCount++;
    }
  }

  // Also add 1 pending course specifically for Admin Moderation queue testing
  const pendingSlug = 'distributed-consensus-algorithms-and-raft';
  const pendingCourse = {
    courseTitle: 'Distributed Consensus Algorithms and Raft',
    title: 'Distributed Consensus Algorithms and Raft',
    slug: pendingSlug,
    courseDescription: 'Explore Byzantine fault tolerance, Paxos, and Raft consensus protocols for distributed databases.',
    description: 'Explore Byzantine fault tolerance, Paxos, and Raft consensus protocols for distributed databases.',
    courseThumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    category: 'Programming',
    level: 'Advanced',
    language: 'English',
    coursePrice: 89.99,
    price: 89.99,
    discount: 10,
    duration: '22 hours',
    status: 'draft',
    approvalStatus: 'pending',
    isPublished: false,
    educator: educatorId,
    learningObjectives: ['Implement Raft leader election', 'Handle split-brain network partitions'],
    prerequisites: ['Go or C++ experience', 'Networking fundamentals'],
    skills: ['Distributed Systems', 'Raft', 'Go'],
    modules: [
      {
        moduleId: 'mod_pending_1',
        moduleTitle: 'Consensus Mechanics',
        title: 'Consensus Mechanics',
        moduleOrder: 1,
        order: 1,
        description: 'Consensus overview',
        lessons: [
          {
            lessonId: 'les_pending_1',
            title: 'Paxos vs Raft',
            description: 'Comparative study of consensus algorithms',
            duration: 18,
            videoUrl: DEMO_VIDEOS[0],
            order: 1,
            isPreview: true,
            lectureId: 'les_pending_1',
            lectureTitle: 'Paxos vs Raft',
            lectureDuration: 18,
            lectureUrl: DEMO_VIDEOS[0],
            isPreviewFree: true,
            lectureOrder: 1,
          },
        ],
      },
    ],
  };

  const existingPending = await Course.findOne({ slug: pendingSlug });
  if (existingPending) {
    await Course.findByIdAndUpdate(existingPending._id, { $set: pendingCourse });
  } else {
    await Course.create(pendingCourse);
  }

  console.log(`[Seed Complete] Successfully processed courses: ${createdCount} created, ${updatedCount} updated.`);
  const totalCourses = await Course.countDocuments();
  console.log(`[Seed] Total courses in MongoDB: ${totalCourses}`);
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
