# GaetanAcademy — Plateforme d'Apprentissage IA/Cloud/Defense

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une plateforme web locale de formation gamifiee qui suit le plan de carriere Solutions Architect IA / Defense de Gaetan, avec exercices interactifs, notebooks Jupyter, terminal sandbox Docker, et timeline des certifications.

**Architecture:** Application web full-stack servie localement. Backend FastAPI (Python) avec SQLite pour la persistance. Frontend React + Tailwind (standalone, hors IDEManta). Jupyter intégré via jupyter-server API. Containers Docker jetables pour les exercices pratiques (Linux, Docker, K8s). Exercices definis en YAML/Markdown, importables depuis des repos GitHub.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, SQLite, React 19, TypeScript, Tailwind CSS 4, Vite, Jupyter Server, Docker SDK for Python, xterm.js

---

## Contexte du plan de carriere

Cette plateforme couvre les phases du plan `PLAN_CARRIERE_IA.md` :

| Phase | Periode | Modules |
|-------|---------|---------|
| Phase 1 — Fondations | Mois 1-3 | Linux, Git, Docker, Python/FastAPI, Reseau/Securite |
| Phase 2 — Cloud + Certifs | Mois 3-6 | AWS SAA, Azure AI-102, AWS ML Specialty |
| Phase 3 — Specialisation | Mois 4-9 | MLOps, Fine-tuning LLM, RAG, Kubernetes |
| Projets Portfolio | Continu | RAG Entreprise, Fine-tuning Metier, Infra Securisee |
| Certifications | Jalons | AWS SAA, AI-102, AWS ML, CKA, Security+, Terraform |

---

## Repos GitHub d'exercices integres

| Module | Repo | Description |
|--------|------|-------------|
| Linux | `krother/bash_tutorial` | Exercices bash structures |
| Docker | `collabnix/dockerlabs` | 500+ labs interactifs |
| Git | `eficode-academy/git-katas` | Katas Git progressifs |
| FastAPI | `ChristopherGS/ultimate-fastapi-tutorial` | Tutoriel complet FastAPI |
| Kubernetes | `seifrajhi/Kubernetes-practical-exercises-Hands-on` | Exercices K8s pratiques |
| AWS | `iamrajaram1/100-Days-of-AWS-Cloud` | Plan 100 jours AWS |
| ML | `microsoft/ML-For-Beginners` | 26 lecons ML par Microsoft |
| General | Exercism (exercism.io) | 3100+ challenges multi-langages |

---

## Structure des fichiers

```
~/gaetan-academy/
├── backend/
│   ├── main.py                      # FastAPI app, CORS, startup
│   ├── config.py                    # Settings (DB path, Docker, Jupyter)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                  # Profil, XP, niveau, streak
│   │   ├── module.py                # Module d'apprentissage (Linux, Docker...)
│   │   ├── exercise.py              # Exercice individuel
│   │   ├── progress.py              # Progression par exercice
│   │   ├── badge.py                 # Badges et achievements
│   │   └── certification.py         # Certifications et jalons
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── dashboard.py             # Stats globales, streak, XP
│   │   ├── modules.py               # CRUD modules + listing
│   │   ├── exercises.py             # CRUD exercices + validation
│   │   ├── progress.py              # Progression + gamification
│   │   ├── sandbox.py               # Gestion containers Docker
│   │   ├── notebooks.py             # Proxy Jupyter API
│   │   └── certifications.py        # Timeline certifs
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gamification.py          # Calcul XP, niveaux, badges, streaks
│   │   ├── docker_sandbox.py        # Creation/destruction containers
│   │   ├── jupyter_manager.py       # Demarrage/arret Jupyter server
│   │   ├── exercise_loader.py       # Parse YAML exercices
│   │   └── github_importer.py       # Import exercices depuis GitHub
│   ├── database.py                  # SQLAlchemy engine + session
│   ├── seed_data/
│   │   ├── modules.yaml             # Modules du plan de carriere
│   │   ├── exercises/
│   │   │   ├── linux_basics.yaml    # Exercices Linux
│   │   │   ├── docker_basics.yaml   # Exercices Docker
│   │   │   ├── git_basics.yaml      # Exercices Git
│   │   │   ├── python_fastapi.yaml  # Exercices Python/FastAPI
│   │   │   ├── networking.yaml      # Exercices Reseau/Secu
│   │   │   ├── aws_cloud.yaml       # Exercices AWS
│   │   │   ├── azure_ai.yaml        # Exercices Azure
│   │   │   ├── mlops.yaml           # Exercices MLOps
│   │   │   ├── llm_finetuning.yaml  # Exercices Fine-tuning
│   │   │   ├── rag.yaml             # Exercices RAG
│   │   │   └── kubernetes.yaml      # Exercices K8s
│   │   ├── badges.yaml              # Definitions des badges
│   │   └── certifications.yaml      # Timeline certifs
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx                 # Entry point React
│   │   ├── App.tsx                  # Router principal
│   │   ├── api/
│   │   │   └── client.ts            # Fetch wrapper pour le backend
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Page d'accueil avec stats
│   │   │   ├── ModuleList.tsx       # Liste des modules
│   │   │   ├── ModuleDetail.tsx     # Detail d'un module + exercices
│   │   │   ├── Exercise.tsx         # Vue exercice (instructions + terminal/notebook)
│   │   │   ├── Certifications.tsx   # Timeline des certifications
│   │   │   └── Profile.tsx          # Profil, badges, historique
│   │   ├── components/
│   │   │   ├── Layout.tsx           # Shell: sidebar + header + content
│   │   │   ├── Sidebar.tsx          # Navigation modules
│   │   │   ├── XPBar.tsx            # Barre d'XP + niveau
│   │   │   ├── StreakCounter.tsx     # Compteur de streak
│   │   │   ├── BadgeGrid.tsx        # Grille de badges
│   │   │   ├── ProgressRing.tsx     # Anneau de progression par module
│   │   │   ├── ExerciseCard.tsx     # Carte d'exercice dans un module
│   │   │   ├── Terminal.tsx         # Terminal xterm.js connecte au sandbox
│   │   │   ├── NotebookViewer.tsx   # Iframe Jupyter / notebook viewer
│   │   │   ├── CertTimeline.tsx     # Timeline visuelle des certifs
│   │   │   ├── ModuleCard.tsx       # Carte module sur le dashboard
│   │   │   └── DailyChallenge.tsx   # Challenge quotidien
│   │   ├── hooks/
│   │   │   ├── useApi.ts            # Hook fetch generique
│   │   │   └── useProgress.ts       # Hook progression utilisateur
│   │   └── styles/
│   │       └── globals.css          # Tailwind base + theme custom
│   └── Dockerfile
├── sandbox/
│   ├── Dockerfile.linux             # Image sandbox Linux (bash, coreutils, man)
│   ├── Dockerfile.docker            # Image sandbox Docker-in-Docker
│   ├── Dockerfile.python            # Image sandbox Python (FastAPI, pytest)
│   ├── Dockerfile.k8s               # Image sandbox avec minikube/kind
│   └── Dockerfile.ml                # Image sandbox ML (torch, transformers)
├── notebooks/
│   ├── python_basics.ipynb          # Notebook Python de base
│   ├── fastapi_intro.ipynb          # Notebook FastAPI
│   ├── docker_commands.ipynb        # Notebook commandes Docker
│   ├── ml_pipeline.ipynb            # Notebook pipeline ML
│   ├── rag_demo.ipynb               # Notebook RAG
│   └── llm_finetuning.ipynb         # Notebook fine-tuning
├── docker-compose.yml               # Orchestration: backend + frontend + jupyter
├── Makefile                         # Raccourcis: make dev, make seed, make sandbox
└── README.md
```

---

## Format des exercices (YAML)

Chaque exercice est defini en YAML avec validation automatique :

```yaml
# Exemple: linux_basics.yaml
module: linux
exercises:
  - id: linux-001
    title: "Naviguer dans le filesystem"
    description: |
      Utilise `cd`, `ls` et `pwd` pour explorer le systeme de fichiers.
      Trouve le fichier `secret.txt` cache quelque part dans `/home/student/`.
    difficulty: 1  # 1-5
    xp: 25
    type: sandbox  # sandbox | notebook | quiz | project
    sandbox_image: linux
    setup_script: |
      mkdir -p /home/student/documents/projets/.hidden
      echo "BRAVO" > /home/student/documents/projets/.hidden/secret.txt
    validation:
      type: command_output
      command: "cat /home/student/documents/projets/.hidden/secret.txt"
      expected: "BRAVO"
    hints:
      - "Utilise `ls -la` pour voir les fichiers caches"
      - "Les dossiers commencant par `.` sont caches"
    tags: [cli, navigation, fichiers]
    source_repo: "krother/bash_tutorial"
    phase: 1
```

---

## Systeme de gamification

```
XP & Niveaux:
  - Chaque exercice donne des XP (25-200 selon difficulte)
  - Niveaux: 0-100 XP = Debutant, 100-500 = Apprenti, 500-1500 = Praticien,
             1500-3000 = Expert, 3000+ = Architecte
  - Bonus XP: premier essai (+50%), streak (+10% par jour consecutif)

Streaks:
  - 1 exercice/jour minimum pour maintenir le streak
  - Milestones: 7 jours, 30 jours, 100 jours

Badges:
  - Par module: "Linux Padawan", "Docker Captain", "Cloud Pioneer", etc.
  - Par accomplissement: "First Blood" (1er exercice), "Streak Master" (30j),
    "Cert Ready" (tous exercices d'un module certif termines)
  - Par projet: "RAG Builder", "Fine-Tuner", "Security Architect"

Challenge quotidien:
  - 1 exercice aleatoire adapte au niveau actuel
  - Bonus XP x2 si complete le jour meme
```

---

## Tasks

### Task 1: Initialisation du projet + Backend FastAPI de base

**Files:**
- Create: `~/gaetan-academy/backend/main.py`
- Create: `~/gaetan-academy/backend/config.py`
- Create: `~/gaetan-academy/backend/database.py`
- Create: `~/gaetan-academy/backend/models/__init__.py`
- Create: `~/gaetan-academy/backend/models/user.py`
- Create: `~/gaetan-academy/backend/models/module.py`
- Create: `~/gaetan-academy/backend/models/exercise.py`
- Create: `~/gaetan-academy/backend/models/progress.py`
- Create: `~/gaetan-academy/backend/models/badge.py`
- Create: `~/gaetan-academy/backend/models/certification.py`
- Create: `~/gaetan-academy/backend/routers/__init__.py`
- Create: `~/gaetan-academy/backend/services/__init__.py`
- Create: `~/gaetan-academy/backend/requirements.txt`
- Test: `~/gaetan-academy/backend/tests/test_main.py`

- [ ] **Step 1: Creer la structure du projet**

```bash
mkdir -p ~/gaetan-academy/{backend/{models,routers,services,seed_data/exercises,tests},frontend/src/{api,pages,components,hooks,styles},sandbox,notebooks}
cd ~/gaetan-academy
git init
```

- [ ] **Step 2: Creer requirements.txt**

```
# ~/gaetan-academy/backend/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
pydantic==2.9.0
pyyaml==6.0.2
docker==7.1.0
httpx==0.27.0
pytest==8.3.0
pytest-asyncio==0.24.0
```

```bash
cd ~/gaetan-academy/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- [ ] **Step 3: Ecrire le test de base pour le health endpoint**

```python
# ~/gaetan-academy/backend/tests/test_main.py
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

- [ ] **Step 4: Verifier que le test echoue**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_main.py::test_health -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'main'`

- [ ] **Step 5: Ecrire config.py**

```python
# ~/gaetan-academy/backend/config.py
from pathlib import Path

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "academy.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"
SEED_DATA_DIR = BASE_DIR / "seed_data"
JUPYTER_PORT = 8888
SANDBOX_NETWORK = "academy-sandbox"
```

- [ ] **Step 6: Ecrire database.py**

```python
# ~/gaetan-academy/backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 7: Ecrire les modeles SQLAlchemy**

```python
# ~/gaetan-academy/backend/models/__init__.py
from models.user import User
from models.module import Module
from models.exercise import Exercise
from models.progress import Progress
from models.badge import Badge, UserBadge
from models.certification import Certification
```

```python
# ~/gaetan-academy/backend/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, default=1)
    name = Column(String, default="Gaetan")
    xp = Column(Integer, default=0)
    level = Column(String, default="Debutant")
    streak_days = Column(Integer, default=0)
    last_activity = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
```

```python
# ~/gaetan-academy/backend/models/module.py
from sqlalchemy import Column, Integer, String, Text
from database import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String, unique=True, nullable=False)  # "linux", "docker", etc.
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)  # emoji ou lucide icon name
    phase = Column(Integer)  # 1, 2 ou 3
    order = Column(Integer)  # ordre d'affichage
    color = Column(String)  # couleur theme du module
```

```python
# ~/gaetan-academy/backend/models/exercise.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from database import Base

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String, unique=True, nullable=False)  # "linux-001"
    module_slug = Column(String, ForeignKey("modules.slug"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    difficulty = Column(Integer, default=1)  # 1-5
    xp = Column(Integer, default=25)
    type = Column(String, default="sandbox")  # sandbox, notebook, quiz, project
    sandbox_image = Column(String)  # nom de l'image Docker
    setup_script = Column(Text)  # script de setup dans le container
    validation = Column(JSON)  # {"type": "command_output", "command": "...", "expected": "..."}
    hints = Column(JSON)  # ["hint1", "hint2"]
    tags = Column(JSON)  # ["cli", "navigation"]
    source_repo = Column(String)  # "owner/repo"
    order = Column(Integer, default=0)
```

```python
# ~/gaetan-academy/backend/models/progress.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func
from database import Base

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    exercise_id = Column(String, ForeignKey("exercises.external_id"), nullable=False)
    completed = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    first_attempt = Column(Boolean, default=True)
    completed_at = Column(DateTime)
    started_at = Column(DateTime, server_default=func.now())
```

```python
# ~/gaetan-academy/backend/models/badge.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from database import Base

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    condition_type = Column(String)  # "module_complete", "streak", "exercises_count"
    condition_value = Column(String)  # "linux", "30", "50"

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    badge_slug = Column(String, ForeignKey("badges.slug"), nullable=False)
    earned_at = Column(DateTime, server_default=func.now())
```

```python
# ~/gaetan-academy/backend/models/certification.py
from sqlalchemy import Column, Integer, String, Text, Boolean, Date
from database import Base

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    provider = Column(String)  # "AWS", "Microsoft", "Linux Foundation"
    description = Column(Text)
    cost = Column(String)  # "~165 EUR"
    funding = Column(String)  # "CPF", "autodidacte", "employeur"
    target_date = Column(Date)  # date cible de passage
    passed = Column(Boolean, default=False)
    passed_date = Column(Date)
    prerequisite_modules = Column(String)  # "aws_saa,networking" (slugs separes par virgule)
    priority = Column(String)  # "before_job", "on_job"
    order = Column(Integer, default=0)
```

- [ ] **Step 8: Ecrire main.py**

```python
# ~/gaetan-academy/backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="GaetanAcademy", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
```

- [ ] **Step 9: Verifier que le test passe**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_main.py::test_health -v
```
Expected: PASS

- [ ] **Step 10: Commit**

```bash
cd ~/gaetan-academy
git add backend/
git commit -m "feat: init backend FastAPI with SQLAlchemy models"
```

---

### Task 2: Seed data — Modules, exercices et certifications YAML

**Files:**
- Create: `~/gaetan-academy/backend/seed_data/modules.yaml`
- Create: `~/gaetan-academy/backend/seed_data/exercises/linux_basics.yaml`
- Create: `~/gaetan-academy/backend/seed_data/exercises/docker_basics.yaml`
- Create: `~/gaetan-academy/backend/seed_data/exercises/git_basics.yaml`
- Create: `~/gaetan-academy/backend/seed_data/exercises/python_fastapi.yaml`
- Create: `~/gaetan-academy/backend/seed_data/exercises/networking.yaml`
- Create: `~/gaetan-academy/backend/seed_data/badges.yaml`
- Create: `~/gaetan-academy/backend/seed_data/certifications.yaml`
- Create: `~/gaetan-academy/backend/services/exercise_loader.py`
- Test: `~/gaetan-academy/backend/tests/test_exercise_loader.py`

- [ ] **Step 1: Ecrire modules.yaml**

```yaml
# ~/gaetan-academy/backend/seed_data/modules.yaml
modules:
  - slug: linux
    name: "Linux CLI & Sysadmin"
    description: "Ligne de commande, permissions, systemd, scripting bash"
    icon: "terminal"
    phase: 1
    order: 1
    color: "#22c55e"

  - slug: git
    name: "Git & Workflow"
    description: "Branches, merge, rebase, PRs, workflow collaboratif"
    icon: "git-branch"
    phase: 1
    order: 2
    color: "#f97316"

  - slug: docker
    name: "Docker & Containers"
    description: "Dockerfile, Compose, volumes, networks, registries"
    icon: "container"
    phase: 1
    order: 3
    color: "#3b82f6"

  - slug: python_fastapi
    name: "Python & FastAPI"
    description: "APIs REST, SQLAlchemy, pytest, CI/CD, architecture"
    icon: "code"
    phase: 1
    order: 4
    color: "#a855f7"

  - slug: networking
    name: "Reseau & Securite"
    description: "TCP/IP, HTTPS, TLS, VPN, firewall, zero-trust, chiffrement"
    icon: "shield"
    phase: 1
    order: 5
    color: "#ef4444"

  - slug: aws_saa
    name: "AWS Solutions Architect"
    description: "EC2, S3, VPC, IAM, RDS, Lambda, Well-Architected"
    icon: "cloud"
    phase: 2
    order: 6
    color: "#f59e0b"

  - slug: azure_ai
    name: "Azure AI Engineer"
    description: "Cognitive Services, Azure OpenAI, Azure ML Studio"
    icon: "brain"
    phase: 2
    order: 7
    color: "#0ea5e9"

  - slug: aws_ml
    name: "AWS ML Specialty"
    description: "SageMaker, pipelines ML, feature engineering, model tuning"
    icon: "cpu"
    phase: 2
    order: 8
    color: "#8b5cf6"

  - slug: mlops
    name: "MLOps"
    description: "MLflow, model serving, monitoring, CI/CD ML"
    icon: "workflow"
    phase: 3
    order: 9
    color: "#10b981"

  - slug: llm_finetuning
    name: "Fine-tuning LLM"
    description: "LoRA, QLoRA, PEFT, datasets, evaluation, quantization"
    icon: "sparkles"
    phase: 3
    order: 10
    color: "#ec4899"

  - slug: rag
    name: "RAG"
    description: "Embeddings, bases vectorielles, chunking, LangChain, LlamaIndex"
    icon: "database"
    phase: 3
    order: 11
    color: "#14b8a6"

  - slug: kubernetes
    name: "Kubernetes"
    description: "Pods, Deployments, Services, Helm, deploiement ML sur K8s"
    icon: "server"
    phase: 3
    order: 12
    color: "#6366f1"
```

- [ ] **Step 2: Ecrire les 5 premiers exercices Linux**

```yaml
# ~/gaetan-academy/backend/seed_data/exercises/linux_basics.yaml
module: linux
exercises:
  - id: linux-001
    title: "Naviguer dans le filesystem"
    description: |
      Utilise `cd`, `ls` et `pwd` pour explorer.
      Trouve le fichier `secret.txt` cache dans `/home/student/`.
    difficulty: 1
    xp: 25
    type: sandbox
    sandbox_image: linux
    setup_script: |
      mkdir -p /home/student/docs/projects/.hidden
      echo "FOUND_IT" > /home/student/docs/projects/.hidden/secret.txt
    validation:
      type: command_output
      command: "cat /home/student/docs/projects/.hidden/secret.txt"
      expected: "FOUND_IT"
    hints:
      - "Utilise `ls -la` pour voir les fichiers caches"
      - "Les dossiers commencant par `.` sont caches"
    tags: [cli, navigation, fichiers]
    source_repo: "krother/bash_tutorial"

  - id: linux-002
    title: "Permissions de fichiers"
    description: |
      Le fichier `/home/student/script.sh` n'est pas executable.
      Rends-le executable et lance-le.
    difficulty: 1
    xp: 30
    type: sandbox
    sandbox_image: linux
    setup_script: |
      echo '#!/bin/bash\necho "PERMISSIONS_OK"' > /home/student/script.sh
      chmod 644 /home/student/script.sh
    validation:
      type: command_output
      command: "bash -c '[[ -x /home/student/script.sh ]] && echo OK'"
      expected: "OK"
    hints:
      - "Utilise `chmod` pour changer les permissions"
      - "`chmod +x fichier` rend un fichier executable"
    tags: [permissions, chmod]

  - id: linux-003
    title: "Chercher avec grep"
    description: |
      Trouve le mot de passe cache dans les fichiers de `/var/log/`.
      Le mot de passe est sur une ligne contenant "PASSWORD=".
    difficulty: 2
    xp: 40
    type: sandbox
    sandbox_image: linux
    setup_script: |
      mkdir -p /var/log/app
      echo "info: starting service" > /var/log/app/service.log
      echo "debug: PASSWORD=SUPER_SECRET_42" >> /var/log/app/service.log
      echo "info: ready" >> /var/log/app/service.log
      for i in $(seq 1 5); do echo "noise line $i" > /var/log/app/noise_$i.log; done
    validation:
      type: command_output
      command: "grep -r 'PASSWORD=' /var/log/ | grep -o 'SUPER_SECRET_42'"
      expected: "SUPER_SECRET_42"
    hints:
      - "`grep -r` cherche recursivement dans les sous-dossiers"
      - "Essaie `grep -r 'PASSWORD=' /var/log/`"
    tags: [grep, recherche, logs]

  - id: linux-004
    title: "Pipes et redirections"
    description: |
      Le fichier `/home/student/data.txt` contient 100 lignes.
      Ecris les 10 dernieres lignes triees alphabetiquement dans `/home/student/result.txt`.
    difficulty: 2
    xp: 50
    type: sandbox
    sandbox_image: linux
    setup_script: |
      for i in $(seq 1 100); do echo "line_$(shuf -i 1000-9999 -n 1)" >> /home/student/data.txt; done
    validation:
      type: script
      command: |
        expected=$(tail -10 /home/student/data.txt | sort)
        actual=$(cat /home/student/result.txt)
        [ "$expected" = "$actual" ] && echo "PASS" || echo "FAIL"
      expected: "PASS"
    hints:
      - "`tail -n 10` affiche les 10 dernieres lignes"
      - "`sort` trie alphabetiquement"
      - "Utilise `>` pour rediriger la sortie vers un fichier"
    tags: [pipes, redirection, sort, tail]

  - id: linux-005
    title: "Gerer les processus"
    description: |
      Un processus `rogue_process` tourne en arriere-plan et consomme du CPU.
      Trouve son PID et tue-le.
    difficulty: 2
    xp: 50
    type: sandbox
    sandbox_image: linux
    setup_script: |
      nohup bash -c 'while true; do :; done' &
      echo $! > /tmp/rogue_pid
      # Rename for ps display
      exec -a rogue_process bash -c 'while true; do sleep 1; done' &
    validation:
      type: script
      command: |
        pgrep -f rogue_process > /dev/null 2>&1 && echo "STILL_RUNNING" || echo "KILLED"
      expected: "KILLED"
    hints:
      - "`ps aux` ou `ps -ef` liste tous les processus"
      - "`kill PID` envoie un signal de terminaison"
      - "`pgrep -f nom` trouve le PID par nom"
    tags: [processus, kill, ps]
```

- [ ] **Step 3: Ecrire les exercices Docker de base**

```yaml
# ~/gaetan-academy/backend/seed_data/exercises/docker_basics.yaml
module: docker
exercises:
  - id: docker-001
    title: "Lancer ton premier container"
    description: |
      Lance un container `alpine` qui affiche "Hello Docker".
      Verifie avec `docker ps -a` que le container a bien tourne.
    difficulty: 1
    xp: 25
    type: sandbox
    sandbox_image: docker
    validation:
      type: command_output
      command: "docker run alpine echo 'Hello Docker'"
      expected: "Hello Docker"
    hints:
      - "`docker run IMAGE COMMAND` lance un container"
    tags: [docker, basics, run]
    source_repo: "collabnix/dockerlabs"

  - id: docker-002
    title: "Ecrire un Dockerfile"
    description: |
      Cree un Dockerfile dans `/home/student/myapp/` qui:
      1. Part de `python:3.12-slim`
      2. Copie `app.py` dans `/app/`
      3. Definit le WORKDIR a `/app`
      4. Lance `python app.py` au demarrage
    difficulty: 2
    xp: 50
    type: sandbox
    sandbox_image: docker
    setup_script: |
      mkdir -p /home/student/myapp
      echo 'print("Hello from Docker!")' > /home/student/myapp/app.py
    validation:
      type: script
      command: |
        cd /home/student/myapp
        docker build -t test-app . 2>/dev/null && docker run --rm test-app
      expected: "Hello from Docker!"
    hints:
      - "Un Dockerfile commence par `FROM image`"
      - "`COPY source destination` copie des fichiers"
      - "`CMD [\"python\", \"app.py\"]` definit la commande de demarrage"
    tags: [dockerfile, build, python]

  - id: docker-003
    title: "Docker Compose multi-services"
    description: |
      Cree un `docker-compose.yml` dans `/home/student/stack/` avec:
      - Un service `web` (image nginx, port 8080:80)
      - Un service `api` (image python:3.12-slim, commande `python -m http.server 5000`)
      Les deux services doivent etre sur le meme reseau `app-net`.
    difficulty: 3
    xp: 75
    type: sandbox
    sandbox_image: docker
    setup_script: |
      mkdir -p /home/student/stack
    validation:
      type: script
      command: |
        cd /home/student/stack
        docker compose config > /dev/null 2>&1 && echo "VALID" || echo "INVALID"
      expected: "VALID"
    hints:
      - "Un docker-compose.yml commence par `services:`"
      - "Les ports se mappent avec `ports: [\"8080:80\"]`"
      - "Les reseaux se definissent avec `networks:`"
    tags: [compose, networking, multi-service]
```

- [ ] **Step 4: Ecrire les exercices Git**

```yaml
# ~/gaetan-academy/backend/seed_data/exercises/git_basics.yaml
module: git
exercises:
  - id: git-001
    title: "Init, add et commit"
    description: |
      Initialise un repo git dans `/home/student/project/`.
      Cree un fichier `README.md` avec le contenu "Mon projet".
      Fais un premier commit avec le message "initial commit".
    difficulty: 1
    xp: 25
    type: sandbox
    sandbox_image: linux
    setup_script: |
      mkdir -p /home/student/project
    validation:
      type: script
      command: |
        cd /home/student/project
        git log --oneline 2>/dev/null | head -1 | grep -q "initial commit" && echo "OK" || echo "FAIL"
      expected: "OK"
    hints:
      - "`git init` initialise un nouveau repo"
      - "`git add .` ajoute tous les fichiers"
      - "`git commit -m \"message\"` cree un commit"
    tags: [git, init, commit]
    source_repo: "eficode-academy/git-katas"

  - id: git-002
    title: "Branches et merge"
    description: |
      Dans `/home/student/project/` (repo git existant):
      1. Cree une branche `feature`
      2. Ajoute un fichier `feature.txt` avec "new feature"
      3. Commit sur la branche `feature`
      4. Reviens sur `main` et merge `feature`
    difficulty: 2
    xp: 50
    type: sandbox
    sandbox_image: linux
    setup_script: |
      mkdir -p /home/student/project && cd /home/student/project
      git init && git config user.email "test@test.com" && git config user.name "Test"
      echo "base" > README.md && git add . && git commit -m "initial"
      git branch -M main
    validation:
      type: script
      command: |
        cd /home/student/project
        git log --oneline main | grep -q "feature" && cat feature.txt 2>/dev/null
      expected: "new feature"
    hints:
      - "`git checkout -b feature` cree et bascule sur une branche"
      - "`git checkout main` revient sur main"
      - "`git merge feature` fusionne la branche"
    tags: [git, branches, merge]

  - id: git-003
    title: "Resoudre un conflit de merge"
    description: |
      Le repo dans `/home/student/project/` a un conflit entre `main` et `feature`.
      Resous le conflit dans `config.txt` en gardant les deux modifications.
      Le fichier final doit contenir exactement:
      ```
      setting=main_value
      feature_setting=feature_value
      ```
    difficulty: 3
    xp: 75
    type: sandbox
    sandbox_image: linux
    setup_script: |
      mkdir -p /home/student/project && cd /home/student/project
      git init && git config user.email "t@t.com" && git config user.name "T"
      echo "setting=original" > config.txt && git add . && git commit -m "init"
      git branch -M main
      git checkout -b feature
      echo -e "setting=original\nfeature_setting=feature_value" > config.txt
      git add . && git commit -m "add feature setting"
      git checkout main
      echo "setting=main_value" > config.txt
      git add . && git commit -m "update setting"
      git merge feature || true
    validation:
      type: script
      command: |
        cd /home/student/project
        expected=$'setting=main_value\nfeature_setting=feature_value'
        actual=$(cat config.txt)
        [ "$expected" = "$actual" ] && git log --oneline | grep -q "Merge\|merge\|resolve\|fix" && echo "RESOLVED" || echo "FAIL"
      expected: "RESOLVED"
    hints:
      - "Ouvre `config.txt` — les marqueurs `<<<<<<<`, `=======`, `>>>>>>>` delimitent le conflit"
      - "Edite le fichier pour garder les deux lignes"
      - "Apres edition: `git add config.txt && git commit -m \"resolve merge conflict\"`"
    tags: [git, merge, conflict]
```

- [ ] **Step 5: Ecrire certifications.yaml**

```yaml
# ~/gaetan-academy/backend/seed_data/certifications.yaml
certifications:
  - slug: aws_saa
    name: "AWS Solutions Architect Associate (SAA-C03)"
    provider: AWS
    description: "La certif cloud la plus reconnue du marche"
    cost: "2 500 - 3 500 EUR"
    funding: CPF
    target_date: "2026-08-15"
    prerequisite_modules: "aws_saa,networking"
    priority: before_job
    order: 1

  - slug: azure_ai_102
    name: "Azure AI Engineer Associate (AI-102)"
    provider: Microsoft
    description: "Azure dominant dans la defense FR"
    cost: "~165 EUR"
    funding: autodidacte
    target_date: "2026-09-30"
    prerequisite_modules: "azure_ai"
    priority: before_job
    order: 2

  - slug: aws_ml
    name: "AWS Machine Learning Specialty (MLS-C01)"
    provider: AWS
    description: "Expertise ML + SageMaker"
    cost: "~300 EUR"
    funding: autodidacte
    target_date: "2026-11-30"
    prerequisite_modules: "aws_ml,mlops"
    priority: before_job
    order: 3

  - slug: cka
    name: "Certified Kubernetes Administrator"
    provider: "Linux Foundation"
    description: "K8s partout dans les archi MLOps defense"
    cost: "~395 USD"
    funding: employeur
    target_date: "2027-06-30"
    prerequisite_modules: "kubernetes"
    priority: on_job
    order: 4

  - slug: security_plus
    name: "CompTIA Security+"
    provider: CompTIA
    description: "Signal d'entree en securite"
    cost: "~350-400 EUR"
    funding: employeur
    target_date: "2027-12-31"
    prerequisite_modules: "networking"
    priority: on_job
    order: 5

  - slug: terraform
    name: "HashiCorp Terraform Associate"
    provider: HashiCorp
    description: "Infrastructure as Code, tres demande"
    cost: "~70 USD"
    funding: autodidacte
    target_date: "2028-06-30"
    prerequisite_modules: "aws_saa,docker,kubernetes"
    priority: on_job
    order: 6
```

- [ ] **Step 6: Ecrire badges.yaml**

```yaml
# ~/gaetan-academy/backend/seed_data/badges.yaml
badges:
  # Progression
  - slug: first_blood
    name: "First Blood"
    description: "Premier exercice complete"
    icon: "🩸"
    condition_type: exercises_count
    condition_value: "1"

  - slug: ten_down
    name: "Ten Down"
    description: "10 exercices completes"
    icon: "🔟"
    condition_type: exercises_count
    condition_value: "10"

  - slug: fifty_strong
    name: "Fifty Strong"
    description: "50 exercices completes"
    icon: "💪"
    condition_type: exercises_count
    condition_value: "50"

  # Streaks
  - slug: streak_7
    name: "Week Warrior"
    description: "7 jours de streak"
    icon: "🔥"
    condition_type: streak
    condition_value: "7"

  - slug: streak_30
    name: "Streak Master"
    description: "30 jours de streak"
    icon: "⚡"
    condition_type: streak
    condition_value: "30"

  - slug: streak_100
    name: "Centurion"
    description: "100 jours de streak"
    icon: "👑"
    condition_type: streak
    condition_value: "100"

  # Modules
  - slug: linux_padawan
    name: "Linux Padawan"
    description: "Tous les exercices Linux completes"
    icon: "🐧"
    condition_type: module_complete
    condition_value: "linux"

  - slug: docker_captain
    name: "Docker Captain"
    description: "Tous les exercices Docker completes"
    icon: "🐳"
    condition_type: module_complete
    condition_value: "docker"

  - slug: git_guru
    name: "Git Guru"
    description: "Tous les exercices Git completes"
    icon: "🌿"
    condition_type: module_complete
    condition_value: "git"

  - slug: cloud_pioneer
    name: "Cloud Pioneer"
    description: "Tous les exercices AWS SAA completes"
    icon: "☁️"
    condition_type: module_complete
    condition_value: "aws_saa"

  - slug: ml_architect
    name: "ML Architect"
    description: "Tous les exercices MLOps completes"
    icon: "🧠"
    condition_type: module_complete
    condition_value: "mlops"

  # Certifs
  - slug: cert_ready_aws
    name: "Cert Ready: AWS SAA"
    description: "Pret pour passer la certif AWS SAA"
    icon: "📜"
    condition_type: module_complete
    condition_value: "aws_saa"

  # Projets
  - slug: rag_builder
    name: "RAG Builder"
    description: "Projet RAG Entreprise termine"
    icon: "🏗️"
    condition_type: project_complete
    condition_value: "rag_enterprise"

  - slug: fine_tuner
    name: "Fine-Tuner"
    description: "Projet Fine-tuning termine"
    icon: "🎯"
    condition_type: project_complete
    condition_value: "finetuning_metier"

  - slug: security_architect
    name: "Security Architect"
    description: "Projet Infra Securisee termine"
    icon: "🛡️"
    condition_type: project_complete
    condition_value: "infra_secure"
```

- [ ] **Step 7: Ecrire le test pour exercise_loader**

```python
# ~/gaetan-academy/backend/tests/test_exercise_loader.py
import pytest
from pathlib import Path
from services.exercise_loader import load_modules, load_exercises, load_certifications, load_badges

SEED_DIR = Path(__file__).parent.parent / "seed_data"

def test_load_modules():
    modules = load_modules(SEED_DIR / "modules.yaml")
    assert len(modules) == 12
    assert modules[0]["slug"] == "linux"
    assert modules[0]["phase"] == 1

def test_load_exercises():
    exercises = load_exercises(SEED_DIR / "exercises" / "linux_basics.yaml")
    assert len(exercises) >= 5
    assert exercises[0]["id"] == "linux-001"
    assert exercises[0]["module"] == "linux"
    assert "validation" in exercises[0]

def test_load_certifications():
    certs = load_certifications(SEED_DIR / "certifications.yaml")
    assert len(certs) == 6
    assert certs[0]["slug"] == "aws_saa"

def test_load_badges():
    badges = load_badges(SEED_DIR / "badges.yaml")
    assert len(badges) >= 10
    assert badges[0]["slug"] == "first_blood"
```

- [ ] **Step 8: Verifier que les tests echouent**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_exercise_loader.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'services.exercise_loader'`

- [ ] **Step 9: Implementer exercise_loader.py**

```python
# ~/gaetan-academy/backend/services/__init__.py
```

```python
# ~/gaetan-academy/backend/services/exercise_loader.py
from pathlib import Path
import yaml

def load_modules(path: Path) -> list[dict]:
    with open(path) as f:
        data = yaml.safe_load(f)
    return data["modules"]

def load_exercises(path: Path) -> list[dict]:
    with open(path) as f:
        data = yaml.safe_load(f)
    module = data["module"]
    exercises = data["exercises"]
    for ex in exercises:
        ex["module"] = module
    return exercises

def load_all_exercises(exercises_dir: Path) -> list[dict]:
    all_exercises = []
    for yaml_file in sorted(exercises_dir.glob("*.yaml")):
        all_exercises.extend(load_exercises(yaml_file))
    return all_exercises

def load_certifications(path: Path) -> list[dict]:
    with open(path) as f:
        data = yaml.safe_load(f)
    return data["certifications"]

def load_badges(path: Path) -> list[dict]:
    with open(path) as f:
        data = yaml.safe_load(f)
    return data["badges"]
```

- [ ] **Step 10: Verifier que les tests passent**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_exercise_loader.py -v
```
Expected: PASS (4 tests)

- [ ] **Step 11: Commit**

```bash
cd ~/gaetan-academy
git add backend/seed_data/ backend/services/ backend/tests/test_exercise_loader.py
git commit -m "feat: add seed data (modules, exercises, certs, badges) and YAML loader"
```

---

### Task 3: Routers API — Dashboard, Modules, Exercices, Progression

**Files:**
- Create: `~/gaetan-academy/backend/routers/dashboard.py`
- Create: `~/gaetan-academy/backend/routers/modules.py`
- Create: `~/gaetan-academy/backend/routers/exercises.py`
- Create: `~/gaetan-academy/backend/routers/progress.py`
- Create: `~/gaetan-academy/backend/routers/certifications.py`
- Modify: `~/gaetan-academy/backend/main.py`
- Create: `~/gaetan-academy/backend/services/gamification.py`
- Test: `~/gaetan-academy/backend/tests/test_routers.py`

- [ ] **Step 1: Ecrire le test pour les routers**

```python
# ~/gaetan-academy/backend/tests/test_routers.py
import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from database import engine, Base, SessionLocal
from services.seed import seed_database

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.mark.asyncio
async def test_get_dashboard():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/dashboard")
    assert r.status_code == 200
    data = r.json()
    assert "xp" in data
    assert "level" in data
    assert "streak_days" in data
    assert "modules_progress" in data

@pytest.mark.asyncio
async def test_list_modules():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/modules")
    assert r.status_code == 200
    modules = r.json()
    assert len(modules) == 12
    assert modules[0]["slug"] == "linux"

@pytest.mark.asyncio
async def test_get_module_exercises():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/modules/linux/exercises")
    assert r.status_code == 200
    exercises = r.json()
    assert len(exercises) >= 5

@pytest.mark.asyncio
async def test_complete_exercise():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/api/exercises/linux-001/complete")
    assert r.status_code == 200
    data = r.json()
    assert data["xp_earned"] > 0
    assert data["completed"] is True

@pytest.mark.asyncio
async def test_get_certifications():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/certifications")
    assert r.status_code == 200
    certs = r.json()
    assert len(certs) == 6
```

- [ ] **Step 2: Verifier que les tests echouent**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_routers.py -v
```
Expected: FAIL

- [ ] **Step 3: Ecrire le service seed**

```python
# ~/gaetan-academy/backend/services/seed.py
from pathlib import Path
from sqlalchemy.orm import Session
from models import User, Module, Exercise, Badge, Certification
from services.exercise_loader import load_modules, load_all_exercises, load_certifications, load_badges
from config import SEED_DATA_DIR

def seed_database(db: Session):
    # User
    if not db.query(User).first():
        db.add(User(name="Gaetan"))

    # Modules
    for m in load_modules(SEED_DATA_DIR / "modules.yaml"):
        if not db.query(Module).filter_by(slug=m["slug"]).first():
            db.add(Module(**m))

    # Exercises
    for ex in load_all_exercises(SEED_DATA_DIR / "exercises"):
        if not db.query(Exercise).filter_by(external_id=ex["id"]).first():
            db.add(Exercise(
                external_id=ex["id"],
                module_slug=ex["module"],
                title=ex["title"],
                description=ex.get("description", ""),
                difficulty=ex.get("difficulty", 1),
                xp=ex.get("xp", 25),
                type=ex.get("type", "sandbox"),
                sandbox_image=ex.get("sandbox_image"),
                setup_script=ex.get("setup_script"),
                validation=ex.get("validation"),
                hints=ex.get("hints", []),
                tags=ex.get("tags", []),
                source_repo=ex.get("source_repo"),
            ))

    # Badges
    for b in load_badges(SEED_DATA_DIR / "badges.yaml"):
        if not db.query(Badge).filter_by(slug=b["slug"]).first():
            db.add(Badge(**b))

    # Certifications
    for c in load_certifications(SEED_DATA_DIR / "certifications.yaml"):
        if not db.query(Certification).filter_by(slug=c["slug"]).first():
            db.add(Certification(**c))

    db.commit()
```

- [ ] **Step 4: Ecrire gamification.py**

```python
# ~/gaetan-academy/backend/services/gamification.py
from datetime import datetime, date
from sqlalchemy.orm import Session
from models import User, Progress, Badge, UserBadge, Exercise

LEVELS = [
    (0, "Debutant"),
    (100, "Apprenti"),
    (500, "Praticien"),
    (1500, "Expert"),
    (3000, "Architecte"),
]

def get_level(xp: int) -> str:
    level = "Debutant"
    for threshold, name in LEVELS:
        if xp >= threshold:
            level = name
    return level

def calculate_xp(base_xp: int, first_attempt: bool, streak_days: int) -> int:
    xp = base_xp
    if first_attempt:
        xp = int(xp * 1.5)
    streak_bonus = min(streak_days * 0.1, 1.0)  # max +100%
    xp = int(xp * (1 + streak_bonus))
    return xp

def update_streak(db: Session, user: User):
    today = date.today()
    if user.last_activity:
        last = user.last_activity.date() if isinstance(user.last_activity, datetime) else user.last_activity
        delta = (today - last).days
        if delta == 1:
            user.streak_days += 1
        elif delta > 1:
            user.streak_days = 1
    else:
        user.streak_days = 1
    user.last_activity = datetime.now()

def check_badges(db: Session, user: User) -> list[str]:
    earned = []
    existing = {ub.badge_slug for ub in db.query(UserBadge).filter_by(user_id=user.id).all()}
    badges = db.query(Badge).all()
    completed_count = db.query(Progress).filter_by(user_id=user.id, completed=True).count()

    for badge in badges:
        if badge.slug in existing:
            continue

        awarded = False
        if badge.condition_type == "exercises_count":
            awarded = completed_count >= int(badge.condition_value)
        elif badge.condition_type == "streak":
            awarded = user.streak_days >= int(badge.condition_value)
        elif badge.condition_type == "module_complete":
            module_exercises = db.query(Exercise).filter_by(module_slug=badge.condition_value).count()
            module_completed = (
                db.query(Progress)
                .join(Exercise, Progress.exercise_id == Exercise.external_id)
                .filter(Exercise.module_slug == badge.condition_value, Progress.completed == True)
                .count()
            )
            awarded = module_exercises > 0 and module_completed >= module_exercises

        if awarded:
            db.add(UserBadge(user_id=user.id, badge_slug=badge.slug))
            earned.append(badge.slug)

    if earned:
        db.commit()
    return earned
```

- [ ] **Step 5: Ecrire les routers**

```python
# ~/gaetan-academy/backend/routers/__init__.py
```

```python
# ~/gaetan-academy/backend/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Module, Exercise, Progress, UserBadge
from services.gamification import get_level

router = APIRouter(prefix="/api")

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    user = db.query(User).first()
    modules = db.query(Module).order_by(Module.order).all()

    modules_progress = []
    for m in modules:
        total = db.query(Exercise).filter_by(module_slug=m.slug).count()
        done = (
            db.query(Progress)
            .join(Exercise, Progress.exercise_id == Exercise.external_id)
            .filter(Exercise.module_slug == m.slug, Progress.completed == True)
            .count()
        )
        modules_progress.append({
            "slug": m.slug,
            "name": m.name,
            "icon": m.icon,
            "color": m.color,
            "phase": m.phase,
            "total": total,
            "completed": done,
            "percent": round(done / total * 100) if total > 0 else 0,
        })

    badges_count = db.query(UserBadge).filter_by(user_id=user.id).count()

    return {
        "xp": user.xp,
        "level": get_level(user.xp),
        "streak_days": user.streak_days,
        "badges_count": badges_count,
        "modules_progress": modules_progress,
    }
```

```python
# ~/gaetan-academy/backend/routers/modules.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Module, Exercise

router = APIRouter(prefix="/api")

@router.get("/modules")
def list_modules(db: Session = Depends(get_db)):
    modules = db.query(Module).order_by(Module.order).all()
    return [
        {
            "slug": m.slug,
            "name": m.name,
            "description": m.description,
            "icon": m.icon,
            "phase": m.phase,
            "order": m.order,
            "color": m.color,
        }
        for m in modules
    ]

@router.get("/modules/{slug}")
def get_module(slug: str, db: Session = Depends(get_db)):
    module = db.query(Module).filter_by(slug=slug).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    exercises = db.query(Exercise).filter_by(module_slug=slug).order_by(Exercise.order).all()
    return {
        "slug": module.slug,
        "name": module.name,
        "description": module.description,
        "icon": module.icon,
        "phase": module.phase,
        "color": module.color,
        "exercises_count": len(exercises),
    }
```

```python
# ~/gaetan-academy/backend/routers/exercises.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Exercise, Progress, User
from services.gamification import calculate_xp, update_streak, check_badges, get_level
from datetime import datetime

router = APIRouter(prefix="/api")

@router.get("/modules/{slug}/exercises")
def list_exercises(slug: str, db: Session = Depends(get_db)):
    exercises = db.query(Exercise).filter_by(module_slug=slug).order_by(Exercise.order).all()
    user = db.query(User).first()
    result = []
    for ex in exercises:
        progress = db.query(Progress).filter_by(user_id=user.id, exercise_id=ex.external_id).first()
        result.append({
            "id": ex.external_id,
            "title": ex.title,
            "difficulty": ex.difficulty,
            "xp": ex.xp,
            "type": ex.type,
            "tags": ex.tags or [],
            "completed": progress.completed if progress else False,
            "attempts": progress.attempts if progress else 0,
        })
    return result

@router.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter_by(external_id=exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    user = db.query(User).first()
    progress = db.query(Progress).filter_by(user_id=user.id, exercise_id=exercise_id).first()
    return {
        "id": ex.external_id,
        "module_slug": ex.module_slug,
        "title": ex.title,
        "description": ex.description,
        "difficulty": ex.difficulty,
        "xp": ex.xp,
        "type": ex.type,
        "sandbox_image": ex.sandbox_image,
        "hints": ex.hints or [],
        "tags": ex.tags or [],
        "completed": progress.completed if progress else False,
        "attempts": progress.attempts if progress else 0,
    }

@router.post("/exercises/{exercise_id}/complete")
def complete_exercise(exercise_id: str, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter_by(external_id=exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    user = db.query(User).first()
    progress = db.query(Progress).filter_by(user_id=user.id, exercise_id=exercise_id).first()

    first_attempt = progress is None
    if not progress:
        progress = Progress(user_id=user.id, exercise_id=exercise_id)
        db.add(progress)

    progress.attempts += 1
    progress.completed = True
    progress.completed_at = datetime.now()
    progress.first_attempt = first_attempt

    xp_earned = calculate_xp(ex.xp, first_attempt, user.streak_days)
    progress.xp_earned = xp_earned
    user.xp += xp_earned
    user.level = get_level(user.xp)

    update_streak(db, user)
    db.commit()

    new_badges = check_badges(db, user)

    return {
        "completed": True,
        "xp_earned": xp_earned,
        "total_xp": user.xp,
        "level": user.level,
        "streak_days": user.streak_days,
        "new_badges": new_badges,
    }
```

```python
# ~/gaetan-academy/backend/routers/progress.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Progress, UserBadge, Badge

router = APIRouter(prefix="/api")

@router.get("/progress")
def get_progress(db: Session = Depends(get_db)):
    user = db.query(User).first()
    completed = db.query(Progress).filter_by(user_id=user.id, completed=True).count()
    total_attempts = db.query(Progress).filter_by(user_id=user.id).count()
    return {
        "exercises_completed": completed,
        "total_attempts": total_attempts,
        "xp": user.xp,
        "level": user.level,
        "streak_days": user.streak_days,
    }

@router.get("/badges")
def get_badges(db: Session = Depends(get_db)):
    user = db.query(User).first()
    all_badges = db.query(Badge).all()
    earned_slugs = {
        ub.badge_slug
        for ub in db.query(UserBadge).filter_by(user_id=user.id).all()
    }
    return [
        {
            "slug": b.slug,
            "name": b.name,
            "description": b.description,
            "icon": b.icon,
            "earned": b.slug in earned_slugs,
        }
        for b in all_badges
    ]
```

```python
# ~/gaetan-academy/backend/routers/certifications.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Certification

router = APIRouter(prefix="/api")

@router.get("/certifications")
def list_certifications(db: Session = Depends(get_db)):
    certs = db.query(Certification).order_by(Certification.order).all()
    return [
        {
            "slug": c.slug,
            "name": c.name,
            "provider": c.provider,
            "description": c.description,
            "cost": c.cost,
            "funding": c.funding,
            "target_date": str(c.target_date) if c.target_date else None,
            "passed": c.passed,
            "prerequisite_modules": c.prerequisite_modules,
            "priority": c.priority,
        }
        for c in certs
    ]
```

- [ ] **Step 6: Enregistrer les routers dans main.py**

Remplacer le contenu de `main.py` par :

```python
# ~/gaetan-academy/backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import dashboard, modules, exercises, progress, certifications
from services.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield

app = FastAPI(title="GaetanAcademy", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(modules.router)
app.include_router(exercises.router)
app.include_router(progress.router)
app.include_router(certifications.router)

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
```

- [ ] **Step 7: Lancer les tests**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_routers.py -v
```
Expected: PASS (5 tests)

- [ ] **Step 8: Commit**

```bash
cd ~/gaetan-academy
git add backend/
git commit -m "feat: add API routers (dashboard, modules, exercises, progress, certs) + gamification"
```

---

### Task 4: Service Docker Sandbox

**Files:**
- Create: `~/gaetan-academy/backend/services/docker_sandbox.py`
- Create: `~/gaetan-academy/backend/routers/sandbox.py`
- Create: `~/gaetan-academy/sandbox/Dockerfile.linux`
- Create: `~/gaetan-academy/sandbox/Dockerfile.python`
- Modify: `~/gaetan-academy/backend/main.py` (add sandbox router)
- Test: `~/gaetan-academy/backend/tests/test_sandbox.py`

- [ ] **Step 1: Ecrire Dockerfile.linux (image sandbox)**

```dockerfile
# ~/gaetan-academy/sandbox/Dockerfile.linux
FROM alpine:3.19

RUN apk add --no-cache \
    bash coreutils findutils grep sed gawk \
    man-pages man-db less \
    git curl wget vim nano \
    procps htop net-tools iputils \
    openssh-client nmap bind-tools

RUN adduser -D -s /bin/bash student
WORKDIR /home/student
USER student

CMD ["bash"]
```

- [ ] **Step 2: Ecrire Dockerfile.python**

```dockerfile
# ~/gaetan-academy/sandbox/Dockerfile.python
FROM python:3.12-slim

RUN pip install --no-cache-dir \
    fastapi uvicorn sqlalchemy pytest httpx \
    requests pandas numpy

RUN useradd -m -s /bin/bash student
WORKDIR /home/student
USER student

CMD ["bash"]
```

- [ ] **Step 3: Ecrire le test sandbox**

```python
# ~/gaetan-academy/backend/tests/test_sandbox.py
import pytest
from services.docker_sandbox import DockerSandbox

@pytest.fixture
def sandbox():
    return DockerSandbox()

def test_sandbox_init(sandbox):
    assert sandbox is not None

def test_image_name_mapping(sandbox):
    assert sandbox.get_image_name("linux") == "academy-sandbox-linux"
    assert sandbox.get_image_name("python") == "academy-sandbox-python"

def test_build_sandbox_image(sandbox):
    # This test requires Docker running
    result = sandbox.build_image("linux")
    assert result is True
```

- [ ] **Step 4: Verifier que les tests echouent**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_sandbox.py::test_sandbox_init -v
```
Expected: FAIL

- [ ] **Step 5: Implementer docker_sandbox.py**

```python
# ~/gaetan-academy/backend/services/docker_sandbox.py
import docker
from docker.errors import NotFound, BuildError
from pathlib import Path

SANDBOX_DIR = Path(__file__).parent.parent.parent / "sandbox"

class DockerSandbox:
    def __init__(self):
        self.client = docker.from_env()
        self.containers: dict[str, str] = {}  # exercise_id -> container_id

    def get_image_name(self, sandbox_type: str) -> str:
        return f"academy-sandbox-{sandbox_type}"

    def build_image(self, sandbox_type: str) -> bool:
        dockerfile = SANDBOX_DIR / f"Dockerfile.{sandbox_type}"
        if not dockerfile.exists():
            return False
        try:
            self.client.images.build(
                path=str(SANDBOX_DIR),
                dockerfile=f"Dockerfile.{sandbox_type}",
                tag=self.get_image_name(sandbox_type),
                rm=True,
            )
            return True
        except BuildError:
            return False

    def create_container(self, exercise_id: str, sandbox_type: str, setup_script: str | None = None) -> str:
        image = self.get_image_name(sandbox_type)
        container = self.client.containers.run(
            image=image,
            name=f"academy-{exercise_id}",
            detach=True,
            tty=True,
            stdin_open=True,
            mem_limit="256m",
            cpu_period=100000,
            cpu_quota=50000,  # 50% CPU max
            network_mode="none",  # isolation reseau
            remove=False,
        )
        if setup_script:
            container.exec_run(f"bash -c '{setup_script}'", user="root")
        self.containers[exercise_id] = container.id
        return container.id

    def exec_command(self, exercise_id: str, command: str) -> tuple[int, str]:
        container_id = self.containers.get(exercise_id)
        if not container_id:
            return -1, "No container found"
        try:
            container = self.client.containers.get(container_id)
            exit_code, output = container.exec_run(f"bash -c '{command}'", user="student")
            return exit_code, output.decode("utf-8", errors="replace")
        except NotFound:
            return -1, "Container not found"

    def validate_exercise(self, exercise_id: str, validation: dict) -> bool:
        if validation["type"] == "command_output":
            _, output = self.exec_command(exercise_id, validation["command"])
            return output.strip() == validation["expected"].strip()
        elif validation["type"] == "script":
            exit_code, output = self.exec_command(exercise_id, validation["command"])
            return output.strip() == validation["expected"].strip()
        return False

    def destroy_container(self, exercise_id: str):
        container_id = self.containers.pop(exercise_id, None)
        if container_id:
            try:
                container = self.client.containers.get(container_id)
                container.stop(timeout=5)
                container.remove()
            except NotFound:
                pass

    def cleanup_all(self):
        for exercise_id in list(self.containers.keys()):
            self.destroy_container(exercise_id)
```

- [ ] **Step 6: Ecrire le router sandbox**

```python
# ~/gaetan-academy/backend/routers/sandbox.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Exercise
from services.docker_sandbox import DockerSandbox

router = APIRouter(prefix="/api/sandbox")
sandbox = DockerSandbox()

class ExecRequest(BaseModel):
    command: str

@router.post("/{exercise_id}/start")
def start_sandbox(exercise_id: str, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter_by(external_id=exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if not ex.sandbox_image:
        raise HTTPException(status_code=400, detail="Exercise has no sandbox")
    try:
        container_id = sandbox.create_container(exercise_id, ex.sandbox_image, ex.setup_script)
        return {"status": "running", "container_id": container_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{exercise_id}/exec")
def exec_in_sandbox(exercise_id: str, req: ExecRequest):
    exit_code, output = sandbox.exec_command(exercise_id, req.command)
    if exit_code == -1:
        raise HTTPException(status_code=404, detail=output)
    return {"exit_code": exit_code, "output": output}

@router.post("/{exercise_id}/validate")
def validate_sandbox(exercise_id: str, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter_by(external_id=exercise_id).first()
    if not ex or not ex.validation:
        raise HTTPException(status_code=404, detail="Exercise or validation not found")
    passed = sandbox.validate_exercise(exercise_id, ex.validation)
    return {"passed": passed}

@router.delete("/{exercise_id}")
def stop_sandbox(exercise_id: str):
    sandbox.destroy_container(exercise_id)
    return {"status": "stopped"}
```

- [ ] **Step 7: Ajouter le router sandbox a main.py**

Ajouter dans `main.py` :

```python
from routers import dashboard, modules, exercises, progress, certifications, sandbox
# ...
app.include_router(sandbox.router)
```

- [ ] **Step 8: Build les images sandbox**

```bash
cd ~/gaetan-academy
docker build -t academy-sandbox-linux -f sandbox/Dockerfile.linux sandbox/
docker build -t academy-sandbox-python -f sandbox/Dockerfile.python sandbox/
```

- [ ] **Step 9: Lancer les tests**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_sandbox.py -v
```
Expected: PASS

- [ ] **Step 10: Commit**

```bash
cd ~/gaetan-academy
git add sandbox/ backend/services/docker_sandbox.py backend/routers/sandbox.py backend/tests/test_sandbox.py backend/main.py
git commit -m "feat: add Docker sandbox service with isolated containers per exercise"
```

---

### Task 5: Service Jupyter Notebooks

**Files:**
- Create: `~/gaetan-academy/backend/services/jupyter_manager.py`
- Create: `~/gaetan-academy/backend/routers/notebooks.py`
- Create: `~/gaetan-academy/notebooks/python_basics.ipynb`
- Create: `~/gaetan-academy/notebooks/fastapi_intro.ipynb`
- Modify: `~/gaetan-academy/backend/main.py` (add notebooks router)
- Test: `~/gaetan-academy/backend/tests/test_jupyter.py`

- [ ] **Step 1: Ecrire le test Jupyter**

```python
# ~/gaetan-academy/backend/tests/test_jupyter.py
import pytest
from services.jupyter_manager import JupyterManager

def test_jupyter_manager_init():
    jm = JupyterManager()
    assert jm.port == 8888

def test_notebooks_dir_exists():
    jm = JupyterManager()
    assert jm.notebooks_dir.exists()

def test_list_notebooks():
    jm = JupyterManager()
    notebooks = jm.list_notebooks()
    assert isinstance(notebooks, list)
```

- [ ] **Step 2: Verifier que les tests echouent**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_jupyter.py -v
```
Expected: FAIL

- [ ] **Step 3: Implementer jupyter_manager.py**

```python
# ~/gaetan-academy/backend/services/jupyter_manager.py
import subprocess
import signal
from pathlib import Path
from config import JUPYTER_PORT

NOTEBOOKS_DIR = Path(__file__).parent.parent.parent / "notebooks"

class JupyterManager:
    def __init__(self):
        self.port = JUPYTER_PORT
        self.notebooks_dir = NOTEBOOKS_DIR
        self.process: subprocess.Popen | None = None
        self.token = "academy-local-token"

    def start(self) -> str:
        if self.process and self.process.poll() is None:
            return self.get_url()
        self.process = subprocess.Popen(
            [
                "jupyter", "notebook",
                f"--port={self.port}",
                "--no-browser",
                f"--NotebookApp.token={self.token}",
                "--NotebookApp.allow_origin=*",
                f"--notebook-dir={self.notebooks_dir}",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        return self.get_url()

    def stop(self):
        if self.process:
            self.process.send_signal(signal.SIGTERM)
            self.process.wait(timeout=5)
            self.process = None

    def get_url(self) -> str:
        return f"http://localhost:{self.port}/?token={self.token}"

    def list_notebooks(self) -> list[dict]:
        notebooks = []
        for nb in sorted(self.notebooks_dir.glob("*.ipynb")):
            notebooks.append({
                "name": nb.stem,
                "filename": nb.name,
                "path": str(nb),
            })
        return notebooks

    def is_running(self) -> bool:
        return self.process is not None and self.process.poll() is None
```

- [ ] **Step 4: Ecrire le router notebooks**

```python
# ~/gaetan-academy/backend/routers/notebooks.py
from fastapi import APIRouter
from services.jupyter_manager import JupyterManager

router = APIRouter(prefix="/api/notebooks")
jupyter = JupyterManager()

@router.get("/")
def list_notebooks():
    return {
        "notebooks": jupyter.list_notebooks(),
        "running": jupyter.is_running(),
    }

@router.post("/start")
def start_jupyter():
    url = jupyter.start()
    return {"status": "running", "url": url}

@router.post("/stop")
def stop_jupyter():
    jupyter.stop()
    return {"status": "stopped"}
```

- [ ] **Step 5: Creer les notebooks de base**

```python
# Script a executer pour creer les notebooks
# ~/gaetan-academy/backend/scripts/create_notebooks.py
import json
from pathlib import Path

NOTEBOOKS_DIR = Path(__file__).parent.parent.parent / "notebooks"

def make_notebook(cells):
    return {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}},
        "cells": cells,
    }

def md(source):
    return {"cell_type": "markdown", "metadata": {}, "source": source.split("\n")}

def code(source):
    return {"cell_type": "code", "metadata": {}, "source": source.split("\n"), "outputs": [], "execution_count": None}

# Python Basics
python_nb = make_notebook([
    md("# Python Basics\n\nExercices de base Python pour GaetanAcademy."),
    md("## Variables et types"),
    code("# Declare une variable nom avec ton prenom\nnom = \"Gaetan\"\nprint(f\"Bonjour {nom}!\")"),
    md("## Listes et comprehensions"),
    code("# Cree une liste des carres de 1 a 10\ncarres = [x**2 for x in range(1, 11)]\nprint(carres)"),
    md("## Fonctions"),
    code("def fibonacci(n):\n    \"\"\"Retourne les n premiers nombres de Fibonacci.\"\"\"\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib[:n]\n\nprint(fibonacci(10))"),
    md("## A toi ! Ecris une fonction qui verifie si un nombre est premier."),
    code("def is_prime(n):\n    # Ton code ici\n    pass\n\n# Tests\nassert is_prime(7) == True\nassert is_prime(4) == False\nassert is_prime(2) == True\nprint(\"Tous les tests passent !\")"),
])

fastapi_nb = make_notebook([
    md("# FastAPI Introduction\n\nDecouverte de FastAPI avec des exemples pratiques."),
    md("## Installation"),
    code("!pip install fastapi uvicorn httpx"),
    md("## Premier endpoint"),
    code("from fastapi import FastAPI\nfrom fastapi.testclient import TestClient\n\napp = FastAPI()\n\n@app.get(\"/hello\")\ndef hello():\n    return {\"message\": \"Hello World\"}\n\n# Test\nclient = TestClient(app)\nresponse = client.get(\"/hello\")\nprint(response.json())"),
    md("## Path parameters"),
    code("@app.get(\"/users/{user_id}\")\ndef get_user(user_id: int):\n    return {\"user_id\": user_id, \"name\": f\"User {user_id}\"}\n\nresponse = client.get(\"/users/42\")\nprint(response.json())"),
    md("## A toi ! Cree un endpoint POST /items qui accepte un JSON {name, price}."),
    code("from pydantic import BaseModel\n\nclass Item(BaseModel):\n    name: str\n    price: float\n\n# Ton code ici\n# @app.post(\"/items\")\n# def create_item(item: Item):\n#     ...\n"),
])

NOTEBOOKS_DIR.mkdir(exist_ok=True)
for name, nb in [("python_basics", python_nb), ("fastapi_intro", fastapi_nb)]:
    with open(NOTEBOOKS_DIR / f"{name}.ipynb", "w") as f:
        json.dump(nb, f, indent=2)
print("Notebooks created!")
```

```bash
cd ~/gaetan-academy/backend
python scripts/create_notebooks.py
```

- [ ] **Step 6: Ajouter le router notebooks a main.py**

```python
from routers import dashboard, modules, exercises, progress, certifications, sandbox, notebooks
# ...
app.include_router(notebooks.router)
```

- [ ] **Step 7: Lancer les tests**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_jupyter.py -v
```
Expected: PASS

- [ ] **Step 8: Commit**

```bash
cd ~/gaetan-academy
git add backend/services/jupyter_manager.py backend/routers/notebooks.py notebooks/ backend/scripts/ backend/tests/test_jupyter.py backend/main.py
git commit -m "feat: add Jupyter notebook integration with manager service"
```

---

### Task 6: Frontend — Setup React + Layout + Dashboard

**Files:**
- Create: `~/gaetan-academy/frontend/package.json`
- Create: `~/gaetan-academy/frontend/vite.config.ts`
- Create: `~/gaetan-academy/frontend/tsconfig.json`
- Create: `~/gaetan-academy/frontend/index.html`
- Create: `~/gaetan-academy/frontend/src/main.tsx`
- Create: `~/gaetan-academy/frontend/src/App.tsx`
- Create: `~/gaetan-academy/frontend/src/api/client.ts`
- Create: `~/gaetan-academy/frontend/src/styles/globals.css`
- Create: `~/gaetan-academy/frontend/src/components/Layout.tsx`
- Create: `~/gaetan-academy/frontend/src/components/Sidebar.tsx`
- Create: `~/gaetan-academy/frontend/src/components/XPBar.tsx`
- Create: `~/gaetan-academy/frontend/src/components/StreakCounter.tsx`
- Create: `~/gaetan-academy/frontend/src/components/ModuleCard.tsx`
- Create: `~/gaetan-academy/frontend/src/components/ProgressRing.tsx`
- Create: `~/gaetan-academy/frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Init le projet frontend**

```json
// ~/gaetan-academy/frontend/package.json
{
  "name": "gaetan-academy",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.5.0",
    "lucide-react": "^0.460.0",
    "@xterm/xterm": "^5.5.0",
    "@xterm/addon-fit": "^0.10.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.8.0",
    "vite": "^6.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

```bash
cd ~/gaetan-academy/frontend
pnpm install
```

- [ ] **Step 2: Config Vite + TypeScript**

```typescript
// ~/gaetan-academy/frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
```

```json
// ~/gaetan-academy/frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Ecrire index.html + entry point**

```html
<!-- ~/gaetan-academy/frontend/index.html -->
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GaetanAcademy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```css
/* ~/gaetan-academy/frontend/src/styles/globals.css */
@import "tailwindcss";

:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent: #3b82f6;
  --accent-green: #22c55e;
  --accent-orange: #f97316;
  --accent-purple: #a855f7;
  --accent-red: #ef4444;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: "Inter", system-ui, sans-serif;
  margin: 0;
}
```

```tsx
// ~/gaetan-academy/frontend/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 4: Ecrire le client API**

```typescript
// ~/gaetan-academy/frontend/src/api/client.ts
const BASE = "/api";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface DashboardData {
  xp: number;
  level: string;
  streak_days: number;
  badges_count: number;
  modules_progress: ModuleProgress[];
}

export interface ModuleProgress {
  slug: string;
  name: string;
  icon: string;
  color: string;
  phase: number;
  total: number;
  completed: number;
  percent: number;
}

export interface ExerciseItem {
  id: string;
  title: string;
  difficulty: number;
  xp: number;
  type: string;
  tags: string[];
  completed: boolean;
  attempts: number;
}

export interface ExerciseDetail extends ExerciseItem {
  module_slug: string;
  description: string;
  sandbox_image: string;
  hints: string[];
}

export interface CertificationItem {
  slug: string;
  name: string;
  provider: string;
  description: string;
  cost: string;
  funding: string;
  target_date: string | null;
  passed: boolean;
  prerequisite_modules: string;
  priority: string;
}
```

- [ ] **Step 5: Ecrire les composants UI**

```tsx
// ~/gaetan-academy/frontend/src/components/XPBar.tsx
interface XPBarProps {
  xp: number;
  level: string;
}

const LEVEL_THRESHOLDS: Record<string, [number, number]> = {
  Debutant: [0, 100],
  Apprenti: [100, 500],
  Praticien: [500, 1500],
  Expert: [1500, 3000],
  Architecte: [3000, 10000],
};

export default function XPBar({ xp, level }: XPBarProps) {
  const [min, max] = LEVEL_THRESHOLDS[level] || [0, 100];
  const progress = Math.min(((xp - min) / (max - min)) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-blue-400 font-bold">{level}</span>
        <span className="text-slate-400">{xp} XP</span>
      </div>
      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

```tsx
// ~/gaetan-academy/frontend/src/components/StreakCounter.tsx
import { Flame } from "lucide-react";

interface StreakCounterProps {
  days: number;
}

export default function StreakCounter({ days }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
      <Flame className={days > 0 ? "text-orange-500" : "text-slate-600"} size={24} />
      <div>
        <div className="text-2xl font-bold">{days}</div>
        <div className="text-xs text-slate-400">jours de streak</div>
      </div>
    </div>
  );
}
```

```tsx
// ~/gaetan-academy/frontend/src/components/ProgressRing.tsx
interface ProgressRingProps {
  percent: number;
  color: string;
  size?: number;
}

export default function ProgressRing({ percent, color, size = 64 }: ProgressRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#334155"
        strokeWidth={4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}
```

```tsx
// ~/gaetan-academy/frontend/src/components/ModuleCard.tsx
import { Link } from "react-router-dom";
import ProgressRing from "./ProgressRing";
import type { ModuleProgress } from "../api/client";

export default function ModuleCard({ module }: { module: ModuleProgress }) {
  return (
    <Link
      to={`/modules/${module.slug}`}
      className="bg-slate-800 rounded-xl p-5 hover:bg-slate-750 transition-colors border border-slate-700 hover:border-slate-600"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-slate-400">Phase {module.phase}</div>
          <div className="text-lg font-semibold">{module.name}</div>
        </div>
        <ProgressRing percent={module.percent} color={module.color} />
      </div>
      <div className="flex justify-between text-sm text-slate-400">
        <span>{module.completed}/{module.total} exercices</span>
        <span style={{ color: module.color }}>{module.percent}%</span>
      </div>
    </Link>
  );
}
```

```tsx
// ~/gaetan-academy/frontend/src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Award, GraduationCap, User } from "lucide-react";

const NAV = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/modules", icon: BookOpen, label: "Modules" },
  { path: "/certifications", icon: GraduationCap, label: "Certifications" },
  { path: "/profile", icon: User, label: "Profil" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          GaetanAcademy
        </h1>
        <p className="text-xs text-slate-500 mt-1">Solutions Architect IA</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

```tsx
// ~/gaetan-academy/frontend/src/components/Layout.tsx
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Ecrire la page Dashboard**

```tsx
// ~/gaetan-academy/frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { api, type DashboardData } from "../api/client";
import XPBar from "../components/XPBar";
import StreakCounter from "../components/StreakCounter";
import ModuleCard from "../components/ModuleCard";
import { Trophy } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api<DashboardData>("/dashboard").then(setData);
  }, []);

  if (!data) return <div className="text-slate-400">Chargement...</div>;

  const phase1 = data.modules_progress.filter((m) => m.phase === 1);
  const phase2 = data.modules_progress.filter((m) => m.phase === 2);
  const phase3 = data.modules_progress.filter((m) => m.phase === 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salut Gaetan !</h1>
          <p className="text-slate-400 mt-1">Continue ta progression vers Solutions Architect IA</p>
        </div>
        <StreakCounter days={data.streak_days} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <XPBar xp={data.xp} level={data.level} />
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex items-center gap-4">
          <Trophy className="text-yellow-500" size={32} />
          <div>
            <div className="text-2xl font-bold">{data.badges_count}</div>
            <div className="text-sm text-slate-400">Badges gagnes</div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Progression globale</div>
          <div className="text-2xl font-bold">
            {Math.round(
              data.modules_progress.reduce((acc, m) => acc + m.percent, 0) /
                data.modules_progress.length
            )}%
          </div>
        </div>
      </div>

      {[
        { title: "Phase 1 — Fondations", modules: phase1 },
        { title: "Phase 2 — Cloud + Certifs", modules: phase2 },
        { title: "Phase 3 — Specialisation", modules: phase3 },
      ].map(({ title, modules }) => (
        <section key={title}>
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <ModuleCard key={m.slug} module={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Ecrire App.tsx avec le routing**

```tsx
// ~/gaetan-academy/frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Pages suivantes ajoutees dans les tasks suivantes */}
      </Routes>
    </Layout>
  );
}
```

- [ ] **Step 8: Verifier que le frontend compile**

```bash
cd ~/gaetan-academy/frontend
pnpm run build
```
Expected: Build successful

- [ ] **Step 9: Commit**

```bash
cd ~/gaetan-academy
git add frontend/
git commit -m "feat: add React frontend with Dashboard, XP bar, streak, module cards"
```

---

### Task 7: Frontend — Pages Modules, Exercices, Terminal

**Files:**
- Create: `~/gaetan-academy/frontend/src/pages/ModuleList.tsx`
- Create: `~/gaetan-academy/frontend/src/pages/ModuleDetail.tsx`
- Create: `~/gaetan-academy/frontend/src/pages/Exercise.tsx`
- Create: `~/gaetan-academy/frontend/src/components/ExerciseCard.tsx`
- Create: `~/gaetan-academy/frontend/src/components/Terminal.tsx`
- Create: `~/gaetan-academy/frontend/src/hooks/useApi.ts`
- Modify: `~/gaetan-academy/frontend/src/App.tsx` (add routes)

- [ ] **Step 1: Ecrire le hook useApi**

```typescript
// ~/gaetan-academy/frontend/src/hooks/useApi.ts
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api<T>(path)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [path]);

  return { data, loading, error, refetch: () => api<T>(path).then(setData) };
}
```

- [ ] **Step 2: Ecrire ExerciseCard**

```tsx
// ~/gaetan-academy/frontend/src/components/ExerciseCard.tsx
import { Link } from "react-router-dom";
import { CheckCircle, Circle, Star } from "lucide-react";
import type { ExerciseItem } from "../api/client";

export default function ExerciseCard({ exercise }: { exercise: ExerciseItem }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < exercise.difficulty);

  return (
    <Link
      to={`/exercises/${exercise.id}`}
      className="flex items-center gap-4 bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors border border-slate-700"
    >
      {exercise.completed ? (
        <CheckCircle className="text-green-500 shrink-0" size={24} />
      ) : (
        <Circle className="text-slate-600 shrink-0" size={24} />
      )}
      <div className="flex-1">
        <div className="font-medium">{exercise.title}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex gap-0.5">
            {stars.map((filled, i) => (
              <Star
                key={i}
                size={12}
                className={filled ? "text-yellow-500 fill-yellow-500" : "text-slate-600"}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">{exercise.type}</span>
          {exercise.tags.map((tag) => (
            <span key={tag} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="text-sm text-blue-400 font-mono">{exercise.xp} XP</div>
    </Link>
  );
}
```

- [ ] **Step 3: Ecrire ModuleList page**

```tsx
// ~/gaetan-academy/frontend/src/pages/ModuleList.tsx
import { useApi } from "../hooks/useApi";
import ModuleCard from "../components/ModuleCard";
import type { ModuleProgress } from "../api/client";

interface ModulesResponse {
  slug: string;
  name: string;
  description: string;
  icon: string;
  phase: number;
  order: number;
  color: string;
}

export default function ModuleList() {
  const { data: modules, loading } = useApi<ModulesResponse[]>("/modules");

  if (loading || !modules) return <div className="text-slate-400">Chargement...</div>;

  const byPhase = [1, 2, 3].map((phase) => ({
    phase,
    modules: modules.filter((m) => m.phase === phase),
  }));

  const phaseNames: Record<number, string> = {
    1: "Phase 1 — Fondations (Mois 1-3)",
    2: "Phase 2 — Cloud + Certifs (Mois 3-6)",
    3: "Phase 3 — Specialisation (Mois 4-9)",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Modules</h1>
      {byPhase.map(({ phase, modules }) => (
        <section key={phase}>
          <h2 className="text-xl font-semibold mb-4 text-slate-300">{phaseNames[phase]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <ModuleCard
                key={m.slug}
                module={{ ...m, total: 0, completed: 0, percent: 0 }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Ecrire ModuleDetail page**

```tsx
// ~/gaetan-academy/frontend/src/pages/ModuleDetail.tsx
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useApi } from "../hooks/useApi";
import ExerciseCard from "../components/ExerciseCard";
import type { ExerciseItem } from "../api/client";

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: exercises, loading } = useApi<ExerciseItem[]>(`/modules/${slug}/exercises`);

  if (loading || !exercises) return <div className="text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/modules" className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
        <ArrowLeft size={18} />
        Retour aux modules
      </Link>
      <h1 className="text-3xl font-bold capitalize">{slug?.replace("_", " ")}</h1>
      <div className="text-slate-400">
        {exercises.filter((e) => e.completed).length}/{exercises.length} exercices termines
      </div>
      <div className="space-y-3">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Ecrire le composant Terminal (xterm.js)**

```tsx
// ~/gaetan-academy/frontend/src/components/Terminal.tsx
import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { api } from "../api/client";

interface TerminalProps {
  exerciseId: string;
}

export default function Terminal({ exerciseId }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerminal | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerminal({
      theme: {
        background: "#0f172a",
        foreground: "#f1f5f9",
        cursor: "#3b82f6",
      },
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 14,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;

    let currentLine = "";

    term.writeln("GaetanAcademy Sandbox Terminal");
    term.writeln("---");
    term.write("$ ");

    term.onData((data) => {
      if (data === "\r") {
        term.writeln("");
        if (currentLine.trim()) {
          api<{ exit_code: number; output: string }>(
            `/sandbox/${exerciseId}/exec`,
            {
              method: "POST",
              body: JSON.stringify({ command: currentLine }),
            }
          ).then((res) => {
            if (res.output) term.writeln(res.output);
            term.write("$ ");
          }).catch((err) => {
            term.writeln(`Error: ${err.message}`);
            term.write("$ ");
          });
        } else {
          term.write("$ ");
        }
        currentLine = "";
      } else if (data === "\x7f") {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write("\b \b");
        }
      } else {
        currentLine += data;
        term.write(data);
      }
    });

    return () => {
      term.dispose();
    };
  }, [exerciseId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-80 rounded-lg overflow-hidden border border-slate-700"
    />
  );
}
```

- [ ] **Step 6: Ecrire la page Exercise**

```tsx
// ~/gaetan-academy/frontend/src/pages/Exercise.tsx
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, CheckCircle, Lightbulb, Play, RotateCcw } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { api, type ExerciseDetail } from "../api/client";
import Terminal from "../components/Terminal";

export default function Exercise() {
  const { id } = useParams<{ id: string }>();
  const { data: exercise, loading, refetch } = useApi<ExerciseDetail>(`/exercises/${id}`);
  const [sandboxReady, setSandboxReady] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  if (loading || !exercise) return <div className="text-slate-400">Chargement...</div>;

  const startSandbox = async () => {
    await api(`/sandbox/${id}/start`, { method: "POST" });
    setSandboxReady(true);
  };

  const validate = async () => {
    const res = await api<{ passed: boolean }>(`/sandbox/${id}/validate`, { method: "POST" });
    setValidationResult(res.passed);
    if (res.passed) {
      const complete = await api<{ xp_earned: number }>(`/exercises/${id}/complete`, {
        method: "POST",
      });
      setXpEarned(complete.xp_earned);
      refetch();
    }
  };

  const resetSandbox = async () => {
    await api(`/sandbox/${id}`, { method: "DELETE" });
    setSandboxReady(false);
    setValidationResult(null);
    await startSandbox();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to={`/modules/${exercise.module_slug}`}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft size={18} />
        Retour au module
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{exercise.title}</h1>
        <span className="text-blue-400 font-mono">{exercise.xp} XP</span>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
          {exercise.description}
        </div>
      </div>

      {/* Hints */}
      {exercise.hints.length > 0 && (
        <div>
          <button
            onClick={() => setHintsShown(Math.min(hintsShown + 1, exercise.hints.length))}
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 text-sm"
          >
            <Lightbulb size={16} />
            {hintsShown === 0 ? "Afficher un indice" : `Indice suivant (${hintsShown}/${exercise.hints.length})`}
          </button>
          {exercise.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="mt-2 bg-yellow-500/10 text-yellow-200 rounded-lg px-4 py-2 text-sm">
              {hint}
            </div>
          ))}
        </div>
      )}

      {/* Sandbox */}
      {exercise.type === "sandbox" && (
        <div className="space-y-4">
          {!sandboxReady ? (
            <button
              onClick={startSandbox}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Play size={18} />
              Lancer le sandbox
            </button>
          ) : (
            <>
              <Terminal exerciseId={id!} />
              <div className="flex gap-3">
                <button
                  onClick={validate}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <CheckCircle size={18} />
                  Valider
                </button>
                <button
                  onClick={resetSandbox}
                  className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Validation result */}
      {validationResult === true && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
          <CheckCircle className="text-green-500 mx-auto mb-2" size={48} />
          <div className="text-xl font-bold text-green-400">Bravo !</div>
          <div className="text-green-300">+{xpEarned} XP gagnes</div>
        </div>
      )}
      {validationResult === false && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
          Pas encore... Reessaie ! Utilise les indices si besoin.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Mettre a jour App.tsx avec les nouvelles routes**

```tsx
// ~/gaetan-academy/frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ModuleList from "./pages/ModuleList";
import ModuleDetail from "./pages/ModuleDetail";
import Exercise from "./pages/Exercise";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/modules" element={<ModuleList />} />
        <Route path="/modules/:slug" element={<ModuleDetail />} />
        <Route path="/exercises/:id" element={<Exercise />} />
      </Routes>
    </Layout>
  );
}
```

- [ ] **Step 8: Verifier que le build passe**

```bash
cd ~/gaetan-academy/frontend
pnpm run build
```
Expected: Build successful

- [ ] **Step 9: Commit**

```bash
cd ~/gaetan-academy
git add frontend/
git commit -m "feat: add module list, exercise detail, and sandbox terminal pages"
```

---

### Task 8: Frontend — Pages Certifications et Profil

**Files:**
- Create: `~/gaetan-academy/frontend/src/pages/Certifications.tsx`
- Create: `~/gaetan-academy/frontend/src/pages/Profile.tsx`
- Create: `~/gaetan-academy/frontend/src/components/CertTimeline.tsx`
- Create: `~/gaetan-academy/frontend/src/components/BadgeGrid.tsx`
- Modify: `~/gaetan-academy/frontend/src/App.tsx` (add routes)

- [ ] **Step 1: Ecrire CertTimeline**

```tsx
// ~/gaetan-academy/frontend/src/components/CertTimeline.tsx
import { CheckCircle, Circle, Calendar } from "lucide-react";
import type { CertificationItem } from "../api/client";

export default function CertTimeline({ certs }: { certs: CertificationItem[] }) {
  const beforeJob = certs.filter((c) => c.priority === "before_job");
  const onJob = certs.filter((c) => c.priority === "on_job");

  const renderCert = (cert: CertificationItem) => (
    <div
      key={cert.slug}
      className={`relative flex gap-4 pb-8 ${cert.passed ? "opacity-70" : ""}`}
    >
      <div className="flex flex-col items-center">
        {cert.passed ? (
          <CheckCircle className="text-green-500" size={24} />
        ) : (
          <Circle className="text-blue-500" size={24} />
        )}
        <div className="w-0.5 flex-1 bg-slate-700 mt-2" />
      </div>
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">{cert.name}</div>
            <div className="text-sm text-slate-400">{cert.provider}</div>
          </div>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
            {cert.funding === "CPF" ? "CPF" : cert.cost}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-2">{cert.description}</p>
        {cert.target_date && (
          <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
            <Calendar size={12} />
            Objectif: {new Date(cert.target_date).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4 text-orange-400">Avant premier poste</h2>
        <div>{beforeJob.map(renderCert)}</div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4 text-blue-400">En poste</h2>
        <div>{onJob.map(renderCert)}</div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Ecrire BadgeGrid**

```tsx
// ~/gaetan-academy/frontend/src/components/BadgeGrid.tsx
interface BadgeItem {
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export default function BadgeGrid({ badges }: { badges: BadgeItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.slug}
          className={`rounded-xl p-4 text-center border transition-all ${
            badge.earned
              ? "bg-slate-800 border-yellow-500/30 shadow-lg shadow-yellow-500/5"
              : "bg-slate-800/50 border-slate-700 opacity-40 grayscale"
          }`}
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <div className="font-medium text-sm">{badge.name}</div>
          <div className="text-xs text-slate-400 mt-1">{badge.description}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Ecrire Certifications page**

```tsx
// ~/gaetan-academy/frontend/src/pages/Certifications.tsx
import { useApi } from "../hooks/useApi";
import CertTimeline from "../components/CertTimeline";
import type { CertificationItem } from "../api/client";

export default function Certifications() {
  const { data: certs, loading } = useApi<CertificationItem[]>("/certifications");

  if (loading || !certs) return <div className="text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Certifications</h1>
      <p className="text-slate-400">
        Parcours de certifications aligne avec ton plan de carriere.
        Budget: ~3 500 EUR CPF + ~500 EUR perso.
      </p>
      <CertTimeline certs={certs} />
    </div>
  );
}
```

- [ ] **Step 4: Ecrire Profile page**

```tsx
// ~/gaetan-academy/frontend/src/pages/Profile.tsx
import { useApi } from "../hooks/useApi";
import XPBar from "../components/XPBar";
import StreakCounter from "../components/StreakCounter";
import BadgeGrid from "../components/BadgeGrid";

interface ProfileData {
  exercises_completed: number;
  total_attempts: number;
  xp: number;
  level: string;
  streak_days: number;
}

interface BadgeItem {
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export default function Profile() {
  const { data: profile, loading: l1 } = useApi<ProfileData>("/progress");
  const { data: badges, loading: l2 } = useApi<BadgeItem[]>("/badges");

  if (l1 || l2 || !profile || !badges) return <div className="text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Profil</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <XPBar xp={profile.xp} level={profile.level} />
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex items-center justify-center">
          <StreakCounter days={profile.streak_days} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold">{profile.exercises_completed}</div>
          <div className="text-sm text-slate-400">Exercices termines</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold">{profile.total_attempts}</div>
          <div className="text-sm text-slate-400">Tentatives totales</div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <BadgeGrid badges={badges} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Mettre a jour App.tsx**

```tsx
// ~/gaetan-academy/frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ModuleList from "./pages/ModuleList";
import ModuleDetail from "./pages/ModuleDetail";
import Exercise from "./pages/Exercise";
import Certifications from "./pages/Certifications";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/modules" element={<ModuleList />} />
        <Route path="/modules/:slug" element={<ModuleDetail />} />
        <Route path="/exercises/:id" element={<Exercise />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}
```

- [ ] **Step 6: Build et verifier**

```bash
cd ~/gaetan-academy/frontend
pnpm run build
```
Expected: Build successful

- [ ] **Step 7: Commit**

```bash
cd ~/gaetan-academy
git add frontend/
git commit -m "feat: add Certifications timeline and Profile page with badges"
```

---

### Task 9: Docker Compose + Makefile — Orchestration complete

**Files:**
- Create: `~/gaetan-academy/docker-compose.yml`
- Create: `~/gaetan-academy/backend/Dockerfile`
- Create: `~/gaetan-academy/frontend/Dockerfile`
- Create: `~/gaetan-academy/Makefile`

- [ ] **Step 1: Ecrire le Dockerfile backend**

```dockerfile
# ~/gaetan-academy/backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

- [ ] **Step 2: Ecrire le Dockerfile frontend**

```dockerfile
# ~/gaetan-academy/frontend/Dockerfile
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8000;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
EXPOSE 80
```

- [ ] **Step 3: Ecrire docker-compose.yml**

```yaml
# ~/gaetan-academy/docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./notebooks:/notebooks
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - PYTHONDONTWRITEBYTECODE=1

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  jupyter:
    image: jupyter/minimal-notebook:latest
    ports:
      - "8888:8888"
    volumes:
      - ./notebooks:/home/jovyan/work
    environment:
      - JUPYTER_TOKEN=academy-local-token
    command: start-notebook.sh --NotebookApp.allow_origin='*'
```

- [ ] **Step 4: Ecrire le Makefile**

```makefile
# ~/gaetan-academy/Makefile
.PHONY: dev dev-backend dev-frontend sandbox-build seed test clean

# Developpement local (sans Docker)
dev:
	@echo "Starting backend + frontend..."
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000

dev-frontend:
	cd frontend && pnpm dev

# Docker
up:
	docker compose up --build -d

down:
	docker compose down

# Sandbox images
sandbox-build:
	docker build -t academy-sandbox-linux -f sandbox/Dockerfile.linux sandbox/
	docker build -t academy-sandbox-python -f sandbox/Dockerfile.python sandbox/

# Seed la base de donnees
seed:
	cd backend && source .venv/bin/activate && python -c "from database import engine, Base, SessionLocal; from services.seed import seed_database; Base.metadata.create_all(bind=engine); db = SessionLocal(); seed_database(db); db.close(); print('Seed OK')"

# Tests
test:
	cd backend && source .venv/bin/activate && python -m pytest tests/ -v

# Nettoyage
clean:
	docker compose down -v
	docker container prune -f --filter "label=academy"
	rm -f backend/academy.db
```

- [ ] **Step 5: Commit**

```bash
cd ~/gaetan-academy
git add docker-compose.yml Makefile backend/Dockerfile frontend/Dockerfile
git commit -m "feat: add Docker Compose orchestration and Makefile"
```

---

### Task 10: GitHub Importer — Import d'exercices depuis des repos

**Files:**
- Create: `~/gaetan-academy/backend/services/github_importer.py`
- Create: `~/gaetan-academy/backend/routers/import_exercises.py`
- Modify: `~/gaetan-academy/backend/main.py` (add import router)
- Test: `~/gaetan-academy/backend/tests/test_github_importer.py`

- [ ] **Step 1: Ecrire le test**

```python
# ~/gaetan-academy/backend/tests/test_github_importer.py
import pytest
from services.github_importer import GitHubImporter

def test_parse_repo_url():
    importer = GitHubImporter()
    owner, repo = importer.parse_repo("eficode-academy/git-katas")
    assert owner == "eficode-academy"
    assert repo == "git-katas"

def test_parse_repo_url_full():
    importer = GitHubImporter()
    owner, repo = importer.parse_repo("https://github.com/eficode-academy/git-katas")
    assert owner == "eficode-academy"
    assert repo == "git-katas"
```

- [ ] **Step 2: Verifier que les tests echouent**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_github_importer.py -v
```
Expected: FAIL

- [ ] **Step 3: Implementer github_importer.py**

```python
# ~/gaetan-academy/backend/services/github_importer.py
import httpx
from pathlib import Path

class GitHubImporter:
    BASE_URL = "https://api.github.com"

    def parse_repo(self, repo_ref: str) -> tuple[str, str]:
        repo_ref = repo_ref.rstrip("/")
        if "github.com" in repo_ref:
            parts = repo_ref.split("github.com/")[1].split("/")
        else:
            parts = repo_ref.split("/")
        return parts[0], parts[1]

    def list_contents(self, owner: str, repo: str, path: str = "") -> list[dict]:
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/contents/{path}"
        resp = httpx.get(url, headers={"Accept": "application/vnd.github.v3+json"})
        resp.raise_for_status()
        return resp.json()

    def get_file_content(self, owner: str, repo: str, path: str) -> str:
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/contents/{path}"
        resp = httpx.get(url, headers={"Accept": "application/vnd.github.v3.raw"})
        resp.raise_for_status()
        return resp.text

    def get_readme(self, owner: str, repo: str, path: str = "") -> str | None:
        try:
            contents = self.list_contents(owner, repo, path)
            for item in contents:
                if item["name"].lower() in ("readme.md", "readme.txt", "readme"):
                    return self.get_file_content(owner, repo, item["path"])
        except Exception:
            pass
        return None

    def import_repo_as_exercises(self, repo_ref: str, module_slug: str) -> list[dict]:
        owner, repo = self.parse_repo(repo_ref)
        contents = self.list_contents(owner, repo)

        exercises = []
        order = 0
        for item in contents:
            if item["type"] != "dir":
                continue

            readme = self.get_readme(owner, repo, item["path"])
            if not readme:
                continue

            order += 1
            exercises.append({
                "id": f"{module_slug}-gh-{order:03d}",
                "module": module_slug,
                "title": item["name"].replace("-", " ").replace("_", " ").title(),
                "description": readme[:2000],
                "difficulty": min(1 + order // 5, 5),
                "xp": 25 + (order * 5),
                "type": "sandbox",
                "sandbox_image": "linux",
                "tags": [module_slug, "github-import"],
                "source_repo": repo_ref,
                "order": order,
            })

        return exercises
```

- [ ] **Step 4: Ecrire le router import**

```python
# ~/gaetan-academy/backend/routers/import_exercises.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Exercise
from services.github_importer import GitHubImporter

router = APIRouter(prefix="/api/import")
importer = GitHubImporter()

class ImportRequest(BaseModel):
    repo: str
    module_slug: str

@router.post("/github")
def import_from_github(req: ImportRequest, db: Session = Depends(get_db)):
    try:
        exercises = importer.import_repo_as_exercises(req.repo, req.module_slug)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {e}")

    imported = 0
    for ex in exercises:
        if not db.query(Exercise).filter_by(external_id=ex["id"]).first():
            db.add(Exercise(
                external_id=ex["id"],
                module_slug=ex["module"],
                title=ex["title"],
                description=ex["description"],
                difficulty=ex["difficulty"],
                xp=ex["xp"],
                type=ex["type"],
                sandbox_image=ex.get("sandbox_image"),
                tags=ex.get("tags", []),
                source_repo=ex.get("source_repo"),
                order=ex.get("order", 0),
            ))
            imported += 1

    db.commit()
    return {"imported": imported, "total_found": len(exercises)}
```

- [ ] **Step 5: Ajouter le router a main.py**

```python
from routers import dashboard, modules, exercises, progress, certifications, sandbox, notebooks, import_exercises
# ...
app.include_router(import_exercises.router)
```

- [ ] **Step 6: Lancer les tests**

```bash
cd ~/gaetan-academy/backend
python -m pytest tests/test_github_importer.py -v
```
Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd ~/gaetan-academy
git add backend/services/github_importer.py backend/routers/import_exercises.py backend/tests/test_github_importer.py backend/main.py
git commit -m "feat: add GitHub exercise importer service"
```

---

## Recapitulatif des tasks

| Task | Description | Fichiers cles |
|------|-------------|---------------|
| 1 | Backend FastAPI + modeles SQLAlchemy | `main.py`, `models/`, `database.py` |
| 2 | Seed data YAML (modules, exercices, certifs, badges) | `seed_data/`, `exercise_loader.py` |
| 3 | Routers API + gamification | `routers/`, `gamification.py` |
| 4 | Docker sandbox (containers isoles) | `docker_sandbox.py`, `sandbox/Dockerfile.*` |
| 5 | Jupyter notebooks integration | `jupyter_manager.py`, `notebooks/` |
| 6 | Frontend setup + Dashboard | `frontend/src/pages/Dashboard.tsx` |
| 7 | Pages Modules + Exercices + Terminal | `Terminal.tsx`, `Exercise.tsx` |
| 8 | Pages Certifications + Profil + Badges | `Certifications.tsx`, `Profile.tsx` |
| 9 | Docker Compose + Makefile | `docker-compose.yml`, `Makefile` |
| 10 | GitHub importer | `github_importer.py` |

---

## Exercices supplementaires a ajouter (post-v1)

Les fichiers YAML suivants sont a completer apres la v1 :
- `python_fastapi.yaml` — exercices FastAPI (endpoints, Pydantic, SQLAlchemy, tests)
- `networking.yaml` — exercices reseau (ping, traceroute, nmap, firewall)
- `aws_cloud.yaml` — exercices AWS (CLI, S3, EC2, IAM, VPC)
- `azure_ai.yaml` — exercices Azure AI (Cognitive Services, prompts)
- `mlops.yaml` — exercices MLOps (MLflow, tracking, serving)
- `llm_finetuning.yaml` — exercices fine-tuning (LoRA, datasets)
- `rag.yaml` — exercices RAG (embeddings, vectorDB, retrieval)
- `kubernetes.yaml` — exercices K8s (pods, deployments, services)
