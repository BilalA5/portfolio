

export const PROJECTS = [
  { file: "project-paykit.svg", image: "/antique-mirror-and-key-1k.png", symbol: "/diamond.png", name: "Glammer", description: "Application design and build", type: "Application", year: "2026", stats: "100 users", url: "https://www.glammer.ai" },
  { file: "project-superzed.svg", image: "/retro-macintosh-glow-1k.png", symbol: "/lemniscate-form.png", videoDark: "/figure8-dark.mp4", videoLight: "/figure8-light.mp4", name: "Figure8", description: "Mobile product experience with dark and light motion cuts", type: "Application", year: "2026", stats: "Dark + light motion", url: "https://www.figure8.app" },
  { file: "project-hitch.svg", image: "/retro-computer-portal-1k.png", symbol: "/nebula.png", name: "Cloudey", description: "Gemini-powered browser assistant with page-aware chat and agentic Chrome actions", type: "Chrome Extension", year: "2025", url: "https://github.com/BilalA5/googlebuiltinai25-Cloudey" },
  { file: "project-opensec.svg", image: "/brass-telescope-stage-1k.png", symbol: "/soil-tester.png", name: "Cascade", description: "ESP32 field sensors stream soil moisture and motion through AWS IoT Core into a React dashboard with weather and Gemini agronomy insights", type: "IoT & Cloud", year: "2025", url: "https://github.com/BilalA5/Cascade" },
  { file: "project-research.svg", image: "/sailboat-after-dark-1k.png", symbol: "/money-bag.png", name: "E-commerce Churn", description: "Decision-tree model trained on 5,000 sessions to predict cart abandonment and surface conversion levers", type: "Machine Learning", year: "2025", url: "https://github.com/BilalA5/ecommerce-churn-prediction" },
  { file: "project-flight-delay.svg", image: "/sports-car-inferno-1k.png", symbol: "/airplane.png", name: "Flight Delay Analytics", description: "Dockerized ETL pipeline for US flight data with Python ingestion, dbt/PostgreSQL transformations, and Airflow orchestration", type: "Data Engineering", year: "2025", url: "https://github.com/BilalA5/flight-delay-analytics-pipeline" },
  { file: "project-microui.svg", image: "/sunken-amphitheater-1k.png", symbol: "/frost.png", name: "Frosted MicroUI Kit", description: "Minimal glass components for fast prototyping", type: "Figma", year: "2025", stats: "416 uses · 4 likes", url: "https://www.figma.com/community/file/1563199825667468406/frosted-micro-ui-kit-minimal-glass-components" },
  { file: "project-aither.svg", image: "/treasure-burst-1k.png", symbol: "/robotic-arm.png", name: "Aither UI", description: "UI for a mental health chatbot application", type: "Figma", year: "2025", url: "https://www.figma.com/design/aAeJbCf29uCeADBX7WGQoG/Aither-UI?node-id=0-1&t=MuqcccCKCusr36Sr-1" },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.image ?? `/${p.file}`);
