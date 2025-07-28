from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Board, Tag, Feedback, Comment


# Simple admin registration for User
class UserAdmin(BaseUserAdmin):
    # Add role field to the admin
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role', 'is_active')


# Simple admin for other models
class BoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_public', 'created_at')
    list_filter = ('is_public',)
    filter_horizontal = ('members',)


class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('title', 'board', 'author', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'board')
    filter_horizontal = ('tags', 'upvotes')


class CommentAdmin(admin.ModelAdmin):
    list_display = ('feedback', 'author', 'created_at')
    list_filter = ('created_at',)


class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)


# Register models
admin.site.register(User, UserAdmin)
admin.site.register(Board, BoardAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(Comment, CommentAdmin)