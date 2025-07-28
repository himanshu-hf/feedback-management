"""
Feedback Management System Views

This module contains API views for the feedback management system,
implementing CRUD operations for all models with proper permissions
and business logic.
"""

from django.contrib.auth import authenticate
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend

from .models import User, Board, Tag, Feedback, Comment
from .serializers import (
    UserSerializer, BoardSerializer, TagSerializer, 
    FeedbackSerializer, CommentSerializer
)
from .permissions import (
    BoardPermission, FeedbackPermission, CommentPermission,
    IsAdminOrModerator
)

class UserViewSet(viewsets.ModelViewSet):
    """
    Simple User ViewSet with authentication
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """Override permissions for specific actions."""
        if self.action in ['register', 'login']:
            permission_classes = [AllowAny]
        elif self.action in ['list', 'destroy']:
            permission_classes = [IsAdminOrModerator]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user's information."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new user account."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'full_name': user.first_name + ' ' + user.last_name if user.first_name else user.username
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Authenticate user and return tokens."""
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'full_name': user.first_name + ' ' + user.last_name if user.first_name else user.username
            }
        }, status=status.HTTP_200_OK)


class BoardViewSet(viewsets.ModelViewSet):
    """
    Simple Board ViewSet
    """
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [BoardPermission]

    def get_queryset(self):
        """Filter boards based on user permissions"""
        user = self.request.user
        if user.role in ['admin', 'moderator']:
            return Board.objects.all()
        else:
            # Contributors can only see public boards or boards they're members of
            return Board.objects.filter(
                Q(is_public=True) | Q(members=user)
            ).distinct()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        """Join a public board"""
        board = self.get_object()
        if not board.is_public:
            return Response({'error': 'Cannot join private board'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if request.user in board.members.all():
            return Response({'message': 'Already a member'}, 
                           status=status.HTTP_200_OK)
        
        board.members.add(request.user)
        return Response({'message': 'Successfully joined board'}, 
                       status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        """Leave a board"""
        board = self.get_object()
        if request.user not in board.members.all():
            return Response({'error': 'Not a member of this board'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        board.members.remove(request.user)
        return Response({'message': 'Successfully left board'}, 
                       status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_member(self, request, pk=None):
        """Add a member to board (admin/moderator only)"""
        if request.user.role not in ['admin', 'moderator']:
            return Response({'error': 'Permission denied'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        board = self.get_object()
        username = request.data.get('username')
        
        if not username:
            return Response({'error': 'Username required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
            board.members.add(user)
            return Response({'message': f'Added {username} to board'}, 
                           status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, 
                           status=status.HTTP_404_NOT_FOUND)


class TagViewSet(viewsets.ModelViewSet):
    """
    Simple Tag ViewSet
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]


class FeedbackViewSet(viewsets.ModelViewSet):
    """
    Simple Feedback ViewSet with analytics and filtering
    """
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [FeedbackPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'board', 'author']
    search_fields = ['title', 'content', 'author__username', 'author__first_name', 'author__last_name']
    ordering_fields = ['created_at', 'updated_at', 'upvote_count', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter feedback based on board access"""
        user = self.request.user
        if user.is_anonymous:
            # Anonymous users can only see feedback from public boards
            return Feedback.objects.filter(board__is_public=True)
        elif user.role in ['admin', 'moderator']:
            return Feedback.objects.all()
        else:
            # Contributors can see feedback from public boards or boards they're members of
            return Feedback.objects.filter(
                Q(board__is_public=True) | Q(board__members=user)
            ).distinct()

    def perform_create(self, serializer):
        """Validate board membership for private boards and set author"""
        board = serializer.validated_data.get('board')
        if board and not board.is_public:
            if self.request.user not in board.members.all():
                raise PermissionDenied("You must be a member of this board to create feedback.")
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        """Vote/unvote on feedback"""
        feedback = self.get_object()
        user = request.user
        
        if user in feedback.upvotes.all():
            feedback.upvotes.remove(user)
            action_taken = 'removed'
        else:
            feedback.upvotes.add(user)
            action_taken = 'added'
            
        return Response({
            'success': True,
            'action': action_taken,
            'upvotes': feedback.upvotes.count()
        })

    @action(detail=False, methods=['get'])
    def counts(self, request):
        """Get feedback counts by status"""
        queryset = self.get_queryset()
        total = queryset.count()
        active = queryset.filter(status='open').count()
        completed = queryset.filter(status='completed').count()
        in_progress = queryset.filter(status='in_progress').count()
        under_review = queryset.filter(status='under_review').count()
        
        return Response({
            'total': total,
            'active': active,
            'completed': completed,
            'in_progress': in_progress,
            'under_review': under_review
        })

    @action(detail=False, methods=['get'])
    def top_voted(self, request):
        """Get top voted feedback"""
        queryset = self.get_queryset()
        top = queryset.annotate(
            num_upvotes=Count('upvotes')
        ).order_by('-num_upvotes')[:5]
        serializer = self.get_serializer(top, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get feedback submission trends"""
        from django.db.models.functions import TruncDate
        
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        
        queryset = self.get_queryset()
        trend = (
            queryset
            .filter(created_at__date__gte=last_30)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        return Response(list(trend))


class CommentViewSet(viewsets.ModelViewSet):
    """
    Simple Comment ViewSet
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [CommentPermission]
    
    def get_queryset(self):
        """Filter comments based on feedback access"""
        user = self.request.user
        if user.is_anonymous:
            return Comment.objects.filter(feedback__board__is_public=True)
        elif user.role in ['admin', 'moderator']:
            return Comment.objects.all()
        else:
            return Comment.objects.filter(
                Q(feedback__board__is_public=True) | 
                Q(feedback__board__members=user)
            ).distinct()
    
    def perform_create(self, serializer):
        """Validate board membership for commenting and set author"""
        feedback = serializer.validated_data.get('feedback')
        if feedback and not feedback.board.is_public:
            if self.request.user not in feedback.board.members.all():
                raise PermissionDenied("You must be a member of this board to comment.")
        serializer.save(author=self.request.user)
