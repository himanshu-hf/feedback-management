
from rest_framework import permissions



# BoardPermission: Only admins/moderators can create boards, only owner/admin/moderator can update/delete, only members can view private boards, anyone can view public boards

class BoardPermission(permissions.BasePermission):
    """
    Board Permissions:
    - List/Retrieve: Any authenticated user
    - Create: Only admin/moderator
    - Update/Partial Update: Only admin/moderator
    - Destroy: Only admin
    - Private boards: Only members can view
    """
    def has_permission(self, request, view):
        if view.action in ['list', 'retrieve']:
            return request.user.is_authenticated
        if view.action == 'create':
            return request.user.is_authenticated and getattr(request.user, 'role', None) in ['admin', 'moderator']
        if view.action in ['update', 'partial_update', 'destroy']:
            return request.user.is_authenticated and getattr(request.user, 'role', None) in ['admin', 'moderator']
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if view.action in ['retrieve']:
            if not obj.is_public:
                return request.user in obj.members.all()
            return True
        if view.action in ['update', 'partial_update']:
            return getattr(request.user, 'role', None) in ['admin', 'moderator']
        if view.action == 'destroy':
            return getattr(request.user, 'role', None) == 'admin'
        return False

# FeedbackPermission: Only board members can create feedback, only author/admin/moderator can edit/delete, anyone can view feedback

class FeedbackPermission(permissions.BasePermission):
    """
    Feedback Permissions:
    - List/Retrieve: Anyone
    - Create: Only board members
    - Update/Partial Update/Destroy: Only author, admin, or moderator
    """
    def has_permission(self, request, view):
        if view.action in ['list', 'retrieve']:
            return True
        if view.action == 'create':
            board_id = request.data.get('board')
            if not board_id or not request.user.is_authenticated:
                return False
            try:
                from .models import Board
                board = Board.objects.get(id=board_id)
            except Exception:
                return False
            return request.user in board.members.all()
        if view.action in ['update', 'partial_update', 'destroy']:
            return request.user.is_authenticated
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if view.action in ['retrieve']:
            return True
        if view.action in ['update', 'partial_update', 'destroy']:
            return request.user == obj.author or getattr(request.user, 'role', None) in ['admin', 'moderator']
        return False




class CommentPermission(permissions.BasePermission):
    """
    Comment Permissions:
    - List/Retrieve: Anyone
    - Create: Only board members
    - Update/Partial Update/Destroy: Only author, admin, or moderator
    """
    def has_permission(self, request, view):
        if view.action in ['list', 'retrieve']:
            return True
        if view.action == 'create':
            feedback_id = request.data.get('feedback')
            if not feedback_id or not request.user.is_authenticated:
                return False
            try:
                from .models import Feedback
                feedback = Feedback.objects.get(id=feedback_id)
                board = feedback.board
            except Exception:
                return False
            return request.user in board.members.all()
        if view.action in ['update', 'partial_update', 'destroy']:
            return request.user.is_authenticated
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if view.action in ['retrieve']:
            return True
        if view.action in ['update', 'partial_update', 'destroy']:
            return request.user == obj.author or getattr(request.user, 'role', None) in ['admin', 'moderator']
        return False
