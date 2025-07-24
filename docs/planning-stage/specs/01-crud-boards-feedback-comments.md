# 01. CRUD for Boards, Feedback & Comments

## Models

```
class User:
    id: int
    username: str
    email: str
    role: Enum('admin', 'moderator', 'contributor')
```
```
class Board:
    id: int
    name: str
    description: str
    is_public: bool
    members: List[User]
    created_at: datetime
    updated_at: datetime
```
```
class Tag:
    id: int
    name: str
```
```
class Feedback:
    id: int
    board: Board
    author: User
    title: str
    content: str
    status: Enum('open', 'in_progress', 'completed')
    upvotes: Set[User]
    tags: List[Tag]
    created_at: datetime
    updated_at: datetime
```
```
class Comment:
    id: int
    feedback: Feedback
    author: User
    content: str
    created_at: datetime
    updated_at: datetime
```

## Permissions

```
def can_create_board(user):
    return user.role in ['admin', 'moderator']

def can_edit_board(user, board):
    return user.role in ['admin', 'moderator']

def can_delete_board(user, board):
    return user.role == 'admin'

def can_create_feedback(user, board):
    return user in board.members

def can_edit_feedback(user, feedback):
    return user == feedback.author or user.role in ['admin', 'moderator']

def can_delete_feedback(user, feedback):
    return user == feedback.author or user.role in ['admin', 'moderator']

def can_upvote_feedback(user, feedback):
    return user not in feedback.upvotes

def can_comment(user, feedback):
    return user in feedback.board.members

def can_edit_comment(user, comment):
    return user == comment.author or user.role in ['admin', 'moderator']

def can_delete_comment(user, comment):
    return user == comment.author or user.role in ['admin', 'moderator']
```

## API Actions

### Boards
```
GET    /api/boards/           -> list_boards(user)
POST   /api/boards/           -> create_board(user, data)
GET    /api/boards/{id}/      -> get_board(user, board_id)
PUT    /api/boards/{id}/      -> update_board(user, board_id, data)
PATCH  /api/boards/{id}/      -> partial_update_board(user, board_id, data)
DELETE /api/boards/{id}/      -> delete_board(user, board_id)
```
### Tags
```
GET    /api/tags/             -> list_tags(user)
POST   /api/tags/             -> create_tag(user, data)
GET    /api/tags/{id}/        -> get_tag(user, tag_id)
PUT    /api/tags/{id}/        -> update_tag(user, tag_id, data)
DELETE /api/tags/{id}/        -> delete_tag(user, tag_id)
```
### Feedback
```
GET    /api/feedback/         -> list_feedback(user, filters)
POST   /api/feedback/         -> create_feedback(user, data)
GET    /api/feedback/{id}/    -> get_feedback(user, feedback_id)
PUT    /api/feedback/{id}/    -> update_feedback(user, feedback_id, data)
PATCH  /api/feedback/{id}/    -> partial_update_feedback(user, feedback_id, data)
DELETE /api/feedback/{id}/    -> delete_feedback(user, feedback_id)
```
### Comments
```
GET    /api/comments/         -> list_comments(user, filters)
POST   /api/comments/         -> create_comment(user, data)
GET    /api/comments/{id}/    -> get_comment(user, comment_id)
PUT    /api/comments/{id}/    -> update_comment(user, comment_id, data)
PATCH  /api/comments/{id}/    -> partial_update_comment(user, comment_id, data)
DELETE /api/comments/{id}/    -> delete_comment(user, comment_id)
```

## Validation & Error Handling

- Permissions checked before each action
- Required fields validated by DRF serializers
- Upvote logic and membership checks handled in view/permission logic
- Return error if user not in board.members for private boards

## Example Workflow

```
user = get_user(request)
board = get_board(board_id)
if can_create_feedback(user, board):
    feedback = create_feedback(user, board, data)
```

Collecting workspace informationHere’s a spec for **Multiple Data Views** tailored to your project’s models and API:

---

# 02. Multiple Data Views

## Views
```
def table_view(user, filters, sort, page):
    feedback_list = get_feedback_list(filters, sort, page)
    return render_table(feedback_list, columns=[
        'title', 'status', 'board', 'author', 'upvotes', 'tags', 'created_at'
    ])

def kanban_view(user, board_id):
    feedback_by_status = group_feedback_by_status(board_id)
    return render_kanban(feedback_by_status, columns=[
        'open', 'in_progress', 'completed'
    ])

def switch_view(user, view_type, params):
    if view_type == 'table':
        return table_view(user, params['filters'], params['sort'], params['page'])
    elif view_type == 'kanban':
        return kanban_view(user, params['board_id'])
```

## Interactions
```
def update_feedback_status(user, feedback_id, new_status):
    feedback = get_feedback(feedback_id)
    if can_edit_feedback(user, feedback):
        feedback.status = new_status
        save_feedback(feedback)

def filter_feedback(user, filters):
    return get_feedback_list(filters)

def sort_feedback(user, sort_params):
    return get_feedback_list(sort=sort_params)

def paginate_feedback(user, page):
    return get_feedback_list(page=page)
```

## API Endpoints
```
GET    /api/feedback/           -> get_feedback_list(filters, sort, page)
PUT    /api/feedback/{id}/      -> update_feedback_status(user, feedback_id, new_status)
GET    /api/boards/             -> get_boards()
GET    /api/tags/               -> get_tags()
```

## Implementation Notes

- Use React components for table and kanban views.
- Use drag-and-drop for kanban status changes.
- Sync UI state for filters, sorting, pagination.
- Ensure responsive design and accessibility.

## Example Workflow
```
user = get_user(request)
view = switch_view(user, 'table', params)
if user switches to 'kanban':
    view = switch_view(user, 'kanban', params)
if user drags feedback to new column:
    update_feedback_status(user, feedback_id, new_status)
```
