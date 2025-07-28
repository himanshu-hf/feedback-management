"""
Feedback Management System Tests

This module contains comprehensive test cases for the feedback management system.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Board, Tag, Feedback, Comment
from .constants import UserRoles, FeedbackStatus, FeedbackPriority

User = get_user_model()


class ModelTestCase(TestCase):
    """Test cases for model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123',
            role=UserRoles.ADMIN
        )
        self.contributor_user = User.objects.create_user(
            username='contributor',
            email='contributor@test.com', 
            password='testpass123',
            role=UserRoles.CONTRIBUTOR
        )
        
        self.public_board = Board.objects.create(
            name='Public Board',
            description='A public board for testing',
            is_public=True
        )
        
        self.private_board = Board.objects.create(
            name='Private Board',
            description='A private board for testing',
            is_public=False
        )
        self.private_board.members.add(self.contributor_user)
        
        self.tag = Tag.objects.create(name='bug')
        
        self.feedback = Feedback.objects.create(
            title='Test Feedback',
            content='This is test feedback content',
            board=self.public_board,
            author=self.contributor_user,
            status=FeedbackStatus.OPEN,
            priority=FeedbackPriority.MEDIUM
        )
        self.feedback.tags.add(self.tag)
        
        self.comment = Comment.objects.create(
            content='Test comment',
            feedback=self.feedback,
            author=self.admin_user
        )

    def test_user_model(self):
        """Test User model functionality."""
        self.assertEqual(str(self.admin_user), 'admin (Admin)')
        self.assertEqual(self.admin_user.role, UserRoles.ADMIN)
        self.assertTrue(self.admin_user.check_password('testpass123'))

    def test_board_model(self):
        """Test Board model functionality."""
        self.assertEqual(str(self.public_board), 'Public Board')
        self.assertTrue(self.public_board.is_public)
        self.assertEqual(self.private_board.member_count, 1)
        self.assertIn(self.contributor_user, self.private_board.members.all())

    def test_tag_model(self):
        """Test Tag model functionality."""
        self.assertEqual(str(self.tag), 'bug')
        self.assertEqual(self.tag.usage_count, 1)

    def test_feedback_model(self):
        """Test Feedback model functionality."""
        self.assertEqual(str(self.feedback), 'Test Feedback')
        self.assertEqual(self.feedback.upvote_count, 0)
        self.assertEqual(self.feedback.comment_count, 1)
        self.assertTrue(self.feedback.can_be_upvoted_by(self.admin_user))
        
        # Test upvoting
        self.feedback.upvotes.add(self.admin_user)
        self.assertEqual(self.feedback.upvote_count, 1)
        self.assertFalse(self.feedback.can_be_upvoted_by(self.admin_user))

    def test_comment_model(self):
        """Test Comment model functionality."""
        expected_str = f"Comment by {self.admin_user.username} on {self.feedback.title}"
        self.assertEqual(str(self.comment), expected_str)


class APITestCase(APITestCase):
    """Test cases for API endpoints."""
    
    def setUp(self):
        """Set up test data and authentication."""
        self.client = APIClient()
        
        # Create test users
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123',
            role=UserRoles.ADMIN
        )
        self.moderator_user = User.objects.create_user(
            username='moderator',
            email='moderator@test.com',
            password='testpass123',
            role=UserRoles.MODERATOR
        )
        self.contributor_user = User.objects.create_user(
            username='contributor',
            email='contributor@test.com',
            password='testpass123',
            role=UserRoles.CONTRIBUTOR
        )
        
        # Create test boards
        self.public_board = Board.objects.create(
            name='Public Board',
            description='A public board',
            is_public=True
        )
        self.private_board = Board.objects.create(
            name='Private Board',
            description='A private board',
            is_public=False
        )
        self.private_board.members.add(self.contributor_user)
        
        # Create test tags and feedback
        self.tag = Tag.objects.create(name='feature')
        self.feedback = Feedback.objects.create(
            title='Test Feedback',
            content='This is test feedback',
            board=self.public_board,
            author=self.contributor_user
        )

    def get_token_for_user(self, user):
        """Get JWT token for user."""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def authenticate_user(self, user):
        """Authenticate a user for API requests."""
        token = self.get_token_for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_user_registration(self):
        """Test user registration endpoint."""
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_user_login(self):
        """Test user login endpoint."""
        url = reverse('user-login')
        data = {
            'username': 'contributor',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_board_list_permissions(self):
        """Test board list permissions."""
        url = reverse('board-list')
        
        # Anonymous user
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Contributor can see public boards and their private boards
        self.authenticate_user(self.contributor_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        board_names = [board['name'] for board in response.data]
        self.assertIn('Public Board', board_names)
        self.assertIn('Private Board', board_names)
        
        # Admin can see all boards
        self.authenticate_user(self.admin_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_board_creation(self):
        """Test board creation permissions."""
        url = reverse('board-list')
        data = {
            'name': 'New Board',
            'description': 'A new board',
            'is_public': True
        }
        
        # Contributors cannot create boards
        self.authenticate_user(self.contributor_user)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Admins can create boards
        self.authenticate_user(self.admin_user)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_feedback_creation(self):
        """Test feedback creation."""
        url = reverse('feedback-list')
        data = {
            'title': 'New Feature Request',
            'content': 'Please add this new feature',
            'board': self.public_board.id,
            'priority': FeedbackPriority.HIGH,
            'tags': [{'name': 'enhancement'}]
        }
        
        self.authenticate_user(self.contributor_user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Feature Request')
        self.assertEqual(response.data['author']['username'], 'contributor')

    def test_feedback_voting(self):
        """Test feedback voting functionality."""
        url = reverse('feedback-vote', kwargs={'pk': self.feedback.id})
        
        self.authenticate_user(self.admin_user)
        
        # First vote should add vote
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'added')
        self.assertEqual(response.data['upvotes'], 1)
        
        # Second vote should remove vote
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'removed')
        self.assertEqual(response.data['upvotes'], 0)

    def test_comment_creation(self):
        """Test comment creation."""
        url = reverse('comment-list')
        data = {
            'content': 'This is a test comment',
            'feedback': self.feedback.id
        }
        
        self.authenticate_user(self.contributor_user)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'This is a test comment')
        self.assertEqual(response.data['author']['username'], 'contributor')

    def test_analytics_endpoints(self):
        """Test analytics endpoints."""
        self.authenticate_user(self.contributor_user)
        
        # Test feedback counts
        url = reverse('feedback-counts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('active', response.data)
        
        # Test top voted feedback
        url = reverse('feedback-top-voted')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        # Test trends
        url = reverse('feedback-trends')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_private_board_access(self):
        """Test private board access restrictions."""
        # Create feedback in private board
        private_feedback = Feedback.objects.create(
            title='Private Feedback',
            content='This is private feedback',
            board=self.private_board,
            author=self.contributor_user
        )
        
        # Member can access
        self.authenticate_user(self.contributor_user)
        url = reverse('feedback-detail', kwargs={'pk': private_feedback.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Non-member cannot access (create different contributor)
        other_user = User.objects.create_user(
            username='other',
            email='other@test.com',
            password='testpass123'
        )
        self.authenticate_user(other_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_input_validation(self):
        """Test input validation."""
        url = reverse('feedback-list')
        
        self.authenticate_user(self.contributor_user)
        
        # Test empty title
        data = {
            'title': '',
            'content': 'Valid content',
            'board': self.public_board.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test empty content
        data = {
            'title': 'Valid title',
            'content': '',
            'board': self.public_board.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
