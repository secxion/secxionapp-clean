# Task: Pre-Launch Audit & Optimization

- [x] Project Cleanup
    - [x] Delete `backups/` directory
    - [x] Delete `.tmp/` directory
    - [x] Identify redundant `node_modules` (Found 1.5GB in frontend)
- [x] Security & Quality Audit
    - [x] Scan for exposed secrets/API keys (Found `REACT_APP_DEV_AUTH_BYPASS` in `.env.local`)
    - [x] Check for `console.log` and `debugger` in production code (Minimal logs found)
    - [x] Review environment variable usage
- [x] Frontend Optimization
    - [x] Asset audit (Large/Duplicate images in `frontend/src/gcl`)
    - [x] Architecture review (App.js and Providers are efficient)
    - [x] Remove unused dependency `react-hot-toast`
- [ ] Final Verification
    - [ ] Run `npm audit` for dependencies
    - [ ] Verify build integrity
