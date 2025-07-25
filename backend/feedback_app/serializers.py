from rest_framework import serializers
from .models import User, Board, Tag, Feedback, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class BoardSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'is_public', 'members', 'created_at', 'updated_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class FeedbackSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    board = serializers.PrimaryKeyRelatedField(queryset=Board.objects.all())
    upvotes = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)

    class Meta:
        model = Feedback
        fields = [
            'id', 'board', 'author', 'title', 'content', 'status',
            'upvotes', 'tags', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    feedback = serializers.PrimaryKeyRelatedField(queryset=Feedback.objects.all())
    class Meta:
        model = Comment
        fields = ['id', 'feedback', 'author', 'content', 'created_at', 'updated_at']
