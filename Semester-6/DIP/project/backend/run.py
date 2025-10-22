from api.app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('instance', exist_ok=True)
    os.makedirs('storage/images', exist_ok=True)
    os.makedirs('storage/embeddings', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)