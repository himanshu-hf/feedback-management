"""
Feedback Management System Models

This module contains the data models for the feedback management system,
including User roles, Boards, Feedback items, Tags, and Comments.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model with role-based permissions.
    
    Roles:
    - Admin: Full system access, can manage all resources
    - Moderator: Can manage feedback lifecycle and boards
    - Contributor: Can create feedback and comments
    """
    class Role(models.TextChoices):
        ADMIN = 'admin', _('Admin')
        MODERATOR = 'moderator', _('Moderator')
        CONTRIBUTOR = 'contributor', _('Contributor')
    
    role = models.CharField(
        max_length=20, 
        choices=Role.choices, 
        default=Role.CONTRIBUTOR,
        help_text=_("User's role determines their permissions in the system")
    )

    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')


class Board(models.Model):
    """
    Board model represents a container for feedback items.
    
    Boards can be public (visible to all) or private (restricted access).
    Users must be added as members to interact with private boards.
    """
    name = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(2)],
        help_text=_("Name of the feedback board")
    )
    description = models.TextField(
        blank=True, 
        help_text=_("Optional description of the board's purpose")
    )
    is_public = models.BooleanField(
        default=True,
        help_text=_("Public boards are visible to all users, private boards require membership")
    )
    members = models.ManyToManyField(
        User, 
        related_name="boards", 
        blank=True,
        help_text=_("Users who have access to this board")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        """Return the number of members in this board."""
        return self.members.count()
    
    @property 
    def feedback_count(self):
        """Return the number of feedback items in this board."""
        return self.feedbacks.count()
        
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Board')
        verbose_name_plural = _('Boards')


class Tag(models.Model):
    """
    Tag model for categorizing feedback items.
    """
    name = models.CharField(
        max_length=50, 
        unique=True,
        validators=[MinLengthValidator(2)],
        help_text=_("Tag name for categorizing feedback")
    )

    def __str__(self):
        return self.name
    
    @property
    def usage_count(self):
        """Return the number of feedback items using this tag."""
        return self.feedbacks.count()
        
    class Meta:
        ordering = ['name']
        verbose_name = _('Tag')
        verbose_name_plural = _('Tags')


class Feedback(models.Model):
    """
    Feedback model represents feature requests, bug reports, or suggestions.
    
    Each feedback item belongs to a board and follows a status workflow.
    Users can upvote feedback to show support.
    """
    class Status(models.TextChoices):
        OPEN = 'open', _('Open')
        IN_PROGRESS = 'in_progress', _('In Progress')
        UNDER_REVIEW = 'under_review', _('Under Review')
        COMPLETED = 'completed', _('Completed')
        REJECTED = 'rejected', _('Rejected')
    
    class Priority(models.TextChoices):
        LOW = 'low', _('Low')
        MEDIUM = 'medium', _('Medium')
        HIGH = 'high', _('High')
    
    board = models.ForeignKey(
        Board, 
        related_name="feedbacks", 
        on_delete=models.CASCADE,
        help_text=_("The board this feedback belongs to")
    )
    author = models.ForeignKey(
        User, 
        related_name="feedbacks", 
        on_delete=models.CASCADE,
        help_text=_("The user who created this feedback")
    )
    title = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(5)],
        help_text=_("Brief title describing the feedback")
    )
    content = models.TextField(
        validators=[MinLengthValidator(10)],
        help_text=_("Detailed description of the feedback")
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.OPEN,
        help_text=_("Current status of the feedback")
    )
    priority = models.CharField(
        max_length=10, 
        choices=Priority.choices, 
        default=Priority.MEDIUM,
        help_text=_("Priority level of the feedback")
    )
    upvotes = models.ManyToManyField(
        User, 
        related_name="upvoted_feedbacks", 
        blank=True,
        help_text=_("Users who have upvoted this feedback")
    )
    tags = models.ManyToManyField(
        Tag, 
        related_name="feedbacks", 
        blank=True,
        help_text=_("Tags for categorizing this feedback")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    @property
    def upvote_count(self):
        """Return the number of upvotes for this feedback."""
        return self.upvotes.count()
    
    @property
    def comment_count(self):
        """Return the number of comments on this feedback."""
        return self.comments.count()
    
    def can_be_upvoted_by(self, user):
        """Check if a user can upvote this feedback."""
        return user.is_authenticated and user not in self.upvotes.all()
        
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Feedback')
        verbose_name_plural = _('Feedback')


class Comment(models.Model):
    """
    Comment model for discussions on feedback items.
    """
    feedback = models.ForeignKey(
        Feedback, 
        related_name="comments", 
        on_delete=models.CASCADE,
        help_text=_("The feedback this comment belongs to")
    )
    author = models.ForeignKey(
        User, 
        related_name="comments", 
        on_delete=models.CASCADE,
        help_text=_("The user who wrote this comment")
    )
    content = models.TextField(
        validators=[MinLengthValidator(3)],
        help_text=_("The comment content")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.feedback.title}"
        
    class Meta:
        ordering = ['created_at']
        verbose_name = _('Comment')
        verbose_name_plural = _('Comments')
