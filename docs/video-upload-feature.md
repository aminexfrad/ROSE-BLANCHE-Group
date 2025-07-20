# Video Upload Feature for Testimonials

## Overview

The testimonial feature now supports direct video file uploads in addition to video URLs. Users can upload video files (MP4, AVI, MOV, WMV, FLV, WEBM) directly through the interface, with a maximum file size of 50MB.

## Features

### Frontend Features

1. **Video Upload Component** (`frontend/components/video-upload.tsx`)
   - Drag and drop file upload
   - File type validation (MP4, AVI, MOV, WMV, FLV, WEBM)
   - File size validation (50MB max)
   - Video preview with custom controls
   - Progress bar for upload status
   - Error handling and user feedback

2. **Enhanced Testimonial Forms**
   - Updated stagiaire testimonial creation/editing
   - Support for both video files and URLs
   - Preview functionality for uploaded videos
   - Responsive design for mobile devices

3. **Video Display**
   - Native HTML5 video player for uploaded files
   - Embedded iframe for URL videos
   - Consistent display across all testimonial views

### Backend Features

1. **File Upload Handling**
   - File validation (type and size)
   - Secure file storage in `testimonials/videos/` directory
   - Proper file URL generation for frontend access

2. **API Enhancements**
   - Updated serializers to handle video files
   - Enhanced validation for video testimonials
   - Proper error messages for invalid uploads

3. **Database Schema**
   - Existing `video_file` field in Testimonial model
   - File storage configuration in Django settings

## Technical Implementation

### File Upload Flow

1. **Frontend**: User selects video file or enters URL
2. **Validation**: Client-side validation for file type and size
3. **Upload**: FormData sent to backend with video file
4. **Backend Validation**: Server-side validation for security
5. **Storage**: File saved to media directory
6. **Response**: File URL returned to frontend

### Security Measures

- File type validation (whitelist approach)
- File size limits (50MB max)
- Secure file storage outside web root
- Content-Type validation
- User authentication required

### Supported Formats

- **MP4** (video/mp4)
- **AVI** (video/avi)
- **MOV** (video/mov)
- **WMV** (video/wmv)
- **FLV** (video/flv)
- **WEBM** (video/webm)

## Usage

### For Stagiaires

1. Navigate to "Témoignages" in the stagiaire dashboard
2. Click "Nouveau témoignage"
3. Select "Vidéo" as testimonial type
4. Either:
   - Drag and drop a video file
   - Click "parcourez vos fichiers" to select a file
   - Enter a video URL
5. Preview the video using the built-in player
6. Submit the testimonial

### For RH/Admin

1. Navigate to "Témoignages" in the RH dashboard
2. View testimonials with video content
3. Videos are displayed inline for uploaded files
4. URLs are shown as clickable links

### For Public Users

1. Visit the public testimonials page
2. View video testimonials with embedded players
3. Uploaded videos play directly in the browser
4. URL videos open in new tabs

## Configuration

### Backend Settings

The feature uses Django's default media file configuration:

```python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### File Storage

Videos are stored in: `backend/gateway/media/testimonials/videos/`

### Size Limits

- Maximum file size: 50MB
- Configurable in the VideoUpload component

## Testing

Run the test script to verify functionality:

```bash
cd backend
python test_video_upload.py
```

## Future Enhancements

1. **Video Compression**: Automatic compression for large files
2. **Thumbnail Generation**: Auto-generated video thumbnails
3. **Streaming**: Support for video streaming
4. **Cloud Storage**: Integration with cloud storage providers
5. **Video Processing**: Background video processing for optimization

## Troubleshooting

### Common Issues

1. **File too large**: Ensure file is under 50MB
2. **Unsupported format**: Check file is in supported format
3. **Upload fails**: Check server storage permissions
4. **Video doesn't play**: Verify browser supports video format

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify file upload in Django admin
3. Check media directory permissions
4. Test with different video formats

## API Endpoints

### Create Testimonial with Video
```
POST /testimonials/create/
Content-Type: multipart/form-data

{
  "title": "Test Video Testimonial",
  "content": "Test content",
  "testimonial_type": "video",
  "stage": 1,
  "video_file": <file>
}
```

### Update Testimonial with Video
```
PUT /testimonials/{id}/update/
Content-Type: multipart/form-data

{
  "title": "Updated Video Testimonial",
  "content": "Updated content",
  "testimonial_type": "video",
  "video_file": <file>
}
```

## Dependencies

### Frontend
- React hooks for state management
- HTML5 video API for preview
- FormData for file uploads

### Backend
- Django FileField for file storage
- Django REST Framework for API
- Pillow (optional) for image processing

## Security Considerations

1. **File Validation**: Both client and server-side validation
2. **Access Control**: Authentication required for uploads
3. **File Storage**: Secure directory structure
4. **Content Security**: File type restrictions
5. **Rate Limiting**: Consider implementing upload rate limits

## Performance

1. **File Size**: 50MB limit prevents server overload
2. **Caching**: Video files can be cached by CDN
3. **Compression**: Consider video compression for storage efficiency
4. **CDN**: Consider CDN for video delivery in production 