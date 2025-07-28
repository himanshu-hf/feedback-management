from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import User, Board, Tag, Feedback, Comment


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with password validation and confirmation.
    """
    password_confirm = serializers.CharField(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm', 'role', 'full_name',
            'date_joined', 'last_login'
        )
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'role': {'read_only': True},
            'date_joined': {'read_only': True},
            'last_login': {'read_only': True},
        }

    def get_full_name(self, obj):
        """Return the user's full name."""
        return get_user_display_name(obj)

    def validate_password(self, value):
        """Validate password using Django's built-in validators."""
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(e.messages)
        return value

    def validate(self, data):
        """Validate password confirmation matches password."""
        if 'password' in data and 'password_confirm' in data:
            if data['password'] != data['password_confirm']:
                raise serializers.ValidationError({
                    'password_confirm': Messages.PASSWORDS_DONT_MATCH
                })
        return data

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm', None)
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update user with hashed password if provided."""
        validated_data.pop('password_confirm', None)
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)


class BoardSerializer(serializers.ModelSerializer):
    """
    Serializer for Board model with member information and statistics.
    """
    members = UserSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(source='member_count', read_only=True)
    feedback_count = serializers.IntegerField(source='feedback_count', read_only=True)
    
    class Meta:
        model = Board
        fields = [
            'id', 'name', 'description', 'is_public', 'members', 
            'member_count', 'feedback_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """Ensure board name is not empty after stripping whitespace."""
        return validate_non_empty_field(value, 'Board name')


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for Tag model with usage statistics.
    """
    usage_count = serializers.IntegerField(source='usage_count', read_only=True)
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'usage_count']
        read_only_fields = ['id']

    def validate_name(self, value):
        """Ensure tag name is properly formatted."""
        validated_value = validate_non_empty_field(value, 'Tag name')
        return normalize_tag_name(validated_value)


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for Feedback model with related data and vote information.
    """
    author = UserSerializer(read_only=True)
    board_name = serializers.CharField(source='board.name', read_only=True)
    tags = serializers.SerializerMethodField()
    upvote_count = serializers.IntegerField(source='upvote_count', read_only=True)
    comment_count = serializers.IntegerField(source='comment_count', read_only=True)
    is_upvoted = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'board', 'board_name', 'author', 'title', 'content', 
            'status', 'priority', 'tags', 'upvote_count', 'comment_count',
            'is_upvoted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_tags(self, obj):
        """Return tags as list of tag objects with id and name."""
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def get_is_upvoted(self, obj):
        """Check if the current user has upvoted this feedback."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return request.user in obj.upvotes.all()
        return False

    def validate_title(self, value):
        """Ensure title is not empty after stripping whitespace."""
        return validate_non_empty_field(value, 'Title')

    def validate_content(self, value):
        """Ensure content is not empty after stripping whitespace."""
        return validate_non_empty_field(value, 'Content')

    def create(self, validated_data):
        """Create feedback with proper author and tag handling."""
        # Extract tags from request data
        request = self.context.get('request')
        tags_data = extract_tags_from_request_data(request.data if request else {})
        
        # Set author from request user
        validated_data['author'] = request.user if request else None
        
        # Create feedback instance
        feedback = super().create(validated_data)
        
        # Handle tags
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            feedback.tags.add(tag)
        
        return feedback


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for Comment model with author information.
    """
    author = UserSerializer(read_only=True)
    feedback_title = serializers.CharField(source='feedback.title', read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'feedback', 'feedback_title', 'author', 
            'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
        
    def validate_content(self, value):
        """Ensure comment content is not empty after stripping whitespace."""
        return validate_non_empty_field(value, 'Comment content')

    def create(self, validated_data):
        """Create comment with author from request user."""
        request = self.context.get('request')
        validated_data['author'] = request.user if request else None
        return super().create(validated_data)
