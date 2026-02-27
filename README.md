# leaked-system-prompts

## Description

This repository is a collection of leaked system prompts from widely used LLM based services.

1. If you would like to submit a PR, please match the format of other documents. You must include sources that I can verify or reproducible prompts.
2. If the above process is too cumbersome, you can simply post a link in the Issues section. If there are verifiable sources or reproducible prompts, I will verify them and then proceed with the merge.
3. This repository is cited in many papers. To prevent repository takedown due to [DMCA](https://docs.github.com/en/site-policy/content-removal-policies/dmca-takedown-policy) warnings, please do not include sensitive commercial source code.

## Local Web Interface

We have added a modern, SaaS-like web interface to browse and test these system prompts locally.

### Features
- **Prompt Browser:** Search and filter prompts by provider (OpenAI, Anthropic, xAI, etc.).
- **AI Playground:** Select a prompt and immediately start a chat with an LLM to test its behavior.
- **Secure Key Management:** Enter your OpenAI or Anthropic API keys (stored safely in your browser's local storage).
- **Favorites:** Bookmark prompts for quick access.
- **Dark Mode:** Supports both light and dark themes.

### How to Run
1. Open your terminal in the root of this repository.
2. Navigate to the `ui` directory:
   ```bash
   cd ui
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your web browser.
