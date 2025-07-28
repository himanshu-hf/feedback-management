"""
Feedback Management System Permissions

This module contains custom permission classes for role-based access control
and board membership validation.
"""

from rest_framework import permissions
from .models import User


class BoardPermission(permissions.BasePermission):
    """
    Custom permission for Board operations.
    
    Permissions:
    - List/Retrieve: Authenticated users (filtered in viewset)
    - Create: Admin/Moderator only
    - Update/Delete: Admin/Moderator only
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to perform the action."""
        if not request.user.is_authenticated:
            return False
            
        # Safe methods (GET, HEAD, OPTIONS) are allowed for authenticated users
        if view.action in ['list', 'retrieve']:
            return True
            
        # Only admins and moderators can create/update/delete boards
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            return request.user.role in [User.Role.ADMIN, User.Role.MODERATOR]
            
        return False

    def has_object_permission(self, request, view, obj):
        """Check object-level permissions."""
        if view.action == 'retrieve':
            # Users can view public boards or boards they're members of
            return obj.is_public or request.user in obj.members.all()
            
        if view.action in ['update', 'partial_update']:
            return request.user.role in [User.Role.ADMIN, User.Role.MODERATOR]
            
        if view.action == 'destroy':
            # Only admins can delete boards
            return request.user.role == User.Role.ADMIN
            
        return False


class FeedbackPermission(permissions.BasePermission):
    """
    Custom permission for Feedback operations.
    
    Permissions:
    - List/Retrieve: Public boards or board members
    - Create: Board members only  
    - Update/Delete: Author, Admin, or Moderator
    - Vote: Authenticated users with board access
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to perform the action."""
        # Analytics endpoints are available to all authenticated users
        if view.action in ['list', 'retrieve', 'counts', 'top_voted', 'trends']:
            return True
            
        if view.action == 'create':
            return request.user.is_authenticated
            
        if view.action in ['update', 'partial_update', 'destroy', 'vote']:
            return request.user.is_authenticated
            
        return False

    def has_object_permission(self, request, view, obj):
        """Check object-level permissions."""
        if view.action == 'retrieve':
            # Can view if board is public or user is a member
            if obj.board.is_public:
                return True
            return (request.user.is_authenticated and 
                   request.user in obj.board.members.all())
            
        if view.action in ['update', 'partial_update', 'destroy']:
            # Authors, admins, and moderators can modify feedback
            return (
                request.user == obj.author or 
                request.user.role in [User.Role.ADMIN, User.Role.MODERATOR]
            )
            
        if view.action == 'vote':
            # Can vote if user has access to the feedback
            if obj.board.is_public:
                return request.user.is_authenticated
            return (request.user.is_authenticated and 
                   request.user in obj.board.members.all())
            
        return False


class CommentPermission(permissions.BasePermission):
    """
    Custom permission for Comment operations.
    
    Permissions:
    - List/Retrieve: Board members or public boards
    - Create: Board members only
    - Update/Delete: Author, Admin, or Moderator
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to perform the action."""
        if view.action in ['list', 'retrieve']:
            return True
            
        if view.action == 'create':
            return request.user.is_authenticated
            
        if view.action in ['update', 'partial_update', 'destroy']:
            return request.user.is_authenticated
            
        return False

    def has_object_permission(self, request, view, obj):
        """Check object-level permissions."""
        if view.action == 'retrieve':
            # Can view if board is public or user is a member
            if obj.feedback.board.is_public:
                return True
            return (request.user.is_authenticated and 
                   request.user in obj.feedback.board.members.all())
            
        if view.action in ['update', 'partial_update', 'destroy']:
            # Authors, admins, and moderators can modify comments
            return (
                request.user == obj.author or 
                request.user.role in [User.Role.ADMIN, User.Role.MODERATOR]
            )
            
        return False


class IsAdminOrModerator(permissions.BasePermission):
    """
    Permission class that only allows access to admin and moderator users.
    """
    
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in [User.Role.ADMIN, User.Role.MODERATOR])


class IsBoardMember(permissions.BasePermission):
    """
    Custom permission to check if user is a member of the object's board.
    Assumes the model has a `board` attribute.
    """

    def has_object_permission(self, request, view, obj):
        """Check if user is a member of the board."""
        # Public boards are accessible to all authenticated users
        if obj.board.is_public:
            return request.user.is_authenticated
            
        # Private boards require membership
        return (request.user.is_authenticated and 
                request.user in obj.board.members.all())


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        """Check if user is the owner or request is read-only."""
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.author == request.user