#!/usr/bin/env python3
"""
Pre-flight check for AI Recruitment & HR Dashboard
Validates that everything is configured correctly before starting.
"""

import sys
import os
from pathlib import Path


def check_prerequisites():
    """Check that required tools are installed"""
    print("=" * 60)
    print("PRE-FLIGHT CHECK")
    print("=" * 60)
    print()

    checks = {
        "python": "Python 3.11+",
        "node": "Node.js 20+",
        "ollama": "Ollama",
    }

    all_ok = True
    for cmd, name in checks.items():
        import shutil

        if shutil.which(cmd):
            print(f"  [OK] {name}")
        else:
            print(f"  [FAIL] {name} - NOT FOUND")
            all_ok = False

    return all_ok


def check_backend():
    """Check backend configuration"""
    print()
    print("BACKEND CHECKS:")

    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("  [FAIL] backend/ directory not found")
        return False

    # Check requirements.txt exists
    req_file = backend_dir / "requirements.txt"
    if req_file.exists():
        print("  [OK] requirements.txt found")
    else:
        print("  [FAIL] requirements.txt missing")
        return False

    # Check main.py exists
    main_file = backend_dir / "main.py"
    if main_file.exists():
        print("  [OK] main.py found")
    else:
        print("  [FAIL] main.py missing")
        return False

    # Check if venv exists
    venv_dir = backend_dir / "venv"
    if venv_dir.exists():
        print("  [OK] Virtual environment exists")

        # Try to check if key packages are installed
        try:
            import subprocess

            pip_cmd = str(venv_dir / "Scripts" / "python.exe")
            result = subprocess.run(
                [pip_cmd, "-c", "import fastapi; print('fastapi OK')"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode == 0:
                print("  [OK] Key dependencies installed")
            else:
                print("  [WARN] Dependencies may need installation")
        except:
            print("  [WARN] Could not verify dependencies")
    else:
        print("  [INFO] Virtual environment will be created on first run")

    return True


def check_frontend():
    """Check frontend configuration"""
    print()
    print("FRONTEND CHECKS:")

    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("  [FAIL] frontend/ directory not found")
        return False

    # Check package.json
    pkg_file = frontend_dir / "package.json"
    if pkg_file.exists():
        print("  [OK] package.json found")
    else:
        print("  [FAIL] package.json missing")
        return False

    # Check node_modules
    node_modules = frontend_dir / "node_modules"
    if node_modules.exists():
        print("  [OK] node_modules installed")
    else:
        print("  [INFO] Dependencies will be installed on first run")

    # Check next.config.js
    next_config = frontend_dir / "next.config.js"
    if next_config.exists():
        print("  [OK] next.config.js found")
    else:
        print("  [WARN] next.config.js missing")

    return True


def check_environment():
    """Check environment configuration"""
    print()
    print("ENVIRONMENT CHECKS:")

    env_file = Path(".env")
    env_example = Path(".env.example")

    if env_file.exists():
        print("  [OK] .env file exists")
    elif env_example.exists():
        print("  [INFO] .env will be created from .env.example")
    else:
        print("  [FAIL] No .env or .env.example found")
        return False

    # Check data directory
    data_dir = Path("data")
    if data_dir.exists():
        print("  [OK] data/ directory exists")
    else:
        print("  [INFO] data/ directory will be created")

    return True


def check_ollama_model():
    """Check if Ollama is running and model is available"""
    print()
    print("OLLAMA CHECKS:")

    import urllib.request
    import json

    try:
        req = urllib.request.Request("http://localhost:11434/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            models = [m.get("name", "") for m in data.get("models", [])]

            if any("gemma4" in name for name in models):
                print(f"  [OK] Gemma 4 model is available")
                print(f"  [OK] Models found: {', '.join(models[:5])}")
                return True
            else:
                print(f"  [WARN] Gemma 4 model not found")
                print(
                    f"  [INFO] Available models: {', '.join(models[:5]) if models else 'None'}"
                )
                print(f"  [INFO] Run: ollama pull gemma4:latest")
                return True  # Not a failure, just needs pull
    except Exception as e:
        print(f"  [FAIL] Cannot connect to Ollama: {e}")
        print(f"  [INFO] Make sure Ollama is running: ollama serve")
        return False


def main():
    """Run all checks"""
    all_ok = True

    all_ok = check_prerequisites() and all_ok
    all_ok = check_backend() and all_ok
    all_ok = check_frontend() and all_ok
    all_ok = check_environment() and all_ok
    all_ok = check_ollama_model() and all_ok

    print()
    print("=" * 60)
    if all_ok:
        print("RESULT: All critical checks passed!")
        print("You can start the app with: python start-local.py")
    else:
        print("RESULT: Some checks failed. Please fix the issues above.")
    print("=" * 60)
    print()

    return all_ok


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
