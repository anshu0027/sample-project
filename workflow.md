# Policy Versioning Implementation Workflow

## 1. Database Structure
- Already have `PolicyVersion` entity with:
  - id
  - policyId (relation to Policy)
  - data (JSON field)
  - createdAt

## 2. Backend Implementation
### A. Policy Update Route
1. Before updating policy:
   - Create snapshot of current policy data including all relations
   - Save snapshot to PolicyVersion table
   - Cap versions at 10 (delete oldest if limit reached)

### B. Policy Version Routes
1. GET `/policies/:id/versions`
   - Fetch all versions for a policy
   - Return versions sorted by createdAt DESC

2. GET `/policies/:id/versions/:versionId`
   - Fetch specific version data
   - Return complete policy data from version

## 3. Frontend Implementation
### A. Edit Policy Page
1. Add Versions Button:
   - Add button next to Save
   - Show versions dropdown on click
   - List versions with dates

2. Version Selection:
   - On version select, fetch version data
   - Repopulate all form fields
   - Update UI to show "Restored from version"

### B. Form Components
1. Update Step1Form, Step2Form, Step3Form:
   - Add isRestored prop
   - Show restoration notice if true
   - Handle version data population

## 4. Implementation Order
1. Uncomment and update versioning logic in policy.routes.ts
2. Add version endpoints
3. Update frontend to handle versions
4. Add version UI components
5. Test version creation and restoration

## 5. Testing Points
1. Version creation on policy update
2. Version limit enforcement
3. Version data accuracy
4. Form population from version
5. UI/UX for version selection 