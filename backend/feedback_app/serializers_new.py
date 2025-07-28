from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import User, Board, Tag, Feedback, Comment


class UserSerializer(serializers.ModelSerializer):
    """Simple User serializer"""
    password_confirm = serializers.CharField(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'password', 'password_confirm', 'full_name',
            'date_joined', 'is_active'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'date_joined': {'read_only': True},
        }

    def get_full_name(self, obj):
        """Get user's full name or username"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username

    def validate(self, attrs):
        """Validate password confirmation"""
        if 'password' in attrs:
            password = attrs['password']
            password_confirm = attrs.pop('password_confirm', None)
            
            if password_confirm and password != password_confirm:
                raise serializers.ValidationError({
                    'password_confirm': 'Passwords do not match.'
                })
            
            # Validate password strength
            try:
                validate_password(password)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'password': list(e.messages)})
        
        return attrs

    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm', None)
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update user with hashed password"""
        validated_data.pop('password_confirm', None)
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)


class BoardSerializer(serializers.ModelSerializer):
    """Simple Board serializer"""
    member_count = serializers.SerializerMethodField()
    feedback_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Board
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_member_count(self, obj):
        """Get number of board members"""
        return obj.members.count()

    def get_feedback_count(self, obj):
        """Get number of feedback items"""
        return obj.feedback_set.count()

    def validate_name(self, value):
        """Validate board name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Board name cannot be empty.")
        return value.strip()


class TagSerializer(serializers.ModelSerializer):
    """Simple Tag serializer"""
    
    class Meta:
        model = Tag
        fields = '__all__'

    def validate_name(self, value):
        """Validate and normalize tag name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Tag name cannot be empty.")
        return value.strip().lower()


class FeedbackSerializer(serializers.ModelSerializer):
    """Simple Feedback serializer"""
    author_name = serializers.SerializerMethodField()
    board_name = serializers.SerializerMethodField()
    upvote_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ('author', 'created_at', 'updated_at')

    def get_author_name(self, obj):
        """Get author's name"""
        if obj.author.first_name and obj.author.last_name:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return obj.author.username

    def get_board_name(self, obj):
        """Get board name"""
        return obj.board.name

    def get_upvote_count(self, obj):
        """Get number of upvotes"""
        return obj.upvotes.count()

    def get_comment_count(self, obj):
        """Get number of comments"""
        return obj.comment_set.count()

    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_content(self, value):
        """Validate content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()

    def create(self, validated_data):
        """Create feedback and handle tags"""
        # Handle tags from request data
        request = self.context.get('request')
        tags_data = []
        if request and 'tags' in request.data:
            tags_data = request.data.get('tags', [])
        
        # Remove tags from validated_data if present
        validated_data.pop('tags', None)
        
        # Create feedback
        feedback = super().create(validated_data)
        
        # Handle tags
        if tags_data:
            for tag_name in tags_data:
                if isinstance(tag_name, str):
                    tag, created = Tag.objects.get_or_create(
                        name=tag_name.strip().lower()
                    )
                    feedback.tags.add(tag)
        
        return feedback


class CommentSerializer(serializers.ModelSerializer):
    """Simple Comment serializer"""
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('author', 'created_at', 'updated_at')

    def get_author_name(self, obj):
        """Get author's name"""
        if obj.author.first_name and obj.author.last_name:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return obj.author.username

    def validate_content(self, value):
        """Validate content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty.")
        return value.strip()
