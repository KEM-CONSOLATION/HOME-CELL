# HOME-CELL (Salvation Ministries) — Product Requirements Document (PRD)

Source: `SALVATION MINITRIES HOMECELL PROPOSAL.pdf` (Pilot Implementation – Cross River State).

## Overview

HOME-CELL is a web-based platform to digitize and centralize **Home Fellowship attendance**, **member tracking**, **new convert allocation**, **leadership oversight**, and **communication** (WhatsApp + Email) for Salvation Ministries — starting with **Cross River State** as the pilot region.

## Goals

- **Digitize attendance**: replace manual/paper reporting with weekly online submissions by cell leaders.
- **Improve follow-up**: ensure new converts are registered, assigned to home fellowships quickly, and tracked for follow-up.
- **Automate communication**: WhatsApp and email notifications for reminders, assignments, and announcements.
- **Increase leadership visibility**: real-time reporting and dashboards for all leadership layers.
- **Enforce accountability**: track compliance (who submitted attendance vs. who didn’t).

## Pilot Scope

- **Pilot State**: Cross River State
- **System Type**: Web-based platform
- **Access**: Mobile + Desktop
- **Users / Roles**:
  - Cell Leader
  - Zonal Leader
  - Area Leader
  - State Leader
  - State Pastor
  - Admin
- **Coverage**: All Home Fellowships in Cross River State
- **Expansion**: After successful pilot, extend to other states.

## Primary Personas (Role-based)

- **Cell Leader**: submits weekly attendance; manages members; receives new-convert assignments; updates follow-up progress; views basic reports.
- **Zonal Leader**: oversight of all cells in their zone; monitors compliance and attendance.
- **Area Leader**: oversight of zones in their area; aggregate visibility.
- **State Leader**: state-wide monitoring and reporting.
- **State Pastor**: full state overview dashboard.
- **Admin**: system administration (setup, user management, configurations).

## Core Features (from proposal)

### 1) Home Fellowship Attendance Management

- **Weekly attendance submission**: cell leaders log in and submit weekly attendance.
- **Member check-in**: select members present and submit.
- **Attendance storage**: persist all submissions for long-term tracking.
- **Real-time visibility**: leadership can view attendance immediately after submission.

### 2) Member Profile and Tracking System

- **Digital member records**: name, phone, address, and cell information.
- **Attendance history**: track member attendance frequency.
- **Membership status**: categorize as new convert, member, worker, leader.

### 3) New Convert Allocation System

- **New convert registration**: capture new converts into system.
- **Automatic cell assignment**: system assigns new convert to a home fellowship.
- **Leader notification**: home cell leader receives WhatsApp notification immediately.
- **Follow-up tracking**: leader updates follow-up progress in system.

### 4) WhatsApp Communication System

- **Automated notifications**: send WhatsApp messages to leaders and members.
- **New convert alerts**: notify leaders when assigned new converts.
- **Attendance reminders**: remind leaders weekly to submit attendance.
- **Announcements**: leadership can send updates and fellowship messages.

### 5) Leader Compliance Monitoring

- **Attendance monitoring**: track leaders who fail to submit weekly attendance.
- **Weekly compliance report**: list of non-compliant leaders for leadership.
- **Reminder notifications**: automated nudges to reduce missed submissions.

### 6) Leadership Dashboard (role-based visibility)

- **Cell Leader dashboard**: attendance, members, new converts, reports.
- **Zonal Leader dashboard**: all cells in zone.
- **Area Leader dashboard**: all zones in area.
- **State Leader dashboard**: state-wide data.
- **State Pastor dashboard**: full state overview.

### 7) Automated Weekly Reports

- **Attendance reports**: weekly summaries generated automatically.
- **Compliance reports**: submitted vs missed attendance.
- **New convert reports**: new converts + follow-up progress.
- **Email delivery**: reports sent directly to leadership email.

### 8) Bulk Communication System

- **Broadcast messaging**: send messages to multiple leaders/members.
- **Zone-based messaging**: target zones/areas.
- **Email + WhatsApp** channels.

### 9) Growth and Performance Analytics

- **Attendance trends** over time.
- **Cell growth tracking** per fellowship.
- **Performance insights** to identify strong/weak cells.

## Non-Functional Requirements

- **Mobile-first UX**: leaders should submit attendance easily on phones.
- **Role-based access control (RBAC)**: dashboards and data visibility must match role hierarchy.
- **Auditability**: track submissions (who submitted, when) for accountability.
- **Reliability**: reminders/reports should run consistently (weekly cadence).
- **Data privacy**: member personal details must be protected and access-limited.

## Success Metrics

- **Attendance submission compliance**: % of cell leaders submitting weekly on time.
- **New convert assignment speed**: time from registration to assignment.
- **Follow-up completion rate**: % of assigned converts with follow-up updates.
- **Leadership visibility adoption**: active dashboard usage by leadership tiers.

## Delivery Plan (from proposal)

- **Phase 1**: System Development
- **Phase 2**: Cross River State Deployment
- **Phase 3**: Testing and Leader Training
- **Phase 4**: Feedback and Improvement
- **Phase 5**: Full Pilot Operation
- **Phase 6**: Expansion to Other States

---

## Implementation Roadmap for this Repo

### Phase A (Now): Dashboard App First (Requested)

We will build the authenticated, role-based **dashboard app** first:

- **Auth + roles** (Cell/Zonal/Area/State/State Pastor/Admin)
- **Dashboard shell** with role-aware navigation
- **Attendance submission** + compliance visibility
- **Member directory** + attendance history
- **New convert registration + assignment + follow-up tracking**
- **Reports pages** (weekly attendance, compliance, new converts)
- **Communication module** scaffolding (WhatsApp + email integrations)
