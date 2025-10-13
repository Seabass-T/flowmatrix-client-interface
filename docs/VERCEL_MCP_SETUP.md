# Vercel MCP Server Installation & Configuration Guide

**Complete step-by-step guide to install and configure the Vercel MCP (Model Context Protocol) server for Claude Code.**

## What is Vercel MCP?

The Vercel MCP server enables Claude Code to interact directly with your Vercel deployments, allowing you to:
- View deployment status and logs
- Manage environment variables
- Check build information
- Monitor domain configurations
- Access project settings
- View analytics and metrics

**Use Cases:**
- Debug production deployment issues
- Check build logs without leaving Claude
- Verify environment variable configurations
- Monitor deployment history
- Quick access to Vercel project information

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed (`node --version`)
- ✅ **npm or pnpm** package manager
- ✅ **Claude Code** installed and configured
- ✅ **Vercel Account** with at least one project deployed
- ✅ **Vercel CLI** access (optional but recommended for testing)

---

## Step 1: Get Your Vercel API Token

### 1.1. Create a Vercel API Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile icon (top right)
3. Select **"Settings"**
4. In the left sidebar, click **"Tokens"**
5. Click **"Create Token"** button
6. Configure the token:
   - **Name:** `Claude Code MCP` (or any descriptive name)
   - **Scope:** Select the scope for the token
     - **Recommended:** Full Access (for all projects)
     - **Alternative:** Specific team/projects only
   - **Expiration:** Choose based on security needs
     - **Recommended:** 90 days (balance security & convenience)
     - **Alternative:** Never (if you trust the environment)
7. Click **"Create"**
8. **IMPORTANT:** Copy the token immediately (you won't see it again!)
   - It looks like: `vercel_abc123def456...` (67 characters)

### 1.2. Secure Your Token

⚠️ **Security Best Practice:**
- Never commit the token to version control
- Don't share the token with anyone
- Store it securely (password manager recommended)
- Regenerate if compromised

---

## Step 2: Install Vercel MCP Server

The Vercel MCP server is installed via npm and runs on-demand when Claude Code needs it.

### 2.1. No Installation Required!

The Vercel MCP server uses `npx` to run on-demand, so you don't need to install it globally. The configuration below will automatically download and run it when needed.

### 2.2. (Optional) Test Vercel CLI

If you want to verify your Vercel token works:

```bash
# Install Vercel CLI globally (optional)
npm i -g vercel

# Login with your token
vercel login

# List your projects to verify access
vercel list
```

---

## Step 3: Configure Claude Code

### 3.1. Locate Your Config File

Claude Code stores MCP server configurations in:

```
~/.config/claude/config.json
```

**Platform-specific paths:**
- **macOS:** `~/.config/claude/config.json`
- **Linux:** `~/.config/claude/config.json`
- **Windows:** `%USERPROFILE%\.config\claude\config.json`

### 3.2. Create/Edit Config File

If the file doesn't exist, create it:

```bash
# macOS/Linux
mkdir -p ~/.config/claude
touch ~/.config/claude/config.json

# Windows (PowerShell)
New-Item -Path "$env:USERPROFILE\.config\claude" -ItemType Directory -Force
New-Item -Path "$env:USERPROFILE\.config\claude\config.json" -ItemType File
```

### 3.3. Add Vercel MCP Configuration

Edit `~/.config/claude/config.json` and add the Vercel MCP server:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-vercel"],
      "env": {
        "VERCEL_API_TOKEN": "your_vercel_token_here"
      }
    }
  }
}
```

**Replace `your_vercel_token_here` with your actual Vercel API token from Step 1.**

### 3.4. Example with Multiple MCP Servers

If you already have other MCP servers configured (like PostgreSQL), your config will look like:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "enhanced-postgres-mcp-server"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:password@host:5432/db"
      }
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-vercel"],
      "env": {
        "VERCEL_API_TOKEN": "vercel_abc123def456..."
      }
    }
  }
}
```

### 3.5. Verify JSON Syntax

**IMPORTANT:** Make sure your JSON is valid (no trailing commas, proper quotes).

Use a JSON validator if needed:
```bash
# macOS/Linux
cat ~/.config/claude/config.json | python -m json.tool

# Or online: https://jsonlint.com/
```

---

## Step 4: Restart Claude Code

After editing the config file, restart Claude Code to load the new MCP server:

1. **Quit Claude Code completely** (Cmd+Q on macOS, Alt+F4 on Windows)
2. **Reopen Claude Code**
3. Wait for MCP servers to initialize (usually 2-3 seconds)

---

## Step 5: Verify Installation

### 5.1. Check MCP Server Status

In Claude Code, you can verify the Vercel MCP server is connected:

1. Open Claude Code
2. Look for MCP server status in the UI (usually bottom-left or settings)
3. You should see `vercel` listed as connected

### 5.2. Test Basic Commands

Try asking Claude:

**Basic Information:**
```
"List my Vercel projects"
"Show me recent deployments"
"What's the status of my latest deployment?"
```

**Project-Specific:**
```
"Get deployment logs for flowmatrix-client-interface"
"Show me environment variables for my production deployment"
"What domains are configured for my project?"
```

**Build & Performance:**
```
"Show me the build logs for the latest deployment"
"What's the build time for recent deployments?"
"Are there any failed deployments?"
```

---

## Step 6: Common Usage Patterns

### Debugging Production Issues

**Scenario:** Your app works locally but fails in production.

**Commands:**
```
"Show me the latest deployment logs for [project-name]"
"What environment variables are set in production?"
"Get the build logs for the failed deployment"
"Compare environment variables between preview and production"
```

### Monitoring Deployments

**Scenario:** You want to track deployment status after pushing code.

**Commands:**
```
"Show me all deployments from the last 24 hours"
"What's the status of the deployment for commit [hash]?"
"Get the deployment URL for the latest preview"
```

### Environment Variable Management

**Scenario:** You need to verify or update environment variables.

**Commands:**
```
"List all environment variables for production"
"Is NEXT_PUBLIC_SUPABASE_URL set in production?"
"What's the value of API_KEY in preview environment?"
```

**Note:** The Vercel MCP can read environment variables but cannot modify them (security feature).

### Domain & Configuration

**Scenario:** You need to check domain settings or project configuration.

**Commands:**
```
"What domains are configured for my project?"
"Show me the project settings"
"What framework is detected for my project?"
```

---

## Troubleshooting

### Issue: "Vercel MCP server not responding"

**Possible Causes:**
1. Invalid API token
2. Network connectivity issues
3. npx permission issues

**Solutions:**
```bash
# 1. Verify token is valid
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v9/projects

# 2. Check npx permissions
npx @modelcontextprotocol/server-vercel --version

# 3. Clear npm cache
npm cache clean --force

# 4. Restart Claude Code
```

### Issue: "Unauthorized" or "403 Forbidden"

**Cause:** API token is invalid or expired.

**Solution:**
1. Go to Vercel Dashboard → Settings → Tokens
2. Regenerate the token
3. Update `~/.config/claude/config.json` with new token
4. Restart Claude Code

### Issue: "Cannot find module '@modelcontextprotocol/server-vercel'"

**Cause:** npx failed to download the package.

**Solution:**
```bash
# Manually install globally (optional)
npm i -g @modelcontextprotocol/server-vercel

# Or clear npm cache and retry
npm cache clean --force
```

### Issue: Config file changes not taking effect

**Solution:**
1. Verify JSON syntax is valid
2. Completely quit Claude Code (Cmd+Q, not just close window)
3. Reopen Claude Code
4. Check MCP server status

### Issue: "Rate limit exceeded"

**Cause:** Too many API requests to Vercel.

**Solution:**
- Wait 60 seconds before retrying
- Avoid rapid-fire commands
- Consider upgrading Vercel plan if hitting limits frequently

---

## Advanced Configuration

### Custom Configuration Options

The Vercel MCP server supports additional configuration:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-vercel"],
      "env": {
        "VERCEL_API_TOKEN": "vercel_abc123...",
        "VERCEL_TEAM_ID": "team_abc123..."  // Optional: Specific team
      }
    }
  }
}
```

### Team-Specific Access

If you work with multiple Vercel teams:

1. Get your team ID from Vercel Dashboard URL:
   - `https://vercel.com/[team-slug]/...` → Use team slug
2. Add `VERCEL_TEAM_ID` to the config
3. This limits Claude to only that team's projects

### Using with Local Vercel Projects

If you want Claude to access local project metadata:

```bash
# In your project directory
vercel link

# This creates .vercel/project.json with project ID
# Claude can then reference this when you mention the project
```

---

## Security Best Practices

### 1. Token Scoping

**Recommended:** Create project-specific tokens if working on sensitive projects:
- Dashboard → Project Settings → Tokens
- Create token with read-only access
- Use this token in Claude config

### 2. Token Rotation

**Best Practice:** Rotate tokens regularly:
- Set token expiration to 90 days
- Create a reminder to regenerate
- Update config before expiration

### 3. Environment Isolation

**Important:** Never expose production tokens in shared environments:
- Use separate tokens for dev/prod
- Don't commit config.json to version control
- Use environment-specific tokens

### 4. Audit Logs

**Monitor Usage:**
- Check Vercel Dashboard → Settings → Audit Log
- Review API token usage periodically
- Revoke suspicious tokens immediately

---

## Integration with FlowMatrix AI Project

### Project-Specific Usage

For the FlowMatrix AI Client Interface project:

**Common Tasks:**
```
"Show me the latest deployment for flowmatrix-client-interface"
"Get the build logs for the production deployment"
"What environment variables are set for NEXT_PUBLIC_SUPABASE_URL?"
"Show me the deployment history from the last week"
"Is the latest deployment successful?"
```

**Debugging Scenarios:**
```
"Compare the production environment variables with my local .env"
"Show me any build warnings or errors"
"What's the build time trend for the last 10 deployments?"
"Get the deployment URL for branch 'feature/payment-integration'"
```

### Recommended Workflow

1. **Before Deploying:**
   ```
   "What's the status of the current production deployment?"
   "Are there any recent failed deployments?"
   ```

2. **After Pushing Code:**
   ```
   "Show me the latest deployment status"
   "Get the preview URL for my latest commit"
   ```

3. **When Issues Occur:**
   ```
   "Show me the error logs from the latest deployment"
   "Compare this deployment with the last successful one"
   "What changed in the build output?"
   ```

---

## Alternative: Using Vercel CLI Directly

If you prefer direct CLI access instead of MCP:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Common commands
vercel list                          # List projects
vercel logs [deployment-url]         # View logs
vercel env ls                        # List env variables
vercel inspect [deployment-url]      # Deployment details
```

**When to use CLI vs MCP:**
- **CLI:** Quick one-off commands, scripting
- **MCP:** Integrated Claude experience, conversational queries

---

## Resources

### Official Documentation
- [Vercel API Docs](https://vercel.com/docs/rest-api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

### Support
- **Vercel Support:** https://vercel.com/support
- **MCP Issues:** https://github.com/modelcontextprotocol/servers
- **Claude Code Feedback:** https://github.com/anthropics/claude-code/issues

### Related MCPs
- **PostgreSQL MCP:** Already configured in this project (see `docs/CLAUDE.md`)
- **GitHub MCP:** For repository management
- **Filesystem MCP:** For local file operations

---

## Summary Checklist

✅ Created Vercel API token with appropriate scope
✅ Copied and securely stored the token
✅ Located Claude config file at `~/.config/claude/config.json`
✅ Added Vercel MCP configuration with valid JSON syntax
✅ Restarted Claude Code completely
✅ Verified MCP server connection
✅ Tested basic commands successfully
✅ Understood security best practices
✅ Bookmarked this guide for future reference

**You're all set!** Claude can now interact with your Vercel deployments directly. 🚀

---

**Questions?** Ask Claude to help you debug any issues with the Vercel MCP setup!
