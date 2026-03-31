[![License](https://img.shields.io/github/license/Yassiinee/sole-studio)](https://github.com/Yassiinee/sole-studio/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/Yassiinee/sole-studio)](https://github.com/Yassiinee/sole-studio/issues)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)

<div align="center">
  <img src="./public/logo.png" alt="SoleStudio Pro Logo" width="150" height="auto" />
  <h1>SoleStudio Pro 👟</h1>
  <p><strong>Professional 4K Studio Renderings from Amateur Shoe Photos</strong></p>
</div>

**SoleStudio Pro** is an advanced AI-driven application designed to transform amateur shoe photos into professional, studio-quality product shots directly from your browser.

By unifying **Groq Vision** and **fal-ai's FLUX.1-schnell**, SoleStudio Pro processes your footwear images into 4K e-commerce assets with precise textures, realistic lighting, and pristine studio backdrops in seconds.

---

## ✨ Features

- **Automated AI Pipeline**: No manual prompt tuning. Groq Vision studies your uploaded shoe and algorithmically crafts the perfect prompt for you.
- **Groq Vision Engine**: Utilizing the cutting edge `llama-4-scout-17b-16e` model to accurately detect brand, colorways, and precise shoe geometries.
- **FLUX.1-schnell Synthesis**: Offloading rendering to HuggingFace routers targeting the `fal-ai/flux/schnell` model for hyper-realistic 4K results in ~10 seconds.
- **Vite Proxy Magic**: Zero CORS issues—the UI automatically proxies API calls through the Vite development server to safely connect with external services.
- **High-Res Downloads**: Instantly save your 1024x1024 studio shots locally with one click.
- **Refined UI/UX**: A sleek, minimal browser canvas built with React, Vite, and smooth Framer Motion aesthetics.

---

## 🏗️ Architecture & Technology Stack

SoleStudio acts as the master conductor between ultra-fast inference engines and local user workflows:

### The Two-Step Pipeline

1. **Step 1 (Analysis)**: Your source image is parsed into Base64 and sent to Groq. A fine-tuned Vision prompt extracts visual features and returns a meticulously constructed FLUX prompt.
2. **Step 2 (Generation)**: The generated prompt hits the `fal-ai FLUX.1` engine over HuggingFace, executing a 4-step diffusion pass against a seamless `#E8E8E8` studio backdrop.

### Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Vision Model**: Groq `llama-4-scout-17b-16e-instruct`
- **Image Model**: FLUX.1-schnell (fal-ai via HuggingFace)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

---

## 🚀 Getting Started

To run SoleStudio Pro, you will need two free access tokens. Follow the instructions carefully to set up your environment.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- API Keys:
  - **Groq API Key**: Obtain a free key from the [Groq Console](https://console.groq.com/).
  - **HuggingFace Token**: Get a free READ token from [HuggingFace Settings](https://huggingface.co/settings/tokens).

### 2. Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Yassiinee/sole-studio.git
   cd sole-studio
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file at the root of the project by copying the example:

   ```bash
   cp .env.example .env
   ```

   Add your keys to the `.env` file:

   ```env
   GROQ_API_KEY=gsk_youractualkeyhere...
   HF_TOKEN=hf_youractualtokenhere...
   ```

4. **Launch the Application**:

   ```bash
   npm run dev
   ```

5. **Start Creating**:
   Open the port provided by vite (usually `http://localhost:5173`). Upload a shoe photo and generate!

---

## 📄 License

This project is open-source and licensed under the **Apache-2.0 License**.

## Author

**Yassine Zakhama** — [zakhamayassine@gmail.com
](mailto:zakhamayassine@gmail.com)
