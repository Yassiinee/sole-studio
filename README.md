<div align="center">

# SoleStudio Pro 👟
### Zero-Config Professional Shoe Photography Powered by FLUX.1 & Puter.js

**SoleStudio Pro** is an advanced AI-driven application designed to transform amateur shoe photos into professional, studio-quality product shots directly from your browser. 

By leveraging **FLUX.1-schnell** via **Puter.js**, SoleStudio Pro eliminates the need for `.env` files, API keys, and complex setups. Users get instant 4K studio environments with high-fidelity textures, realistic lighting, and flawless shadows—**completely for free**.

</div>

---

## ✨ Features

- **Zero Configuration**: No API keys or `.env` files are required. The entire AI pipeline is managed automatically, directly from the browser window.
- **FLUX.1-schnell Engine**: Rapid image generation using the lightning-fast FLUX.1 model, ensuring premium commercial photography composition in seconds.
- **Reference Upload**: Optional image upload capability. Your uploaded sneakers serve as the reference base for the new 4K studio AI generation.
- **Pro Lighting Engine**: Prompts are meticulously optimized to apply soft shadows, directional light, and a pristine `#E8E8E8` backdrop.
- **4K High-Res Downloads**: Export your generated image with full resolution for professional e-commerce use.
- **Refined UI/UX**: A sleek, minimal interface designed with **Tailwind CSS v4** and **Framer Motion** for a luxurious user experience.

---

## 🏗️ Architecture & Technology Stack

SoleStudio operates on a lightweight frontend architecture, abstracting all heavy lifting to the free-to-use Puter CDN.

### Core Architecture
- **Puter.js Integration**: The app avoids server-side secret management by using `window.puter.ai.txt2img`. Users securely connect their free Puter account in-browser.
- **State Management**: Full React state management governing idle, preparing, generation, and output rendering cycles.
- **Fluid Animation System**: Leveraging `motion/react` for buttery smooth transitions, dynamic tickers during loading states, and layout persistence.

### Tech Stack
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **AI Backend**: [Puter.js](https://puter.com/) (FLUX.1 txt2img endpoints)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

---

## 🛠️ Usage Flow

1. **Upload Reference (Optional)**: Drag and drop an existing shoe photo you want to base your image on.
2. **Customize Prompt**: The default prompt achieves a premium 3/4 angle studio look. Click **"Edit Prompt"** to refine aesthetics, add props, or change the lighting.
3. **Generate**: Click the generate button. If it's your first time, the Puter.js OAuth modal will pop up. Sign in quickly (it's free).
4. **Processing**: The UI will cycle securely through generation phases.
5. **Download**: Once the model renders the 4K asset, hit download to save directly to your drive.

---

## 🚀 Getting Started Locally

Getting the development environment up and running is phenomenally straight-forward since there are no API keys required.

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Yassiinee/sole-studio.git
   cd sole-studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Launch the Application**:
   ```bash
   npm run dev
   ```

4. **Navigate to Local Server**:
   Open `http://localhost:3000` in your web browser. Ensure you allow the Puter.js script to run if you have aggressive ad blockers enabled.

---

## 💬 FAQ

**Are there limits to image generation?**
Generation runs via the Puter.js platform. Currently, Puter offers extremely generous free daily usage. A single user can typically generate dozens to hundreds of high-quality results per day with FLUX.1-schnell.

**Why did you remove Gemini?**
We migrated to Puter.js to completely remove developer friction. Requiring a `GEMINI_API_KEY` meant folks couldn't clone and run instantly. By switching to Puter, the end user authenticates, meaning devs don't need APIs setup!

---

## 📄 License

This project is open-source and licensed under the **Apache-2.0 License**. Feel free to fork, adapt, and build incredible AI-powered tools on top of this starter!
