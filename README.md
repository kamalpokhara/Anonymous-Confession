# AnonyConfess 🎭
> **Status: 🚧 Work in Progress (Development Phase)**

AnonyConfess is a privacy-first web application designed for truly anonymous digital expressions. By removing traditional identity markers like email addresses and implementing a Proof-of-Work (PoW) gate, it ensures a bot-free environment without compromising user privacy.

---

## ✨ Key Features (Implemented)

- **Email-less Authentication**: Custom `AbstractUser` model with stripped email requirements to ensure zero contact-data collection.
- **PoW Registration Gate**: A client-side SHA-256 mining mechanism that prevents spam accounts by requiring computational effort before registration.
- **Automated Ghost Identities**: System-generated 16-digit alphanumeric usernames to maintain total anonymity.
- **Bootstrap Automation**: Includes a `run.sh` script for rapid environment setup and dependency management.

---

## 🛠️ Tech Stack

- **Framework**: Django 5.x (Python)
- **Database**: SQLite (Local Development)
- **Security**: SHA-256 Proof-of-Work

---

## ⚙️ Quick Start (For Contributors)

To get this project running on your local machine:

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/kamalpokhara/Anonymous-Confession.git](https://github.com/kamalpokhara/Anonymous-Confession.git)
   cd Anonymous-Confession
