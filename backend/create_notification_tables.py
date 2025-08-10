"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import os
import sys
import django

# Add the gateway directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'gateway'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from django.db import connection

def create_notification_tables():
    """Create the missing notification tables manually"""
    
    with connection.cursor() as cursor:
        try:
            # Create notification_event table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notification_event (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    event_type VARCHAR(20) NOT NULL,
                    event_data JSON NOT NULL,
                    processed BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at DATETIME(6) NOT NULL,
                    processed_at DATETIME(6) NULL,
                    source_user_id INT NULL,
                    INDEX idx_event_type (event_type),
                    INDEX idx_processed (processed),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("✅ Created notification_event table")
            
            # Create notification_template table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notification_template (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    title_template VARCHAR(200) NOT NULL,
                    message_template TEXT NOT NULL,
                    notification_type VARCHAR(10) NOT NULL DEFAULT 'info',
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at DATETIME(6) NOT NULL,
                    updated_at DATETIME(6) NOT NULL,
                    INDEX idx_name (name),
                    INDEX idx_is_active (is_active)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("✅ Created notification_template table")
            
            # Create websocket_connection table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS websocket_connection (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    connection_id VARCHAR(255) NOT NULL UNIQUE,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    last_activity DATETIME(6) NOT NULL,
                    created_at DATETIME(6) NOT NULL,
                    user_id INT NOT NULL,
                    INDEX idx_connection_id (connection_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_is_active (is_active)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("✅ Created websocket_connection table")
            
            # Create the many-to-many table for notification_event.target_users
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notification_event_target_users (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    notificationevent_id BIGINT NOT NULL,
                    user_id INT NOT NULL,
                    UNIQUE KEY unique_notification_user (notificationevent_id, user_id),
                    INDEX idx_notificationevent_id (notificationevent_id),
                    INDEX idx_user_id (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("✅ Created notification_event_target_users table")
            
            print("\n🎉 All notification tables created successfully!")
            
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            return False
    
    return True

if __name__ == "__main__":
    print("🚀 Creating notification tables...")
    success = create_notification_tables()
    
    if success:
        print("\n✅ Notification system is now ready!")
        print("You can now run the role-based notification tests.")
    else:
        print("\n❌ Failed to create notification tables.")
        sys.exit(1)
