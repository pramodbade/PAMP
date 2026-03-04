# DO NOT RUN THE REPORTER STACK

## Summary

The **Reporter** service has been **deprecated and fully removed** from this platform.
Do **not** attempt to start it.

---

## Background

An earlier version of this VM ran a separate "Reporter" stack managed by a
**snap-installed Docker daemon** (`snap.docker.dockerd`).

That daemon is **disabled and stopped** as of 2026-03-04 and must stay that way.

The PAMP production stack runs exclusively on the **apt-installed Docker daemon**
(`/usr/bin/dockerd`, socket `/run/docker.sock`).

---

## Why Reporter Was Removed

- Reporter was superseded by the PAMP platform's native assessment and summary modules.
- The snap Docker daemon it depended on conflicted with the apt Docker daemon used by PAMP.
- Running two Docker daemons on the same VM causes networking conflicts and unpredictable container behaviour.

---

## What Remains on Disk (Do Not Touch)

| Path | What it is |
|------|-----------|
| `/home/harshil.mehta/reporter/` | Old reporter source — do not run |
| `/home/harshil/reporter/` | Old reporter source — do not run |
| `/var/snap/docker/...` | Stale snap Docker data root — do not start |

These files are left in place to avoid accidental data loss.
They are **not part of the PAMP stack** and should never be executed.

---

## Consequence of Running Reporter

Starting the snap Docker daemon or the reporter containers would:

1. Conflict with PAMP's Docker networking (`pamp_net`)
2. Potentially interrupt the running `pamp_db`, `pamp_backend`, `pamp_frontend`, `pamp_nginx` containers
3. Introduce duplicate daemon socket conflicts

---

## If You Need Reporting Functionality

Use the built-in **Assessment Summary** and **Dashboard** modules within PAMP.
Navigate to any assessment → **Summary** tab to generate a summary report.

---

*Last updated: 2026-03-04*
