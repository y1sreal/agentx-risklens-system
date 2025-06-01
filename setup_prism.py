#!/usr/bin/env python3
"""
PRISM Setup Script
Automates the setup of the PRISM backend with real data and logic
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description, cwd=None):
    """Run a command and handle errors"""
    print(f"\n🚀 {description}")
    print(f"Running: {command}")
    
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True,
            cwd=cwd
        )
        print("✅ Success!")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is 3.8+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def setup_backend():
    """Set up the backend environment"""
    print("\n📦 Setting up PRISM backend...")
    
    backend_dir = Path("backend")
    
    # Install Python dependencies
    if not run_command(
        "pip install -r requirements.txt",
        "Installing Python dependencies",
        cwd=backend_dir
    ):
        return False
    
    # Run database migration
    if not run_command(
        "python ../database_migration.py",
        "Running PRISM data migration",
        cwd=backend_dir
    ):
        print("⚠️  Migration failed. Checking if data files exist...")
        prism_data_path = Path("PRISM/AgentX-feature-AIEthics/AIAAIC_ProdHunt_IRR_100.csv")
        if not prism_data_path.exists():
            print(f"❌ PRISM data file not found at: {prism_data_path}")
            print("Please ensure the PRISM folder contains the required CSV data files.")
            return False
        return False
    
    return True

def setup_frontend():
    """Set up the frontend environment"""
    print("\n🎨 Setting up frontend...")
    
    frontend_dir = Path("frontend")
    
    # Check if node_modules exists
    if not (frontend_dir / "node_modules").exists():
        if not run_command(
            "npm install",
            "Installing Node.js dependencies",
            cwd=frontend_dir
        ):
            return False
    else:
        print("✅ Node.js dependencies already installed")
    
    return True

def verify_prism_data():
    """Verify PRISM data files exist"""
    print("\n🔍 Verifying PRISM data files...")
    
    required_files = [
        "PRISM/AgentX-feature-AIEthics/AIAAIC_ProdHunt_IRR_100.csv",
        "PRISM/AgentX-feature-AIEthics/requirements.txt",
        "PRISM/AgentX-feature-AIEthics/README.md"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
        else:
            print(f"✅ Found: {file_path}")
    
    if missing_files:
        print("\n❌ Missing PRISM data files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    print("✅ All PRISM data files found!")
    return True

def start_services():
    """Start the backend and frontend services"""
    print("\n🚀 Starting services...")
    
    print("To start the backend server:")
    print("  cd backend")
    print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    print("\nTo start the frontend development server:")
    print("  cd frontend")
    print("  npm start")
    
    print("\n🌐 After starting both servers:")
    print("  - Backend API: http://localhost:8000")
    print("  - Frontend App: http://localhost:3000")
    print("  - API Documentation: http://localhost:8000/docs")

def main():
    """Main setup function"""
    print("🔬 PRISM AI Ethics System Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Verify PRISM data
    if not verify_prism_data():
        print("\n💡 Please ensure the PRISM folder contains all required data files.")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed!")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed!")
        sys.exit(1)
    
    print("\n🎉 PRISM setup completed successfully!")
    print("\nWhat was set up:")
    print("✅ Backend dependencies installed")
    print("✅ PRISM data migrated to database")
    print("✅ Real PRISM scoring logic integrated")
    print("✅ Frontend dependencies installed")
    print("✅ API endpoints updated with real logic")
    
    start_services()

if __name__ == "__main__":
    main() 