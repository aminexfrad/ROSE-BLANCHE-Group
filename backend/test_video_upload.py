#!/usr/bin/env python3
"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

"""
Test script for video upload functionality in testimonials
"""

import os
import sys
import django
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import Testimonial, Stage
from auth_service.models import User

def test_video_upload_functionality():
    """Test the video upload functionality for testimonials"""
    
    print("🧪 Testing video upload functionality for testimonials...")
    
    # Create test user
    User = get_user_model()
    user = User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        nom='Test',
        prenom='User',
        role='stagiaire'
    )
    
    # Create test stage
    stage = Stage.objects.create(
        title='Test Stage',
        company='Test Company',
        location='Test Location',
        stagiaire=user,
        status='active'
    )
    
    # Create API client
    client = APIClient()
    
    # Login
    response = client.post('/auth/login/', {
        'email': 'test@example.com',
        'password': 'testpass123'
    })
    
    if response.status_code != 200:
        print("❌ Login failed")
        return False
    
    token = response.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # Test 1: Create testimonial with video file
    print("\n1. Testing testimonial creation with video file...")
    
    # Create a mock video file
    video_content = b'fake video content' * 1000  # 16KB fake video
    video_file = SimpleUploadedFile(
        'test_video.mp4',
        video_content,
        content_type='video/mp4'
    )
    
    testimonial_data = {
        'title': 'Test Video Testimonial',
        'content': 'This is a test testimonial with video upload',
        'testimonial_type': 'video',
        'stage': stage.id,
        'video_file': video_file
    }
    
    response = client.post('/testimonials/create/', testimonial_data, format='multipart')
    
    if response.status_code == 201:
        print("✅ Video testimonial created successfully")
        testimonial = Testimonial.objects.get(id=response.data['id'])
        print(f"   - Video file: {testimonial.video_file}")
        print(f"   - File exists: {testimonial.video_file.storage.exists(testimonial.video_file.name)}")
    else:
        print(f"❌ Failed to create video testimonial: {response.data}")
        return False
    
    # Test 2: Create testimonial with video URL
    print("\n2. Testing testimonial creation with video URL...")
    
    testimonial_data = {
        'title': 'Test URL Video Testimonial',
        'content': 'This is a test testimonial with video URL',
        'testimonial_type': 'video',
        'stage': stage.id,
        'video_url': 'https://www.youtube.com/watch?v=test123'
    }
    
    response = client.post('/testimonials/create/', testimonial_data)
    
    if response.status_code == 201:
        print("✅ URL video testimonial created successfully")
        print(f"   - Video URL: {response.data['video_url']}")
    else:
        print(f"❌ Failed to create URL video testimonial: {response.data}")
        return False
    
    # Test 3: Create text testimonial (should work)
    print("\n3. Testing text testimonial creation...")
    
    testimonial_data = {
        'title': 'Test Text Testimonial',
        'content': 'This is a test text testimonial',
        'testimonial_type': 'text',
        'stage': stage.id
    }
    
    response = client.post('/testimonials/create/', testimonial_data)
    
    if response.status_code == 201:
        print("✅ Text testimonial created successfully")
    else:
        print(f"❌ Failed to create text testimonial: {response.data}")
        return False
    
    # Test 4: Try to create video testimonial without video (should fail)
    print("\n4. Testing video testimonial without video (should fail)...")
    
    testimonial_data = {
        'title': 'Test Invalid Video Testimonial',
        'content': 'This should fail',
        'testimonial_type': 'video',
        'stage': stage.id
    }
    
    response = client.post('/testimonials/create/', testimonial_data)
    
    if response.status_code == 400:
        print("✅ Correctly rejected video testimonial without video")
    else:
        print(f"❌ Should have rejected but got: {response.status_code}")
        return False
    
    # Test 5: Check testimonial list
    print("\n5. Testing testimonial list retrieval...")
    
    response = client.get('/testimonials/')
    
    if response.status_code == 200:
        testimonials = response.data['results']
        print(f"✅ Retrieved {len(testimonials)} testimonials")
        
        video_testimonials = [t for t in testimonials if t['testimonial_type'] == 'video']
        text_testimonials = [t for t in testimonials if t['testimonial_type'] == 'text']
        
        print(f"   - Video testimonials: {len(video_testimonials)}")
        print(f"   - Text testimonials: {len(text_testimonials)}")
        
        # Check if video_file URLs are included
        for testimonial in video_testimonials:
            if testimonial.get('video_file'):
                print(f"   - Video file URL: {testimonial['video_file']}")
    else:
        print(f"❌ Failed to retrieve testimonials: {response.data}")
        return False
    
    print("\n🎉 All video upload tests passed!")
    return True

if __name__ == '__main__':
    try:
        success = test_video_upload_functionality()
        if success:
            print("\n✅ Video upload functionality is working correctly!")
        else:
            print("\n❌ Video upload functionality has issues!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1) 