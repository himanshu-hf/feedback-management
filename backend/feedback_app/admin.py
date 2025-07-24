from django.contrib import admin
from .models import User, Board, Tag, Feedback, Comment

admin.site.register(User)
admin.site.register(Board)
admin.site.register(Tag)
admin.site.register(Feedback)
admin.site.register(Comment)