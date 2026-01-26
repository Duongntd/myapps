---
name: github-issue-implementation
description: Fetches GitHub issues by issue number or project identifier (e.g., MA-1), analyzes them, breaks them down into actionable deliverables, assigns the issue, updates it with the breakdown, creates a branch, implements the solution, and opens a pull request. Use when the user provides a GitHub issue number, project identifier, or asks to implement a GitHub issue.
---

# GitHub Issue Implementation

## Overview

This skill automates the workflow of:
1. Fetching a GitHub issue by issue number or project identifier (e.g., MA-1)
2. Analyzing the issue content and requirements
3. Breaking it down into actionable deliverables
4. Assigning the issue to the user or agent
5. Updating the issue with the breakdown as a comment
6. Creating a feature branch
7. Creating a structured task list
8. Implementing the solution
9. Committing and pushing changes
10. Creating a pull request

## Workflow

**IMPORTANT**: This workflow requires network access for GitHub API calls. When executing this skill:
- Request network permissions upfront: Use `required_permissions: ['network']` in all tool calls that access GitHub
- This ensures smooth execution without repeated approval prompts
- Network access is needed for fetching issues, searching, assigning, commenting, and creating PRs

### Step 1: Fetch the GitHub Issue

When the user provides an issue identifier (e.g., "#42", "42", or "MA-1"):

1. **Determine the repository**:
   - Check `git remote -v` to get the repository URL
   - Extract owner and repo name (e.g., `owner/repo` from `https://github.com/owner/repo.git`)

2. **Resolve project identifier** (if provided):
   - If identifier matches pattern like "MA-1", "PROJ-123", etc.:
     - **Request network permissions** for API calls (use `required_permissions: ['network']` in tool calls)
     - Search issues using GitHub API: `GET /repos/{owner}/{repo}/issues?state=all&per_page=100`
     - Look for issue title or body containing the project identifier
     - Alternatively, check GitHub Projects API if identifier is a project item
     - If found, extract the actual issue number
   - If no project identifier pattern, treat as direct issue number

3. **Fetch the issue**:
   - **Request network permissions** when making API calls (use `required_permissions: ['network']` in tool calls)
   - Use GitHub API: `https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}`
   - If API fails or no token available, use `mcp_web_fetch` with: `https://github.com/{owner}/{repo}/issues/{issue_number}`
   - Extract: title, body, labels, assignees, comments, issue number (if available)

4. **Display the issue**:
   - Show title, description, labels, and status
   - Highlight any code blocks, checklists, or structured requirements
   - Note the actual issue number if resolved from project identifier

### Step 2: Analyze and Break Down

Analyze the issue content to identify:

- **Core requirements**: What must be implemented
- **Acceptance criteria**: How to verify completion
- **Dependencies**: What needs to be done first
- **Components affected**: Files, modules, or features that need changes
- **Edge cases**: Special scenarios to handle

Break down into deliverables using this structure:

```
Deliverable 1: [Specific task]
- Subtask 1.1: [Actionable item]
- Subtask 1.2: [Actionable item]

Deliverable 2: [Specific task]
- Subtask 2.1: [Actionable item]
```

### Step 3: Assign the Issue

After breaking down the issue, assign it:

1. **Get assignee username**:
   - If user specified an assignee, use that username
   - Otherwise, check if user wants it assigned to them:
     - Get GitHub username from git config: `git config user.name` or `git config github.user`
     - Or use the repository owner if no user config found
   - If user wants agent to "assign to itself", this typically means assigning to the user (agents can't be assigned)

2. **Assign via GitHub API**:
   - **Request network permissions** for API calls (use `required_permissions: ['network']` in tool calls)
   - Use PATCH: `https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}`
   - Body: `{"assignees": ["username"]}`
   - Requires authentication token

3. **Handle assignment failure**:
   - If API assignment fails (no token or permissions), note it but continue
   - User can manually assign later

### Step 4: Update Issue with Breakdown

Post the breakdown as a comment on the issue:

1. **Format the breakdown**:
   - Create a markdown-formatted comment with the breakdown
   - Include clear sections: Overview, Deliverables, Subtasks
   - Use checkboxes for tracking: `- [ ] Task description`

2. **Post comment via GitHub API**:
   - **Request network permissions** for API calls (use `required_permissions: ['network']` in tool calls)
   - Use POST: `https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments`
   - Body: `{"body": "## Implementation Breakdown\n\n[formatted breakdown]"}`
   - Requires authentication token

3. **Comment format example**:
   ```markdown
   ## Implementation Breakdown
   
   ### Overview
   [Brief summary of approach]
   
   ### Deliverables
   
   **Deliverable 1: [Name]**
   - [ ] Subtask 1.1
   - [ ] Subtask 1.2
   
   **Deliverable 2: [Name]**
   - [ ] Subtask 2.1
   ```

4. **Handle comment failure**:
   - If API comment fails, display the breakdown to user
   - User can manually add the comment

### Step 5: Create Feature Branch

Before starting implementation, create a branch:

1. **Generate branch name**:
   - Format: `issue-{issue_number}-{slug}` or `{project_id}-{slug}`
   - Examples: `issue-42-dark-mode-toggle`, `ma-1-theme-switcher`
   - Slug: Convert issue title to lowercase, replace spaces with hyphens, remove special chars
   - Keep under 50 characters total

2. **Create and checkout branch**:
   ```bash
   git checkout -b issue-42-dark-mode-toggle
   ```
   - Ensure starting from latest main/master branch: `git checkout main && git pull`
   - Create branch from main/master

3. **Verify branch creation**:
   - Confirm branch exists: `git branch`
   - Verify clean working directory before starting

### Step 6: Create Task List

Use `todo_write` to create a structured task list:

- Group related tasks under logical deliverables
- Mark dependencies clearly (e.g., "pending" until prerequisite completes)
- Include verification/testing tasks
- Set first task to "in_progress"

### Step 7: Start Implementation

Begin with the first task:

1. **Read relevant files**: Understand current codebase structure
2. **Make changes**: Implement the feature following project conventions
3. **Update todos**: Mark completed tasks, move to next
4. **Continue iteratively**: Work through deliverables systematically
5. **Commit incrementally**: Commit logical units of work with descriptive messages

### Step 8: Commit and Push Changes

After completing implementation:

1. **Review changes**:
   - Check status: `git status`
   - Review diff: `git diff`
   - Ensure all relevant files are included

2. **Stage changes**:
   ```bash
   git add .
   # Or selectively: git add path/to/file1 path/to/file2
   ```

3. **Commit with descriptive message**:
   ```bash
   git commit -m "feat: implement dark mode toggle [MA-1]

   - Add theme state management with Pinia store
   - Create theme toggle component
   - Apply theme styles across components
   - Persist theme preference to localStorage
   
   Closes #42"
   ```
   - Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.
   - Reference issue number: `Closes #42` or `Fixes #42`
   - Include project identifier if applicable: `[MA-1]`

4. **Push branch to remote**:
   ```bash
   git push -u origin issue-42-dark-mode-toggle
   ```
   - Use `-u` to set upstream tracking
   - Handle push failures (e.g., authentication, permissions)

### Step 9: Create Pull Request

After pushing the branch, create a PR:

1. **Prepare PR details**:
   - **Title**: Use issue title or descriptive summary
     - Example: `Add dark mode toggle [MA-1]` or `feat: Add dark mode toggle`
   - **Description**: Include:
     - Summary of changes
     - Reference to issue: `Closes #42` or `Fixes #42`
     - Project identifier: `[MA-1]`
     - Implementation breakdown (can reference the comment)
     - Testing notes
     - Screenshots (if UI changes)

2. **Create PR via GitHub API**:
   - **Request network permissions** for API calls (use `required_permissions: ['network']` in tool calls)
   - Use POST: `https://api.github.com/repos/{owner}/{repo}/pulls`
   - Body: `{"title": "...", "body": "...", "head": "...", "base": "main"}`
   - Requires authentication token
   
   Example API call:
   ```bash
   curl -X POST \
     -H "Authorization: token YOUR_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/{owner}/{repo}/pulls" \
     -d '{
       "title": "Add dark mode toggle [MA-1]",
       "body": "## Summary\n\nImplements dark mode toggle feature...\n\nCloses #42\n\n## Changes\n\n- Add theme state management\n- Create toggle component\n- Apply theme styles\n\n## Testing\n\n- [x] Tested theme switching\n- [x] Verified localStorage persistence",
       "head": "issue-42-dark-mode-toggle",
       "base": "main"
     }'
   ```

3. **PR body template**:
   ```markdown
   ## Summary
   [Brief description of what this PR does]
   
   Closes #[issue_number]
   [Project identifier if applicable]
   
   ## Changes
   - [Change 1]
   - [Change 2]
   - [Change 3]
   
   ## Implementation Details
   [Reference the breakdown comment or add details]
   
   ## Testing
   - [ ] Tested [scenario 1]
   - [ ] Tested [scenario 2]
   - [ ] Verified [requirement]
   
   ## Screenshots (if applicable)
   [Add screenshots for UI changes]
   ```

4. **Link PR to issue**:
   - Use keywords in PR description: `Closes #42`, `Fixes #42`, `Resolves #42`
   - GitHub will automatically link and close the issue when PR is merged

5. **Handle PR creation failure**:
   - If API fails, provide PR URL template:
     - `https://github.com/{owner}/{repo}/compare/main...issue-42-dark-mode-toggle`
   - User can create PR manually via GitHub UI
   - Include prepared title and description for easy copy-paste

## Issue Analysis Guidelines

### Identifying Requirements

Look for:
- **Explicit requirements**: "Add X", "Implement Y", "Fix Z"
- **User stories**: "As a user, I want..."
- **Acceptance criteria**: Checkboxes, "should" statements
- **Technical specs**: API endpoints, data structures, UI components
- **Examples**: Code snippets, mockups, references

### Breaking Down Complex Issues

For large issues:
- **Phase 1**: Core functionality (MVP)
- **Phase 2**: Enhancements and polish
- **Phase 3**: Edge cases and error handling

For feature requests:
- **Backend**: Data models, API endpoints, business logic
- **Frontend**: UI components, state management, routing
- **Integration**: Connect frontend to backend
- **Testing**: Unit tests, integration tests

### Dependencies

Identify and order tasks by:
- **Prerequisites**: What must exist first (e.g., data model before API)
- **Logical flow**: Natural progression (e.g., create before update)
- **Risk**: High-risk items first to catch issues early

## Implementation Best Practices

### Code Quality

- Follow existing project patterns and conventions
- Maintain consistency with codebase style
- Add appropriate comments for complex logic
- Update related documentation

### Testing

- Add tests for new functionality
- Verify edge cases mentioned in issue
- Test integration points

### Documentation

- Update README if user-facing features change
- Add code comments for complex logic
- Update API docs if endpoints change

## Example Workflow

**User input**: "Implement MA-1" or "Implement issue #42"

**Step 1**: Fetch issue from GitHub
- If "MA-1" provided, search for issue containing "MA-1" in title/body
- Found: Issue #42 contains "MA-1" identifier
```
Issue #42: Add dark mode toggle [MA-1]
Description: Users should be able to switch between light and dark themes...
Labels: enhancement, frontend
```

**Step 2**: Break down
```
Deliverable 1: Theme state management
- Add theme store/context
- Persist preference to localStorage

Deliverable 2: UI toggle component
- Create theme toggle button
- Add to header/settings

Deliverable 3: Apply theme styles
- Update CSS variables
- Ensure all components respect theme
```

**Step 3**: Assign issue to user (or specified assignee)

**Step 4**: Post breakdown comment to issue #42

**Step 5**: Create branch `issue-42-dark-mode-toggle`

**Step 6**: Create todos and start implementation

**Step 7**: Implement features, commit incrementally

**Step 8**: Push branch: `git push -u origin issue-42-dark-mode-toggle`

**Step 9**: Create PR with title "Add dark mode toggle [MA-1]" linking to issue #42

## Error Handling

If issue fetch fails:
- Check if issue number is valid
- Verify repository access
- Try alternative fetch method (web vs API)

If breakdown is unclear:
- Ask user for clarification on ambiguous requirements
- Make reasonable assumptions and note them
- Proceed with best-effort breakdown

## Notes

### Network Permissions

**IMPORTANT**: All GitHub API calls require network permissions. When making API calls:
- Always use `required_permissions: ['network']` in tool calls that fetch from GitHub
- This allows the agent to make network requests without asking for approval each time
- Network permissions are needed for:
  - Fetching issues
  - Searching for project identifiers
  - Assigning issues
  - Posting comments
  - Creating pull requests

### Authentication

- GitHub API requires authentication for private repos (use `GITHUB_TOKEN` env var if available)
- For public repos, API works without auth but has rate limits
- Web fetch works for public repos but may need parsing
- Always verify the issue is still open/valid before starting work

### Other Notes

- Project identifiers (MA-1, PROJ-123, etc.) are searched in issue titles and bodies
- Assignment, commenting, and PR creation require GitHub API authentication
- If API operations fail, continue with local workflow and inform user
- Branch names should be descriptive and reference the issue number
- Use conventional commit messages for better project history
- PR descriptions should reference the issue to auto-close on merge