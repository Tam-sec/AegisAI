#!/usr/bin/env python3
"""
AI Recruitment & HR Dashboard - Local Launcher
No Docker required. Runs backend and frontend directly.
"""

import subprocess
import sys
import os
import time
import shutil
import webbrowser
from pathlib import Path


def run_command(cmd, cwd=None, capture=False):
    """Run a shell command and return result"""
    print(f"[RUNNING] {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    try:
        if capture:
            result = subprocess.run(
                cmd, shell=True, cwd=cwd, capture_output=True, text=True
            )
            return result
        else:
            subprocess.run(cmd, shell=True, cwd=cwd, check=True)
            return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Command failed: {e}")
        return False


def check_command(cmd):
    """Check if a command exists in PATH"""
    return shutil.which(cmd) is not None


def check_prerequisites():
    """Check that all required tools are installed"""
    print("=" * 50)
    print("AI Recruitment & HR Dashboard - Local Mode")
    print("=" * 50)
    print()

    checks = [
        ("python", "Python 3.11+"),
        ("node", "Node.js 20+"),
        ("ollama", "Ollama"),
    ]

    for cmd, name in checks:
        if check_command(cmd):
            print(f"[OK] {name} found")
        else:
            print(f"[ERROR] {name} is not installed or not in PATH.")
            return False

    return True


def start_ollama():
    """Start Ollama if not running"""
    # Check if Ollama is running
    try:
        import urllib.request

        req = urllib.request.Request("http://localhost:11434/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            print("[OK] Ollama is already running")
            return True
    except:
        print("[STARTING] Ollama...")
        # Start Ollama in background
        if sys.platform == "win32":
            subprocess.Popen(
                ["ollama", "serve"], creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            subprocess.Popen(["ollama", "serve"])

        # Wait for Ollama to be ready
        print("[WAITING] For Ollama to start...")
        for i in range(20):
            time.sleep(1)
            try:
                import urllib.request

                req = urllib.request.Request(
                    "http://localhost:11434/api/tags", method="GET"
                )
                with urllib.request.urlopen(req, timeout=2) as response:
                    print("[OK] Ollama is ready")
                    return True
            except:
                continue

        print("[WARNING] Ollama may not be fully ready yet")
        return True


def check_model():
    """Check if gemma4 model is available, pull if not"""
    print("[CHECKING] For Gemma 4 model...")

    try:
        import urllib.request
        import json

        req = urllib.request.Request("http://localhost:11434/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            models = [m.get("name", "") for m in data.get("models", [])]

            if any("gemma4" in name for name in models):
                print("[OK] Gemma 4 model is available")
                return True
    except Exception as e:
        print(f"[WARNING] Could not check models via API: {e}")

    # Fallback: try ollama list command
    try:
        result = subprocess.run(
            ["ollama", "list"], capture_output=True, text=True, timeout=30
        )
        if "gemma4" in result.stdout:
            print("[OK] Gemma 4 model is available")
            return True
    except:
        pass

    # Model not found, pull it
    print("[PULLING] Gemma 4 model. This may take several minutes...")
    result = run_command("ollama pull gemma4:latest")
    if not result:
        print("[ERROR] Failed to pull gemma4:latest model.")
        return False

    print("[OK] Gemma 4 model pulled successfully")
    return True


def setup_env():
    """Create .env file if it doesn't exist"""
    env_file = Path(".env")
    env_example = Path(".env.example")

    if not env_file.exists():
        if env_example.exists():
            print("[CREATING] .env from .env.example...")
            shutil.copy(env_example, env_file)
            print("[OK] Created .env file. Please review and customize it if needed.")
        else:
            print("[ERROR] .env.example not found.")
            return False

    # Create data directories
    Path("data/uploads").mkdir(parents=True, exist_ok=True)

    return True


def start_backend():
    """Setup and start the backend"""
    print()
    print("[SETTING UP] Backend...")

    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("[ERROR] backend directory not found.")
        return None

    # Create virtual environment if it doesn't exist
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("[CREATING] Python virtual environment...")
        run_command([sys.executable, "-m", "venv", str(venv_dir)], cwd=str(backend_dir))

    # Determine pip path
    if sys.platform == "win32":
        pip_path = venv_dir / "Scripts" / "pip.exe"
        python_path = venv_dir / "Scripts" / "python.exe"
    else:
        pip_path = venv_dir / "bin" / "pip"
        python_path = venv_dir / "bin" / "python"

    # Install dependencies
    print("[INSTALLING] Python dependencies... This may take a few minutes.")
    result = run_command(
        [str(pip_path), "install", "--upgrade", "-r", "requirements.txt"],
        cwd=str(backend_dir),
    )
    if not result:
        print("[ERROR] Failed to install Python dependencies.")
        return None

    # Create database tables
    print("[RUNNING] Database setup...")
    run_command(
        [
            str(python_path),
            "-c",
            "from core.database import Base, engine; Base.metadata.create_all(bind=engine)",
        ],
        cwd=str(backend_dir),
    )

    # Start backend
    print("[STARTING] Backend API on port 8001...")
    backend_cmd = (
        f'"{python_path}" -m uvicorn main:app --reload --port 8001 --host 0.0.0.0'
    )

    if sys.platform == "win32":
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=str(backend_dir),
            creationflags=subprocess.CREATE_NEW_CONSOLE,
        )
    else:
        backend_process = subprocess.Popen(
            backend_cmd, cwd=str(backend_dir), shell=True
        )

    return backend_process


def start_frontend():
    """Setup and start the frontend"""
    print()
    print("[SETTING UP] Frontend...")

    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("[ERROR] frontend directory not found.")
        return None

    # Install dependencies
    print("[INSTALLING] Node.js dependencies... This may take a few minutes.")
    result = run_command("npm install", cwd=str(frontend_dir))
    if not result:
        print("[ERROR] Failed to install Node.js dependencies.")
        return None

    # Start frontend
    print("[STARTING] Frontend on port 3000...")
    frontend_cmd = "npm run dev"

    if sys.platform == "win32":
        frontend_process = subprocess.Popen(
            frontend_cmd,
            cwd=str(frontend_dir),
            creationflags=subprocess.CREATE_NEW_CONSOLE,
            shell=True,
        )
    else:
        frontend_process = subprocess.Popen(
            frontend_cmd, cwd=str(frontend_dir), shell=True
        )

    return frontend_process


def wait_for_backend():
    """Wait for backend to be ready"""
    print()
    print("[WAITING] For backend to initialize...")

    for i in range(15):
        time.sleep(2)
        try:
            import urllib.request

            req = urllib.request.Request(
                "http://localhost:8001/api/health", method="GET"
            )
            with urllib.request.urlopen(req, timeout=2) as response:
                if response.status == 200:
                    print("[OK] Backend is healthy")
                    return True
        except:
            print(f"[WAITING] Backend not ready yet... ({i + 1}/15)")
            continue

    print("[WARNING] Backend health check timed out. It may still be starting...")
    return True


def main():
    """Main entry point"""
    # Check prerequisites
    if not check_prerequisites():
        input("\nPress Enter to exit...")
        sys.exit(1)

    # Start Ollama
    if not start_ollama():
        input("\nPress Enter to exit...")
        sys.exit(1)

    # Check model
    if not check_model():
        input("\nPress Enter to exit...")
        sys.exit(1)

    # Setup environment
    if not setup_env():
        input("\nPress Enter to exit...")
        sys.exit(1)

    # Start backend
    backend_process = start_backend()
    if not backend_process:
        input("\nPress Enter to exit...")
        sys.exit(1)

    # Wait for backend
    wait_for_backend()

    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        input("\nPress Enter to exit...")
        sys.exit(1)

    # Wait a moment for frontend
    time.sleep(5)

    # Show info
    print()
    print("=" * 50)
    print("ALL SERVICES ARE STARTING UP")
    print("=" * 50)
    print()
    print("Frontend:  http://localhost:3000")
    print("Backend:   http://localhost:8001")
    print("API Docs:  http://localhost:8001/docs")
    print()
    print("Default login:")
    print("  Username: admin")
    print("  Password: admin123")
    print()
    print("NOTE: Using SQLite database (data/hr_app.db)")
    print()

    # Ask to open browser
    response = input("Open dashboard in browser? (y/n): ").strip().lower()
    if response in ("y", "yes", ""):
        webbrowser.open("http://localhost:3000")

    print()
    print("Services are running in separate windows.")
    print("Close those windows to stop the services.")
    print()
    input("Press Enter to exit this launcher...")


if __name__ == "__main__":
    main()
