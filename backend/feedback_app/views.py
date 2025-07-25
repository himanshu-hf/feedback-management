from rest_framework import viewsets
from .models import User, Board, Tag, Feedback, Comment
from .serializers import UserSerializer, BoardSerializer, TagSerializer, FeedbackSerializer, CommentSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

from .permissions import BoardPermission

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [BoardPermission]

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .permissions import FeedbackPermission

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [FeedbackPermission]

    # Analytics Endpoints
    @action(detail=False, methods=['get'])
    def counts(self, request):
        total = Feedback.objects.count()
        active = Feedback.objects.filter(status='open').count()
        completed = Feedback.objects.filter(status='completed').count()
        in_progress = Feedback.objects.filter(status='in_progress').count()
        return Response({
            'total': total,
            'active': active,
            'completed': completed,
            'in_progress': in_progress
        })

    @action(detail=False, methods=['get'])
    def top_voted(self, request):
        top = Feedback.objects.annotate(num_upvotes=Count('upvotes')).order_by('-num_upvotes')[:5]
        serializer = self.get_serializer(top, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trends(self, request):
        from django.utils import timezone
        from datetime import timedelta
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        from django.db.models.functions import TruncDate
        trend = (
            Feedback.objects
            .filter(created_at__date__gte=last_30)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        return Response(trend)

from .permissions import CommentPermission

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [CommentPermission]
