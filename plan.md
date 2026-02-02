# Remove Barrel Exports (index.ts) Migration Plan

## Overview

This plan documents the migration from barrel export pattern (index.ts files) to direct file imports across all modules in `packages/core`. This improves build performance, tree-shaking, and makes dependencies more explicit.

## Current State

There are **35+ barrel files** across the modules:

### Module-Level Barrels (7)
- `modules/identity/index.ts`
- `modules/workspace/index.ts`
- `modules/project/index.ts`
- `modules/member/index.ts`
- `modules/invitation/index.ts`
- `modules/integration/index.ts`
- `modules/time/index.ts`

### Sub-Directory Barrels (30+)
Each module has nested barrels in:
- `domain/index.ts` - Domain models and errors
- `repositories/index.ts` - Repository implementations
- `actions/index.ts` - Action implementations
- Sub-action directories (e.g., `actions/user/index.ts`)

### Import Patterns to Replace

**Current (barrel imports):**
```typescript
import { IdentityModuleService } from "~/modules/identity";
import { Workspace, WorkspaceModuleService } from "~/modules/workspace";
import { ProjectModuleService, Task } from "~/modules/project";
import { MemberModuleService } from "~/modules/member";
import { InvitationModuleService } from "~/modules/invitation";
import { IntegrationModuleService } from "~/modules/integration";
```

**Target (direct imports):**
```typescript
import { IdentityModuleService } from "~/modules/identity/identity-module";
import { Workspace } from "~/modules/workspace/domain/workspace.model";
import { WorkspaceModuleService } from "~/modules/workspace/workspace-module.service";
import { ProjectModuleService } from "~/modules/project/project-module.service";
import { Task } from "~/modules/project/domain/task.model";
import { MemberModuleService } from "~/modules/member/member-module.service";
import { InvitationModuleService } from "~/modules/invitation/invitation-module.service";
import { IntegrationModuleService } from "~/modules/integration/integration-module.service";
```

## Benefits

1. **Better Build Performance** - No need to traverse barrel files
2. **Improved Tree-Shaking** - Direct imports enable better dead code elimination
3. **Circular Dependency Prevention** - Easier to spot and prevent circular imports
4. **Clearer Dependencies** - You see exactly which file provides each import
5. **Faster IDE Performance** - Less file resolution overhead
6. **Explicit Module Boundaries** - Forces conscious decisions about public API

## Migration Strategy

### Phase 1: Identity Module (Focus Area)

Start with identity module as the priority area.

#### Files to Update

**Barrels to Remove:**
1. `modules/identity/index.ts` (main barrel)
2. `modules/identity/domain/index.ts`
3. `modules/identity/repositories/index.ts`
4. `modules/identity/actions/index.ts`
5. `modules/identity/actions/user/index.ts`
6. `modules/identity/actions/session/index.ts`

**Files Importing from Identity:**
- `flows/workspace/create.ts`
- `flows/workspace/set-active-workspace.ts`
- `flows/workspace-invitation/create.ts`
- `flows/workspace-invitation/accept.ts`
- `shared/auth/index.ts`
- `infra/email/index.ts`

#### Identity Module Structure

```
modules/identity/
├── identity-module.ts          # Export IdentityModuleService
├── errors.ts                   # Export error classes
├── domain/
│   ├── user.model.ts           # Export User class
│   └── session.model.ts        # Export Session class
├── repositories/
│   ├── user.repo.ts            # Export UserRepository
│   └── session.repo.ts         # Export SessionRepository
└── actions/
    ├── user/
    │   ├── create.ts           # Export CreateUserAction
    │   ├── patch.ts            # Export PatchUserAction
    │   └── retrieve.ts         # Export RetrieveUserAction
    └── session/
        └── set-active-workspace.ts  # Export SetActiveWorkspaceAction
```

### Phase 2: Remaining Modules

After identity module is complete, apply the same pattern to:

1. **workspace** module
2. **project** module
3. **member** module
4. **invitation** module
5. **integration** module
6. **time** module

### Phase 3: Clean Up

1. Delete all index.ts barrel files
2. Update tsconfig.json if needed (path aliases)
3. Run full test suite
4. Update documentation

## Implementation Steps (Per Module)

### Step 1: Identify All Barrel Exports
```bash
# Find all index.ts files in modules
glob "**/modules/**/index.ts"

# Find all imports using barrel pattern
grep -r "from \"~/modules/\w+\"" --include="*.ts"
```

### Step 2: Create Direct Import Map

For each barrel, document what it exports and the direct import path:

| Barrel File | Current Export | Direct Import Path |
|------------|----------------|-------------------|
| `identity/index.ts` | `IdentityModuleService` | `~/modules/identity/identity-module` |
| `identity/index.ts` | `User`, `Session` | `~/modules/identity/domain/user.model`, `~/modules/identity/domain/session.model` |
| `identity/index.ts` | `UserRepository`, `SessionRepository` | `~/modules/identity/repositories/user.repo`, `~/modules/identity/repositories/session.repo` |
| `identity/index.ts` | Error classes | `~/modules/identity/errors` |

### Step 3: Update Import Statements

Replace all barrel imports with direct imports in:
- Flow files (`flows/**/*.ts`)
- API files (`api/**/*.ts`)
- Shared files (`shared/**/*.ts`)
- Infrastructure files (`infra/**/*.ts`)

**Example Migration:**

```typescript
// BEFORE (barrel import)
import { IdentityModuleService, User, Session } from "~/modules/identity";

// AFTER (direct imports)
import { IdentityModuleService } from "~/modules/identity/identity-module";
import { User } from "~/modules/identity/domain/user.model";
import { Session } from "~/modules/identity/domain/session.model";
```

### Step 4: Remove Barrel Files

After all imports are updated, delete the index.ts files:

```bash
rm modules/identity/index.ts
rm modules/identity/domain/index.ts
rm modules/identity/repositories/index.ts
rm modules/identity/actions/index.ts
# ... etc
```

### Step 5: Verify

Run the verification commands:

```bash
# Check for any remaining barrel imports
grep -r "from \"~/modules/\w+\"" --include="*.ts"

# Should return no results

# Run typecheck
turbo typecheck

# Run lint
turbo lint

# Run tests
bun test
```

## Import Path Convention

### Standard Pattern

```typescript
// Domain models
import { User } from "~/modules/identity/domain/user.model";
import { Session } from "~/modules/identity/domain/session.model";

// Services
import { IdentityModuleService } from "~/modules/identity/identity-module";

// Repositories
import { UserRepository } from "~/modules/identity/repositories/user.repo";
import { SessionRepository } from "~/modules/identity/repositories/session.repo";

// Actions
import { CreateUserAction } from "~/modules/identity/actions/user/create";
import { PatchUserAction } from "~/modules/identity/actions/user/patch";
import { RetrieveUserAction } from "~/modules/identity/actions/user/retrieve";

// Errors
import { UserNotFoundError } from "~/modules/identity/errors";
```

### Path Alias Rules

1. **Always use `~/` prefix** for internal imports
2. **Domain models**: `~/modules/{module}/domain/{file}`
3. **Services**: `~/modules/{module}/{module}-module.service`
4. **Repositories**: `~/modules/{module}/repositories/{file}`
5. **Actions**: `~/modules/{module}/actions/{subfolder}/{file}`
6. **Errors**: `~/modules/{module}/errors` (single file, not barrel)

## Files Affected by Identity Module Migration

### Files Importing from `~/modules/identity`

1. `flows/workspace/create.ts`
   - `IdentityModuleService`

2. `flows/workspace/set-active-workspace.ts`
   - `IdentityModuleService`

3. `flows/workspace-invitation/create.ts`
   - `IdentityModuleService`

4. `flows/workspace-invitation/accept.ts`
   - `IdentityModuleService`

5. `shared/auth/index.ts`
   - Types: `Session`, `User`

6. `infra/email/index.ts`
   - Type: `User`

### Identity Module Barrel Files to Remove

1. `modules/identity/index.ts`
2. `modules/identity/domain/index.ts`
3. `modules/identity/repositories/index.ts`
4. `modules/identity/actions/index.ts`
5. `modules/identity/actions/user/index.ts`
6. `modules/identity/actions/session/index.ts`

## Verification Checklist

- [ ] All imports from `~/modules/identity` replaced with direct imports
- [ ] All identity barrel files removed
- [ ] No remaining `from "~/modules/\w+"` patterns (except for other modules)
- [ ] `turbo typecheck` passes
- [ ] `turbo lint` passes
- [ ] All tests pass
- [ ] Application builds successfully
- [ ] No runtime errors

## Notes

### Special Cases

1. **Error Files**: Most modules have a single `errors.ts` file that can still be imported directly (e.g., `~/modules/identity/errors`). This is NOT a barrel file - it's a single source file.

2. **Actions with Multiple Exports**: Action files may export multiple items (main action + types). Keep these in the same file and import directly:
   ```typescript
   import {
     CreateUserAction,
     CreateUserInput,
     CreateUserOutput,
   } from "~/modules/identity/actions/user/create";
   ```

3. **Model Files**: Model files (e.g., `user.model.ts`) may export:
   - The model class
   - Create/patch input schemas
   - Related types
   
   Import everything needed from the single file.

### IDE Support

Configure your IDE to:
- Auto-import from direct paths (not barrels)
- Show import path suggestions
- Organize imports on save

VS Code settings:
```json
{
  "typescript.preferences.autoImportFileExcludePatterns": [
    "**/index.ts"
  ],
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (Identity Module)
3. Apply learnings to Phase 2 (Remaining Modules)
4. Finalize with Phase 3 (Clean Up)
