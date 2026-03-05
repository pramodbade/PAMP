"""
PAMP — Pentest Assessment Management Platform
FastAPI Backend Entry Point
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, products, assessments, scope, endpoints, checklist, findings, blockers, custom_tests, summary, dashboard, admin

app = FastAPI(
    title="PAMP — Pentest Assessment Management Platform",
    description="Internal platform for managing penetration testing assessments",
    version="1.0.0",
)

# In production, traffic arrives via nginx (same origin) so CORS is only
# needed for local development. The wildcard is safe for an internal tool.
_allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(assessments.router)
app.include_router(scope.router)
app.include_router(endpoints.router)
app.include_router(checklist.router)
app.include_router(findings.router)
app.include_router(blockers.router)
app.include_router(custom_tests.router)
app.include_router(summary.router)
app.include_router(dashboard.router)
app.include_router(admin.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "PAMP API"}
