# Project Spec

## Roles
Owner, Admin, Manager, Member

## Company
- name, createdAt

## User
- name, email, password (hashed)
- companyId (ref Company)
- role: enum ['Owner','Admin','Manager','Member']

## Project
- title, description, status, deadline
- companyId (ref Company)
- members: [userId]
- createdBy: userId

## Task
- title, description, priority, status, dueDate, labels: [String]
- companyId (ref Company)
- projectId (ref Project)
- assignedTo: userId
- createdBy: userId

## Comment
- text, taskId, userId, companyId, createdAt

## ActivityLog
- companyId, projectId (optional), userId, action, createdAt

## Notification
- companyId, userId, message, type, read (Boolean), createdAt

## Role Permission Matrix
| Action | Owner | Admin | Manager | Member |
|---|---|---|---|---|
| Manage company/users | ✅ | ✅ | ❌ | ❌ |
| Create/delete project | ✅ | ✅ | ❌ | ❌ |
| Create/assign task | ✅ | ✅ | ✅ | ❌ |
| Update own task status | ✅ | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ | ✅ |

## Rule
Every DB query MUST filter by companyId.