import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

export class PortManager {
  private static lockFilePath = path.join(process.cwd(), ".port.lock");

  /**
   * Check if a port is in use
   */
  static async isPortInUse(port: number): Promise<boolean> {
    try {
      if (process.platform === "win32") {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        return stdout.trim().length > 0;
      } else {
        const { stdout } = await execAsync(`lsof -i:${port}`);
        return stdout.trim().length > 0;
      }
    } catch {
      return false;
    }
  }

  /**
   * Kill process using a specific port
   */
  static async killPortProcess(port: number): Promise<void> {
    try {
      if (process.platform === "win32") {
        // Windows
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split("\n");

        const pids = new Set<string>();
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0" && !isNaN(Number(pid))) {
            pids.add(pid);
          }
        }

        for (const pid of pids) {
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`✅ Killed process ${pid} on port ${port}`);
          } catch (error) {
            console.warn(`⚠️  Failed to kill process ${pid}:`, error);
          }
        }
      } else {
        // Linux/Mac
        try {
          await execAsync(`lsof -ti:${port} | xargs kill -9`);
          console.log(`✅ Killed process on port ${port}`);
        } catch {
          // Port might not be in use
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error killing port ${port}:`, error);
    }
  }

  /**
   * Ensure port is available, kill existing process if needed
   */
  static async ensurePortAvailable(port: number): Promise<void> {
    const inUse = await this.isPortInUse(port);

    if (inUse) {
      console.log(`⚠️  Port ${port} is in use. Attempting to free it...`);
      await this.killPortProcess(port);

      // Wait a bit for the port to be released
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify port is now free
      const stillInUse = await this.isPortInUse(port);
      if (stillInUse) {
        throw new Error(
          `Failed to free port ${port}. Please manually kill the process.`,
        );
      }

      console.log(`✅ Port ${port} is now available`);
    }
  }

  /**
   * Create a lock file to prevent multiple instances
   */
  static createLockFile(port: number): void {
    const lockData = {
      pid: process.pid,
      port,
      timestamp: Date.now(),
    };

    fs.writeFileSync(this.lockFilePath, JSON.stringify(lockData, null, 2));
    console.log(`🔒 Created lock file for PID ${process.pid} on port ${port}`);
  }

  /**
   * Remove lock file on process exit
   */
  static setupLockFileCleanup(): void {
    const cleanup = () => {
      if (fs.existsSync(this.lockFilePath)) {
        fs.unlinkSync(this.lockFilePath);
        console.log("🔓 Removed lock file");
      }
    };

    // Clean up on various exit signals
    process.on("exit", cleanup);
    process.on("SIGINT", () => {
      cleanup();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      cleanup();
      process.exit(1);
    });
  }

  /**
   * Check if another instance is running
   */
  static async checkExistingInstance(): Promise<boolean> {
    if (!fs.existsSync(this.lockFilePath)) {
      return false;
    }

    try {
      const lockData = JSON.parse(fs.readFileSync(this.lockFilePath, "utf-8"));
      const { pid, port } = lockData;

      // Check if the process is still running
      if (process.platform === "win32") {
        try {
          await execAsync(`tasklist /FI "PID eq ${pid}" | findstr ${pid}`);
          console.log(
            `⚠️  Found existing instance (PID: ${pid}) on port ${port}`,
          );
          return true;
        } catch {
          // Process not running, remove stale lock file
          fs.unlinkSync(this.lockFilePath);
          return false;
        }
      } else {
        try {
          process.kill(pid, 0); // Check if process exists
          console.log(
            `⚠️  Found existing instance (PID: ${pid}) on port ${port}`,
          );
          return true;
        } catch {
          // Process not running, remove stale lock file
          fs.unlinkSync(this.lockFilePath);
          return false;
        }
      }
    } catch {
      // Invalid lock file, remove it
      fs.unlinkSync(this.lockFilePath);
      return false;
    }
  }
}
