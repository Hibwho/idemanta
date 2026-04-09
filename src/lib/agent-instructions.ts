// ~/idemanta/src/lib/agent-instructions.ts

export function generateAgentClaudeMd(config: {
  agentName: string;
  agentRole: string;
  speciality: string;
  projectName: string;
  boardPath: string;
  planPath: string;
}): string {
  return `# ${config.projectName} — Agent Instructions

## Your Identity
- **Name:** ${config.agentName}
- **Role:** ${config.agentRole}
- **Speciality:** ${config.speciality}

## Workflow

You are part of a multi-agent team. An orchestrator assigns you tasks via the board file.

### Board File: \`${config.boardPath}\`

The board tracks all tasks and their status. When you receive a task instruction:

1. **Read the plan** at \`${config.planPath}\` for full task details
2. **Implement the task** following the plan exactly — files to create, code to write, tests to run
3. **Test your work** before marking it done
4. **Update the board** when finished:

\`\`\`python
import json
from pathlib import Path

board_path = Path("${config.boardPath}")
board = json.loads(board_path.read_text())

# Find your task and mark it done
for phase in board["phases"]:
    for task in phase["tasks"]:
        if task["id"] == "YOUR_TASK_ID":
            task["status"] = "done"
            task["completed_at"] = "ISO_TIMESTAMP"

# Find your agent entry and set to idle
for agent in board["agents"]:
    if agent["name"] == "${config.agentName}":
        agent["status"] = "idle"
        agent["current_task"] = None

board_path.write_text(json.dumps(board, indent=2))
\`\`\`

5. **Commit your work** with a clear message referencing the task

### Rules
- Only work on tasks assigned to you
- Do NOT modify files outside your task's scope
- Do NOT communicate with other agents — use the board only
- If blocked, update your task status to "blocked" in board.json
- Stay focused on your speciality: ${config.speciality}
`;
}
