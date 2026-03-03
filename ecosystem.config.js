// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "Naijailoaded",
            cwd: "./server",
            script: "pnpm",
            args: "./dist/app.js", // or your entry file like "app.js"
            interpreter: "none", // important when calling pnpm/npm directly
            env: {
                NODE_ENV: "production",
            },
            // THE FIXES:
            exp_backoff_restart_delay: 100, // Wait 100ms, then 200ms, etc.
            max_restarts: 50,               // Be more persistent
            min_uptime: "10s",              // Only count as 'stable' after 10s
            max_memory_restart: "500M"      // Kill & restart if it leaks memory
        }
    ]
}