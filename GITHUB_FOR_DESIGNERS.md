# GitHub for UI/UX Designers: No-Code Guide

<div align="center">
  <img src="https://via.placeholder.com/500x150/4A90E2/FFFFFF?text=GitHub+for+Designers" alt="GitHub for Designers" width="500"/>
  <p><em>Working with GitHub without writing a single line of code</em></p>
</div>

## 🤔 What is GitHub (in Plain English)?

GitHub is like a shared digital workspace where all the code for our app lives. Think of it as Google Docs, but for code - it keeps track of all changes, who made them, and when.

<div align="center">
  <img src="https://via.placeholder.com/800x300/F5F5F5/333333" alt="GitHub Explained" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB EXPLAINED                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   REPOSITORY          BRANCHES             PULL REQUESTS        │
│  ┌─────────┐         ┌─────────┐          ┌─────────┐          │
│  │         │         │         │          │         │          │
│  │  The    │         │Different │         │Proposing│          │
│  │ Project │         │Versions  │         │ Changes │          │
│  │  Folder │         │of the App│         │for Review│         │
│  │         │         │         │          │         │          │
│  └─────────┘         └─────────┘          └─────────┘          │
│                                                                 │
│  Like a shared        Like having         Like saying           │
│  Dropbox folder       multiple drafts     "Please review        │
│  for the whole        of the same         my changes            │
│  project              document            before finalizing"    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
  <p><em>GitHub concepts in everyday terms</em></p>
</div>

## 🔄 Your Design Workflow with GitHub

As a designer, you'll interact with GitHub in a few specific ways, but you won't need to use complex commands or write code.

<div align="center">
  <img src="https://via.placeholder.com/800x500/E3F2FD/333333" alt="Designer Workflow" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│             DESIGNER'S GITHUB WORKFLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      │
│  │  1. ACCESS  │      │ 2. MAKE     │      │ 3. SUBMIT   │      │
│  │   PROJECT   │─────►│   CHANGES   │─────►│   CHANGES   │      │
│  │             │      │             │      │             │      │
│  └─────────────┘      └─────────────┘      └─────────────┘      │
│                                                   │             │
│                                                   │             │
│                                                   ▼             │
│                       ┌─────────────┐      ┌─────────────┐      │
│                       │ 5. FINALIZE │      │ 4. REVIEW   │      │
│                       │   CHANGES   │◄─────│   PROCESS   │      │
│                       │             │      │             │      │
│                       └─────────────┘      └─────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
  <p><em>How you'll work with GitHub</em></p>
</div>

## 🚪 Accessing the Project (No Terminal Needed!)

### Option 1: GitHub Codespaces

GitHub Codespaces gives you a complete development environment in your browser - no installation needed!

<div align="center">
  <img src="https://via.placeholder.com/800x300/E8F5E9/333333" alt="Codespaces" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                  USING GITHUB CODESPACES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Go to github.com/yourusername/indaba-care                   │
│                                                                 │
│  2. Look for the green "Code" button                            │
│                                                                 │
│  3. Select "Codespaces" tab                                     │
│                                                                 │
│  4. Click "Create codespace on main"                            │
│                                                                 │
│  5. Wait a minute while it sets up                              │
│                                                                 │
│  6. You're in! The editor will open right in your browser       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
  <p><em>Accessing the project through GitHub Codespaces</em></p>
</div>

### Option 2: Windsurf

Windsurf offers an even more designer-friendly interface with AI assistance.

<div align="center">
  <img src="https://via.placeholder.com/800x300/FFF8E1/333333" alt="Windsurf" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                     USING WINDSURF                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Go to windsurf.app and log in with your account             │
│                                                                 │
│  2. Create a new project from GitHub repository                 │
│                                                                 │
│  3. Enter: yourusername/indaba-care                             │
│                                                                 │
│  4. Windsurf automatically connects to GitHub                   │
│                                                                 │
│  5. You can now edit files with Cascade's help                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
  <p><em>Accessing the project through Windsurf</em></p>
</div>

## 🛤 GitHub Branches: Working on Your Own Version

In GitHub, everyone works on their own "branch" - like having your own copy of the project to experiment with.

<div align="center">
  <img src="https://via.placeholder.com/800x350/F3E5F5/333333" alt="Branches" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKING WITH BRANCHES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│               ┌───────── main branch ─────────────────►         │
│               │                                                 │
│               │                                                 │
│               ├──── your-design-branch ────┐                    │
│               │                            │                    │
│               │                            └─── merge back ───► │
│               │                                                 │
│               └─── another-feature-branch ─────┐                │
│                                                │                │
│                                                └── merge back ─►│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
  <p><em>How branches work</em></p>
</div>

### Creating Your Design Branch

In Windsurf or Codespaces:

1. **Ask Cascade** (in Windsurf):
   ```
   "Can you help me create a new branch called 'design/photo-gallery-update'?"
   ```

2. **Use the UI** (in Codespaces):
   - Look for the branch name (usually "main") in the bottom left corner
   - Click on it and select "Create new branch"
   - Name it with a descriptive prefix like "design/login-screen-update"

## 🎨 Making Design Changes

Once you're on your own branch, you can safely make changes without affecting the main project.

### Finding Files to Edit

Ask Cascade in Windsurf:
```
"Where can I find the photo gallery component?"
```

Or in Codespaces:
- Use the file explorer on the left sidebar
- Navigate to the components and pages folders

### Making Changes

1. **Edit CSS/SCSS files** for styling changes
2. **Edit component files** for layout changes
3. **Edit asset files** to update images and icons

## 📤 Sharing Your Changes on GitHub

When you're happy with your changes, you'll need to "commit" them (save them to GitHub) and create a "pull request" (ask for your changes to be reviewed).

### Committing Changes

In Windsurf, just ask Cascade:
```
"Can you help me commit my changes to GitHub? I've updated the photo gallery design."
```

In Codespaces:
1. Click the "Source Control" icon in the left sidebar (looks like a branch)
2. You'll see a list of changed files
3. Add a message describing your changes
4. Click "Commit"

<div align="center">
  <img src="https://via.placeholder.com/800x300/E8EAF6/333333" alt="Committing" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                       COMMIT MESSAGES                            │
├──────────────────────────────┬──────────────────────────────────┤
│                              │                                  │
│        GOOD EXAMPLES         │         BAD EXAMPLES             │
│                              │                                  │
├──────────────────────────────┼──────────────────────────────────┤
│                              │                                  │
│  "Update photo gallery card  │  "Fixed stuff"                   │
│   design with rounded corners"│                                  │
│                              │  "CSS changes"                   │
│  "Redesign login page with   │                                  │
│   new color scheme and logo" │  "WIP"                           │
│                              │                                  │
│  "Add responsive layout for  │  "Please work"                   │
│   activity cards on mobile"  │                                  │
│                              │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```
  <p><em>How to write good commit messages</em></p>
</div>

### Creating a Pull Request (PR)

A pull request is your way of saying "I've made some changes, please review them and add them to the main project."

In Windsurf:
```
"Can you help me create a pull request for my design changes to the photo gallery?"
```

In Codespaces:
1. After committing, click "Publish Branch"
2. You'll see a prompt to create a pull request
3. Fill in the details about your design changes
4. Submit the PR

<div align="center">
  <img src="https://via.placeholder.com/800x400/FFEBEE/333333" alt="Pull Request" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                     PULL REQUEST TEMPLATE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Title: "Design: Update Photo Gallery Card Layout"              │
│                                                                 │
│  Description:                                                   │
│  -----------------------------------------------------------    │
│  This PR updates the photo gallery cards with:                  │
│                                                                 │
│  - Rounded corners (8px border radius)                          │
│  - Updated color scheme to match our new brand colors           │
│  - Improved responsive layout for mobile devices                │
│  - Added hover effects for better user interaction              │
│                                                                 │
│  Screenshot:                                                    │
│  [Attach before/after screenshots of your design changes]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
  <p><em>Example pull request for design changes</em></p>
</div>

## 👀 The Review Process

After submitting your PR, developers will review your changes.

<div align="center">
  <img src="https://via.placeholder.com/800x300/F1F8E9/333333" alt="Review Process" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                        REVIEW PROCESS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. FEEDBACK                    2. CHANGES                      │
│  ┌───────────────┐              ┌───────────────┐              │
│  │ "The spacing   │              │ "I've updated  │              │
│  │  needs to be   │──────────────►  the spacing   │              │
│  │  adjusted"     │              │  as requested" │              │
│  └───────────────┘              └───────────────┘              │
│          │                               │                      │
│          └───────────────────────────────┘                      │
│                          │                                      │
│                          ▼                                      │
│                  ┌───────────────┐                              │
│                  │  3. APPROVAL  │                              │
│                  │               │                              │
│                  │  "Looks good! │                              │
│                  │   Approved!"  │                              │
│                  └───────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
  <p><em>The review and feedback cycle</em></p>
</div>

### Addressing Feedback

If the reviewers request changes:

1. Go back to your branch in Windsurf or Codespaces
2. Make the requested changes
3. Commit them again with a clear message
4. The PR will automatically update

### When Your PR is Approved

Once approved, your changes will be "merged" into the main project, and everyone will be able to see your design updates in the app.

## 📋 GitHub Glossary for Designers

<div align="center">
  <img src="https://via.placeholder.com/800x450/E0F7FA/333333" alt="GitHub Glossary" width="800"/>
  
```
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB TERMINOLOGY                           │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                   │
│         GITHUB TERM         │       WHAT IT ACTUALLY MEANS      │
│                             │                                   │
├─────────────────────────────┼───────────────────────────────────┤
│                             │                                   │
│  Repository (Repo)          │  The project folder that contains │
│                             │  all the files                    │
│                             │                                   │
│  Branch                     │  Your own working copy where you  │
│                             │  can make changes safely          │
│                             │                                   │
│  Commit                     │  Saving your changes with a       │
│                             │  descriptive message              │
│                             │                                   │
│  Pull Request (PR)          │  Asking for your changes to be    │
│                             │  reviewed and included            │
│                             │                                   │
│  Merge                      │  Combining your changes with      │
│                             │  the main project                 │
│                             │                                   │
│  Clone                      │  Making a copy of the repository  │
│                             │  on your computer                 │
│                             │                                   │
│  Fork                       │  Making your own copy of someone  │
│                             │  else's repository                │
│                             │                                   │
└─────────────────────────────┴───────────────────────────────────┘
```
  <p><em>GitHub terms translated for designers</em></p>
</div>

## 🆘 GitHub Help for Designers

If you get stuck with GitHub:

1. **Ask Cascade** in Windsurf for help with any GitHub tasks
2. **Ask a developer** on the team - they're used to GitHub and can help
3. **Use GitHub's visual interface** rather than trying to use commands
4. **Take screenshots** of any errors you encounter to share with the team

Remember: You don't need to understand all of GitHub to make design changes effectively!

---

<div align="center">
  <p>Created by the Indaba Care Development Team | Last Updated: May 13, 2025</p>
</div>
