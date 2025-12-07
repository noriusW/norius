# norius // visit

Personal landing page inspired by Hyprland & Unixporn aesthetics.
Features AMOLED dark theme, glassmorphism, starfield animation, and Discord/Lanyard integration.

## 🚀 How to Deploy to GitHub Pages

1.  **Create a Repository:**
    *   Go to [GitHub.com](https://github.com) and create a new public repository (e.g., `visit` or `yourname.github.io`).

2.  **Push Files:**
    *   Initialize git in this folder:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
        git push -u origin main
        ```

3.  **Enable Pages:**
    *   Go to your repository **Settings** -> **Pages**.
    *   Under **Build and deployment** -> **Source**, select `Deploy from a branch`.
    *   Select **Branch:** `main` and folder `/(root)`.
    *   Click **Save**.

4.  **Done!**
    *   Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

## 🛠 Configuration

*   **Discord ID:** Edit `script.js` line 124 (`const DISCORD_ID = '...'`) to change the user.
*   **Images:** Favicon is located at `favicon.png`.

## 📦 Credits

*   Font: [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
*   Icons: [FontAwesome](https://fontawesome.com/)
*   API: [Lanyard](https://github.com/Phineas/lanyard/)
