# Project: Feedback Management

## Overview
Feedback Management is an application that helps businesses effectively gather, prioritize, and act on customer feedback. Customers can submit, vote on, comment on, and track progress. The product team can tag feedback, update statuses, detect trends, analyze data, and make data-driven product decisions.

---

## Task

As part of the project, we will be building the following modules for the Feedback Management application using the **Django** and **React** tech stack.

### 1. CRUD for Boards, Feedback & Comments

Implement the core data model and API endpoints for boards, feedback, and comments, ensuring role-based access control.

#### Core Resources & Relationships

- **Users:**  
  Users will have different roles (Admin, Moderator, or Contributor) that determine their permissions.  
  - Admins and Moderators: Product team, manage feedback lifecycle  
  - Contributors: Customers, provide feedback

- **Boards:**  
  Containers that hold feedback.  
  - Public: Open for all  
  - Private: Restricted access  
  - Users must be added to a board to interact with it.

- **Feedback:**  
  Represents feature requests, bug reports, or suggestions.  
  - Each feedback belongs to a single board  
  - Can have multiple upvotes  
  - Follows a status workflow (e.g., Open → In Progress → Completed)

- **Comments:**  
  Users can add comments to feedback for discussion.  
  - Each comment is tied to a specific feedback entry

#### Instructions

- Implement CRUD operations for boards, feedback, and comments.
- Use Django's built-in authentication, user management, and role-based access control.

---

### 2. Multiple Data Views (Table & Kanban Board)

Using the above APIs, build multiple ways to visualize and interact with feedback data.

#### Instructions

- Implement a table view with sortable, filterable, and paginated feedback entries.
- Develop a Kanban board view with drag-and-drop functionality for feedback status updates.
- Maintain consistency across all views and allow users to switch between them.
- Use modular and reusable UI components.
- _[Try]_ Ensure cross-device compatibility.

---

### 3. Dashboard & Analytics View

Using the APIs, build a dashboard to provide insights into customer feedback.

#### Instructions

- Display total feedback count, active feedback count, completed count, and items in progress.
- Highlight top-voted feedback.
- Include feedback submission trends over time (daily, weekly, monthly).
- Include graphs to show how feedback items are distributed across various tags, different statuses, etc.
- Provide interactive filters (by time range, status, tag, etc.) that allow users to slice and dice the data.
- _[Try]_ Ensure responsive design and optimized rendering for large datasets.

---

NOTE: From here onwards it's my ideas.
      Hence these aren't must to implement.

### 4. Integration Capabilities

Implement features that allow the feedback system to integrate with other tools and workflows.

#### Instructions

- **Slack/Teams Notifications**: Create a notification system that sends alerts to Slack or Microsoft Teams when high-priority feedback is submitted.
- **Export Functionality**: Implement functionality to export feedback data to CSV/Excel formats for stakeholder reporting.
- **Email Digests**: Build a scheduled email system that sends summary reports of new feedback to product managers.

---

### 5. Practical Workflow Enhancements

Improve the user experience with features that streamline feedback management workflows.

#### Instructions

- **Batch Operations**: Implement functionality to update status/tags for multiple feedback items simultaneously.
- **Merge Similar Feedback**: Create a system to identify and combine duplicate feedback items to reduce clutter and consolidate votes.

---

NOTE: these are future ideas.

### 6. User Experience Improvements

Enhance the interface with features that improve usability and productivity.

#### Instructions

- **Rich Text Editing**: Implement support for formatting, code snippets, and image attachments in feedback and comments.
- **Search Functionality**: Develop full-text search capabilities across feedback and comments with advanced filtering options. (Fuzzy search)
- **Activity Feed**: Create a timeline view showing recent actions and updates across boards.

---

### 7. Business-Focused Features

Add features that provide business value and demonstrate real-world applicability.

#### Instructions

- **User Feedback Form**: Develop an embeddable widget that can be integrated into products to collect feedback directly.
- **Customer Impact Score**: Implement a scoring system that combines votes, comments, and user segment data to prioritize feedback.
- **Time-to-Resolution Tracking**: Build metrics to measure and report on how quickly feedback moves