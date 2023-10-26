```markdown
# Distributing a TypeScript Node Package

## Prerequisites

Before distributing your TypeScript project as a Node Package on GitHub, ensure that you have the following prerequisites:

- [Node.js](https://nodejs.org/) installed on your development machine.
- A [GitHub](https://github.com/) repository where you want to host your project.

## Step 1: Compile TypeScript to JavaScript

To distribute your project as a Node Package, you need to compile your TypeScript code into JavaScript. Follow these steps:

1. **Install TypeScript**: Ensure TypeScript is installed globally. If not, install it using this command:

   ```bash
   npm install -g typescript
   ```

2. **Create `tsconfig.json`**: Create a `tsconfig.json` file in your project's root directory if you don't have one already. Here's a sample `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "target": "ES6",
       "module": "CommonJS",
       "outDir": "./dist", // Output directory for compiled JavaScript
       "rootDir": "./src"  // Your TypeScript source directory
     }
   }
   ```

3. **Compile TypeScript**: Run the TypeScript compiler with the following command:

   ```bash
   tsc
   ```

   This generates JavaScript files in the specified `outDir` directory.

## Step 2: Create a Node Package

Now, create a Node Package for your project:

1. **Initialize Package**: Use the following command to initialize your package and provide necessary information:

   ```bash
   npm init
   ```

   Follow the prompts to provide information about your package.

2. **Create `.gitignore`**: Create a `.gitignore` file in your project root to exclude unnecessary files from version control. Here's a standard Node.js `.gitignore` template:

   ```
   # Node modules
   /node_modules

   # Compiled JavaScript files
   /dist

   # IDE/Editor specific files
   .vscode
   .idea

   # Other build files
   /build
   ```

3. **Commit Changes**: Commit your changes to your GitHub repository.

## Step 3: Publish to GitHub

To make your package accessible to your team, push it to your GitHub repository:

1. **Add GitHub Remote**: Add your GitHub repository as a remote in your Git configuration:

   ```bash
   git remote add origin https://github.com/Raalnan1/SPCommander
   ```

2. **Push to GitHub**: Push your code to GitHub:

   ```bash
   git push -u origin master
   ```

## Step 4: Installing the Package

Your team members can now install and use your package in their projects:

1. **Add Dependency**: In their project directory, add your package as a dependency in their `package.json` file:

   ```json
   "dependencies": {
     "your-package-name": "github:yourusername/your-repo-name"
   }
   ```

   Replace `"your-package-name"` with your package's name and `"yourusername/your-repo-name"` with the GitHub repository path.

2. **Install Package**: Run the following command to install the package:

   ```bash
   npm install
   ```

## Usage in TypeScript Code

To use your package in TypeScript code, team members can import the modules and classes provided by your package:

```typescript
import { SPListsController } from 'your-package-name';

// Use SPListsController and other exported classes/methods as needed.
```

That's it! Your team can now download and use the compiled JavaScript files from your GitHub repository in their TypeScript projects.
```

This improved Markdown document provides better readability and clarity through section headings, numbered steps, code blocks, and consistent formatting.