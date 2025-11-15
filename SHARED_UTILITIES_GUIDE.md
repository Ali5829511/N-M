# Shared Utilities Usage Guide

This document explains how to use the newly created shared utility modules in your code.

## JavaScript: BaseExporter Class

### Location
`js/base_exporter.js`

### Purpose
Base class for all export functionality (Excel, PDF, HTML) with common helper methods.

### Usage

#### In HTML files, load the base exporter first:
```html
<!-- Load base exporter first -->
<script src="js/base_exporter.js"></script>
<!-- Then load specific exporters -->
<script src="js/advanced_export.js"></script>
<!-- or -->
<script src="js/advanced_export_professional.js"></script>
```

#### Creating a new exporter:
```javascript
class MyCustomExporter extends BaseExporter {
    constructor() {
        super();
        // Your custom initialization
    }
    
    // Override or add custom methods
    async exportToMyFormat() {
        // Use inherited methods:
        // - this.setData(data, images)
        // - this.downloadFile(blob, filename)
        // - this.buildHeader(...)
        // - this.buildFooter(...)
        // - this.calculateStatistics()
        // etc.
    }
}
```

### Available Methods

#### Data Management
- `setData(data, images)` - Set data and images for export
- `calculateStatistics()` - Calculate statistics from data

#### File Operations
- `downloadFile(blob, filename)` - Download file to user's browser
- `imageToBase64(file)` - Convert image file to Base64
- `canvasToBase64(canvas)` - Convert canvas to Base64

#### HTML Building
- `buildHeader(orgName, deptName, title, reportNum)` - Build report header
- `buildFooter(orgName, includeSignature)` - Build report footer
- `buildSummary(total, unique, repeated)` - Build statistics summary
- `buildTableRow(item, index, imageData, showRowNum)` - Build table row

### Dependencies
- None (pure JavaScript, works in any modern browser)

### Files that use BaseExporter
- `js/advanced_export.js` - Extends BaseExporter
- `js/advanced_export_professional.js` - Extends BaseExporter

---

## Python: plate_recognition_utils Module

### Location
`plate_recognition_utils.py`

### Purpose
Shared utilities for plate recognition systems including database management, API interaction, and file operations.

### Usage

#### Import the utilities:
```python
from plate_recognition_utils import (
    DatabaseManager,
    PlateRecognizerAPI,
    ConfigManager,
    FileManager,
    print_banner,
    print_summary
)
```

### Available Classes

#### DatabaseManager
Manages database connections and operations.

```python
# Create database manager
db_manager = DatabaseManager('traffic.db')

# Connect to database
if db_manager.connect():
    # Setup tables
    db_manager.setup_tables()
    
    # Search for vehicle
    vehicle = db_manager.get_vehicle('ABC123')
    
    # Add violation
    db_manager.add_violation(
        car_id=1,
        plate='ABC123',
        violation_type='Parking violation',
        violation_date='2025-11-14',
        fine_amount=100,
        officer_name='Officer Name',
        image_path='/path/to/image.jpg'
    )
    
    # Close connection
    db_manager.close()
```

#### PlateRecognizerAPI
Interface for Plate Recognizer API.

```python
# Create API interface
api = PlateRecognizerAPI(
    api_token='your_api_token',
    api_url='https://api.platerecognizer.com/v1/plate-reader/'
)

# Process image
result = api.process_image('/path/to/image.jpg', regions='sa')

# Extract plate information
if result:
    plate_info = api.extract_plate_info(result)
    print(f"Plate: {plate_info['plate']}")
    print(f"Confidence: {plate_info['confidence']}")
```

#### ConfigManager
Configuration file management (static methods).

```python
# Load configuration
config = ConfigManager.load_config('config.json')

# Create default configuration
if not config:
    config = ConfigManager.create_default_config(
        'config.json',
        api_token_placeholder='YOUR_API_KEY'
    )
```

#### FileManager
File and directory operations (static methods).

```python
# Create directories
FileManager.create_directories('/path/to/dir1', '/path/to/dir2')

# Get image files from folder
images = FileManager.get_image_files('/path/to/folder')

# Copy image to destination
saved_path = FileManager.copy_image(
    source_path='/path/to/source.jpg',
    dest_folder='/path/to/dest',
    new_name='new_image.jpg'  # optional
)
```

### Utility Functions

```python
# Print system banner
print_banner("My System Title")

# Print processing summary
print_summary(
    processed=10,
    errors=2,
    total=12
)
```

### Dependencies
- Standard library: `os`, `sqlite3`, `json`, `datetime`, `pathlib`
- External (if needed): `requests` (for API calls)

### Files that use plate_recognition_utils
- `auto_plate_recognition.py` - Uses all utilities
- `plate_violation_processor.py` - Uses DatabaseManager, PlateRecognizerAPI, FileManager, and utility functions

---

## Best Practices

### JavaScript
1. Always load `base_exporter.js` before any exporter that extends it
2. Use inheritance for code reuse - don't duplicate methods
3. Override methods only when necessary
4. Call `super()` in constructor when extending BaseExporter

### Python
1. Import only what you need to keep code clean
2. Use context managers or try-finally for database connections
3. Handle exceptions appropriately
4. Use static methods from FileManager and ConfigManager directly

---

## Extending the Utilities

### Adding a New JavaScript Exporter
```javascript
// my_exporter.js
class MyExporter extends BaseExporter {
    constructor() {
        super();
        this.myCustomProperty = 'value';
    }
    
    async exportToMyFormat() {
        // Use inherited functionality
        const stats = this.calculateStatistics();
        const header = this.buildHeader('Org', 'Dept', 'Title');
        
        // Your custom logic here
    }
}
```

### Adding New Python Utility Class
```python
# In plate_recognition_utils.py
class MyNewUtility:
    """Description of utility"""
    
    def __init__(self):
        # Initialization
        pass
    
    def my_method(self):
        # Implementation
        pass
```

---

## Troubleshooting

### JavaScript Issues
- **Error: BaseExporter is not defined**
  - Make sure `base_exporter.js` is loaded before other exporters
  - Check browser console for loading errors

- **Methods not working**
  - Verify you're using `this.methodName()` to access inherited methods
  - Check that you called `super()` in constructor

### Python Issues
- **ModuleNotFoundError: No module named 'plate_recognition_utils'**
  - Make sure `plate_recognition_utils.py` is in the same directory
  - Check that you're running Python from the correct directory

- **Import errors**
  - Verify all required dependencies are installed
  - Run: `pip install -r requirements.txt`

---

## Support

For issues or questions about the shared utilities:
1. Check this guide
2. Review the code comments in the utility files
3. See `REFACTORING_SUMMARY.md` for implementation details
4. Check existing usage in the refactored files

---

## Version History

### Version 1.0 (2025-11-14)
- Initial creation of shared utilities
- Refactored 4 files to use shared code
- Eliminated ~610 lines of duplicated code
