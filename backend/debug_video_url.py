#!/usr/bin/env python3
"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

"""
Debug script to check video file URLs and media serving
"""

import os
import sys
import django
from django.conf import settings

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import Testimonial
from auth_service.models import User

def debug_video_files():
    """Debug video file URLs and media serving"""
    
    print("🔍 Debugging video file URLs...")
    
    # Check media settings
    print(f"\n📁 Media Settings:")
    print(f"   MEDIA_URL: {settings.MEDIA_URL}")
    print(f"   MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"   DEBUG: {settings.DEBUG}")
    
    # Check if media directory exists
    media_dir = settings.MEDIA_ROOT
    print(f"\n📂 Media Directory:")
    print(f"   Exists: {os.path.exists(media_dir)}")
    if os.path.exists(media_dir):
        print(f"   Path: {media_dir}")
        # List contents
        try:
            contents = os.listdir(media_dir)
            print(f"   Contents: {contents}")
        except Exception as e:
            print(f"   Error listing contents: {e}")
    
    # Check testimonials with video files
    print(f"\n🎥 Testimonials with Video Files:")
    testimonials_with_video = Testimonial.objects.filter(video_file__isnull=False).exclude(video_file='')
    
    if testimonials_with_video.exists():
        for testimonial in testimonials_with_video:
            print(f"\n   Testimonial ID: {testimonial.id}")
            print(f"   Title: {testimonial.title}")
            print(f"   Video File: {testimonial.video_file}")
            print(f"   Video File Name: {testimonial.video_file.name if testimonial.video_file else 'None'}")
            print(f"   Video File URL: {testimonial.video_file.url if testimonial.video_file else 'None'}")
            print(f"   File Exists: {testimonial.video_file.storage.exists(testimonial.video_file.name) if testimonial.video_file else 'False'}")
            
            # Check file size
            if testimonial.video_file and testimonial.video_file.storage.exists(testimonial.video_file.name):
                try:
                    size = testimonial.video_file.size
                    print(f"   File Size: {size} bytes ({size/1024/1024:.2f} MB)")
                except Exception as e:
                    print(f"   Error getting file size: {e}")
    else:
        print("   No testimonials with video files found")
    
    # Check testimonials with video URLs
    print(f"\n🔗 Testimonials with Video URLs:")
    testimonials_with_url = Testimonial.objects.filter(video_url__isnull=False).exclude(video_url='')
    
    if testimonials_with_url.exists():
        for testimonial in testimonials_with_url:
            print(f"\n   Testimonial ID: {testimonial.id}")
            print(f"   Title: {testimonial.title}")
            print(f"   Video URL: {testimonial.video_url}")
    else:
        print("   No testimonials with video URLs found")
    
    # Test URL generation
    print(f"\n🌐 Testing URL Generation:")
    if testimonials_with_video.exists():
        testimonial = testimonials_with_video.first()
        print(f"   Sample testimonial: {testimonial.id}")
        print(f"   Video file: {testimonial.video_file}")
        
        # Test building absolute URL
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/')
        request.META['HTTP_HOST'] = 'localhost:8000'
        request.META['wsgi.url_scheme'] = 'http'
        
        try:
            absolute_url = request.build_absolute_uri(testimonial.video_file.url)
            print(f"   Absolute URL: {absolute_url}")
        except Exception as e:
            print(f"   Error building absolute URL: {e}")
    
    print(f"\n✅ Debug complete!")

if __name__ == '__main__':
    try:
        debug_video_files()
    except Exception as e:
        print(f"❌ Debug failed with error: {e}")
        import traceback
        traceback.print_exc() 