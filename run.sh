#!/bin/bash
# 1. Choose the right python command (some systems use 'python', others 'python3')
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

VENV_NAME="../venv"

# 2. Create venv if missing
if [ ! -d "$VENV_NAME" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv $VENV_NAME
fi

# 3. Activate and Install
# This works for Git Bash, Linux, and macOS
source $VENV_NAME/Scripts/activate 2>/dev/null || source $VENV_NAME/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    pip install django
fi

# 4. Sync the Database
echo "Running migrations..."
$PYTHON_CMD manage.py migrate

echo "------------------------------------------------"
echo "Setup Complete! To start working, type:"
echo "source $VENV_NAME/bin/activate (Linux/Mac) OR"
echo "source $VENV_NAME/Scripts/activate (Git Bash)"
echo "------------------------------------------------"